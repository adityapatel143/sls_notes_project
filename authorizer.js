import { CognitoJwtVerifier } from 'aws-jwt-verify';

const COGNITO_USERPOOL_ID = process.env.COGNITO_USERPOOL_ID;
const COGNITO_WEB_CLIENT_ID = process.env.COGNITO_WEB_CLIENT_ID;


const jwtVerifier = CognitoJwtVerifier.create({
    userPoolId: COGNITO_USERPOOL_ID,
    tokenUse: "id",
    clientId: COGNITO_WEB_CLIENT_ID
})

const generatePolicy = (principalId, effect, resource) => {
    let authResponse = {};

    authResponse.principalId = principalId;
    if (effect && resource) {
        let policyDocument = {
            Version: "2012-10-17",
            Statement: [{
                Effect: effect,
                Resource: resource,
                Action: "execute-api:Invoke"
            }]
        }
        authResponse.policyDocument = policyDocument;
    }

    authResponse.context = {
        // we can add additional checks, like name and email, do DB query etc.
        foo: "bar"
    };

    console.log(JSON.stringify(authResponse))
    return authResponse;
}


export const handler = async (event, context, callback) => {
    // lambda authorizaer code

    let token = event.authorizationToken; // "allow" or "deny"

    // validate token
    try {
        const payload = await jwtVerifier.verify(token);
        console.log(payload);

        return generatePolicy("user", "Allow", event.methodArn);

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify(error.message),
        };
    }




    // let policy = "";

    // switch (token) {
    //     case "allow":
    //         policy = generatePolicy("user", "Allow", event.methodArn)
    //         break;

    //     case "deny":
    //         policy = generatePolicy("user", "Deny", event.methodArn)
    //         break;

    //     default:
    //         policy = "Error: Invalid Token"
    //         break;
    // }

    // return policy
}