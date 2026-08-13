#!/usr/bin/env python3
"""
Organize TOEIC Audio Files

Current structure:
    audio/
        test001/
            part1_group001.mp3
            part2_group001.mp3
            part3_group001.mp3
            part4_group001.mp3

Target structure:
    audio/
        test001/
            part01/
                test001_part01_group001.mp3
            part02/
                test001_part02_group001.mp3
            part03/
                test001_part03_group001.mp3
            part04/
                test001_part04_group001.mp3

IMPORTANT:
- Does NOT modify the database.
- Does NOT modify JSON files.
- Does NOT overwrite existing files.
- Detects destination conflicts.
- Reports every moved file.
"""

import argparse
import hashlib
import re
import shutil
import sys
from pathlib import Path
from typing import Optional


# ============================================================
# PATH CONFIGURATION
# ============================================================

SCRIPT_DIR = Path(__file__).resolve().parent
BASE_DIR = SCRIPT_DIR.parent

AUDIO_DIR = BASE_DIR / "audio"


# ============================================================
# STATISTICS
# ============================================================

class Stats:
    def __init__(self):
        self.tests_processed = 0

        self.found = 0
        self.moved = 0
        self.already_exists = 0
        self.conflicts = 0
        self.missing = 0
        self.invalid = 0
        self.errors = 0

        self.moved_files = []
        self.already_exists_files = []
        self.conflict_files = []
        self.missing_files = []
        self.error_files = []


stats = Stats()


# ============================================================
# HELPERS
# ============================================================

def calculate_sha256(file_path: Path) -> Optional[str]:
    """
    Calculate SHA256 hash of a file.

    Used to determine whether an existing destination file
    is exactly the same as the source file.
    """

    try:
        sha256 = hashlib.sha256()

        with open(file_path, "rb") as f:
            while True:
                chunk = f.read(1024 * 1024)

                if not chunk:
                    break

                sha256.update(chunk)

        return sha256.hexdigest()

    except Exception as e:
        print(f"[ERROR] Cannot hash file:")
        print(f"        {file_path}")
        print(f"        {e}")

        return None


def get_test_dir(test_num: int) -> Path:
    """
    Return audio directory for a test.

    Example:
        test_num = 72

        audio/test072
    """

    return AUDIO_DIR / f"test{test_num:03d}"


def get_source_file(
    test_num: int,
    part: int,
    group_num: int
) -> Path:
    """
    Return current source file.

    Example:

        audio/test072/part1_group001.mp3
    """

    test_dir = get_test_dir(test_num)

    return test_dir / (
        f"part{part}_group{group_num:03d}.mp3"
    )


def get_destination_file(
    test_num: int,
    part: int,
    group_num: int
) -> Path:
    """
    Return desired destination file.

    Example:

        audio/test072/part01/test072_part01_group001.mp3
    """

    test_dir = get_test_dir(test_num)

    part_dir = test_dir / f"part{part:02d}"

    filename = (
        f"test{test_num:03d}"
        f"_part{part:02d}"
        f"_group{group_num:03d}.mp3"
    )

    return part_dir / filename


def is_expected_source_file(
    filename: str,
    part: int,
    group_num: int
) -> bool:
    """
    Check whether filename matches:

        part1_group001.mp3

    or:

        part2_group025.mp3
    """

    pattern = (
        rf"^part{part}_group{group_num:03d}\.mp3$"
    )

    return re.match(pattern, filename, re.IGNORECASE) is not None


# ============================================================
# MOVE ONE FILE
# ============================================================

def move_audio_file(
    test_num: int,
    part: int,
    group_num: int,
    dry_run: bool = False
) -> None:

    source = get_source_file(
        test_num,
        part,
        group_num
    )

    destination = get_destination_file(
        test_num,
        part,
        group_num
    )

    stats.found += 1

    # --------------------------------------------------------
    # SOURCE DOES NOT EXIST
    # --------------------------------------------------------

    if not source.exists():

        stats.missing += 1

        relative_source = source.relative_to(BASE_DIR)

        print(
            f"[MISSING] {relative_source}"
        )

        stats.missing_files.append(
            str(relative_source)
        )

        return

    # --------------------------------------------------------
    # SOURCE IS NOT A FILE
    # --------------------------------------------------------

    if not source.is_file():

        stats.invalid += 1

        print(
            f"[INVALID] Source is not a file:"
        )
        print(
            f"          {source.relative_to(BASE_DIR)}"
        )

        return

    # --------------------------------------------------------
    # DESTINATION ALREADY EXISTS
    # --------------------------------------------------------

    if destination.exists():

        source_hash = calculate_sha256(source)
        destination_hash = calculate_sha256(destination)

        if (
            source_hash is not None
            and destination_hash is not None
            and source_hash == destination_hash
        ):
            stats.already_exists += 1

            print(
                f"[ALREADY EXISTS] "
                f"{source.relative_to(BASE_DIR)}"
            )

            print(
                f"                -> "
                f"{destination.relative_to(BASE_DIR)}"
            )

            stats.already_exists_files.append(
                (
                    str(source.relative_to(BASE_DIR)),
                    str(destination.relative_to(BASE_DIR))
                )
            )

            # IMPORTANT:
            # We do NOT delete the source automatically.
            #
            # This is safer because the user may want to
            # inspect it before removing duplicates.

            return

        # ----------------------------------------------------
        # DESTINATION EXISTS BUT DIFFERENT CONTENT
        # ----------------------------------------------------

        stats.conflicts += 1

        print()
        print("=" * 70)
        print("[CONFLICT] DESTINATION FILE ALREADY EXISTS")
        print("=" * 70)

        print(
            f"Source      : "
            f"{source.relative_to(BASE_DIR)}"
        )

        print(
            f"Destination : "
            f"{destination.relative_to(BASE_DIR)}"
        )

        print()
        print(
            "Source and destination have DIFFERENT content."
        )

        print(
            ">>> NOTHING WAS OVERWRITTEN."
        )

        print("=" * 70)
        print()

        stats.conflict_files.append(
            (
                str(source.relative_to(BASE_DIR)),
                str(destination.relative_to(BASE_DIR))
            )
        )

        return

    # --------------------------------------------------------
    # DRY RUN
    # --------------------------------------------------------

    if dry_run:

        print(
            f"[DRY-RUN] "
            f"{source.relative_to(BASE_DIR)}"
        )

        print(
            f"          -> "
            f"{destination.relative_to(BASE_DIR)}"
        )

        return

    # --------------------------------------------------------
    # CREATE DESTINATION DIRECTORY
    # --------------------------------------------------------

    try:

        destination.parent.mkdir(
            parents=True,
            exist_ok=True
        )

    except Exception as e:

        stats.errors += 1

        print(
            f"[ERROR] Cannot create directory:"
        )

        print(
            f"        {destination.parent}"
        )

        print(
            f"        {e}"
        )

        stats.error_files.append(
            str(source.relative_to(BASE_DIR))
        )

        return

    # --------------------------------------------------------
    # MOVE
    # --------------------------------------------------------

    try:

        shutil.move(
            str(source),
            str(destination)
        )

        stats.moved += 1

        source_relative = source.relative_to(BASE_DIR)
        destination_relative = destination.relative_to(BASE_DIR)

        print(
            f"[MOVED] "
            f"{source_relative}"
        )

        print(
            f"        -> "
            f"{destination_relative}"
        )

        stats.moved_files.append(
            (
                str(source_relative),
                str(destination_relative)
            )
        )

    except Exception as e:

        stats.errors += 1

        print()
        print(
            f"[ERROR] Failed to move:"
        )

        print(
            f"        {source.relative_to(BASE_DIR)}"
        )

        print(
            f"        -> "
            f"{destination.relative_to(BASE_DIR)}"
        )

        print(
            f"        Reason: {e}"
        )

        stats.error_files.append(
            str(source.relative_to(BASE_DIR))
        )


# ============================================================
# PROCESS ONE TEST
# ============================================================

def process_test(
    test_num: int,
    dry_run: bool = False
) -> None:

    test_dir = get_test_dir(test_num)

    print()
    print("=" * 70)
    print(f"TEST {test_num:03d}")
    print("=" * 70)

    if not test_dir.exists():

        print(
            f"[WARNING] Directory not found:"
        )

        print(
            f"          {test_dir}"
        )

        return

    if not test_dir.is_dir():

        print(
            f"[WARNING] Not a directory:"
        )

        print(
            f"          {test_dir}"
        )

        return

    stats.tests_processed += 1

    # --------------------------------------------------------
    # Process Parts 1-4
    # --------------------------------------------------------

    for part in range(1, 5):

        print()
        print(
            f"--- PART {part} ---"
        )

        # ----------------------------------------------------
        # Find source files directly inside test directory
        # ----------------------------------------------------

        pattern = f"part{part}_group*.mp3"

        source_files = sorted(
            test_dir.glob(pattern)
        )

        if not source_files:

            print(
                f"[INFO] No files found for Part {part}"
            )

            continue

        for source_file in source_files:

            filename = source_file.name

            # -----------------------------------------------
            # Extract group number
            # -----------------------------------------------

            match = re.match(
                rf"^part{part}_group(\d+)\.mp3$",
                filename,
                re.IGNORECASE
            )

            if not match:

                stats.invalid += 1

                print(
                    f"[INVALID] Cannot determine group:"
                )

                print(
                    f"          {source_file.relative_to(BASE_DIR)}"
                )

                continue

            group_num = int(
                match.group(1)
            )

            move_audio_file(
                test_num=test_num,
                part=part,
                group_num=group_num,
                dry_run=dry_run
            )


# ============================================================
# SUMMARY
# ============================================================

def print_summary(
    start_test: int,
    end_test: int,
    dry_run: bool
) -> None:

    print()
    print()
    print("=" * 70)

    if dry_run:
        print("DRY-RUN SUMMARY")
    else:
        print("AUDIO ORGANIZATION SUMMARY")

    print("=" * 70)

    print(
        f"Test range       : "
        f"{start_test:03d} -> {end_test:03d}"
    )

    print(
        f"Tests processed  : "
        f"{stats.tests_processed}"
    )

    print()

    print(
        f"Source files found : "
        f"{stats.found}"
    )

    print(
        f"Moved              : "
        f"{stats.moved}"
    )

    print(
        f"Already exists     : "
        f"{stats.already_exists}"
    )

    print(
        f"Conflicts          : "
        f"{stats.conflicts}"
    )

    print(
        f"Missing            : "
        f"{stats.missing}"
    )

    print(
        f"Invalid            : "
        f"{stats.invalid}"
    )

    print(
        f"Errors             : "
        f"{stats.errors}"
    )

    # --------------------------------------------------------
    # Moved files
    # --------------------------------------------------------

    if stats.moved_files:

        print()
        print("=" * 70)
        print("FILES MOVED")
        print("=" * 70)

        for source, destination in stats.moved_files:

            print()
            print(
                f"SOURCE:"
            )

            print(
                f"  {source}"
            )

            print(
                f"DESTINATION:"
            )

            print(
                f"  {destination}"
            )

    # --------------------------------------------------------
    # Already exists
    # --------------------------------------------------------

    if stats.already_exists_files:

        print()
        print("=" * 70)
        print(
            "FILES ALREADY EXISTING "
            "(same content, NOT overwritten)"
        )
        print("=" * 70)

        for source, destination in stats.already_exists_files:

            print()
            print(
                f"SOURCE:"
            )

            print(
                f"  {source}"
            )

            print(
                f"DESTINATION:"
            )

            print(
                f"  {destination}"
            )

    # --------------------------------------------------------
    # Conflicts
    # --------------------------------------------------------

    if stats.conflict_files:

        print()
        print("=" * 70)
        print(
            "CONFLICTS "
            "(different content, NOT overwritten)"
        )
        print("=" * 70)

        for source, destination in stats.conflict_files:

            print()
            print(
                f"SOURCE:"
            )

            print(
                f"  {source}"
            )

            print(
                f"DESTINATION:"
            )

            print(
                f"  {destination}"
            )

    # --------------------------------------------------------
    # Missing
    # --------------------------------------------------------

    if stats.missing_files:

        print()
        print("=" * 70)
        print("MISSING FILES")
        print("=" * 70)

        for file in stats.missing_files:

            print(
                f"  {file}"
            )

    # --------------------------------------------------------
    # Errors
    # --------------------------------------------------------

    if stats.error_files:

        print()
        print("=" * 70)
        print("ERROR FILES")
        print("=" * 70)

        for file in stats.error_files:

            print(
                f"  {file}"
            )

    # --------------------------------------------------------
    # Final message
    # --------------------------------------------------------

    print()
    print("=" * 70)

    if dry_run:

        print(
            "DRY-RUN COMPLETE."
        )

        print(
            "No files were moved."
        )

        print(
            "If everything looks correct, run again "
            "without --dry-run."
        )

    elif stats.conflicts > 0:

        print(
            "COMPLETED WITH CONFLICTS."
        )

        print(
            "No existing files were overwritten."
        )

        print(
            "Review the CONFLICTS section above."
        )

    elif stats.errors > 0:

        print(
            "COMPLETED WITH ERRORS."
        )

        print(
            "Review the ERROR FILES section above."
        )

    else:

        print(
            "🎉 AUDIO ORGANIZATION COMPLETE!"
        )

        print(
            "No existing files were overwritten."
        )

    print("=" * 70)


# ============================================================
# MAIN
# ============================================================

def main():

    parser = argparse.ArgumentParser(
        description=(
            "Organize TOEIC audio files "
            "into the structure referenced by audio_url."
        )
    )

    parser.add_argument(
        "--from",
        dest="start_test",
        type=int,
        default=1,
        help="First test number. Default: 1"
    )

    parser.add_argument(
        "--to",
        dest="end_test",
        type=int,
        default=100,
        help="Last test number. Default: 100"
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
        help=(
            "Preview changes without moving files."
        )
    )

    args = parser.parse_args()

    start_test = args.start_test
    end_test = args.end_test

    # --------------------------------------------------------
    # Validate range
    # --------------------------------------------------------

    if start_test < 1:

        print(
            "[ERROR] --from must be >= 1"
        )

        sys.exit(1)

    if end_test < start_test:

        print(
            "[ERROR] --to must be >= --from"
        )

        sys.exit(1)

    # --------------------------------------------------------
    # Check audio directory
    # --------------------------------------------------------

    if not AUDIO_DIR.exists():

        print(
            "[ERROR] Audio directory does not exist:"
        )

        print(
            f"        {AUDIO_DIR}"
        )

        sys.exit(1)

    # --------------------------------------------------------
    # Header
    # --------------------------------------------------------

    print()
    print("=" * 70)
    print("TOEIC AUDIO ORGANIZER")
    print("=" * 70)

    print(
        f"Audio directory:"
    )

    print(
        f"  {AUDIO_DIR}"
    )

    print()

    print(
        f"Test range:"
    )

    print(
        f"  test{start_test:03d} "
        f"-> "
        f"test{end_test:03d}"
    )

    print()

    if args.dry_run:

        print(
            "MODE: DRY-RUN"
        )

        print(
            "No files will be moved."
        )

    else:

        print(
            "MODE: REAL MOVE"
        )

        print(
            "Existing files will NEVER be overwritten."
        )

    print("=" * 70)

    # --------------------------------------------------------
    # Process tests
    # --------------------------------------------------------

    for test_num in range(
        start_test,
        end_test + 1
    ):

        process_test(
            test_num,
            dry_run=args.dry_run
        )

    # --------------------------------------------------------
    # Summary
    # --------------------------------------------------------

    print_summary(
        start_test,
        end_test,
        args.dry_run
    )

    # --------------------------------------------------------
    # Exit code
    # --------------------------------------------------------

    if stats.conflicts > 0 or stats.errors > 0:

        sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    main()