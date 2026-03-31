import serial, time

PORT = "COM5"
BAUD = 230400

N_SAMPLES = 200          # must match Arduino N_SAMPLES
LABELS = [0, 1, 2, 3]     # 0 = no movement
CLIPS_PER_LABEL = 100       # change if you want multiple 2s clips per class

OUT = "imu_2sec_clips.csv"

def is_data_row(line: str) -> bool:
    # data rows look like: label,ax,ay,az,gx,gy,gz  => 6 commas
    # ignore headers/status/done lines
    return line.count(",") == 6 and not line.startswith("label,") and line != "done"

with serial.Serial(PORT, BAUD, timeout=2) as ser, open(OUT, "w", newline="") as f:
    # When Python opens the port, the board may reset -> wait a moment
    time.sleep(2.0)
    ser.reset_input_buffer()

    # Write our own header once
    f.write("label,ax,ay,az,gx,gy,gz\n")

    for lab in LABELS:
        for clip in range(CLIPS_PER_LABEL):
            input(f"\nLabel {lab} (0=no movement). Clip {clip+1}/{CLIPS_PER_LABEL}. Press ENTER to record 2s...")

            # send label then start token
            ser.write(str(lab).encode("ascii"))
            time.sleep(0.05)
            ser.write(b"s")

            n = 0
            while n < N_SAMPLES:
                raw = ser.readline().decode("utf-8", errors="ignore").strip()
                if not raw:
                    continue
                if is_data_row(raw):
                    f.write(raw + "\n")
                    n += 1

            f.flush()
            print(f"Saved clip: label={lab}, rows={n}")

print("Saved to", OUT)