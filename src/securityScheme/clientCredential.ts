require('dotenv').config()
const request = require('request-promise')
const btoaVar = require('btoa')
const { ISSUER, CLIENT_ID, CLIENT_SECRET, DEFAULT_SCOPE } = process.env


export async function getAccessToken(): Promise<any> {
    const token = btoaVar(`${CLIENT_ID}:${CLIENT_SECRET}`)
    try {
        const { token_type, access_token } = await request({
            uri: `${ISSUER}/v1/token`,
            json: true,
            method: 'POST',
            headers: {
                authorization: `Basic ${token}`,
            },
            form: {
                grant_type: 'client_credentials',
                scope: DEFAULT_SCOPE,
            },
        })
        //console.log(token_type)
        //console.log(access_token)
        return { token_type, access_token }
    } catch (error: any) {
        console.log(`Error v: ${error.message}`)
        throw error
    }
}

export async function verifyTokenUSingOkta(access_token: string): Promise<Boolean> {
    const OktaJwtVerifier = require('@okta/jwt-verifier')
    const oktaJwtVerifier = new OktaJwtVerifier({
        issuer: process.env.ISSUER,
        clientId: process.env.TEST_CLIENT_ID,
        jwksUri: `${ISSUER}/v1/keys`
    })
    try {
        await oktaJwtVerifier.verifyAccessToken(access_token)
        console.log('Token is verified')
        //console.log(jwt)
        return true
    } catch (error: any) {
        console.log({ error: error.message })
        throw error
    }
}

export async function verifyTokenUSingIntrospect(access_token: string): Promise<Boolean> {
    const token = btoaVar(`${CLIENT_ID}:${CLIENT_SECRET}`)
    try {
        await request({
            uri: `${ISSUER}/v1/introspect`,
            json: true,
            method: 'POST',
            headers: {
                authorization: `Basic ${token}`,
            },
            form: {
                token: access_token,
                token_type_hint: 'access_token',
            },
        })
        //console.log(val)
        return true
    } catch (error: any) {
        console.log(`Error intro: ${error.message}`)
        throw error
    }
}

//test()

