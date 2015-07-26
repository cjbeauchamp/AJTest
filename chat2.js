var alljoyn = require('alljoyn');

var myArgs = process.argv.slice(2);
var mode = myArgs[0];

console.log("Loading alljoyn bus...");
var sessionId = 0;
var portNumber = 27;
var serviceName = "org.alljoyn.bus.samples.chat.test";
var interfaceName = "org.alljoyn.bus.samples.chat";
var bus = alljoyn.BusAttachment("chat");
var inter = alljoyn.InterfaceDescription();

console.log("CreateInterfaceInBus " + bus.createInterface(interfaceName, inter));
console.log("AddingSignal " + inter.addSignal("Chat", "s",  "msg"));

var busListener = alljoyn.BusListener(
  function(name){
    console.log("BusListener: FoundAdvertisedBusName", name);
    sessionId = bus.joinSession(name, portNumber, 0);
    console.log("BusListener: JoinedSession " + sessionId);
  },
  function(name){
    console.log("BusListener: LostAdvertisedBusName", name);
  },
  function(name){
    console.log("BusListener: BusNameOwnerChanged", name);
  }
);
console.log("Registering bus listener...");
bus.registerBusListener(busListener);

console.log("StartingBus " + bus.start());
console.log("Creating chat service object...");
var chatObject = alljoyn.BusObject("/chatService");
console.log("AddInterfaceToObject " + chatObject.addInterface(inter));

console.log("RegisterSignalHandler " + bus.registerSignalHandler(chatObject, function(msg, info){
  console.log("Signal received: ", msg, info);
  console.log(info["sender"], msg["0"]);
}, inter, "Chat"));

console.log("RegisterBusObject " + bus.registerBusObject(chatObject));
console.log("ConnectBus " + bus.connect());

var portListener = alljoyn.SessionPortListener(
  function(port, joiner){
    console.log("PortListener: AcceptSessionJoiner", port, joiner);
      //return port == portNumber;
      return true;
  },
  function(port, sId, joiner){
    sessionId = sId;
    console.log("PortListener: SessionJoinedByJoiner", port, sessionId, joiner);
  }
);

if(mode.localeCompare("host") == 0){ // host advertises service
  console.log("BusRequestName " + bus.requestName(serviceName));
  console.log("BusBindSessionPortWithPortListener " + bus.bindSessionPort(27, portListener));
  console.log("BusAdvertiseName " + bus.advertiseName(serviceName));
} else { // client looks for service rather than advertise it
  console.log("BusFindAdvertisedName " + bus.findAdvertisedName(serviceName));
}

// Added Chat to example
var stdin = process.stdin;
stdin.resume();
// i don't want binary, do you?
stdin.setEncoding( 'utf8' );
// on any data into stdin
stdin.on( 'data', function( key ){
  // ctrl-c ( end of text )
  if ( key === '\u0003' ) {
    process.exit();
  }
  // write the key to stdout all normal like
  process.stdout.write( ":me " + key);
  chatObject.signal(null, sessionId, inter, "Chat", key.replace(/(\r\n|\n|\r)/gm,""));
});