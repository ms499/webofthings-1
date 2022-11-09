Servient = require("@node-wot/core").Servient;
HttpsClientFactory = require("@node-wot/binding-http").HttpsClientFactory;

Helpers = require("@node-wot/core").Helpers;
let httpsConfig = {
    allowSelfSigned: true
}
// create Servient and add HTTP binding
let servient = new Servient();
servient.addClientFactory(new HttpsClientFactory(httpsConfig));
servient.addCredentials({
    "urn:dev:wot:org:eclipse:thingweb:mygardenThings": {
        apiKey: "gardenThings"
        //username: "iot",
        //password: "gardenThings"
        //token: "eyJraWQiOiJ1dURLVTMxZWRvTi0wd0xMUnl1TW1vbmtBdi1OaFEwejZhWmxjdTN5NU8wIiwiYWxnIjoiUlMyNTYifQ"
    },
});
let wotHelper = new Helpers(servient);
const WeatherPredictionAddress = "https://localhost:8080/mygardenthing";

wotHelper.fetch(WeatherPredictionAddress).then(async (TD) => {
    console.log("!!!Start!!!!")
    try {
        const WoT = await servient.start();
        let weatherpredictionThing = await WoT.consume(TD);
        weatherpredictionThing.writeProperty("humidityThreshold", { "threshold": 89 })
        let state = await weatherpredictionThing.readProperty("humidityThreshold");
        let stateValue = await state.value()
        await weatherpredictionThing.invokeAction("startSprinkler")

       /* weatherpredictionThing.subscribeEvent("tooWet", async (data) => {
            // state verification for client to invoke action stop sprinkler
            /*let state = await weatherpredictionThing.readProperty("state");
            let stateValue = await state.value()
            if (stateValue == "automaticWatering") {
                console.log("!!!Stop the Sprinkler!!!!")
                await weatherpredictionThing.invokeAction("stopSprinkler")
            }
            console.log('success is what i want')
        });*/
    }
    catch (err) {
        console.error("Script error:", err);
    }
});

