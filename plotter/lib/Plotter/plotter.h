/*
  Morse.h - Library to interact with plotter.
*/
#ifndef Plotter_h
#define Plotter_h

#include "Arduino.h"

struct Point {
  float x;
  float y;
};

typedef struct Point Point;

class Plotter
{
  public:
    Plotter();
    void setupPlotter();
    void disablePlotter();
    bool stepToTarget(Point target);
    void penUp();
    void penDown(float mm);
  private:
    int _pin;
};

#endif
