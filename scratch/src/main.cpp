#include <Arduino.h>

typedef struct Command {
  byte code;
  short int delay;
  float x;
  float y;
} Command;

const int YELLOW = 11;
const int ORANGE = 10;
const int PURPLE = 9;

const int COMMAND_BUFFER_COUNT = 100;
Command commandBuffer[COMMAND_BUFFER_COUNT];
int readIndex = 0;
int operationIndex = 0;
unsigned long lastPing = 0;

void setup() {
  pinMode(PURPLE,OUTPUT);
  pinMode(ORANGE,OUTPUT);
  pinMode(YELLOW,OUTPUT);
  digitalWrite(PURPLE,LOW);
  digitalWrite(YELLOW,LOW);
  digitalWrite(ORANGE,LOW);

  Serial.begin(9600);
}


void executeCommand(Command command) {
  switch (command.code) {
    case 0:
      digitalWrite(PURPLE,LOW);
      digitalWrite(YELLOW,LOW);
      digitalWrite(ORANGE,LOW);
      break;
    case 1:
      digitalWrite(PURPLE,LOW);
      analogWrite(YELLOW, (int) (255*command.x));
      analogWrite(ORANGE, (int) (255*command.y));
      break;
    case 2:
      digitalWrite(PURPLE,HIGH);
      analogWrite(YELLOW, 0);
      analogWrite(ORANGE, 0);
      break;
    case 3:
      digitalWrite(PURPLE,LOW);
      digitalWrite(YELLOW,HIGH);
      digitalWrite(ORANGE,LOW);
      break;
    case 4:
      digitalWrite(PURPLE,LOW);
      digitalWrite(YELLOW,LOW);
      digitalWrite(ORANGE,HIGH);
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
    if (millis() - lastPing > 2000) {
      digitalWrite(PURPLE,HIGH);
      Serial.write(COMMAND_BUFFER_COUNT);
      lastPing = millis();
      digitalWrite(PURPLE,LOW);
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
    if (in == 1) {
      Serial.readBytes((byte *) &(commandBuffer[readIndex].x), 4);
      Serial.readBytes((byte *) &(commandBuffer[readIndex].y), 4);
    }
    // Serial.print("Command received, Operation: ");
    // Serial.print((byte) commandBuffer[readIndex].code);
    // Serial.print("  delay: ");
    // Serial.println(commandBuffer[readIndex].delay);
    readIndex++;
  }
}
