"use strict";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand
} from "@aws-sdk/lib-dynamodb";

const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME;

const client = new DynamoDBClient({ 
  region: "us-east-1", 
  maxAttempts: 3, 
  httpOptions: { 
    timeout: 5000 
  } 
});
const docClient = DynamoDBDocumentClient.from(client);

// Formatting the output response
const send = (status, data) => {
  return {
    statusCode: status,
    body: JSON.stringify(data),
  };
};

export const createNote = async (event, context, cb) => {
  // Set to false to send the response right away when the callback runs, 
  // instead of waiting for the Node.js event loop to be empty.
  context.callbackWaitsForEmptyEventLoop = false
  let data = JSON.parse(event.body);

  try {
    const command = new PutCommand({
      TableName: NOTES_TABLE_NAME,
      Item: {
        notesId: data.id,
        title: data.title,
        body: data.body,
      },
      ConditionExpression: "attribute_not_exists(notesId)",
    });

    const response = await docClient.send(command);

    return send(201, { response: response, inputData: data });
  } catch (error) {
    return send(500, error.message);
  }
};

export const updateNote = async (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false
  let id = event.pathParameters.id;
  let data = JSON.parse(event.body);

  try {
    const command = new UpdateCommand({
      TableName: NOTES_TABLE_NAME,
      Key: {
        notesId: id,
      },
      UpdateExpression: "set title = :title, body = :body",
      ExpressionAttributeValues: {
        ":title": data.title,
        ":body": data.body,
      },
      ConditionExpression: "attribute_exists(notesId)",
      ReturnValues: "ALL_NEW",
    });

    const response = await docClient.send(command);
    return send(201, response);
  } catch (error) {
    return send(500, error.message);
  }
};

export const deleteNote = async (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false
  let id = event.pathParameters.id;

  try {
    const command = new DeleteCommand({
      TableName: NOTES_TABLE_NAME,
      Key: {
        notesId: id,
      },
      ConditionExpression: "attribute_exists(notesId)",
      ReturnValues: "ALL_OLD",
    });

    const response = await docClient.send(command);

    return send(200, response);
  } catch (error) {
    return send(500, error.message);
  }
};

export const getAllNotes = async (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false
  try {
    const command = new ScanCommand({
      TableName: NOTES_TABLE_NAME,
    });

    const response = await docClient.send(command);
    // for (const bird of response.Items) {
    //   console.log(`${bird.Name} - (${bird.Color}, ${bird.AvgLifeSpan})`);
    // }
    return send(200, response);
  } catch (error) {
    return send(500, error.message);
  }
};
