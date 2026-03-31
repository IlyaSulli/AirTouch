#include <Arduino_LSM9DS1.h>

const int HZ = 100;
const uint32_t PERIOD_US = 1000000UL / HZ;

const int N_SAMPLES = 200;   // 2s at 100 Hz
int samples_left = 0;

uint32_t next_us;
int label = 0;               // set with 0..9 keys

void startRecording() {
  samples_left = N_SAMPLES;
  next_us = micros();
  Serial.println("label,ax,ay,az,gx,gy,gz"); // header per clip
}

void setup() {
  Serial.begin(230400);
  while (!Serial) {}

  if (!IMU.begin()) while (1) {}

  Serial.println("Controls: 0-9 set label, s=start");
}

void loop() {
  // commands from laptop
  if (Serial.available()) {
    char c = Serial.read();
    if (c >= '0' && c <= '9') {
      label = c - '0';
      Serial.print("label set to "); Serial.println(label);
    } else if (c == 's') {
      if (samples_left == 0) startRecording();
    }
  }

  if (samples_left == 0) return;

  // fixed-rate sampling
  if ((int32_t)(micros() - next_us) >= 0) {
    next_us += PERIOD_US;

    static float ax=0, ay=0, az=0, gx=0, gy=0, gz=0;

    // Update values if available (keeps last value otherwise)
    if (IMU.accelerationAvailable()) IMU.readAcceleration(ax, ay, az);
    if (IMU.gyroscopeAvailable())     IMU.readGyroscope(gx, gy, gz);

    Serial.print(label); Serial.print(",");
    Serial.print(ax, 6); Serial.print(",");
    Serial.print(ay, 6); Serial.print(",");
    Serial.print(az, 6); Serial.print(",");
    Serial.print(gx, 6); Serial.print(",");
    Serial.print(gy, 6); Serial.print(",");
    Serial.println(gz, 6);

    samples_left--;

    if (samples_left == 0) {
      Serial.println("done");
    }
  }
}