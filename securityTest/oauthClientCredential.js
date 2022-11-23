const  getAccessToken  = require("../dist/securityScheme/clientCredential");
getAccessToken.getAccessToken().then((response) => {console.log(response)})
