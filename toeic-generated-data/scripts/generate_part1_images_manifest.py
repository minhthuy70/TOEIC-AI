#!/usr/bin/env python3
"""
Generate Part 1 Images Manifest from actual TOEIC test data.

IMPORTANT:
- Không random scene.
- Không dùng template ngẫu nhiên.
- Prompt được tạo dựa trên:
    1. explanation
    2. correct answer option
- Mục tiêu: ảnh phải khớp với nội dung câu hỏi thực tế.
"""

import json
from pathlib import Path
from typing import List, Dict, Optional


SCRIPT_DIR = Path(__file__).parent

DATA_DIR = SCRIPT_DIR.parent / "data" / "tests"

OUTPUT_DIR = SCRIPT_DIR.parent

IMAGES_MANIFEST_FILE = OUTPUT_DIR / "part1_images_manifest.json"


def get_correct_option(question: Dict) -> Optional[Dict]:
    """
    Find the correct option based on correct_answer.
    """

    correct_answer = question.get("correct_answer")

    if not correct_answer:
        return None

    correct_answer = str(correct_answer).strip().upper()

    options = question.get("options", [])

    for option in options:
        label = str(
            option.get("option_label", "")
        ).strip().upper()

        if label == correct_answer:
            return option

    return None


def create_image_prompt(
    explanation: str,
    correct_option_text: str
) -> str:
    """
    Create a realistic TOEIC Part 1 image prompt.

    The prompt is based on the actual question data.
    """

    explanation = explanation.strip()
    correct_option_text = correct_option_text.strip()

    prompt = f"""
Create a realistic TOEIC Part 1 photograph.

The photograph must clearly show this situation:

{explanation}

The image must strongly support this correct statement:

"{correct_option_text}"

Requirements:

- Photorealistic professional photograph.
- Natural human poses and realistic proportions.
- The main action must be clearly visible.
- The scene must directly match the described situation.
- The image should look like a real TOEIC Listening Part 1 photograph.
- Use a realistic office, workplace, public place, street, restaurant,
  airport, store, or other appropriate environment depending on the scene.
- Do not add any text.
- Do not add captions.
- Do not add signs with readable words.
- Do not show subtitles.
- Do not show answer choices.
- Do not create an illustration or cartoon.
- No watermark.
- No logos.
- Avoid exaggerated cinematic effects.
- Use natural lighting.
- Make the main action easy to recognize.

The most important requirement is that the visual content must accurately
represent the described situation and correct answer.
"""

    return " ".join(prompt.split())


def generate_distractors(
    correct_option_text: str
) -> List[str]:
    """
    Generate generic distractors.

    These are only stored in the image manifest.
    The actual question options remain in the test JSON.
    """

    return [
        "The person is working outdoors.",
        "The person is preparing food.",
        "The person is exercising."
    ]


def process_test_file(
    test_file: Path,
    all_image_entries: List[Dict]
):
    """
    Process one TOEIC test file.
    """

    test_num = int(
        test_file.stem.replace("test", "")
    )

    print(
        f"\nProcessing test{test_num:03d}..."
    )

    try:
        with open(
            test_file,
            "r",
            encoding="utf-8"
        ) as f:
            test_data = json.load(f)

    except Exception as e:

        print(
            f"[ERROR] Cannot read {test_file}: {e}"
        )

        return

    question_groups = test_data.get(
        "question_groups",
        []
    )

    part1_groups = [
        group
        for group in question_groups
        if group.get("part") == 1
    ]

    print(
        f"  Part 1 groups: {len(part1_groups)}"
    )

    for index, group in enumerate(
        part1_groups,
        start=1
    ):

        questions = group.get(
            "questions",
            []
        )

        if not questions:

            print(
                f"  [WARNING] Group {index}: no question"
            )

            continue

        question = questions[0]

        correct_answer = question.get(
            "correct_answer"
        )

        explanation = question.get(
            "explanation",
            ""
        )

        correct_option = get_correct_option(
            question
        )

        if not correct_option:

            print(
                f"  [WARNING] "
                f"Group {index}: "
                f"cannot find correct option {correct_answer}"
            )

            continue

        correct_option_text = correct_option.get(
            "option_text",
            ""
        )

        if not explanation:

            # Nếu explanation không có,
            # dùng chính option đúng.
            explanation = correct_option_text

        image_filename = (
            f"test{test_num:03d}_"
            f"part01_"
            f"q{index:03d}.jpg"
        )

        # Ưu tiên image_url đã có trong JSON.
        image_url = group.get(
            "image_url"
        )

        if not image_url:

            image_url = (
                f"images/test{test_num:03d}/"
                f"part01/"
                f"{image_filename}"
            )

        image_prompt = create_image_prompt(
            explanation=explanation,
            correct_option_text=correct_option_text
        )

        entry = {
            "test_id": test_num,

            "question_id": index,

            "image_filename": image_filename,

            "image_url": image_url,

            "image_prompt": image_prompt,

            "scene_description": explanation,

            "correct_answer": correct_answer,

            "correct_option_text": correct_option_text,

            "explanation": explanation,

            "distractor_options": generate_distractors(
                correct_option_text
            )
        }

        all_image_entries.append(entry)

        print(
            f"  [{index}] "
            f"Answer {correct_answer}: "
            f"{correct_option_text}"
        )


def generate_part1_manifest():

    print("=" * 70)
    print("GENERATING PART 1 IMAGE MANIFEST")
    print("=" * 70)

    test_files = sorted(
        DATA_DIR.glob("test*.json")
    )

    if not test_files:

        print(
            f"[ERROR] No test files found in:"
        )

        print(DATA_DIR)

        return

    print(
        f"Found {len(test_files)} test files."
    )

    all_image_entries = []

    for test_file in test_files:

        process_test_file(
            test_file,
            all_image_entries
        )

    manifest_data = {

        "total_images":
            len(all_image_entries),

        "description":
            "Part 1 image manifest generated from actual TOEIC test data. "
            "Image prompts are based on each question's explanation "
            "and correct answer.",

        "images":
            all_image_entries
    }

    with open(
        IMAGES_MANIFEST_FILE,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            manifest_data,
            f,
            indent=2,
            ensure_ascii=False
        )

    print()
    print("=" * 70)
    print("MANIFEST GENERATED SUCCESSFULLY")
    print("=" * 70)

    print(
        f"Total images: "
        f"{len(all_image_entries)}"
    )

    print(
        f"Output: "
        f"{IMAGES_MANIFEST_FILE}"
    )


if __name__ == "__main__":

    generate_part1_manifest()