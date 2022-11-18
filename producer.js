
const {
    WoTHttpServer,
    WebOfThing,
} = require('./dist/affordance');

//const actionEmitter = require('./lib/emitter')
actionFunc = require("./dist/actionHandler")
eventFunc = require("./dist/eventHandler")
ThingsConsume = require("./dist/thingsConsume")
// Fetching the things description json from a file
const tdJson= require('./td.json'); 
// consuming the TD
let garden = new ThingsConsume(tdJson);
garden.setWriteProperty('state','manualWatering')

// action call function
actionFunc.invokeAction.on('startSprinkler', (thing) => {
  console.log("start the Sprinkler ")
  let threshold = garden.getProperty('humidityThreshold').threshold
  if (threshold > 20) {
    eventFunc.emitEvent.emit('tooWet', {})
  }
})

actionFunc.invokeAction.on('stopSprinkler', () => {
  console.log("stop the Sprinkler ")
})


const server = new WoTHttpServer(
    new WebOfThing(garden),
    8080
  );

  process.on('SIGINT', () => {
    server
      .stop()
      .then(() => process.exit())
      .catch(() => process.exit());
  });

  server.start().catch(console.error);