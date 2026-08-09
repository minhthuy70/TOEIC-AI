import json
import random
from pathlib import Path


# ============================================================
# CONFIG
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[3]

JSON_FILE = BASE_DIR / "tools" / "listening" / "part1_scripts.json"

OPTIONS_LABELS = ["A", "B", "C", "D"]


# ============================================================
# LOAD JSON
# ============================================================

with open(JSON_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)


if len(data) != 100:
    raise ValueError(
        f"Expected 100 questions, but found {len(data)}"
    )


# ============================================================
# SHUFFLE
# ============================================================

random.seed()  # random mỗi lần chạy

for item in data:

    options = item["options"]

    if len(options) != 4:
        raise ValueError(
            f"Question {item['question']} does not have 4 options."
        )

    # Đáp án đúng hiện tại
    old_correct = item["correct"]

    old_index = OPTIONS_LABELS.index(old_correct)

    # Lấy nội dung đáp án đúng
    correct_text = options[old_index]

    # Trộn 4 đáp án
    random.shuffle(options)

    # Tìm vị trí mới của đáp án đúng
    new_index = options.index(correct_text)

    # Cập nhật A/B/C/D
    item["correct"] = OPTIONS_LABELS[new_index]


# ============================================================
# SAVE
# ============================================================

with open(JSON_FILE, "w", encoding="utf-8") as f:
    json.dump(
        data,
        f,
        ensure_ascii=False,
        indent=2,
    )


# ============================================================
# CHECK DISTRIBUTION
# ============================================================

distribution = {
    "A": 0,
    "B": 0,
    "C": 0,
    "D": 0,
}

for item in data:
    distribution[item["correct"]] += 1


print("=" * 70)
print("PART 1 ANSWERS SHUFFLED")
print("=" * 70)

print()
print(f"JSON: {JSON_FILE}")
print()

print("Answer distribution:")

for label in OPTIONS_LABELS:
    print(f"{label}: {distribution[label]}")

print()
print("First 10 questions:")

for item in data[:10]:

    print()
    print(f"Q{item['question']:02d}")

    for i, option in enumerate(item["options"]):
        label = OPTIONS_LABELS[i]

        marker = " <-- CORRECT" if label == item["correct"] else ""

        print(
            f"{label}. {option}{marker}"
        )

print()
print("=" * 70)
print("DONE")
print("=" * 70)