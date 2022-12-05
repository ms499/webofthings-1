let token
const  getAccessToken  = require("../dist/securityScheme/clientCredential");
const  consumer  = require("../dist/consumer");
// Basic Client code in which the credential is passed in the header
// axios has a parameter 'auth' which is there to support the basic auth

const axios = require('axios')


// New agent is required to the the self signed certificate issue
let https = require('https')
const agent = new https.Agent({
  rejectUnauthorized: false
});


// Simple example of client code
axios.get('https://localhost:8080/mygardenthing', { httpsAgent: agent }).then((response) => {
  if (response.status === 200) {
    let td = response.data
    let payload = { "threshold": 89 }
    consumer.setRequest(td)
    getAccessToken.getAccessToken().then((response) => {
        token = response.access_token        
       /* writePropertyCall(td, 'humidityThreshold', payload)
        readPropertyCall(td, 'humidityThreshold')
        invokeActionCall(td, 'startSprinkler', {})
        readPropertyCall(td, 'state')*/
    })
  }
}).catch((e) => {
    console.error('error')
  });


function writePropertyCall(td,property, payload) {
  let url = td.base + td.properties[property].forms[0].href
  // write to a property
  axios.put(url, payload, { httpsAgent: agent, headers: { 'Authorization': 'Token ' +token }}).then((response) => {
    if (response.status === 200) {
      console.log('Write Property success')
    }
  }).catch((e) => {
      console.error(e)
    })
}

function readPropertyCall(td, property) {
  let url = td.base + td.properties[property].forms[0].href
  console.log(url)
  // write to a property
  axios.get(url, { httpsAgent: agent,  headers: { 'Authorization': 'Token ' +token } }).then((response) => {
    if (response.status === 200) {
      console.log(property + ' Value:', response.data)
    }
  }).catch((e) => {
      //console.error(e)
    })
}

function invokeActionCall(td, action, payload) {
  let url = td.base + td.actions[action].forms[0].href
  // write to a property
  axios.post(url, payload, { httpsAgent: agent,  headers: { 'Authorization': 'Token ' +token } }).then((response) => {
    if (response.status === 200) {
      console.log('Action is invoked')
    }
  }).catch((e) => {
      //console.error(e)
    })
}