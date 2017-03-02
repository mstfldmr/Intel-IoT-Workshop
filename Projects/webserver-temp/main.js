/*
 * IoT Web Server
 * Start a web server
 * Read temperature sensor and return JSON
 */

"use strict";

// we want mraa to be at least version 0.6.1
var mraa = require('mraa');
var version = mraa.getVersion();
if (version >= 'v0.6.1') {
    console.log('mraa version (' + version + ') is good');
}
else {
    console.log('mraa version (' + version + ') is old - this code may not work');
}


//Define sensors
var groveSensor = require('jsupm_grove');
var tempSensor = new groveSensor.GroveTemp(1);


// useful system debug info
sysIdentify();

// define up front, due to no "hoisting"
process.on("exit", function(code) {
    clearInterval(intervalID) ;
    console.log("\nExiting " + APP_NAME + ", with code:", code) ;
});



// Configure the IP address and the port the server listens to
var ipAddress = "0.0.0.0";     // "0.0.0.0" means monitor all network interfaces
var ipPort = 1337;             // the IP port to be used by the web data server

var serverReqCount = 0;


// detect IP address (optional)
var path = require("path");
var ipv4 = require(path.join(__dirname, "utl/get-ipv4-addresses.js")).getIPv4Addresses();
console.log("\n" + ipv4[0] + " IPv4 network interface(s) found.");
if( ipv4[0] > 0 ) {
    console.log("Direct your browser to any of the following URLs:");
    for( var i=ipv4[0]; i; i-- ) {
        console.log("  http://" + ipv4[i][1] + ":" + ipPort);
    }
    console.log(" ");
}
else {
    console.log("No network interfaces found, unable to start " + APP_NAME + ".");
    process.exit(1);
}

/*
 * start the IoT web server and wait for page requests
 */
var http = require("http");
var server = http.createServer( function(req, res) {
        var dataRead = getSensorData();

        res.writeHead(200, { "Content-Type":"text/json" });
        res.write(JSON.stringify(dataRead));
        res.end();
        console.log(JSON.stringify(dataRead));

        serverReqCount++;
    }).listen(ipPort, ipAddress, function() {
        console.log("Server listening on: " + JSON.stringify(server.address()));
        console.log(" ");
});


/*
 * Collect sensor data to be reported by the IoT web server.
 */
function getSensorData() {

    var temperature = tempSensor.value();
    var currTime = Date.now();

    return { temp:temperature, currentTime:currTime };
}


/*
 * print info to the console...
 */
function sysIdentify() {
    console.log("node version: " + process.versions.node);

    var os = require('os');
    console.log("os type: " + os.type());
    console.log("os platform: " + os.platform());
    console.log("os architecture: " + os.arch());
    console.log("os release: " + os.release());
    console.log("os hostname: " + os.hostname());
}


// this is mostly just a "keep alive" so our web server does not terminate
var periodicActivity = function() {
    console.log("Server request count: " + serverReqCount);
} ;
var intervalID = setInterval(periodicActivity, 10000); // start the periodic activity