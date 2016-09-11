#include <Arduino.h>
#include "Plotter.h"
// HIGH is counter clockwise
// clockwise tightens

const int stepsPerRevolution = 200;
const int stepperDelay = 8;
const int pretightenSteps = 5;
const int stepsPerLoop = 10;


int DIR_PIN[3] = { 3, 7, 11 };
int STEP_PIN[3] = { 4, 8, 12 };
int ENABLE_PIN[3] = { 5, 10, 13 };

float spool1[2] = { -225.2, -130.0 };
float spool2[2] = { 0.0, 260.0 };
float spool3[2] = { 225.2, -130.0 };

float pen[] = { 0.0, 0.0 };
float spoolDistance[3] { 260.0, 260.0, 260.0 };

float stepDistance = 42.5 / stepsPerRevolution;
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
    delay(200);
    for (int j=0; j<3; j++)
      digitalWrite(STEP_PIN[j], LOW);
   delay(200);
  }
}

void Plotter::disablePlotter() {
  for (int i=0; i<3; i++) {
    pinMode(DIR_PIN[i], OUTPUT);
    pinMode(STEP_PIN[i], OUTPUT);
    pinMode(ENABLE_PIN[i], OUTPUT);
    digitalWrite(DIR_PIN[i], HIGH);
    digitalWrite(STEP_PIN[i], LOW);
    digitalWrite(ENABLE_PIN[i], HIGH);
  }
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
      delay(stepperDelay);

      for (int j=0; j<3; j++)
        digitalWrite(STEP_PIN[j], LOW);
      delay(stepperDelay);
    }
  }
  return false;
}
