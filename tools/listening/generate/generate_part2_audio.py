import asyncio
import json
from pathlib import Path

import edge_tts


# ============================================================
# CONFIG
# ============================================================

# File nằm ở:
# toeic-ai/tools/listening/generate/generate_part2_audio.py
#
# parents[3] = thư mục gốc toeic-ai
PROJECT_ROOT = Path(__file__).resolve().parents[3]

# JSON:
# toeic-ai/tools/listening/part2_scripts.json
JSON_FILE = (
    PROJECT_ROOT
    / "tools"
    / "listening"
    / "part2_scripts.json"
)

# Output:
# toeic-ai/output/listening/part2/dataset01
OUTPUT_DIR = (
    PROJECT_ROOT
    / "output"
    / "listening"
    / "part2"
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
            "part2_scripts.json phải là một JSON array."
        )

    if len(data) != 100:
        raise ValueError(
            f"Expected 100 questions, but found {len(data)}"
        )

    return data


# ============================================================
# BUILD AUDIO TEXT
# ============================================================

def build_audio_text(item):

    question_text = item["prompt"]
    options = item["options"]

    # Part 2 chỉ có A / B / C
    text = (
        f"{question_text} "
        f"A. {options['A']} "
        f"B. {options['B']} "
        f"C. {options['C']}"
    )

    return text


# ============================================================
# GENERATE ONE AUDIO
# ============================================================

async def generate_audio(
    question_number: int,
    text: str,
):

    output_file = (
        OUTPUT_DIR
        / f"q{question_number:02d}.mp3"
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
        f"Q{question_number:02d} -> "
        f"{output_file.name}"
    )


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
    print("GENERATING PART 2 AUDIO")
    print("=" * 70)

    print()
    print(f"JSON   : {JSON_FILE}")
    print(f"Voice  : {VOICE}")
    print(f"Rate   : {RATE}")
    print(f"Output : {OUTPUT_DIR}")
    print()

    for item in scripts:

        question_number = item["question"]

        # ----------------------------------------------------
        # Part 2:
        #
        # Audio đọc:
        #
        # Câu hỏi
        # A. Đáp án A
        # B. Đáp án B
        # C. Đáp án C
        #
        # Không đọc đáp án đúng.
        # ----------------------------------------------------

        audio_text = build_audio_text(item)

        await generate_audio(
            question_number,
            audio_text,
        )

    print()
    print("=" * 70)
    print("DONE")
    print("=" * 70)

    print()
    print(
        f"Generated {len(scripts)} audio files."
    )

    print()
    print(f"Output: {OUTPUT_DIR}")


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    asyncio.run(main())