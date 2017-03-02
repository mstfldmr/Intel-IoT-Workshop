/*
 * Send and receive data via MQTT
 * 
 * A MQTT server is required.
 *
 * Option 1)
 *  https://test.mosquitto.org/
 *  test.mosquitto.org
 *
 * Option 2)
 *  Setup on Linux
 *  http://mustafa.aldemir.net/ubuntu-uzerinde-mqtt-mosquitto/
 */

"use strict";

var mraa = require("mraa") ;
var pin0 = new mraa.Aio(0);

//Uses mqtt.js: https://www.npmjs.com/package/mqtt
var mqtt    = require('mqtt');

//Connect to an analog sensor on Edison Arduino pin A0.
var analogVolts = function() {
  var counts = pin0.read();
  var volts = counts * 4.95 / 1023;
  return parseFloat(volts).toFixed(4);
};


//MQTT
var URL = 'mqtt://test.mosquitto.org:1883';
//var URL = 'mqtt://ec2-54-171-195-15.eu-west-1.compute.amazonaws.com:1883'
var CLIENTID= 'myClientID';
var TOPIC = 'workshop';

var client  = mqtt.connect(URL, { clientId: CLIENTID });

client.on('connect', function () {
    
    //subscribe
    client.subscribe(TOPIC);

    //publish every 2000ms
    setInterval(function(){
        client.publish(TOPIC, analogVolts());
    }, 2000);
    
});


client.on('message', function (top, msg) {
    //received a message
    if(top == TOPIC){
        console.log("Received: " + msg.toString())
    }
})