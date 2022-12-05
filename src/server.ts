/*TODO: 
* Credentials from other file
* Add comments
* http and https configurable 
* 
*/


import bodyParser from 'body-parser';
import express from 'express';
import * as http from 'http';
import * as https from 'https';
import Thing from './things';
import { responseArray } from './types';
import { cryptoUsingMD5, cryptoUsingSHA256, digestAuth, parseAuthenticationInfo } from './securityScheme/digest';
import {verifyTokenUsingOkta} from './securityScheme/clientCredential'

var messageBus =require('./eventHandler')
const fs = require("fs");
const actionEmitter = require("./actionHandler")

/*var EventEmitter = require('events').EventEmitter
var messageBus = new EventEmitter()*/
//var responseArray: express.Response<any, Record<string, any>>[] | { send: () => void; }[] = []

var responseList: responseArray[]
responseList = []

const credential_digest = {
    userName: "iot",
    password: "gardenThings",
    realm: 'Digest Authentication'
};
const credentials = {
    userName: "iot",
    password: "gardenThings"
};
const apiCredential = {
    apikey: "gardenThings"
}
const bearerCredentials = {
    token: 'eyJraWQiOiJ1dURLVTMxZWRvTi0wd0xMUnl1TW1vbmtBdi1OaFEwejZhWmxjdTN5NU8wIiwiYWxnIjoiUlMyNTYifQ'
}

export class WebOfThing {
    private thing: Thing;

    constructor(thing: Thing) {
        this.thing = thing;
    }

    /**
     * get the things description
     */
    getThing(): Thing {
        return this.thing;
    }

}


abstract class BaseHandler {
    protected things: WebOfThing;
    constructor(things: WebOfThing) {
        this.things = things;
    }
    getThing(): Thing | null {
        return this.things.getThing();
    }

    publish(event: string, data: any) {
        console.log('Publish to the event:' + event)
        //messageBus.emit(event, data)
        messageBus.emitEvent.emit(event, data)
    }
}



/**
 * Handle a request to /.
 */
class WoTThingHandler extends BaseHandler {

    get(req: express.Request, res: express.Response): void {
        const thing = this.getThing();
        if (thing === null) {
            res.status(400).end();
            return;
        }
        const description = thing.getTD();
        description.base = `${req.protocol}://${req.headers.host}${thing.getHref()}`;
        res.json(description);
    }
}

/**
 * Property Request handler
 */
class PropertyHandler extends BaseHandler {
    // Read property request
    get(req: express.Request, res: express.Response): void {
        const td = this.getThing();
        if (td === null) {
            res.status(400).end();
            return;
        }
        const propertyName = req.params.propertyName;
        if (td.hasProperty(propertyName)) {
            res.json(td.getProperty(propertyName));
        } else {
            res.status(400).end();
        }
    }

    // Write property request
    put(req: express.Request, res: express.Response): void {
        const thing = this.getThing();
        if (thing === null) {
            res.status(400).end();
            return;
        }
        const propertyName = req.params.propertyName;
        if (thing.hasProperty(propertyName)) {
            try {
                thing.setWriteProperty(propertyName, req.body);
            } catch (error) {
                // Security: error should not be returned
                if (error !== null && typeof error == 'string') {
                    res.json(error.toString());
                }
                res.status(400).end()
                return;
            }
            res.status(200).end();
            //res.json({ [propertyName]: thing.getProperty(propertyName) });
        } else {
            res.status(400).json("Invalid property name").end();
        }
    }


}

/**
 * Action Request handler
 */
class ActionHandler extends BaseHandler {

    post(req: express.Request, res: express.Response): void {
        const thing = this.getThing();
        if (thing === null) {
            res.status(400).end();
            return;
        }
        const actionName = req.params.actionName;
        actionEmitter.invokeAction.emit(actionName, thing)
        res.status(200).end();
    }

}
let count= 1
/**
 * Event request handler. TODO: Not done yet
 */
class EventHandler extends BaseHandler  {

    get(req: express.Request, res: express.Response): void {
        //console.log('Event get')
        const thing = this.getThing();
        if (thing === null) {
            res.status(400).end();
            return;
        }
        const eventName = req.params.eventName;
        console.log(eventName)
        
        responseList.push({
            'eventName': eventName,
            'response': res
         })
        var addMessageListener = function () {
            //console.log('function call')
            messageBus.emitEvent.once(eventName, function () {
                //console.log('sending data')
                var filteredArray = responseList.filter(responseList => responseList.eventName === eventName);
                  filteredArray.forEach(val=> val.response.send())
            })
        }
        addMessageListener()
        // send the 1st response to establish the connection
        if(count == 1) {
            count = count+1
            res.send()
        }
        //console.log('sequence 1')
    }
}


/**
 * Server to represent a Web Thing over HTTP.
 */
export class WoTHttpServer {
    things: WebOfThing;
    port: number;
    basePath: string;
    app: express.Express;
    server: http.Server | https.Server;
    router: express.Router;

    constructor(
        things: WebOfThing,
        port: number | null = null,
        basePath: string = '/',
    ) {
        this.things = things;
        this.port = Number(port);
        this.basePath = basePath.replace(/\/$/, '') + '/' + this.things.getThing().getTitle() + '/';
        things.getThing().setHrefPrefix(this.basePath);

        this.app = express();
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.raw());
        this.app.use(bodyParser.text());

        // Setting CORS headers
        this.app.use((request, response, next) => {
            response.setHeader('Access-Control-Allow-Origin', '*');
            response.setHeader(
                'Access-Control-Allow-Headers',
                'Origin, X-Requested-With, Content-Type, Accept'
            );
            // response.setHeader("Content-Type", "application/td+json");
            response.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, POST, DELETE');
            if (request.path.split('/').length > 2) {
                let schema = things.getThing().getSecurityScheme();
                console.log(things.getThing().getSecurityName())
                const inValue = things.getThing().getSecurityIn()
                let authValue
                switch (inValue) {
                    case 'query': {
                        authValue = request.query
                        break
                    }
                    case 'body': {
                        authValue = request.body
                        break;
                    }
                    case 'cookie': {
                        authValue = request.headers.cookie
                        let v = authValue?.split(':')
                        if (v) {
                            let v1 = '{"' + v[0] + '":"' + v[1] + '"}'
                            authValue = JSON.parse(v1)
                        }
                        break;
                    }
                    case 'header': {
                        authValue = request.headers
                        break
                    }
                }
                console.log('authValue[things.getThing().getSecurityIn()]')
                console.log(authValue[things.getThing().getSecurityName()])
                switch (schema) {
                    case 'basic': {
                        if (!this.basicAuthentication(response, authValue[things.getThing().getSecurityName()])) {
                            return
                        }
                        break
                    }
                    case 'digest': {
                        let algorithm = 'MD5'
                        let authInfo: any, hash;
                        if (algorithm == "MD5") {
                            hash = cryptoUsingMD5(credential_digest.realm);
                        } else {
                            hash = cryptoUsingSHA256(credential_digest.realm);
                        }
                        if (!authValue.authorization) {
                            this.authenticateUser(response, hash);
                            return;
                        }
                        authInfo = authValue.authorization.replace(/^Digest /, '');
                        authInfo = parseAuthenticationInfo(authInfo);
                        if (authInfo.username !== credential_digest.userName) {
                            this.authenticateUser(response, hash);
                            return;
                        }
                        let digestResp = digestAuth(credential_digest, request.method, algorithm, authInfo)
                        if (authInfo.response !== digestResp) {
                            this.authenticateUser(response, hash);
                            return;
                        }
                        /*let authInfo: any, hash;
                        let digestAuthObject: any = {};
                        hash = this.cryptoUsingMD5(credential_digest.realm);
                        if (!request.headers.authorization) {
                            this.authenticateUser(response, hash);
                            return;
                        }
                        authInfo = request.headers.authorization.replace(/^Digest /, '');
                        authInfo = this.parseAuthenticationInfo(authInfo);
                        if (authInfo.username !== credential_digest.userName) {
                            this.authenticateUser(response, hash);
                            return;
                        }
                        digestAuthObject.ha1 = this.cryptoUsingMD5(authInfo.username + ':' + credential_digest.realm + ':' + credential_digest.password);
                        digestAuthObject.ha2 = this.cryptoUsingMD5(request.method + ':' + authInfo.uri);
                        var resp = this.cryptoUsingMD5([digestAuthObject.ha1, authInfo.nonce, authInfo.nc, authInfo.cnonce, authInfo.qop, digestAuthObject.ha2].join(':'));

                        digestAuthObject.response = resp;
                        if (authInfo.response !== digestAuthObject.response) {
                            this.authenticateUser(response, hash);
                            return;
                        }*/
                        break;
                    }
                    case 'apikey': {
                        if (!authValue[things.getThing().getSecurityName()]) {
                            this.authenticationStatus(response, "ApiKey Authentication")
                            return;
                        } else {
                            let authKey = authValue[things.getThing().getSecurityName()];
                            if (apiCredential.apikey !== authKey) {
                                this.authenticationStatus(response, "ApiKey Authentication")
                                return
                            }
                        }
                        break;
                    }
                    case 'bearer': {
                        if (authValue[things.getThing().getSecurityName()] === undefined) {
                            response.sendStatus(407)
                            response.json({ 'message': "Authorization is needed" })
                            response.end('');
                            return
                        }
                        const auth = authValue[things.getThing().getSecurityName()].split(" ");
                        if (auth[0] !== "Bearer" || auth[1] !== bearerCredentials.token) {
                            response.end('Authorization is needed');
                            return
                        }

                        break;
                    }
                    case 'oauth2': {
                        if (authValue[things.getThing().getSecurityName()] === undefined) {
                            response.sendStatus(407)
                            response.json({ 'message': "Authorization is needed" })
                            response.end('');
                            return
                        }
                        const auth = authValue[things.getThing().getSecurityName()].split(" ");
                        verifyTokenUsingOkta(auth[1]).then(response => console.log(response))
                        break;
                    }
                }
            }
            next()
        });

        this.server = https.createServer({
            key: fs.readFileSync("key.pem"),
            cert: fs.readFileSync("cert.pem")
        });
        //this.server = http.createServer();
        const wotHandler = new WoTThingHandler(this.things);
        const propertyHandler = new PropertyHandler(this.things);
        const actionHandler = new ActionHandler(this.things);
        const eventHandler = new EventHandler(this.things);

        this.router = express.Router();
        this.router.get('/', (req, res) => wotHandler.get(req, res));
        this.router.get('/properties/:propertyName', (req, res) => propertyHandler.get(req, res));
        this.router.put('/properties/:propertyName', (req, res) => propertyHandler.put(req, res));
        this.router.post('/actions/:actionName', (req, res) => actionHandler.post(req, res));
        this.router.get('/events/:eventName', (req, res) => eventHandler.get(req, res));
        this.app.use(this.basePath || '/', this.router);
        this.server.on('request', this.app);
    }

    //Basic Authentication
    basicAuthentication(response: express.Response, authValue: any) {
        //console.log(authValue.authorization)
        if (!authValue) {
            this.authenticationStatus(response, "Basic Authentication")
            return false;
        } else {
            let authentication, loginInfo;
            authentication = authValue.replace(/^Basic/, '');
            authentication = Buffer.from(authentication, 'base64').toString('utf-8');
            loginInfo = authentication.split(':');
            if (loginInfo[0] !== credentials.userName || loginInfo[1] !== credentials.password) {
                this.authenticationStatus(response, "Basic Authentication")
                return false
            }
            return true
        }
    }

    authenticationStatus(resp: express.Response, realm: string) {
        resp.writeHead(200, { 'WWW-Authenticate': 'Basic realm="'+ realm +'"' });
        resp.json('{Error:Authorization is needed}');
        //resp.end();

    };

    authenticateUser(res: express.Response, hash: string) {
        res.writeHead(401, {
            'WWW-Authenticate': 'Digest realm="' + credential_digest.realm + '",qop="auth",nonce="' +
                Math.random() + '",opaque="' + hash + '"'
        });
        res.end('Authorization is needed.');
    }

    start(): Promise<void> {
        return new Promise((resolve) => {
            this.server.listen({ port: this.port }, resolve);
        });
    }
// TODO : how to stop for long poll
    stop(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.server.close((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        })
    }
}
