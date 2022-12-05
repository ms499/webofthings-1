# Security configurations 

This document explains how to configure clients for different security schemes. In order to access the exposed TD there is no need to pass any security credentials. As no check for security is done for the same (same as node-wot).


- ### Basic Security
    - In this scheme client need to pass username and password in header, query, body, cookies of the request. The selection of the field should be based on the value passed in the exposed td parameter **in** in securityScheme. Default value is 'header'.

    - **name** parameter can be used to define the string which contains the credential. By default it is set to 'authorization'.

    - Example of a header passing the credential: **authorization : Basic aW90OmdhcmRlblRoaW5ncw==**

    - The example code is in basic_client.js


- ### Digest Security
    - In this scheme client need to pass username and password in header, query, body, cookies of the request. The selection of the field should be based on the value passed in the exposed td parameter **in** in securityScheme. Default value is 'header'.

    - **name** parameter can be used to define the string which contains the credential. By default it is set to 'authorization'. There is no check done to analyize the string. It is just some random number.

    - In this scheme, client has to calculate parameter to send in the request as well as calulate the digest of the password. In this **MD5** and **SHA256** is supported. By default algo is set to 'MD5'.

    - The digestResponse is calculate using the function digestAuth from the /src/digest.ts file. For each request the all the parmeters has to be passed like mentioned in the example.

    - Example of a header passing the credential: **Authorization: Digest username="iot", realm="Digest Authentication", nonce="0.04870110535710981", uri="/mygardenthing/properties/humidityThreshold", algorithm="MD5", qop=auth, cnonce="undefined", response="b8c340d32379c353a08a637848ad1afb", opaque="0d3ced1a5756977875a15f93cc12dd21"**. Make sure to follow the spaces and , exactly mentioned in the example. Parmeter orders can be changed.

    - The example code is in digest_client.js

- ### Api Key Security
    - In this scheme client need to pass apikey(which is an opaque string) in header, query, body, cookies of the request. The selection of the field should be based on the value passed in the exposed td parameter **in** in securityScheme. Default value is 'header'.

    - **name** parameter can be used to define the string which contains the credential. By default it is set to 'authorization'. There is no check done to analyize the string. It is just some random number.

    - Example of a header passing the credential: **authorization : aW90OmdhcmRlblRoaW5ncw==**

    - The example code is in apiKey_client.js

- ### Bearer Token Security
    - In this scheme client need to pass username and password in header, query, body, cookies of the request. The selection of the field should be based on the value passed in the exposed td parameter **in** in securityScheme. Default value is 'header'.

    - **name** parameter can be used to define the string which contains the credential. By default it is set to 'authorization'. There is no check done to analyize the string. It is just some random number.

    - Example of a header passing the credential: **authorization : Bearer aW90OmdhcmRlblRoaW5ncw==**

    - The example code is in bearer_client.js

- ### OAuth2 Security
    - This scheme is only implemented for the **Client Credential** grant flow.
    - The function **verifyTokenUsingOkta** and **verifyTokenUSingIntrospect** are two methods in which anyone can be used to verify the token. 
    
    - The example code is in oauthClientCredential.js

## Steps to Configure the Authorization server

In this code okta is used to create a authorization server. It supports all the 4 grant and based on the requirement user can create any type of server.
- Create an account on okta https://developer.okta.com/signup/
- Go to applications --> applications
- Click on Create App Integration.
- Select API service for client credentials.
- Link to follow for stepup https://developer.okta.com/docs/guides/implement-grant-type/clientcreds/main/#set-up-your-app
- Go to security --> API
- Click on Add Authorization Server
- Define the server according to the function required. 