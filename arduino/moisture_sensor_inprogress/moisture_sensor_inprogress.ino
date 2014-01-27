#include <OneWire.h>
#include <DallasTemperature.h>


#define voltageFlipPin1 2
#define voltageFlipPin2 3
#define sensorPin1 0
#define sensorPin2 1
#define ldrPin 2


// Data wire is plugged into pin 2 on the Arduino
#define ONE_WIRE_BUS 2

// Setup a oneWire instance to communicate with any OneWire devices (not just Maxim/Dallas temperature ICs)
OneWire oneWire(ONE_WIRE_BUS);
// Pass our oneWire reference to Dallas Temperature.
DallasTemperature sensors(&oneWire);

DeviceAddress tempSensor1 = {0x28, 0xC5, 0x44, 0xBD, 0x04, 0x00, 0x00, 0x0E};
DeviceAddress tempSensor2 = {0x28, 0xD5, 0x70, 0xBD, 0x04, 0x00, 0x00, 0xCE};


#define led 13

int flipTimer = 1000;
int sleep = 1000 * 60;

void setup(){
  Serial.begin(9600);
//  pinMode(voltageFlipPin1, OUTPUT);
//  pinMode(voltageFlipPin2, OUTPUT);
//  pinMode(sensorPin1, INPUT);
//  pinMode(sensorPin2, INPUT);
  
  pinMode(led, OUTPUT);
  digitalWrite(led, LOW);
  
  // Start up the library
  sensors.begin(); // IC Default 9 bit. If you have troubles consider upping it 12. Ups the delay giving the IC more time to process the temperature measurement
  sensors.setResolution(tempSensor1, 10);
  sensors.setResolution(tempSensor2, 10);
}


void setSensorPolarity(boolean flip){
  if(flip){
    digitalWrite(voltageFlipPin1, HIGH);
    digitalWrite(voltageFlipPin2, LOW);
  }else{
    digitalWrite(voltageFlipPin1, LOW);
    digitalWrite(voltageFlipPin2, HIGH);
  }
}

void turnSensorOff() {
  digitalWrite(voltageFlipPin1, LOW);
  digitalWrite(voltageFlipPin2, LOW);
}


void loop(){
  
  //
  digitalWrite(led, HIGH);
  
//  setSensorPolarity(true);
//  delay(flipTimer);
//  int val11 = analogRead(sensorPin1);
//  int val21 = analogRead(sensorPin2);
//  delay(flipTimer);  
//  setSensorPolarity(false);
//  delay(flipTimer);
//  // invert the reading
//  int val12 = 1023 - analogRead(sensorPin1);
//  int val22 = 1023 - analogRead(sensorPin2);
  
  int ldrVal = analogRead(ldrPin);
  
  sensors.requestTemperatures();
  float tempVal = sensors.getTempF(tempSensor1);
  float tempVal2 = sensors.getTempF(tempSensor2);
  
//  turnSensorOff();
  
  digitalWrite(led, LOW);
  //
//  reportLevels(average(val11,val12), average(val21, val22), ldrVal, tempVal, tempVal2);
  reportLevels(-1, -1, ldrVal, tempVal, tempVal2);
    
  delay(sleep);
}

int average(int val1, int val2) {
  return (val1 + val2) / 2;
}

void reportLevels(int ms1,int ms2, int ldrVal, float tempVal, float tempVal2){
  
  String msg = "ms1:";
  msg += ms1;
  msg += ",ms2:";
  msg += ms2;
  msg += ",lv:";
  msg += ldrVal;
  msg += ",tmp:";
  Serial.print(msg);
  Serial.print(tempVal);
  Serial.print(",tmp2:");
  Serial.print(tempVal2);
  Serial.println("");

}

