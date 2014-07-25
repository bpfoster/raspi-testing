#include "Arduino.h"
#include "moisture_sensor.h"


void MoistureSensor::setSensorPolarity(boolean flip){
  if(flip){
    digitalWrite(_pin1, HIGH);
    digitalWrite(_pin2, LOW);
  }else{
    digitalWrite(_pin1, LOW);
    digitalWrite(_pin2, HIGH);
  }
}



MoistureSensor::MoistureSensor(uint8_t pin1, uint8_t pin2, uint8_t sensorPin)
{
  _pin1 = pin1;
  _pin2 = pin2;
  _sensorPin = sensorPin;
  _flip_time = 1000;
}

void MoistureSensor::initialize()
{
  pinMode(_pin1, OUTPUT);
  pinMode(_pin2, OUTPUT);
  pinMode(_sensorPin, INPUT); 
}

int MoistureSensor::readValue()
{
  setSensorPolarity(true);
  delay(_flip_time);
  int val1 = analogRead(_sensorPin); 
  delay(_flip_time);  
  setSensorPolarity(false);
  delay(_flip_time);
  // invert the reading
  int val2 = 1023 - analogRead(_sensorPin);
  
  digitalWrite(_pin1, LOW);
  digitalWrite(_pin2, LOW);
  
  return (val1 + val2) / 2;
}



