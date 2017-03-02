/*
 * Send and receive data via MQTT
 * 
 * Analog Sensor => A0
 * LCD => I2C
 * Buzzer => D6
 *
 * A MQTT server is required.
 * Option 1)
 *  https://test.mosquitto.org/
 *  test.mosquitto.org
 * Option 2)
 *  Setup on Linux
 *  http://mustafa.aldemir.net/ubuntu-uzerinde-mqtt-mosquitto/
 */

"use strict";

var mraa = require("mraa") ;
var mySensor = new mraa.Aio(0); // any analog sensor
var myBuzzer = new mraa.Gpio(6); //buzzer
var myButton = new mraa.Gpio(5); //button
myBuzzer.dir(mraa.DIR_OUT);
myButton.dir(mraa.DIR_IN);

//Uses mqtt.js: https://www.npmjs.com/package/mqtt
var mqtt    = require('mqtt');

// Load lcd module on I2C
var LCD = require('jsupm_i2clcd');
// Initialize Jhd1313m1 at 0x62 (RGB_ADDRESS) and 0x3E (LCD_ADDRESS) 
var myLcd = new LCD.Jhd1313m1 (0, 0x3E, 0x62);


//Read analog sensor value.
var analogVolts = function() {
  var counts = mySensor.read();
  var volts = counts * 4.95 / 1023;
  return parseFloat(volts).toFixed(4);
};


//MQTT
var URL = 'mqtt://test.mosquitto.org:1883';
//var URL = 'mqtt://ec2-54-171-195-15.eu-west-1.compute.amazonaws.com:1883'
var CLIENTID= 'myClientID';
var TOPIC1 = 'workshop//temp';
var TOPIC2 = 'workshop//display';
var TOPIC3 = 'workshop//buzz';

var client  = mqtt.connect(URL, { clientId: CLIENTID });

client.on('connect', function () {
    
    //subscribe
    client.subscribe(TOPIC1);
    client.subscribe(TOPIC2);
    client.subscribe(TOPIC3);

    //publish every 2000ms
    setInterval(function(){
        client.publish(TOPIC1, analogVolts());
    }, 2000);
    
});



client.on('message', function (top, msg) {    
    //received a message
    if(top == TOPIC1){
        
        console.log("Received: " + msg.toString())
        
    } else if(top == TOPIC2){
        
        console.log("Display: " + msg.toString())

        myLcd.clear();
        myLcd.setCursor(0,0);
        myLcd.write(msg.toString());
    } else if(top == TOPIC2){
        
        console.log("Display: " + msg.toString())

        myLcd.clear();
        myLcd.setCursor(0,0);
        myLcd.write(msg.toString());
    } else if(top == TOPIC3){
        
        if(msg.toString() == "start"){
            myBuzzer.write(1);
        } else{
            myBuzzer.write(0);
        }
    }
});


setInterval(function(){
    if(myButton.read()){
        myBuzzer.write(0);
    }
}, 100);