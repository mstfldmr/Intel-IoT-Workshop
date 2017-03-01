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
var t;
if (version >= 'v0.6.1') {
    console.log('mraa version (' + version + ') is good');
}
else {
    console.log('mraa version (' + version + ') is old - this code may not work');
}


var lcd = require('jsupm_i2clcd');
var display = new lcd.Jhd1313m1(0, 0x3E, 0x62);

var groveSensor = require('jsupm_grove');

var led = new groveSensor.GroveLed(2);
var light = new groveSensor.GroveLight(0);

/**
 * Use the upm library to drive the two line display
 */
function useUpm() {    
    var lux = light.value();// If the light sensor value reaches the threshold on/off LED
    console.log("Light Value: " + lux);
    
    display.clear();
    display.setCursor(0,0);
    if(lux < 0){     
        console.log("Error reading light sensor. Lux:" + lux);
        
        led.off();
        
        display.setColor(255, 255, 255);
        display.write("Error!");
        
    } else if(lux < 30){        
        led.on();
        
        display.setColor(0, 0, 255);
        scrollThis("Too dark. Turn on LED!")
        
    } else if(lux < 70){
        led.off();
        
        display.setColor(0, 255, 0);
        display.write("Not bad." + lux);
    } else{
        led.off();
        
        display.setColor(255, 0, 0);
        display.write("Bright!" + lux);
    }

}


/**
* Scroll a text
*  if it is longer than 16 characters (size of LCD)
*/
function scrollThis(text){
    display.write(text);
    var count = text.length - 16;
    loop(count);
}
function loop(count){
    //console.log("c: " + count);
    if(count>0){
        display.scroll (true);
        
        //call yourself again after 300ms
        setTimeout(function(){
            loop(count);
        }, 300); 
    }
    count--;  
}


/**
* Main function
*/
function main() {
    clearTimeout(t);
    setInterval(useUpm, 5000);
}

/**
* start
*/
main();