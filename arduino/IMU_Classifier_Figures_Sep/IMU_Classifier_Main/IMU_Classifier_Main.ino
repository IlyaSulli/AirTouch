#include <Arduino_LSM9DS1.h>
#include <ArduinoBLE.h>
#include "GestureClassifier.h"

GestureClassifier classifier;

// BLE setup...
BLEService myService("180C");
BLEUnsignedCharCharacteristic myChar("2A56", BLERead | BLENotify);

void setup() {
  Serial.begin(230400);
  while (!Serial) {}

  if (!IMU.begin()) {
    Serial.println("IMU failed");
    while (1) {}
  }

  if (!classifier.begin()) {
    Serial.println("Classifier begin failed");
    while (1) {}
  }

  if (!BLE.begin()) {
    Serial.println("BLE failed");
    while (1) {}
  }

  BLE.setLocalName("MUC_1_IMU_Classifier");
  BLE.setAdvertisedService(myService);
  myService.addCharacteristic(myChar);
  BLE.addService(myService);
  myChar.writeValue((uint8_t)0);
  BLE.advertise();
}

void loop() {
  BLEDevice central = BLE.central();
  if (!central) return;

  Serial.println("Central connected");
  unsigned long lastSampleMs = millis();

  while (central.connected()) {
    BLE.poll();

    // sample IMU at ~100-200Hz (adjust as you like)
    unsigned long now = millis();
    if (now - lastSampleMs >= 5) {
      lastSampleMs = now;

      float aX,aY,aZ,gX,gY,gZ;
      if (IMU.accelerationAvailable() && IMU.gyroscopeAvailable()) {
        IMU.readAcceleration(aX,aY,aZ);
        IMU.readGyroscope(gX,gY,gZ);

        classifier.addSample(aX,aY,aZ,gX,gY,gZ);

        int pred; float prob;
        if (classifier.classify(pred, prob)) {
          Serial.print("Pred="); Serial.print(pred);
          Serial.print(" p="); Serial.println(prob, 6);

          myChar.writeValue((uint8_t)pred);
        }
      }
    }

    delay(1);
  }

  Serial.println("Central disconnected");
}