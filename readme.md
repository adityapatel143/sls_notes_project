# To test this application
    Create User
        1. Go to Cognito User Pool.
        2. Go to your created user pool
        3. Create user
        4. You can keep optional fields blank
    
    Get the client ID
        1. Go to App Integration
        2. Get Cognito domain
        3. Get the client ID from App client list

    Use the below URL and replace the domain and  clientId then run it in the browser and enter the username and password
    once successfull, get the #id_token= and &access_token=
        https://mydomain.us-east-1.amazoncognito.com/authorize?response_type=token&client_id=1example23456789&redirect_uri=https://mydomain.example.com
