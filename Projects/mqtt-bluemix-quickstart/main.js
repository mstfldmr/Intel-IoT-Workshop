/*
 * Push sensor readings to Bluemix Quickstart via MQTT
 *
 * Connect an analog pin 0
 * Visit https://quickstart.internetofthings.ibmcloud.com
 */

"use strict" ;

var mraa = require('mraa'); 
var pin0 = new mraa.Aio(0);

//Uses mqtt.js: https://www.npmjs.com/package/mqtt
var mqtt    = require('mqtt');


//Connect to an analog sensor on Edison Arduino pin A0.
var analogVolts = function() {
  var counts = pin0.read();
  var volts = counts * 4.95 / 1023;
  return parseFloat(volts).toFixed(4);
};


//ID required to distinguish your sensor
var ID = Math.floor(Math.random() * 100000000);


//MQTT
var URL = 'mqtt://quickstart.messaging.internetofthings.ibmcloud.com:1883';

var CLIENTID= 'd:quickstart:iotquick-edison:' + ID;
var TOPIC = 'iot-2/evt/status/fmt/json';

var client  = mqtt.connect(URL, { clientId: CLIENTID });

client.on('connect', function () {
  setInterval(function(){
    client.publish(TOPIC, '{"d":{"Volts":' + analogVolts() + '}}'); //Payload is JSON
  }, 2000); //Keeps publishing every 2000 milliseconds.
});


console.log("");
console.log("https://quickstart.internetofthings.ibmcloud.com/#/device/" + ID + "/sensor/");