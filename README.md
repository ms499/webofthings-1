# WebOfThings

## Getting started

This project can be used with node-wot and without
For using it with node-wot, there is an example client file in the folder node-wot-client.

The supported security mechanisms
1. Basic Auth
2. Digest
3. Bearer token
4. Api key
5. OAuth2

### Without node-wot client
1. npm install
2. npm run build
3. To start producer use cmd node ./producer.js w
4. To start clientuse cmd node ./client.js


### With node-wot client
1. cd ./node-wot-client
2. npm install
3. cd ..
4. node ./producer.js
5. node ./node-wot-client/client.js

