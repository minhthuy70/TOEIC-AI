from pathlib import Path
import csv
import sys


# ============================================================
# PATH
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

INPUT_CSV = (
    PROJECT_ROOT
    / "output"
    / "placement-test_segments.csv"
)

OUTPUT_CSV = (
    PROJECT_ROOT
    / "output"
    / "placement-test_question_groups.csv"
)


# ============================================================
# TOEIC LISTENING STRUCTURE
#
# Part 1 = 6 questions
# Part 2 = 25 questions
# Part 3 = 13 question groups
# Part 4 = 10 question groups
#
# Total = 54 groups
# ============================================================

PART_CONFIG = {
    1: {
        "group_start": 1,
        "group_end": 6,
    },
    2: {
        "group_start": 7,
        "group_end": 31,
    },
    3: {
        "group_start": 32,
        "group_end": 44,
    },
    4: {
        "group_start": 45,
        "group_end": 54,
    },
}


# ============================================================
# LOAD SEGMENTS
# ============================================================

def load_segments():

    if not INPUT_CSV.exists():

        print()
        print("ERROR: Khong tim thay file:")
        print(INPUT_CSV)
        print()

        print(
            "Hay chay detect_segments.py truoc."
        )

        sys.exit(1)

    segments = []

    with open(
        INPUT_CSV,
        "r",
        encoding="utf-8-sig",
        newline="",
    ) as file:

        reader = csv.DictReader(file)

        required_columns = {
            "segment",
            "start_seconds",
            "end_seconds",
            "start_time",
            "end_time",
        }

        missing = (
            required_columns
            - set(reader.fieldnames or [])
        )

        if missing:

            print()
            print(
                "ERROR: CSV thieu cot:"
            )

            for column in sorted(missing):
                print(f"  - {column}")

            print()

            sys.exit(1)

        for row in reader:

            try:

                segments.append(
                    {
                        "segment": int(
                            row["segment"]
                        ),
                        "start_seconds": float(
                            row["start_seconds"]
                        ),
                        "end_seconds": float(
                            row["end_seconds"]
                        ),
                        "start_time": row[
                            "start_time"
                        ],
                        "end_time": row[
                            "end_time"
                        ],
                    }
                )

            except (ValueError, TypeError) as error:

                print()
                print(
                    "ERROR: Khong doc duoc segment:"
                )
                print(row)
                print(error)
                print()

                sys.exit(1)

    segments.sort(
        key=lambda x: x["segment"]
    )

    return segments


# ============================================================
# FORMAT TIME
# ============================================================

def format_time(seconds):

    minutes = int(seconds // 60)

    secs = seconds - minutes * 60

    return f"{minutes:02d}:{secs:05.2f}"


# ============================================================
# CREATE EMPTY GROUP
# ============================================================

def empty_group(
    group_id,
    part,
):

    return {
        "group_id": group_id,
        "part": part,

        "start_segment": "",
        "end_segment": "",

        "audio_start_seconds": "",
        "audio_end_seconds": "",

        "audio_start_time": "",
        "audio_end_time": "",

        "segment_count": "",

        "status": "NEED_REVIEW",
    }


# ============================================================
# PART 1
#
# Part 1 has 6 questions.
#
# The current silence detector does NOT give us enough
# information to safely determine the exact question
# boundaries.
#
# Therefore we intentionally keep these as NEED_REVIEW.
# ============================================================

def build_part1_groups():

    groups = []

    for group_id in range(1, 7):

        groups.append(
            empty_group(
                group_id=group_id,
                part=1,
            )
        )

    return groups


# ============================================================
# PART 2
#
# Part 2 has 25 questions.
#
# Same situation as Part 1:
# silence detection alone cannot safely map each
# question to a timestamp.
#
# Therefore these remain NEED_REVIEW.
# ============================================================

def build_part2_groups():

    groups = []

    for group_id in range(7, 32):

        groups.append(
            empty_group(
                group_id=group_id,
                part=2,
            )
        )

    return groups


# ============================================================
# BUILD PART 3 / PART 4
#
# Each group contains exactly 4 speech segments.
#
# Part 3:
#
# Group 32 = segments 38-41
# Group 33 = segments 42-45
# ...
# Group 44 = segments 86-89
#
# Part 4:
#
# Group 45 = segments 92-95
# Group 46 = segments 96-99
# ...
# Group 54 = segments 128-131
# ============================================================

def build_four_segment_groups(
    segments,
    part,
    group_start,
    group_end,
    first_segment,
):

    number_of_groups = (
        group_end
        - group_start
        + 1
    )

    required_segments = (
        number_of_groups * 4
    )

    # --------------------------------------------------------
    # Select required segments
    # --------------------------------------------------------

    selected = [
        segment
        for segment in segments
        if (
            segment["segment"]
            >= first_segment
        )
        and (
            segment["segment"]
            < (
                first_segment
                + required_segments
            )
        )
    ]

    # --------------------------------------------------------
    # Validate number of segments
    # --------------------------------------------------------

    if len(selected) != required_segments:

        raise ValueError(
            f"Part {part}: can "
            f"{required_segments} segments "
            f"nhung tim thay "
            f"{len(selected)}."
        )

    # --------------------------------------------------------
    # Validate continuous segment numbers
    # --------------------------------------------------------

    expected_numbers = list(
        range(
            first_segment,
            first_segment
            + required_segments,
        )
    )

    actual_numbers = [
        segment["segment"]
        for segment in selected
    ]

    if actual_numbers != expected_numbers:

        raise ValueError(
            f"Part {part}: segment numbers "
            f"khong lien tuc.\n"
            f"Expected: {expected_numbers}\n"
            f"Actual:   {actual_numbers}"
        )

    # --------------------------------------------------------
    # Build groups
    # --------------------------------------------------------

    groups = []

    for i in range(number_of_groups):

        group_id = (
            group_start + i
        )

        start_index = i * 4

        end_index = (
            start_index + 3
        )

        group_segments = selected[
            start_index:
            end_index + 1
        ]

        first = group_segments[0]

        last = group_segments[-1]

        groups.append(
            {
                "group_id": group_id,

                "part": part,

                "start_segment": first[
                    "segment"
                ],

                "end_segment": last[
                    "segment"
                ],

                "audio_start_seconds": first[
                    "start_seconds"
                ],

                "audio_end_seconds": last[
                    "end_seconds"
                ],

                "audio_start_time": first[
                    "start_time"
                ],

                "audio_end_time": last[
                    "end_time"
                ],

                "segment_count": len(
                    group_segments
                ),

                "status": "AUTO",
            }
        )

    return groups


# ============================================================
# SAVE CSV
# ============================================================

def save_csv(groups):

    OUTPUT_CSV.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    fieldnames = [
        "group_id",
        "part",
        "start_segment",
        "end_segment",
        "audio_start_seconds",
        "audio_end_seconds",
        "audio_start_time",
        "audio_end_time",
        "segment_count",
        "status",
    ]

    with open(
        OUTPUT_CSV,
        "w",
        encoding="utf-8-sig",
        newline="",
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=fieldnames,
        )

        writer.writeheader()

        writer.writerows(groups)


# ============================================================
# VALIDATE GROUPS
# ============================================================

def validate_groups(groups):

    print()
    print("=" * 70)
    print("VALIDATION")
    print("=" * 70)

    # --------------------------------------------------------
    # Total groups
    # --------------------------------------------------------

    if len(groups) != 54:

        raise ValueError(
            f"Can 54 groups nhung co "
            f"{len(groups)} groups."
        )

    # --------------------------------------------------------
    # Group IDs
    # --------------------------------------------------------

    actual_ids = [
        group["group_id"]
        for group in groups
    ]

    expected_ids = list(
        range(1, 55)
    )

    if actual_ids != expected_ids:

        raise ValueError(
            "Group IDs khong dung."
        )

    # --------------------------------------------------------
    # Part counts
    # --------------------------------------------------------

    part_counts = {}

    for group in groups:

        part = group["part"]

        part_counts[part] = (
            part_counts.get(part, 0)
            + 1
        )

    expected_part_counts = {
        1: 6,
        2: 25,
        3: 13,
        4: 10,
    }

    if part_counts != expected_part_counts:

        raise ValueError(
            f"Part counts sai.\n"
            f"Expected: "
            f"{expected_part_counts}\n"
            f"Actual:   "
            f"{part_counts}"
        )

    # --------------------------------------------------------
    # Validate AUTO groups
    # --------------------------------------------------------

    auto_groups = [
        group
        for group in groups
        if group["status"] == "AUTO"
    ]

    if len(auto_groups) != 23:

        raise ValueError(
            f"Expected 23 AUTO groups "
            f"(13 Part 3 + 10 Part 4), "
            f"nhung co {len(auto_groups)}."
        )

    # --------------------------------------------------------
    # Validate Part 3
    # --------------------------------------------------------

    part3 = [
        group
        for group in groups
        if group["part"] == 3
    ]

    for index, group in enumerate(part3):

        expected_start = (
            38 + index * 4
        )

        expected_end = (
            expected_start + 3
        )

        if (
            group["start_segment"]
            != expected_start
            or
            group["end_segment"]
            != expected_end
        ):

            raise ValueError(
                f"Part 3 Group "
                f"{group['group_id']} "
                f"khong dung segment."
            )

        if group["segment_count"] != 4:

            raise ValueError(
                f"Part 3 Group "
                f"{group['group_id']} "
                f"khong co 4 segments."
            )

    # --------------------------------------------------------
    # Validate Part 4
    # --------------------------------------------------------

    part4 = [
        group
        for group in groups
        if group["part"] == 4
    ]

    for index, group in enumerate(part4):

        expected_start = (
            92 + index * 4
        )

        expected_end = (
            expected_start + 3
        )

        if (
            group["start_segment"]
            != expected_start
            or
            group["end_segment"]
            != expected_end
        ):

            raise ValueError(
                f"Part 4 Group "
                f"{group['group_id']} "
                f"khong dung segment."
            )

        if group["segment_count"] != 4:

            raise ValueError(
                f"Part 4 Group "
                f"{group['group_id']} "
                f"khong co 4 segments."
            )

    print()
    print("Total groups       : 54")
    print("Part 1 groups      : 6")
    print("Part 2 groups      : 25")
    print("Part 3 groups      : 13 AUTO")
    print("Part 4 groups      : 10 AUTO")
    print("AUTO groups        : 23")
    print("NEED_REVIEW groups : 31")

    print()
    print("VALIDATION: OK")


# ============================================================
# PREVIEW PART 3
# ============================================================

def preview_part3(groups):

    print()
    print("-" * 70)
    print("PREVIEW PART 3")
    print("-" * 70)

    for group in groups:

        print(
            f"Group {group['group_id']:02d}: "
            f"segment "
            f"{group['start_segment']:03d}"
            f"-"
            f"{group['end_segment']:03d} | "
            f"{group['audio_start_time']} "
            f"-> "
            f"{group['audio_end_time']} | "
            f"{group['audio_start_seconds']:.2f}s "
            f"-> "
            f"{group['audio_end_seconds']:.2f}s"
        )


# ============================================================
# PREVIEW PART 4
# ============================================================

def preview_part4(groups):

    print()
    print("-" * 70)
    print("PREVIEW PART 4")
    print("-" * 70)

    for group in groups:

        print(
            f"Group {group['group_id']:02d}: "
            f"segment "
            f"{group['start_segment']:03d}"
            f"-"
            f"{group['end_segment']:03d} | "
            f"{group['audio_start_time']} "
            f"-> "
            f"{group['audio_end_time']} | "
            f"{group['audio_start_seconds']:.2f}s "
            f"-> "
            f"{group['audio_end_seconds']:.2f}s"
        )


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("=" * 70)
    print("BUILD TOEIC LISTENING QUESTION GROUPS")
    print("=" * 70)

    # --------------------------------------------------------
    # LOAD
    # --------------------------------------------------------

    segments = load_segments()

    print()
    print(
        f"Loaded segments: "
        f"{len(segments)}"
    )

    if len(segments) < 131:

        print()
        print(
            "ERROR: Can it nhat 131 segments "
            "de build Part 3 + Part 4."
        )

        sys.exit(1)

    # --------------------------------------------------------
    # PART 1
    # --------------------------------------------------------

    part1 = build_part1_groups()

    print()
    print(
        f"Part 1: "
        f"{len(part1)} groups "
        f"(NEED_REVIEW)"
    )

    # --------------------------------------------------------
    # PART 2
    # --------------------------------------------------------

    part2 = build_part2_groups()

    print(
        f"Part 2: "
        f"{len(part2)} groups "
        f"(NEED_REVIEW)"
    )

    # --------------------------------------------------------
    # PART 3
    #
    # segments 38 -> 89
    # --------------------------------------------------------

    part3 = build_four_segment_groups(
        segments=segments,
        part=3,
        group_start=32,
        group_end=44,
        first_segment=38,
    )

    print(
        f"Part 3: "
        f"{len(part3)} groups "
        f"(AUTO)"
    )

    # --------------------------------------------------------
    # PART 4
    #
    # segments 92 -> 131
    # --------------------------------------------------------

    part4 = build_four_segment_groups(
        segments=segments,
        part=4,
        group_start=45,
        group_end=54,
        first_segment=92,
    )

    print(
        f"Part 4: "
        f"{len(part4)} groups "
        f"(AUTO)"
    )

    # --------------------------------------------------------
    # MERGE
    # --------------------------------------------------------

    groups = (
        part1
        + part2
        + part3
        + part4
    )

    # --------------------------------------------------------
    # SORT
    # --------------------------------------------------------

    groups.sort(
        key=lambda x: x["group_id"]
    )

    # --------------------------------------------------------
    # VALIDATE
    # --------------------------------------------------------

    validate_groups(groups)

    # --------------------------------------------------------
    # SAVE
    # --------------------------------------------------------

    save_csv(groups)

    print()
    print("=" * 70)
    print("CSV CREATED")
    print("=" * 70)

    print()
    print(OUTPUT_CSV)

    # --------------------------------------------------------
    # PREVIEW
    # --------------------------------------------------------

    preview_part3(part3)

    preview_part4(part4)

    # --------------------------------------------------------
    # DONE
    # --------------------------------------------------------

    print()
    print("=" * 70)
    print("DONE")
    print("=" * 70)


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()