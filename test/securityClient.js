const axios = require('axios')
const DATA = {
    userName: "iot",
    password: "gardenThings"
}
const HEADER = {
  headers: { Accept: 'application/json',
  Authorization:'Basic aW90OmdhcmRlblRoaW5ncw==' },
}
const HEADER_API = {
    headers: { Accept: 'application/json',
    apikey: "gardenThings" },
  }
  const COOKIE_BASIC = {
    headers: { 
    cookie: "authorization:Basic aW90OmdhcmRlblRoaW5ncw==" },
  }
const HEADER_BEARER = {
    headers: { Accept: 'application/json',
    Authorization:'Bearer eyJraWQiOiJ1dURLVTMxZWRvTi0wd0xMUnl1TW1vbmtBdi1OaFEwejZhWmxjdTN5NU8wIiwiYWxnIjoiUlMyNTYifQ' },
  }
const QUERY_API ={ params: { apikey: "gardenThings" } }
const QUERY_BASIC ={ params: { authorization: 'Basic aW90OmdhcmRlblRoaW5ncw==' } }
const QUERY_BEARER ={ params: { authorization: 'Bearer eyJraWQiOiJ1dURLVTMxZWRvTi0wd0xMUnl1TW1vbmtBdi1OaFEwejZhWmxjdTN5NU8wIiwiYWxnIjoiUlMyNTYifQ' } }
axios
  .get('http://localhost:8080/mygardenthing', COOKIE)
  .then((response) => {
    if (response.status === 200) {
      console.log('Req body:', response.data)
    }
    
  })
  .catch((e) => {
    console.error(e)
  })
