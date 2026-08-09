import asyncio
import json
from pathlib import Path

import edge_tts


# ============================================================
# CONFIG
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

SCRIPT_FILE = (
    BASE_DIR
    / "tools"
    / "listening"
    / "part1_scripts.json"
)

OUTPUT_DIR = (
    BASE_DIR
    / "output"
    / "listening"
    / "part1"
    / "dataset01"
)

VOICE = "en-US-AriaNeural"
RATE = "-5%"
VOLUME = "+0%"


# ============================================================
# LOAD SCRIPTS
# ============================================================

def load_scripts():

    with open(
        SCRIPT_FILE,
        "r",
        encoding="utf-8",
    ) as f:

        data = json.load(f)

    return data


# ============================================================
# GENERATE ONE AUDIO
# ============================================================

async def generate_audio(
    question_number: int,
    options: list[str],
):

    output_file = (
        OUTPUT_DIR
        / f"q{question_number:02d}.mp3"
    )

    # --------------------------------------------------------
    # Tạo nội dung A/B/C/D
    # --------------------------------------------------------

    text = "\n\n".join(
        [
            f"A. {options[0]}",
            f"B. {options[1]}",
            f"C. {options[2]}",
            f"D. {options[3]}",
        ]
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
        f"Q{question_number:03d} -> "
        f"{output_file.name}"
    )


# ============================================================
# MAIN
# ============================================================

async def main():

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    scripts = load_scripts()

    print("=" * 70)
    print("GENERATING PART 1 AUDIO")
    print("=" * 70)

    print()
    print(f"Voice : {VOICE}")
    print(f"Rate  : {RATE}")
    print(f"Output: {OUTPUT_DIR}")
    print()

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    if len(scripts) != 100:

        raise ValueError(
            f"Expected 100 questions, "
            f"but found {len(scripts)}"
        )

    for item in scripts:

        question_number = item["question"]
        options = item["options"]

        if len(options) != 4:

            raise ValueError(
                f"Question {question_number} "
                f"must have exactly 4 options."
            )

    # --------------------------------------------------------
    # GENERATE
    # --------------------------------------------------------

    for item in scripts:

        await generate_audio(
            item["question"],
            item["options"],
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
    print(OUTPUT_DIR)


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    asyncio.run(main())