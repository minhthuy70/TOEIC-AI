import asyncio
import json
from pathlib import Path

import edge_tts


# ============================================================
# CONFIG
# ============================================================

# File:
# tools/listening/part3_scripts.json
#
# Script:
# tools/listening/generate/generate_part3_audio.py

PROJECT_ROOT = Path(__file__).resolve().parents[2]

JSON_FILE = (
    PROJECT_ROOT
    / "listening"
    / "part3_scripts.json"
)

OUTPUT_DIR = (
    PROJECT_ROOT.parent.parent
    / "output"
    / "listening"
    / "part3"
    / "dataset01"
)

# Hai giọng cho hội thoại
VOICE_A = "en-US-AriaNeural"   # Nữ
VOICE_B = "en-US-GuyNeural"    # Nam

RATE = "-5%"
VOLUME = "+0%"


# ============================================================
# SPEAKER -> VOICE
# ============================================================

# Với JSON hiện tại:
#
# Maya   -> giọng nữ
# Daniel -> giọng nam
#
# Nếu các group sau dùng tên speaker khác,
# chương trình sẽ tự luân phiên giọng theo thứ tự speaker.

SPEAKER_VOICES = {
    "Maya": VOICE_A,
    "Daniel": VOICE_B,
}


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
            "part3_scripts.json phải là JSON array."
        )

    if len(data) != 100:
        raise ValueError(
            f"Expected 100 groups, but found {len(data)}"
        )

    return data


# ============================================================
# GET VOICE
# ============================================================

def get_voice(
    speaker: str,
    speaker_voice_map: dict,
):

    # Nếu speaker đã được khai báo
    if speaker in SPEAKER_VOICES:
        return SPEAKER_VOICES[speaker]

    # Nếu speaker mới xuất hiện,
    # tự cấp giọng dựa trên thứ tự xuất hiện.
    if speaker not in speaker_voice_map:

        if len(speaker_voice_map) % 2 == 0:
            speaker_voice_map[speaker] = VOICE_A
        else:
            speaker_voice_map[speaker] = VOICE_B

    return speaker_voice_map[speaker]


# ============================================================
# GENERATE ONE GROUP AUDIO
# ============================================================

async def generate_audio(
    group_number: int,
    dialogue: list,
):

    output_file = (
        OUTPUT_DIR
        / f"g{group_number:03d}.mp3"
    )

    # --------------------------------------------------------
    # Kiểm tra dialogue
    # --------------------------------------------------------

    if not isinstance(dialogue, list):
        raise ValueError(
            f"Group {group_number}: "
            "dialogue phải là array."
        )

    if len(dialogue) < 2:
        raise ValueError(
            f"Group {group_number}: "
            "dialogue phải có ít nhất 2 lượt nói."
        )

    # --------------------------------------------------------
    # Speaker map
    # --------------------------------------------------------

    speaker_voice_map = {}

    # --------------------------------------------------------
    # Tạo audio từng lượt nói
    #
    # Không đọc:
    # - câu hỏi
    # - A/B/C/D
    # - đáp án
    # - explanation
    #
    # Chỉ đọc:
    # dialogue[].text
    # --------------------------------------------------------

    temp_files = []

    try:

        for index, turn in enumerate(dialogue):

            if not isinstance(turn, dict):
                raise ValueError(
                    f"Group {group_number}, "
                    f"dialogue {index + 1}: "
                    "phải là object."
                )

            if "speaker" not in turn:
                raise ValueError(
                    f"Group {group_number}, "
                    f"dialogue {index + 1}: "
                    "thiếu speaker."
                )

            if "text" not in turn:
                raise ValueError(
                    f"Group {group_number}, "
                    f"dialogue {index + 1}: "
                    "thiếu text."
                )

            speaker = turn["speaker"]
            text = turn["text"]

            voice = get_voice(
                speaker,
                speaker_voice_map,
            )

            # File tạm cho từng lượt nói
            temp_file = (
                OUTPUT_DIR
                / f"_temp_g{group_number:03d}_{index + 1:02d}.mp3"
            )

            communicate = edge_tts.Communicate(
                text=text,
                voice=voice,
                rate=RATE,
                volume=VOLUME,
            )

            await communicate.save(
                str(temp_file)
            )

            temp_files.append(temp_file)

            print(
                f"  {speaker:<15} "
                f"{voice:<20} "
                f"-> {text}"
            )

        # ----------------------------------------------------
        # Ghép các file MP3
        # ----------------------------------------------------
        #
        # Dùng ffmpeg để nối:
        #
        # Maya   -> audio
        # Daniel -> audio
        # Maya   -> audio
        # Daniel -> audio
        #
        # thành:
        #
        # g001.mp3
        #
        # ----------------------------------------------------

        concat_file = (
            OUTPUT_DIR
            / f"_concat_g{group_number:03d}.txt"
        )

        with open(
            concat_file,
            "w",
            encoding="utf-8",
        ) as f:

            for temp_file in temp_files:

                # ffmpeg concat format
                safe_path = str(
                    temp_file.resolve()
                ).replace(
                    "\\",
                    "/",
                )

                f.write(
                    f"file '{safe_path}'\n"
                )

        # ----------------------------------------------------
        # FFmpeg
        # ----------------------------------------------------

        process = await asyncio.create_subprocess_exec(
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(concat_file),
            "-c",
            "copy",
            str(output_file),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        stdout, stderr = await process.communicate()

        if process.returncode != 0:

            error = stderr.decode(
                "utf-8",
                errors="ignore",
            )

            raise RuntimeError(
                f"FFmpeg failed for Group "
                f"{group_number}:\n{error}"
            )

        print(
            f"Group {group_number:03d} "
            f"-> {output_file.name}"
        )

    finally:

        # ----------------------------------------------------
        # Xóa file tạm
        # ----------------------------------------------------

        for temp_file in temp_files:

            if temp_file.exists():
                temp_file.unlink()

        if concat_file.exists():
            concat_file.unlink()


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
    print("GENERATING PART 3 AUDIO")
    print("=" * 70)

    print()
    print(f"JSON    : {JSON_FILE}")
    print(f"Voice A : {VOICE_A}")
    print(f"Voice B : {VOICE_B}")
    print(f"Rate    : {RATE}")
    print(f"Output  : {OUTPUT_DIR}")
    print()

    # --------------------------------------------------------
    # Generate 100 groups
    # --------------------------------------------------------

    for item in scripts:

        group_number = item["group"]

        dialogue = item["dialogue"]

        print()
        print(
            f"GROUP {group_number:03d}"
        )
        print("-" * 70)

        await generate_audio(
            group_number,
            dialogue,
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
    print(
        f"Output: {OUTPUT_DIR}"
    )


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    asyncio.run(main())