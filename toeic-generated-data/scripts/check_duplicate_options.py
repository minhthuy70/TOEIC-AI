import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
TESTS_DIR = BASE_DIR / "data" / "tests"

total_questions = 0
bad_questions = 0

for test_file in sorted(TESTS_DIR.glob("test*.json")):
    with open(test_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    for group in data["question_groups"]:
        for question in group["questions"]:
            total_questions += 1

            options = question["options"]
            texts = [o["option_text"].strip().lower() for o in options]

            if len(set(texts)) != len(texts):
                bad_questions += 1

                print("\n" + "=" * 80)
                print(f"FILE: {test_file.name}")
                print(f"PART: {group['part']}")
                print(f"QUESTION: {question['question_number']}")
                print(f"CORRECT: {question['correct_answer']}")

                for option in options:
                    print(
                        f"{option['option_label']}. "
                        f"{option['option_text']}"
                    )

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"Total questions: {total_questions}")
print(f"Questions with duplicate options: {bad_questions}")