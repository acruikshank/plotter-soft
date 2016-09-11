#include <Arduino.h>
#include <Plotter.h>
// #include "noise_grid.h"
#include "circle.h"

Plotter plotter;
Point target;
int currentPoint = 0;


void setup() {
  Point point;
  pinMode(13,OUTPUT);
  digitalWrite(13,HIGH);
  delay(2000);
  plotter.setupPlotter();
  target = circle(0);
  while(!plotter.stepToTarget(target));
  delay(1000);
  // plotter.penDown(4.0);
  // Serial.begin(9600);
}

void loop() {
  if (currentPoint < NUM_POINTS) {
    if (plotter.stepToTarget(target))
      target = circle(++currentPoint);
  } else {
    // plotter.penUp();
    Point target;
    target.x = 0.0;
    target.y = 0.0;
    while(!plotter.stepToTarget(target));
    plotter.disablePlotter();
  }
}
