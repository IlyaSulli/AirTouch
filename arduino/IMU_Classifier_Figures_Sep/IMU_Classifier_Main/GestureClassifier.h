#pragma once
#include <Arduino.h>
#include <TensorFlowLite.h>
#include "tensorflow/lite/micro/micro_interpreter.h"
#include "tensorflow/lite/micro/all_ops_resolver.h"
#include "tensorflow/lite/schema/schema_generated.h"
#include "tensorflow/lite/micro/tflite_bridge/micro_error_reporter.h"

// Forward declare your model array coming from model.h / model_low_layers.h
// (That header must define: extern const unsigned char model[]; or similar)
#include "model_low_layers.h"

class GestureClassifier {
public:
  // Call once in setup()
  bool begin();

  // Feed one sample (6 floats). Returns true if it consumed it.
  bool addSample(float aX, float aY, float aZ, float gX, float gY, float gZ);

  // When enough samples collected, runs inference.
  // Returns true if it ran and filled outPred/outProb.
  bool classify(int &outPred, float &outProb);

  // Optional helpers
  void reset();
  int samplesNeeded() const { return kNumSamples; }
  int samplesSoFar() const { return samplesRead_; }

private:
  static constexpr int kNumSamples = 200;
  static constexpr int kNumAxes = 6;

  // Update these to your values
  static constexpr float MEAN_[kNumAxes] = { -0.02535709f, -0.03664223f, 0.93231633f, 2.73776912f, -4.35018635f, -3.42851257f };
  static constexpr float STD_[kNumAxes]  = {  0.22882311f,  0.42098949f, 0.34977778f, 30.1220714f,  47.98269334f,  55.73724562f };

  // TFLM bits
  tflite::MicroErrorReporter errorReporter_;
  tflite::AllOpsResolver resolver_;
  const tflite::Model* model_ = nullptr;

  // Arena (set to your used + margin; adjust if needed)
  static constexpr int kArenaSize = 108512;
  alignas(16) uint8_t arena_[kArenaSize];

  // Keep interpreter static-ish (as a member) so it lives forever
  tflite::MicroInterpreter* interpreter_ = nullptr;
  TfLiteTensor* input_ = nullptr;
  TfLiteTensor* output_ = nullptr;

  // We store interpreter storage here
  // (Constructed in begin() with placement new)
  alignas(alignof(tflite::MicroInterpreter)) uint8_t interpBuf_[sizeof(tflite::MicroInterpreter)];

  int samplesRead_ = 0;
};