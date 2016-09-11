#include <Arduino.h>

int DIR_PIN[3] = { 55, 61, 48 };
int STEP_PIN[3] = { 54, 60, 46 };
int ENABLE_PIN[3] = { 38, 56, 62 };
int dir = 0;
int stepDelay = 1000;

void setup() {
  for (int i=0; i<3; i++) {
    pinMode(DIR_PIN[i], OUTPUT);
    pinMode(STEP_PIN[i], OUTPUT);
    pinMode(ENABLE_PIN[i], OUTPUT);
    digitalWrite(DIR_PIN[i], HIGH);
    digitalWrite(STEP_PIN[i], LOW);
    digitalWrite(ENABLE_PIN[i], LOW);
  }
  delay(2000);
}

void loop() {
  for (int j=0; j<3; j++)
    digitalWrite(DIR_PIN[j], ((dir)&1) == 0 ? HIGH : LOW);
  for (long int i=0; i<5000; i++) {
    digitalWrite(13, HIGH);
    for (int j=0; j<3; j++)
      digitalWrite(STEP_PIN[j], HIGH);
    delayMicroseconds(stepDelay);
    for (int j=0; j<3; j++)
      digitalWrite(STEP_PIN[j], LOW);
    digitalWrite(13, LOW);
    delayMicroseconds(stepDelay);
  }
  delay(2000);
  dir++;
}
