import os
import csv

SRC_DIR = "src"
OUTPUT_FILE = "flat_dataset_acc.csv"

def process_file(filepath, label):
    samples = []
    current_sample = []

    with open(filepath, "r") as f:
        reader = f.readlines()

    blank_count = 0

    for line in reader:
        line = line.strip()

        # Skip header
        if line.startswith("acc_X"):
            continue

        # Detect blank lines
        if line == "":
            blank_count += 1
            if blank_count == 2:
                if current_sample:
                    samples.append(current_sample)
                    current_sample = []
                blank_count = 0
            continue
        else:
            blank_count = 0

        values = line.split(",")
        if len(values) == 6:
            current_sample.append([int(values[i]) for i in range(3)])

    # Add final sample if file doesn't end with blank lines
    if current_sample:
        samples.append(current_sample)

    # Flatten samples
    flattened = []
    for sample in samples:
        flat_row = [label]
        for row in sample:
            flat_row.extend(row)
        flattened.append(flat_row)

    return flattened


def generate_header(sample_length):
    header = ["label"]
    for i in range(sample_length):
        header.extend([
            f"ax{i}", f"ay{i}", f"az{i}"
        ])
    return header


def main():
    all_data = []
    max_len = 0

    for filename in os.listdir(SRC_DIR):
        if filename.endswith(".csv"):
            label = os.path.splitext(filename)[0]
            filepath = os.path.join(SRC_DIR, filename)

            file_samples = process_file(filepath, label)
            all_data.extend(file_samples)

            for sample in file_samples:
                max_len = max(max_len, (len(sample) - 1) // 6)

    header = generate_header(max_len)

    with open(OUTPUT_FILE, "w", newline="") as f:
        writer = csv.writer(f)
        #writer.writerow(header)
        writer.writerows(all_data)

    print(f"Done. Wrote {len(all_data)} samples to {OUTPUT_FILE}")


main()