#include "GestureClassifier.h"

constexpr float GestureClassifier::MEAN_[GestureClassifier::kNumAxes];
constexpr float GestureClassifier::STD_[GestureClassifier::kNumAxes];

bool GestureClassifier::begin() {
  model_ = tflite::GetModel(model);
  if (!model_) return false;

  if (model_->version() != TFLITE_SCHEMA_VERSION) {
    Serial.println("Model schema mismatch");
    return false;
  }

  // Construct interpreter in our buffer (no heap)
  interpreter_ = new (interpBuf_) tflite::MicroInterpreter(
    model_, resolver_, arena_, kArenaSize
    // /*resource_vars*/ nullptr,
    // /*profiler*/ nullptr
  );
  if (interpreter_->AllocateTensors() != kTfLiteOk) {
    Serial.println("AllocateTensors failed");
    Serial.print("Arena used: ");
    Serial.println(interpreter_->arena_used_bytes());
    return false;
  }

  input_ = interpreter_->input(0);
  output_ = interpreter_->output(0);

  // Sanity checks: float model expected
  if (!input_ || input_->type != kTfLiteFloat32) {
    Serial.println("Unexpected input type (expected float32)");
    return false;
  }
  if (!output_ || output_->type != kTfLiteFloat32) {
    Serial.println("Unexpected output type (expected float32)");
    return false;
  }

  // Ensure input buffer size matches 200*6 floats
  int inputFloats = input_->bytes / sizeof(float);
  if (inputFloats < kNumSamples * kNumAxes) {
    Serial.println("Input tensor too small!");
    return false;
  }

  reset();
  return true;
}

void GestureClassifier::reset() {
  samplesRead_ = 0;
}

bool GestureClassifier::addSample(float aX, float aY, float aZ, float gX, float gY, float gZ) {
  if (!input_) return false;
  if (samplesRead_ >= kNumSamples) return false;

  // Write floats safely (NO *4!)
  int base = samplesRead_ * kNumAxes;
  int inputFloats = input_->bytes / sizeof(float);
  if (base + (kNumAxes - 1) >= inputFloats) {
    Serial.println("Input overflow prevented");
    return false;
  }

  input_->data.f[base + 0] = (aX - MEAN_[0]) / STD_[0];
  input_->data.f[base + 1] = (aY - MEAN_[1]) / STD_[1];
  input_->data.f[base + 2] = (aZ - MEAN_[2]) / STD_[2];
  input_->data.f[base + 3] = (gX - MEAN_[3]) / STD_[3];
  input_->data.f[base + 4] = (gY - MEAN_[4]) / STD_[4];
  input_->data.f[base + 5] = (gZ - MEAN_[5]) / STD_[5];

  samplesRead_++;
  return true;
}

bool GestureClassifier::classify(int &outPred, float &outProb) {
  outPred = -1;
  outProb = 0.0f;

  if (!interpreter_ || !output_) return false;
  if (samplesRead_ < kNumSamples) return false;

  if (interpreter_->Invoke() != kTfLiteOk) {
    Serial.println("Invoke failed");
    return false;
  }

  // Argmax over outputs (assumes 4 classes)
  int best = 0;
  float bestv = output_->data.f[0];

  // If you want this generic, compute count = output_->bytes/4
  int n = output_->bytes / sizeof(float);
  for (int i = 1; i < n; i++) {
    float v = output_->data.f[i];
    if (v > bestv) { bestv = v; best = i; }
  }

  outPred = best;
  outProb = bestv;

  // ready for next window
  reset();
  return true;
}