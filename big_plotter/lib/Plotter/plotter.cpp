#include <Arduino.h>
#include "Plotter.h"
// HIGH is counter clockwise
// clockwise tightens

const int stepperDelay = 100;
const int pretightenSteps = 10;
const int stepsPerLoop = 1000;


int DIR_PIN[3] = { 55, 61, 48 };
int STEP_PIN[3] = { 54, 60, 46 };
int ENABLE_PIN[3] = { 38, 56, 62 };

// side = 1784.35 mm
// float stepDistance = 676.275 / 50000.0;
// float spool1[2] = { 0, -1030.2 };
// float spool2[2] = { -892.2, 515.0 };
// float spool3[2] = { 892.2, 515.0 };
//
// float spoolDistance[3] { 1030.2, 1030.2, 1030.2 };

// side = 812.8 mm
float stepDistance = 676.275 / 50000.0;
float spool1[2] = { 0, -469.3 };
float spool2[2] = { -406.4, 234.6 };
float spool3[2] = { 406.4, 234.6 };

float spoolDistance[3] { 469.3, 469.3, 469.3 };


float pen[] = { 0.0, 0.0 };
int penDownSteps = 0;

float distance( float p1[2], float p2[2] ) {
  return sqrt( (p1[0] - p2[0])*(p1[0] - p2[0]) + (p1[1] - p2[1])*(p1[1] - p2[1]) );
}

float lerp( float a, float b, float x ) {
  return a + x * (b - a);
}

Plotter::Plotter() {
}

void Plotter::setupPlotter() {
  for (int i=0; i<3; i++) {
    pinMode(DIR_PIN[i], OUTPUT);
    pinMode(STEP_PIN[i], OUTPUT);
    pinMode(ENABLE_PIN[i], OUTPUT);
    digitalWrite(DIR_PIN[i], HIGH);
    digitalWrite(STEP_PIN[i], LOW);
    digitalWrite(ENABLE_PIN[i], LOW);
  }
  for (int i=0; i<pretightenSteps; i++) {
    for (int j=0; j<3; j++)
      digitalWrite(STEP_PIN[j], HIGH);
    delayMicroseconds(8*stepperDelay);
    for (int j=0; j<3; j++)
      digitalWrite(STEP_PIN[j], LOW);
   delayMicroseconds(8*stepperDelay);
  }
}

void Plotter::disablePlotter() {
  for (int i=0; i<3; i++)
    digitalWrite(ENABLE_PIN[i], HIGH);
}

void Plotter::penDown(float mm) {
  int stepDestination = (int) (mm / stepDistance);

  int diff = stepDestination - penDownSteps;
  int steps = abs(diff);
  int dir = diff > 0 ? HIGH : LOW;
  penDownSteps = stepDestination;

  for (int i=0; i<steps; i++) {
    for (int j=0; j<3; j++)
      digitalWrite(DIR_PIN[j], dir);

    for (int j=0; j<3; j++)
      digitalWrite(STEP_PIN[j], HIGH);

    delay(30);
    for (int j=0; j<3; j++)
      digitalWrite(STEP_PIN[j], LOW);

    delay(30);
  }
}

void Plotter::penUp() {
  Plotter::penDown(0.0);
}

bool Plotter::stepToTarget(Point target) {
  float targetArray[2] = {target.x, target.y};
  float distanceToTarget = distance(pen, targetArray);
  if (distanceToTarget < stepDistance / 2.0) {
    return true;
  }

  int stepsToTarget = (int) ceilf(distanceToTarget / stepDistance);
  float stepFraction = 1.0 / stepsToTarget;
  float step[2] = {
    (target.x - pen[0]) * stepFraction,
    (target.y - pen[1]) * stepFraction
  };

  for (int i=0; i<min(stepsPerLoop, stepsToTarget); i++) {
    pen[0] += step[0];
    pen[1] += step[1];

    int steps[3] = {
      (int) round((spoolDistance[0] - distance( pen, spool1 )) / stepDistance),
      (int) round((spoolDistance[1] - distance( pen, spool2 )) / stepDistance),
      (int) round((spoolDistance[2] - distance( pen, spool3 )) / stepDistance)
    };

    while (steps[0] != 0 || steps[1] != 0 || steps[2] != 0) {
      for (int j=0; j<3; j++) {
        if (steps[j] != 0) {
          if (steps[j] > 0) {
            steps[j]--;
            digitalWrite(DIR_PIN[j], HIGH);
            spoolDistance[j] -= stepDistance;
          } else {
            steps[j]++;
            digitalWrite(DIR_PIN[j], LOW);
            spoolDistance[j] += stepDistance;
          }
          digitalWrite(STEP_PIN[j], HIGH);
        }
      }
      delayMicroseconds(stepperDelay);

      for (int j=0; j<3; j++)
        digitalWrite(STEP_PIN[j], LOW);
      delayMicroseconds(stepperDelay);
    }
  }
  return false;
}
