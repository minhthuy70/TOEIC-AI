import asyncio
import json
from pathlib import Path

import edge_tts


# ============================================================
# CONFIG
# ============================================================

# File:
# tools/listening/part4_scripts.json
#
# Script:
# tools/listening/generate/generate_part4_audio.py

PROJECT_ROOT = Path(__file__).resolve().parents[2]

JSON_FILE = (
    PROJECT_ROOT
    / "listening"
    / "part4_scripts.json"
)

OUTPUT_DIR = (
    PROJECT_ROOT.parent.parent
    / "output"
    / "listening"
    / "part4"
    / "dataset01"
)

VOICE = "en-US-AriaNeural"

RATE = "-5%"
VOLUME = "+0%"


# ============================================================
# LOAD JSON
# ============================================================

def load_scripts():

    if not JSON_FILE.exists():
        raise FileNotFoundError(
            f"Không tìm thấy file:\n{JSON_FILE}"
        )

    with open(
        JSON_FILE,
        "r",
        encoding="utf-8",
    ) as f:

        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError(
            "part4_scripts.json phải là JSON array."
        )

    if len(data) != 100:
        raise ValueError(
            f"Expected 100 groups, but found {len(data)}"
        )

    return data


# ============================================================
# VALIDATE ONE GROUP
# ============================================================

def validate_group(item):

    if "group" not in item:
        raise ValueError(
            "Group thiếu field 'group'."
        )

    if "monologue" not in item:
        raise ValueError(
            f"Group {item['group']}: "
            "thiếu field 'monologue'."
        )

    monologue = item["monologue"]

    if not isinstance(monologue, dict):
        raise ValueError(
            f"Group {item['group']}: "
            "'monologue' phải là object."
        )

    if "text" not in monologue:
        raise ValueError(
            f"Group {item['group']}: "
            "monologue thiếu field 'text'."
        )

    if not monologue["text"].strip():
        raise ValueError(
            f"Group {item['group']}: "
            "monologue.text đang rỗng."
        )

    if "questions" not in item:
        raise ValueError(
            f"Group {item['group']}: "
            "thiếu questions."
        )

    questions = item["questions"]

    if not isinstance(questions, list):
        raise ValueError(
            f"Group {item['group']}: "
            "questions phải là array."
        )

    if len(questions) != 3:
        raise ValueError(
            f"Group {item['group']}: "
            f"phải có đúng 3 câu hỏi, "
            f"nhưng đang có {len(questions)}."
        )

    for index, question in enumerate(questions, start=1):

        if "question_text" not in question:
            raise ValueError(
                f"Group {item['group']}, "
                f"Question {index}: "
                "thiếu question_text."
            )

        if "options" not in question:
            raise ValueError(
                f"Group {item['group']}, "
                f"Question {index}: "
                "thiếu options."
            )

        options = question["options"]

        required_options = ["A", "B", "C", "D"]

        for label in required_options:

            if label not in options:
                raise ValueError(
                    f"Group {item['group']}, "
                    f"Question {index}: "
                    f"thiếu option {label}."
                )

        if question.get("correct") not in required_options:
            raise ValueError(
                f"Group {item['group']}, "
                f"Question {index}: "
                "correct phải là A/B/C/D."
            )


# ============================================================
# GENERATE ONE AUDIO
# ============================================================

async def generate_audio(
    group_number: int,
    monologue: dict,
):

    output_file = (
        OUTPUT_DIR
        / f"g{group_number:03d}.mp3"
    )

    text = monologue["text"]

    speaker = monologue.get(
        "speaker",
        "Announcer"
    )

    # --------------------------------------------------------
    # PART 4
    #
    # Chỉ đọc đoạn độc thoại.
    #
    # KHÔNG đọc:
    # - câu hỏi
    # - A/B/C/D
    # - đáp án
    # - explanation
    #
    # Một group = một file MP3
    #
    # g001.mp3
    # g002.mp3
    # ...
    # g100.mp3
    # --------------------------------------------------------

    print(
        f"Generating Group {group_number:03d}"
    )

    print(
        f"  Speaker : {speaker}"
    )

    print(
        f"  Text    : {text}"
    )

    communicate = edge_tts.Communicate(
        text=text,
        voice=VOICE,
        rate=RATE,
        volume=VOLUME,
    )

    await communicate.save(
        str(output_file)
    )

    print(
        f"  Output  : {output_file}"
    )

    print()


# ============================================================
# MAIN
# ============================================================

async def main():

    scripts = load_scripts()

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    print("=" * 70)
    print("GENERATING PART 4 AUDIO")
    print("=" * 70)

    print()
    print(f"JSON   : {JSON_FILE}")
    print(f"Voice  : {VOICE}")
    print(f"Rate   : {RATE}")
    print(f"Output : {OUTPUT_DIR}")
    print()

    # --------------------------------------------------------
    # Validate toàn bộ JSON trước khi generate
    # --------------------------------------------------------

    print("Checking JSON...")

    for item in scripts:
        validate_group(item)

    print(
        "JSON validation passed."
    )

    print()

    # --------------------------------------------------------
    # Generate 100 audio files
    # --------------------------------------------------------

    for item in scripts:

        group_number = item["group"]

        monologue = item["monologue"]

        await generate_audio(
            group_number,
            monologue,
        )

    print("=" * 70)
    print("DONE")
    print("=" * 70)

    print()

    print(
        f"Generated {len(scripts)} audio files."
    )

    print()

    print(
        f"Output directory:\n{OUTPUT_DIR}"
    )


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    asyncio.run(main())