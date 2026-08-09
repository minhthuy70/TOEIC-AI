from pathlib import Path
import subprocess
import csv
import sys
import re


# ============================================================
# PATH
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

INPUT_FILE = (
    PROJECT_ROOT
    / "uploads"
    / "tests"
    / "placement-test"
    / "audio"
    / "placement-test.mp3"
)

OUTPUT_DIR = PROJECT_ROOT / "output"


# ============================================================
# TOEIC LISTENING STRUCTURE
# ============================================================

PART_GROUPS = {
    1: 6,
    2: 25,
    3: 13,
    4: 10,
}

TOTAL_GROUPS = sum(PART_GROUPS.values())


# ============================================================
# FORMAT TIME
# ============================================================

def format_time(seconds: float) -> str:
    minutes = int(seconds // 60)
    secs = seconds - minutes * 60

    return f"{minutes:02d}:{secs:05.2f}"


# ============================================================
# GET AUDIO DURATION
# ============================================================

def get_duration(audio_file: Path) -> float:

    command = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        str(audio_file),
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        check=True,
    )

    return float(result.stdout.strip())


# ============================================================
# DETECT SILENCE
# ============================================================

def detect_silence(audio_file: Path):

    command = [
        "ffmpeg",
        "-hide_banner",
        "-i",
        str(audio_file),
        "-af",
        "silencedetect=noise=-35dB:d=0.5",
        "-f",
        "null",
        "-",
    ]

    result = subprocess.run(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )

    output = result.stderr

    silence_start = None
    silences = []

    for line in output.splitlines():

        match_start = re.search(
            r"silence_start:\s*([0-9.]+)",
            line,
        )

        if match_start:

            silence_start = float(
                match_start.group(1)
            )

        match_end = re.search(
            r"silence_end:\s*([0-9.]+)",
            line,
        )

        if match_end and silence_start is not None:

            silence_end = float(
                match_end.group(1)
            )

            silences.append(
                (
                    silence_start,
                    silence_end,
                )
            )

            silence_start = None

    return silences


# ============================================================
# BUILD SPEECH SEGMENTS
# ============================================================

def build_speech_segments(
    duration,
    silences,
):

    segments = []

    current_start = 0.0

    for silence_start, silence_end in silences:

        if silence_start > current_start:

            segments.append(
                {
                    "start": current_start,
                    "end": silence_start,
                }
            )

        current_start = silence_end

    if current_start < duration:

        segments.append(
            {
                "start": current_start,
                "end": duration,
            }
        )

    return segments


# ============================================================
# MERGE CLOSE SEGMENTS
# ============================================================

def merge_segments(
    segments,
    max_gap=1.5,
):

    if not segments:
        return []

    merged = [
        segments[0].copy()
    ]

    for current in segments[1:]:

        previous = merged[-1]

        gap = (
            current["start"]
            - previous["end"]
        )

        if gap <= max_gap:

            previous["end"] = current["end"]

        else:

            merged.append(
                current.copy()
            )

    return merged


# ============================================================
# SAVE CSV
# ============================================================

def save_csv(
    output_file,
    segments,
):

    with open(
        output_file,
        "w",
        newline="",
        encoding="utf-8-sig",
    ) as file:

        writer = csv.writer(file)

        writer.writerow(
            [
                "segment",
                "start_seconds",
                "end_seconds",
                "start_time",
                "end_time",
                "duration_seconds",
            ]
        )

        for index, segment in enumerate(
            segments,
            start=1,
        ):

            start = segment["start"]
            end = segment["end"]

            writer.writerow(
                [
                    index,
                    round(start, 2),
                    round(end, 2),
                    format_time(start),
                    format_time(end),
                    round(
                        end - start,
                        2,
                    ),
                ]
            )


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("=" * 70)
    print("TOEIC AUDIO ANALYZER")
    print("=" * 70)

    # --------------------------------------------------------
    # CHECK INPUT
    # --------------------------------------------------------

    print()
    print("Input:")
    print(INPUT_FILE)

    if not INPUT_FILE.exists():

        print()
        print("ERROR: Audio file not found.")

        sys.exit(1)

    # --------------------------------------------------------
    # DURATION
    # --------------------------------------------------------

    duration = get_duration(
        INPUT_FILE
    )

    print()
    print(
        f"Duration: "
        f"{format_time(duration)}"
    )

    # --------------------------------------------------------
    # SILENCE
    # --------------------------------------------------------

    print()
    print(
        "Detecting silence..."
    )

    silences = detect_silence(
        INPUT_FILE
    )

    print(
        f"Silence intervals: "
        f"{len(silences)}"
    )

    # --------------------------------------------------------
    # SPEECH
    # --------------------------------------------------------

    segments = build_speech_segments(
        duration,
        silences,
    )

    print(
        f"Speech segments before merge: "
        f"{len(segments)}"
    )

    # --------------------------------------------------------
    # MERGE
    # --------------------------------------------------------

    segments = merge_segments(
        segments,
        max_gap=1.5,
    )

    print(
        f"Speech segments after merge: "
        f"{len(segments)}"
    )

    # --------------------------------------------------------
    # OUTPUT
    # --------------------------------------------------------

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    output_file = (
        OUTPUT_DIR
        / "placement-test_segments.csv"
    )

    save_csv(
        output_file,
        segments,
    )

    print()
    print(
        "CSV created:"
    )

    print(
        output_file
    )

    # --------------------------------------------------------
    # EXPECTATION
    # --------------------------------------------------------

    print()
    print(
        f"TOEIC Listening groups expected: "
        f"{TOTAL_GROUPS}"
    )

    print()
    print("=" * 70)
    print("DONE")
    print("=" * 70)


if __name__ == "__main__":
    main()