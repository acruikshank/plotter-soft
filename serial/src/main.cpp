#include <Arduino.h>
#include <Plotter.h>

Plotter plotter;

typedef struct Command {
  byte code;
  short int delay;
  Point target;
} Command;

const int COMMAND_BUFFER_COUNT = 5;
Command commandBuffer[COMMAND_BUFFER_COUNT];
int readIndex = 0;
int operationIndex = 0;
unsigned long lastPing = 0;

void setup() {
  plotter.disablePlotter();
  delay(2000);
  Serial.begin(9600);
}

void executeCommand(Command command) {
  switch (command.code) {
    case 0:
      plotter.setupPlotter();
      break;
    case 1:
      while(!plotter.stepToTarget(command.target));
      break;
    case 2:
      plotter.penDown(command.target.x);
      break;
    case 3:
      plotter.penUp();
      break;
    case 4:
      plotter.disablePlotter();
      break;
    case 5:
      Point target;
      target.x = 0;
      target.y = 0;
      while(!plotter.stepToTarget(target));
      break;
  }
  delay(command.delay);
}

void loop() {
  if (operationIndex < readIndex) {
    executeCommand(commandBuffer[operationIndex++]);
  } else {
    operationIndex = 0;
    readIndex = 0;
    if (millis() - lastPing > 300) {
      Serial.write(COMMAND_BUFFER_COUNT);
      lastPing = millis();
    }
  }
}

void serialEvent() {
  while (Serial.available()) {
    if (readIndex >= COMMAND_BUFFER_COUNT)
      return;

    // get the new byte:
    byte in = Serial.read();
    commandBuffer[readIndex].code = in;
    Serial.readBytes((byte *) &(commandBuffer[readIndex].delay), 2);
    if (in == 1 || in == 2)
      Serial.readBytes((byte *) &(commandBuffer[readIndex].target.x), 4);
    if (in == 1)
      Serial.readBytes((byte *) &(commandBuffer[readIndex].target.y), 4);
    readIndex++;
  }
}
