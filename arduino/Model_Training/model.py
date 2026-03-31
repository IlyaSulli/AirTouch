import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import tensorflow as tf
from scipy.stats import entropy


# the list of gestures that data is available for
GESTURES = [
    "0",
    "1",
    "2",
    "3"
]
################## Lovely graph ###################



# Load dataset with header
df = pd.read_csv("dataset/imu_2sec_clips.csv")

print("Dataset shape:", df.shape)
print(df.head())

TIMESTEPS = 200
FEATURES = 6

digits = range(10)
fig, axs = plt.subplots(6, 1, figsize=(15, 10), sharex=True)

for digit in digits:

    digit_df = df[df["label"] == digit]

    if len(digit_df) == 0:
        continue

    sequences = []

    # Group every 200 rows as one sample
    for i in range(0, len(digit_df), TIMESTEPS):
        sample = digit_df.iloc[i:i+TIMESTEPS]

        if len(sample) != TIMESTEPS:
            continue  # skip incomplete samples

        seq = sample[["ax","ay","az","gx","gy","gz"]].values
        sequences.append(seq)

    if len(sequences) == 0:
        continue

    sequences = np.array(sequences)

    avg_sequence = np.mean(sequences, axis=0)

    for ch in range(6):
        axs[ch].plot(avg_sequence[:, ch], label=f"{digit}")

titles = ["Average aX", "Average aY", "Average aZ",
          "Average gX", "Average gY", "Average gZ"]

for i in range(6):
    axs[i].set_title(titles[i])
    axs[i].legend()

plt.tight_layout()
plt.show()

###################################################################




print(f"TensorFlow version = {tf.__version__}\n")

# Set a fixed random seed value, for reproducibility, this will allow us to get
# the same random numbers each time the notebook is run
SEED = 19022026
np.random.seed(SEED)
tf.random.set_seed(SEED)








print("Total NaNs in dataset:", df.isna().sum().sum())
print("Loaded dataset shape:", df.shape)

TIMESTEPS = 200
FEATURES = 6

inputs = []
outputs = []

# Group by label first
for label in df["label"].unique():

    label_df = df[df["label"] == label]

    # Take chunks of 200 rows
    for i in range(0, len(label_df), TIMESTEPS):
        sample = label_df.iloc[i:i+TIMESTEPS]

        if len(sample) != TIMESTEPS:
            continue  # skip incomplete samples

        tensor = sample[["ax","ay","az","gx","gy","gz"]].values

        inputs.append(tensor)
        outputs.append(int(label))

inputs = np.array(inputs)
outputs = np.array(outputs)

print(f"{np.min(inputs)=} {np.max(inputs)=}")
print("Input shape:", inputs.shape)   # (samples, 200, 6)
print("Output shape:", outputs.shape) # (samples,)  (0-9 labels, 200 each)



#################################################


############## DATA SPLIT ##############

num_inputs = len(inputs)
randomize = np.arange(num_inputs)
np.random.shuffle(randomize)

# Swap the consecutive indexes (0, 1, 2, etc) with the randomized indexes
inputs = inputs[randomize]
outputs = outputs[randomize]

# Split the recordings (group of samples) into three sets: training, testing and validation
TRAIN_SPLIT = int(0.8 * num_inputs)
TEST_SPLIT = int(0.1 * num_inputs + TRAIN_SPLIT)


#[0 -> train_split]
#
#[train_split -> test_split]
#
#[test_split -> end] 

inputs_train, inputs_test, inputs_validate = np.split(inputs, [TRAIN_SPLIT, TEST_SPLIT])
outputs_train, outputs_test, outputs_validate = np.split(outputs, [TRAIN_SPLIT, TEST_SPLIT])

mean = np.mean(inputs_train, axis=(0,1))
std = np.std(inputs_train, axis=(0,1))

print("Mean and std per channel:")
print(mean)
print(std)

# avoid divide-by-zero
std[std == 0] = 1e-8
inputs_train = (inputs_train - mean) / std
inputs_test = (inputs_test - mean) / std
inputs_validate = (inputs_validate - mean) / std

# print(inputs_train)
# print(inputs_test)
# print(inputs_validate)
# print(outputs_train)
# print(outputs_test)
# print(outputs_validate)


##################################################


################### ML MODEL ##################

# build the model and train it
model = tf.keras.Sequential([
    tf.keras.Input(shape=inputs_train.shape[1:]),

    tf.keras.layers.Conv1D(32, 5, activation='relu'),
    tf.keras.layers.BatchNormalization(),

    tf.keras.layers.GlobalAveragePooling1D(),

    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(len(GESTURES), activation='softmax')
])

optimizer = tf.keras.optimizers.Adam(learning_rate=0.0005)   #5x10^-4
model.compile(
    optimizer=optimizer,
    loss=tf.keras.losses.SparseCategoricalCrossentropy(),
    metrics=['accuracy']
)
model.summary()

history = model.fit(
    x=inputs_train,
    y=outputs_train,
    validation_data=[inputs_validate, outputs_validate],
    batch_size=32,
    shuffle=True,
    epochs=300
)

def plot_train_val_statistics(training_statistics, validation_statistics, statistics_name='accuracy'):
    plt.figure(figsize=(8, 6))
    plt.plot(training_statistics)
    plt.plot(validation_statistics)
    plt.title(statistics_name)
    plt.ylabel(statistics_name)
    plt.xlabel('epoch')
    plt.legend(['train', 'val'], loc='upper left')
    plt.show()

plot_train_val_statistics(history.history['accuracy'], history.history['val_accuracy'], 'accuracy')
plot_train_val_statistics(history.history['loss'], history.history['val_loss'], 'loss')





# Results on the test set
performance = model.evaluate(x=inputs_test, y=outputs_test)
print(''.join([f"{name}={value:.05f}  " for name, value in zip(model.metrics_names, performance)]))

# Confidence using Shannon Entropy
pred = model.predict(inputs_test)
H = entropy(pred, base=2, axis=1)
plt.hist(H, bins=10)
plt.xlabel("Shannon Entropy of the softmaxes")
plt.ylabel("Histogram")
plt.show()







############## CONVERTION TO TFLITE ##############

converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

# Save the model to disk
open("gesture_model.tflite", "wb").write(tflite_model)

# Convert the model to the TensorFlow Lite format with quantization
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

# Save the model to disk
open("gesture_model_quantized.tflite", "wb").write(tflite_model)








########### HEADER GENERATION ##############

tflite_path = "gesture_model.tflite"
output_path = "model.h"

def convert_tflite_to_header(tflite_path, output_path):
    with open(tflite_path, "rb") as f:
        model_bytes = f.read()

    with open(output_path, "w") as out:
        out.write("const unsigned char model[] = {\n")

        for i, b in enumerate(model_bytes):
            if i % 12 == 0:
                out.write("  ")
            out.write(f"0x{b:02x}, ")
            if (i + 1) % 12 == 0:
                out.write("\n")

        out.write("\n};\n")

    print(f"Header file written to {output_path}")

convert_tflite_to_header(
    "gesture_model.tflite",
    "model.h"
)

convert_tflite_to_header(
    "gesture_model_quantized.tflite",
    "model_quantized.h"
)