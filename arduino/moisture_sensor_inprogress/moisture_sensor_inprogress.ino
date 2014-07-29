#include <OneWire.h>
#include <DallasTemperature.h>

#include "moisture_sensor.h"


#define voltageFlipPin1 4
#define voltageFlipPin2 5
#define sensorPin1 0
#define ldrPin 2


// Data wire is plugged into pin 2 on the Arduino
#define ONE_WIRE_BUS 3
// Setup a oneWire instance to communicate with any OneWire devices (not just Maxim/Dallas temperature ICs)
OneWire oneWire(ONE_WIRE_BUS);
// Pass our oneWire reference to Dallas Temperature.
DallasTemperature sensors(&oneWire);

DeviceAddress tempSensor1 = {0x28, 0xD5, 0x70, 0xBD, 0x04, 0x00, 0x00, 0xCE}; // first sensor on current pinout 
DeviceAddress tempSensor2 = {0x28, 0xC5, 0x44, 0xBD, 0x04, 0x00, 0x00, 0x0E};  // second sensor on current pinout


#define led 13

const int flipTimer = 1000;

const long sleepBetweenSensorReadings = 1000L * 60L;
const long sleepBetweenValueReporting = 1000L * 600L;
const int numReadingsBeforeReport = sleepBetweenValueReporting / sleepBetweenSensorReadings;
int timesSlept = 0;

int ldrReadings[numReadingsBeforeReport];
float temp1Readings[numReadingsBeforeReport];
float temp2Readings[numReadingsBeforeReport];
int ms1Readings[numReadingsBeforeReport];

MoistureSensor ms1(voltageFlipPin1, voltageFlipPin2, sensorPin1);

// Header constants
const String HEADER_VALUES = "[V]";

void setup(){
  Serial.begin(9600);
  
  ms1.initialize();
  
  pinMode(led, OUTPUT);
  digitalWrite(led, LOW);
  
  // Start up the library
  sensors.begin(); // IC Default 9 bit. If you have troubles consider upping it 12. Ups the delay giving the IC more time to process the temperature measurement
  sensors.setResolution(tempSensor1, 10);
  sensors.setResolution(tempSensor2, 10);
}

float getAverage(float values[]) {
  // TODO: This doesn't work on array values passed as args
  //int length = sizeof(values)/sizeof(values[0]);
  
  int length = numReadingsBeforeReport;
  
  
  float value = 0.0;
  for( int i = 0; i < length; i++) {
    value = value + values[i];
  }
  
  return value / length;
}

int getAverage(int values[]){
  // TODO: This doesn't work on array values passed as args
//  int length = sizeof(*values)/sizeof(values[0]);
  
  int length = numReadingsBeforeReport;
  
  int value = 0;
  for(int i = 0; i < length; i++) {
    value = value + values[i];
  }
  
  return value / length;
}


void loop(){
  digitalWrite(led, HIGH);
  
  ldrReadings[timesSlept] = analogRead(ldrPin);
  
  sensors.requestTemperatures();
  temp1Readings[timesSlept] = sensors.getTempF(tempSensor1);
  temp2Readings[timesSlept] = sensors.getTempF(tempSensor2);
  ms1Readings[timesSlept] = ms1.readValue();
  
  if (timesSlept + 1 == numReadingsBeforeReport) {    
    reportLevels(getAverage(ms1Readings), -1, getAverage(ldrReadings), getAverage(temp1Readings), getAverage(temp2Readings));
   
    timesSlept = -1; 
  }
  digitalWrite(led, LOW);
  
  delay(sleepBetweenSensorReadings);
  timesSlept = timesSlept + 1;
}



void reportLevels(int ms1, int ms2, int ldrVal, float tempVal, float tempVal2){
  Serial.print(HEADER_VALUES);
  Serial.print("ms1:");
  Serial.print(ms1);
  Serial.print(",ms2:");
  Serial.print(ms2);
  Serial.print(",lv:");
  Serial.print(ldrVal);
  Serial.print(",tmp:");
  Serial.print(tempVal);
  Serial.print(",tmp2:");
  Serial.print(tempVal2);
  Serial.println("");
}

