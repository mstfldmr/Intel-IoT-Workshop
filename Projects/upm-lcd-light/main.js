/*
 * Using UPM Library to control LCD, light sensor and LED
 *
 * LCD => any I2C port
 * Light Sensor => A0 port
 * LED => D2 port
 */

"use strict" ;

// we want mraa to be at least version 0.6.1
var mraa = require('mraa');
var version = mraa.getVersion();
if (version >= 'v0.6.1') {
    console.log('mraa version (' + version + ') is good');
}
else {
    console.log('mraa version (' + version + ') is old - this code may not work');
}

// Load lcd module on I2C
var LCD = require('jsupm_i2clcd');

// Initialize Jhd1313m1 at 0x62 (RGB_ADDRESS) and 0x3E (LCD_ADDRESS) 
var myLcd = new LCD.Jhd1313m1 (0, 0x3E, 0x62);

//Define sensors
var groveSensor = require('jsupm_grove');

var led = new groveSensor.GroveLed(2);
var light = new groveSensor.GroveLight(0);


/**
 * Use the upm library to drive the two line display
 */
function useUpm() {    
    var raw = light.raw_value(); //read raw value from the sensor
    var lux = light.value(); //read approximate lux value
    console.log("Lux: " + lux + " --- Raw: " + raw);
    
    myLcd.clear();
    myLcd.setCursor(0,0);
    if(lux < 0){     
        console.log("Error reading light sensor. Lux:" + lux);
        
        led.off();
        
        myLcd.setColor(255, 255, 255);
        myLcd.write("Error!");
        
    } else if(lux < 30){        
        led.on();
        
        myLcd.setColor(0, 0, 255);
        scrollThis("Too dark! Turn on the LED!");
        
    } else if(lux < 70){
        led.off();
        
        myLcd.setColor(0, 255, 0);
        myLcd.write("Not bad: " + lux);
    } else{
        led.off();
        
        myLcd.setColor(255, 0, 0);
        myLcd.write("Bright! " + lux + " lux");
    }

}


/**
* Scroll a text
*  if it is longer than 16 characters (size of LCD)
*/
function scrollThis(text){
    myLcd.write(text);
    var count = text.length - 16;
    loop(count);
}
function loop(count){
    //console.log("c: " + count);
    if(count>0){
        myLcd.scroll (true);
        
        //call yourself again after 300ms
        setTimeout(function(){
            loop(count);
        }, 300); 
    }
    count--;  
}


//timeout
var t;
clearTimeout(t);
setInterval(useUpm, 5000);