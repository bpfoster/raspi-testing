#ifndef moisture_sensor_h
#define moisture_sensor_h

class MoistureSensor
{
  private:
    uint8_t _pin1;
    uint8_t _pin2;
    uint8_t _sensorPin;
    int _flip_time;
    void setSensorPolarity(boolean flip);
    
  public:
    MoistureSensor(uint8_t pin1, uint8_t pin2, uint8_t sensorPin);
    int readValue();
    void initialize();
};

#endif
