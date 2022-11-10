
const axios = require('axios')
const DATA = {
    username: "iot", // sone application it can be userName
    password: "gardenThings",
    realm: 'Digest Authentication'
}

let https = require('https');
const { digestAuth } = require("../dist/securityScheme/digest");
const agent = new https.Agent({
    rejectUnauthorized: false
});
let uri = '/mygardenthing/properties/humidityThreshold'
let algo = 'MD5'

function genNonce(b) {
    var c = [], e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", a = e.length;
    for (var d = 0; d < b; ++d) {
        c.push(e[Math.random() * a | 0])
    }
    return c.join("")
};
// calculate the response
let authInfo = {
    username: DATA.username,
    realm: DATA.realm,
    nonce: Math.random(),
    uri: uri,
    algorithm: algo,
    qop: 'auth',
    nc: '00000001',
    cnonce: genNonce(8),
    opaque: '0d3ced1a5756977875a15f93cc12dd21'

}


axios.get('https://localhost:8080/mygardenthing', { httpsAgent: agent }).then((response) => {
    if (response.status === 200) {
        let td = response.data
        let payload = { "threshold": 89 }
        writePropertyCall(td, 'humidityThreshold', payload)
        readPropertyCall(td, 'humidityThreshold')
        invokeActionCall(td, 'startSprinkler', {})
        readPropertyCall(td, 'state')
    }
}).catch((e) => {
    console.error(e)
});
function readPropertyCall(td, property) {
    let digestResponse = digestAuth(DATA, 'GET', algo, authInfo)
    let header = 'Digest username="' + DATA.username + '", realm="' + DATA.realm + '", nonce="' + authInfo.nonce +
        '", uri="' + authInfo.uri + '", algorithm="' + authInfo.algorithm + '", qop=' + authInfo.qop + ', nc=' + authInfo.nc +
        ', cnonce="' + authInfo.cnonce + '", response="' + digestResponse + '", opaque="' + authInfo.opaque + '"'
    let url = td.base + td.properties[property].forms[0].href
    axios.get(url, { httpsAgent: agent, headers: { 'Authorization': header } }).then((response) => {
        if (response.status === 200) {
            console.log(property + ' Value:', response.data)
        }
    }).catch((e) => {
        //console.error(e.response.headers)
    })
}

function writePropertyCall(td, property, payload) {
    let digestResponse = digestAuth(DATA, 'PUT', algo, authInfo)
    let header = 'Digest username="' + DATA.username + '", realm="' + DATA.realm + '", nonce="' + authInfo.nonce +
        '", uri="' + authInfo.uri + '", algorithm="' + authInfo.algorithm + '", qop=' + authInfo.qop + ', nc=' + authInfo.nc +
        ', cnonce="' + authInfo.cnonce + '", response="' + digestResponse + '", opaque="' + authInfo.opaque + '"'
    let url = td.base + td.properties[property].forms[0].href
    // write to a property
    axios.put(url, payload, { httpsAgent: agent, headers: { 'Authorization': header } }).then((response) => {
        if (response.status === 200) {
            console.log('Write Property success')
        }
    }).catch((e) => {

        console.error(e)
    })
}



function invokeActionCall(td, action, payload) {
    let digestResponse = digestAuth(DATA, 'POST', algo, authInfo)
    console.log(digestResponse)
    let header = 'Digest username="' + DATA.username + '", realm="' + DATA.realm + '", nonce="' + authInfo.nonce +
        '", uri="' + authInfo.uri + '", algorithm="' + authInfo.algorithm + '", qop=' + authInfo.qop + ', nc=' + authInfo.nc +
        ', cnonce="' + authInfo.cnonce + '", response="' + digestResponse + '", opaque="' + authInfo.opaque + '"'
    let url = td.base + td.actions[action].forms[0].href
    // write to a property
    axios.post(url, payload, { httpsAgent: agent, headers: { 'Authorization': header } }).then((response) => {
        if (response.status === 200) {
            console.log('Action is invoked')
        }
    }).catch((e) => {
        //console.error(e)
    })
}

