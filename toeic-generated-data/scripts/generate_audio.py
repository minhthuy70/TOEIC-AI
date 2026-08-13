#!/usr/bin/env python3
"""
TOEIC Audio Generation Script
Generates MP3 audio files for TOEIC test question groups using edge-tts.
Each question group = 1 MP3 file.
"""

import json
import os
import sys
import argparse
import asyncio
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import edge_tts
from datetime import datetime

# Configuration
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data" / "tests"
AUDIO_DIR = BASE_DIR / "audio"
MANIFEST_FILE = BASE_DIR / "audio_manifest.json"

# TTS Configuration
VOICE_MAN = "en-US-GuyNeural"
VOICE_WOMAN = "en-US-JennyNeural"
VOICE_NEUTRAL = "en-US-AriaNeural"
RATE = "+0%"  # Speed adjustment
VOLUME = "+0%"  # Volume adjustment

# Statistics
class Stats:
    def __init__(self):
        self.tests_processed = 0
        self.part1_groups = 0
        self.part2_groups = 0
        self.part3_groups = 0
        self.part4_groups = 0
        self.created = 0
        self.skipped = 0
        self.failed = 0
        self.failed_groups = []

    def add_part_group(self, part: int):
        if part == 1:
            self.part1_groups += 1
        elif part == 2:
            self.part2_groups += 1
        elif part == 3:
            self.part3_groups += 1
        elif part == 4:
            self.part4_groups += 1

stats = Stats()

def ensure_dir(path: Path):
    """Create directory if it doesn't exist."""
    path.mkdir(parents=True, exist_ok=True)

def get_test_file_path(test_num: int) -> Path:
    """Get path to test JSON file."""
    return DATA_DIR / f"test{test_num:03d}.json"

def get_audio_dir(test_num: int) -> Path:
    """Get audio directory for a specific test."""
    return AUDIO_DIR / f"test{test_num:03d}"

def get_audio_filename(part: int, group_num: int) -> str:
    """Generate deterministic audio filename."""
    return f"part{part}_group{group_num:03d}.mp3"

def load_test_json(test_num: int) -> Optional[Dict]:
    """Load test JSON file."""
    test_file = get_test_file_path(test_num)
    if not test_file.exists():
        print(f"[ERROR] Test file not found: {test_file}")
        return None
    
    try:
        with open(test_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"[ERROR] Failed to load {test_file}: {e}")
        return None

def extract_transcript_part1(group: Dict) -> Optional[str]:
    """
    Extract transcript for Part 1.

    Part 1:
    - Có 4 đáp án A, B, C, D
    - Audio phải đọc lần lượt:
      A. ...
      B. ...
      C. ...
      D. ...

    Mỗi group Part 1 tương ứng với 1 file MP3.
    """

    questions = group.get("questions", [])

    if not questions:
        return None

    # Part 1 thường có 1 question / group
    question = questions[0]

    options = question.get("options", [])

    if not options:
        return None

    # Sắp xếp theo display_order
    sorted_options = sorted(
        options,
        key=lambda x: x.get("display_order", 0)
    )

    option_texts = []

    labels = ["A", "B", "C", "D"]

    for index, option in enumerate(sorted_options):
        option_text = option.get("option_text")

        if not option_text or not option_text.strip():
            continue

        option_text = option_text.strip()

        # Lấy A/B/C/D theo thứ tự hiển thị
        label = labels[index] if index < len(labels) else str(index + 1)

        # Thêm nhãn vào transcript
        option_texts.append(
            f"{label}. {option_text}"
        )

    if not option_texts:
        return None

    # Ngắt rõ giữa các đáp án
    return " ".join(option_texts)

def extract_transcript_part2(group: Dict) -> Optional[str]:
    """
    Extract transcript for Part 2.

    Format:
    Question
    A. ...
    B. ...
    C. ...
    D. ...

    Giống cách xử lý của Part 1 để TTS đọc A/B/C/D.
    """

    questions = group.get("questions", [])

    if not questions:
        return None

    # Part 2 thường có 1 question / group
    question = questions[0]

    question_text = question.get("question_text")
    options = question.get("options", [])

    if not question_text or not question_text.strip():
        return None

    if not options:
        return None

    # Sắp xếp theo display_order
    sorted_options = sorted(
        options,
        key=lambda x: x.get("display_order", 0)
    )

    transcript_parts = []

    # Thêm câu hỏi trước
    transcript_parts.append(question_text.strip())

    # Nhãn A/B/C/D giống Part 1
    labels = ["A", "B", "C", "D"]

    for index, option in enumerate(sorted_options):

        option_text = option.get("option_text")

        if not option_text or not option_text.strip():
            continue

        option_text = option_text.strip()

        # Lấy A/B/C/D theo thứ tự
        label = (
            labels[index]
            if index < len(labels)
            else str(index + 1)
        )

        # GIỐNG HỆT PART 1
        transcript_parts.append(
            f"{label}. {option_text}"
        )

    if len(transcript_parts) <= 1:
        return None

    # Dùng dấu chấm + khoảng trắng giống Part 1
    return ". ".join(transcript_parts)

def extract_transcript_part3(group: Dict) -> Optional[str]:
    """
    Extract complete transcript for TOEIC Part 3.

    Part 3 passage contains the full conversation:
    Man: ...
    Woman: ...
    Man: ...
    Woman: ...

    IMPORTANT:
    Must return the entire passage, not only the first sentence.
    """

    passage = group.get("passage")

    if not isinstance(passage, str):
        return None

    passage = passage.strip()

    if not passage:
        return None

    # Giữ nguyên toàn bộ hội thoại
    return passage

def extract_transcript_part4(group: Dict) -> Optional[str]:
    """
    Extract transcript for Part 4.
    Part 4 has passage field with talk/announcement.
    """
    passage = group.get("passage")
    if passage and passage.strip():
        return passage.strip()
    return None

def extract_transcript(group: Dict) -> Optional[str]:
    """
    Extract transcript based on part.
    """
    part = group.get("part")
    if part == 1:
        return extract_transcript_part1(group)
    elif part == 2:
        return extract_transcript_part2(group)
    elif part == 3:
        return extract_transcript_part3(group)
    elif part == 4:
        return extract_transcript_part4(group)
    else:
        return None

def select_voice(part: int, transcript: str) -> str:
    """
    Select appropriate voice based on part and content.
    """
    if part == 3:
        # Part 3 has dialogue, check for Man/Woman indicators
        if "Man:" in transcript or "Woman:" in transcript:
            # Will handle multi-voice in the actual generation
            return VOICE_NEUTRAL
        return VOICE_NEUTRAL
    elif part == 4:
        # Part 4 is typically single speaker announcements
        return VOICE_NEUTRAL
    else:
        return VOICE_NEUTRAL

async def generate_audio_singlespeaker(text: str, output_path: Path, voice: str) -> bool:
    """
    Generate audio with single speaker using edge-tts.
    """
    try:
        communicate = edge_tts.Communicate(text, voice)
        communicate.rate = RATE
        communicate.volume = VOLUME
        
        await communicate.save(str(output_path))
        return True
    except Exception as e:
        print(f"[ERROR] Failed to generate audio: {e}")
        return False

async def generate_audio_multispeaker(
    transcript: str,
    output_path: Path
) -> bool:
    """
    Generate complete multi-speaker audio for TOEIC Part 3.

    Example transcript:

    Man: How is the project deadline progressing?
    Woman: It's on track for completion.
    Man: What are the next steps?
    Woman: We need to finalize the report.

    Each speaker line is generated separately and then
    all audio segments are concatenated into ONE MP3 file.
    """

    temp_files = []

    try:
        lines = transcript.splitlines()

        if not lines:
            return False

        # -------------------------------------------------
        # 1. Generate audio for EVERY line
        # -------------------------------------------------

        for index, line in enumerate(lines):

            line = line.strip()

            if not line:
                continue

            # Determine speaker
            if line.lower().startswith("man:"):
                voice = VOICE_MAN
                text = line[4:].strip()

            elif line.lower().startswith("woman:"):
                voice = VOICE_WOMAN
                text = line[6:].strip()

            else:
                voice = VOICE_NEUTRAL
                text = line

            if not text:
                continue

            temp_file = (
                output_path.parent /
                f".temp_{output_path.stem}_{index:03d}.mp3"
            )

            print(
                f"    [TTS] "
                f"{'MAN' if voice == VOICE_MAN else 'WOMAN' if voice == VOICE_WOMAN else 'NEUTRAL'}: "
                f"{text}"
            )

            communicate = edge_tts.Communicate(
                text=text,
                voice=voice,
                rate=RATE,
                volume=VOLUME
            )

            await communicate.save(str(temp_file))

            if not temp_file.exists() or temp_file.stat().st_size == 0:
                print(f"[ERROR] Empty audio segment: {temp_file}")
                return False

            temp_files.append(temp_file)

        if not temp_files:
            print("[ERROR] No audio segments generated.")
            return False

        # -------------------------------------------------
        # 2. Nếu chỉ có 1 câu
        # -------------------------------------------------

        if len(temp_files) == 1:

            if output_path.exists():
                output_path.unlink()

            temp_files[0].rename(output_path)

            return True

        # -------------------------------------------------
        # 3. Concatenate tất cả MP3 bằng ffmpeg
        # -------------------------------------------------

        concat_file = (
            output_path.parent /
            f".concat_{output_path.stem}.txt"
        )

        with open(concat_file, "w", encoding="utf-8") as f:

            for temp_file in temp_files:

                # ffmpeg concat format
                safe_path = str(temp_file.resolve()).replace("\\", "/")

                f.write(f"file '{safe_path}'\n")

        # Xóa output cũ nếu có
        if output_path.exists():
            output_path.unlink()

        # Chạy ffmpeg
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
            str(output_path),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        stdout, stderr = await process.communicate()

        if process.returncode != 0:

            print("[ERROR] FFmpeg failed:")
            print(stderr.decode(errors="ignore"))

            return False

        # -------------------------------------------------
        # 4. Kiểm tra file cuối cùng
        # -------------------------------------------------

        if not output_path.exists():
            print("[ERROR] Output MP3 was not created.")
            return False

        if output_path.stat().st_size == 0:
            print("[ERROR] Output MP3 is empty.")
            return False

        print(
            f"    [OK] Complete dialogue created: "
            f"{output_path.name}"
        )

        return True

    except Exception as e:

        print(
            f"[ERROR] Failed to generate multi-speaker audio: {e}"
        )

        return False

    finally:

        # -------------------------------------------------
        # 5. Cleanup temporary files
        # -------------------------------------------------

        for temp_file in temp_files:

            try:
                if temp_file.exists():
                    temp_file.unlink()
            except Exception:
                pass

        try:
            concat_file = (
                output_path.parent /
                f".concat_{output_path.stem}.txt"
            )

            if concat_file.exists():
                concat_file.unlink()

        except Exception:
            pass

async def generate_audio_for_group(test_num: int, group: Dict, group_index: int) -> bool:
    """
    Generate audio for a single question group.
    """
    part = group.get("part")
    group_type = group.get("group_type")
    
    # Extract transcript
    transcript = extract_transcript(group)
    
    if not transcript:
        print(f"[WARNING] test{test_num:03d} Part {part} Group {group_index:03d} - No transcript available, skipping")
        stats.skipped += 1
        return False
    
    # Generate audio filename
    audio_filename = get_audio_filename(part, group_index)
    audio_dir = get_audio_dir(test_num)
    ensure_dir(audio_dir)
    audio_path = audio_dir / audio_filename
    
    # Check if file already exists
    if audio_path.exists():
        print(f"[SKIP] test{test_num:03d} Part {part} Group {group_index:03d}")
        stats.skipped += 1
        return True
    
    # Select voice and generate audio
    print(f"[CREATE] test{test_num:03d} Part {part} Group {group_index:03d}")
    
    try:
        if part == 3 and ("Man:" in transcript or "Woman:" in transcript):
            success = await generate_audio_multispeaker(transcript, audio_path)
        else:
            voice = select_voice(part, transcript)
            success = await generate_audio_singlespeaker(transcript, audio_path, voice)
        
        if success:
            stats.created += 1
            return True
        else:
            stats.failed += 1
            stats.failed_groups.append(f"test{test_num:03d} Part {part} group{group_index:03d}")
            return False
    except Exception as e:
        print(f"[ERROR] test{test_num:03d} Part {part} Group {group_index:03d} - {e}")
        stats.failed += 1
        stats.failed_groups.append(f"test{test_num:03d} Part {part} group{group_index:03d}")
        return False

async def process_test(test_num: int) -> bool:
    """
    Process a single test file.
    """
    print(f"\n{'='*60}")
    print(f"Processing test{test_num:03d}")
    print(f"{'='*60}")
    
    # Load test JSON
    test_data = load_test_json(test_num)
    if not test_data:
        return False
    
    question_groups = test_data.get("question_groups", [])
    if not question_groups:
        print(f"[WARNING] test{test_num:03d} has no question groups")
        return False
    
    # Process each group
    group_counter = {1: 0, 2: 0, 3: 0, 4: 0}
    
    for group in question_groups:
        part = group.get("part")
        
        # Only process Parts 1-4 (Parts 5-7 don't have audio)
        if part not in [1, 2, 3, 4]:
            continue
        
        group_counter[part] += 1
        stats.add_part_group(part)
        
        await generate_audio_for_group(test_num, group, group_counter[part])
    
    stats.tests_processed += 1
    return True

def update_manifest(all_tests: List[int]):
    """
    Update audio manifest file.
    """
    manifest = {
        "total_audio_files": 0,
        "audio_files": [],
        "last_updated": datetime.now().isoformat()
    }
    
    for test_num in all_tests:
        test_file = get_test_file_path(test_num)
        if not test_file.exists():
            continue
        
        test_data = load_test_json(test_num)
        if not test_data:
            continue
        
        question_groups = test_data.get("question_groups", [])
        group_counter = {1: 0, 2: 0, 3: 0, 4: 0}
        
        for group in question_groups:
            part = group.get("part")
            if part not in [1, 2, 3, 4]:
                continue
            
            group_counter[part] += 1
            group_index = group_counter[part]
            
            audio_filename = get_audio_filename(part, group_index)
            audio_path = get_audio_dir(test_num) / audio_filename
            
            if audio_path.exists():
                manifest["audio_files"].append({
                    "test_id": test_num,
                    "part": part,
                    "group_number": group_index,
                    "group_type": group.get("group_type"),
                    "audio_file": f"audio/test{test_num:03d}/{audio_filename}"
                })
    
    manifest["total_audio_files"] = len(manifest["audio_files"])
    
    # Save manifest
    try:
        with open(MANIFEST_FILE, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=2)
        print(f"\n[MANIFEST] Updated {MANIFEST_FILE}")
    except Exception as e:
        print(f"[ERROR] Failed to update manifest: {e}")

def verify_audio(all_tests: List[int]) -> bool:
    """
    Verify all audio files exist and are valid.
    """
    print(f"\n{'='*60}")
    print("AUDIO VERIFICATION")
    print(f"{'='*60}\n")
    
    expected_files = 0
    existing_valid = 0
    missing = 0
    empty = 0
    missing_files = []
    
    for test_num in all_tests:
        test_file = get_test_file_path(test_num)
        if not test_file.exists():
            continue
        
        test_data = load_test_json(test_num)
        if not test_data:
            continue
        
        question_groups = test_data.get("question_groups", [])
        group_counter = {1: 0, 2: 0, 3: 0, 4: 0}
        
        for group in question_groups:
            part = group.get("part")
            if part not in [1, 2, 3, 4]:
                continue
            
            group_counter[part] += 1
            group_index = group_counter[part]
            
            # Check if transcript exists
            transcript = extract_transcript(group)
            if not transcript:
                continue  # Skip groups without transcript
            
            expected_files += 1
            
            audio_filename = get_audio_filename(part, group_index)
            audio_path = get_audio_dir(test_num) / audio_filename
            
            if audio_path.exists():
                if audio_path.stat().st_size > 0:
                    existing_valid += 1
                else:
                    empty += 1
                    missing_files.append(f"test{test_num:03d} Part {part} group{group_index:03d} (empty)")
            else:
                missing += 1
                missing_files.append(f"test{test_num:03d} Part {part} group{group_index:03d}")
    
    print(f"Expected: {expected_files}")
    print(f"Existing valid: {existing_valid}")
    print(f"Missing: {missing}")
    print(f"Empty: {empty}")
    
    if missing_files:
        print(f"\nMISSING/EMPTY AUDIO:")
        for file in missing_files[:20]:  # Show first 20
            print(f"  - {file}")
        if len(missing_files) > 20:
            print(f"  ... and {len(missing_files) - 20} more")
    
    return missing == 0 and empty == 0

def print_summary():
    """
    Print generation summary.
    """
    print(f"\n{'='*60}")
    print("AUDIO GENERATION SUMMARY")
    print(f"{'='*60}")
    print(f"Tests processed: {stats.tests_processed}")
    print(f"\nTotal groups:")
    print(f"Part 1: {stats.part1_groups}")
    print(f"Part 2: {stats.part2_groups}")
    print(f"Part 3: {stats.part3_groups}")
    print(f"Part 4: {stats.part4_groups}")
    total_expected = stats.part1_groups + stats.part2_groups + stats.part3_groups + stats.part4_groups
    print(f"Expected audio files: {total_expected}")
    print(f"\nResults:")
    print(f"Created: {stats.created}")
    print(f"Skipped: {stats.skipped}")
    print(f"Failed: {stats.failed}")
    
    if stats.failed_groups:
        print(f"\nFAILED:")
        for group in stats.failed_groups:
            print(f"  - {group}")

async def main():
    parser = argparse.ArgumentParser(description="Generate TOEIC test audio files")
    parser.add_argument("--from", type=int, default=1, help="Start test number (default: 1)")
    parser.add_argument("--to", type=int, default=100, help="End test number (default: 100)")
    parser.add_argument("--verify", action="store_true", help="Only verify existing audio files")
    
    args = parser.parse_args()
    
    # Ensure audio directory exists
    ensure_dir(AUDIO_DIR)
    
    # Determine test range
    start_test = getattr(args, "from")
    end_test = args.to
    test_range = list(range(start_test, end_test + 1))
    
    if args.verify:
        # Verification mode
        success = verify_audio(test_range)
        sys.exit(0 if success else 1)
    
    # Generation mode
    print(f"Starting audio generation for tests {start_test} to {end_test}")
    print(f"Audio directory: {AUDIO_DIR}")
    print(f"Data directory: {DATA_DIR}")
    
    # Process each test
    for test_num in test_range:
        await process_test(test_num)
    
    # Update manifest
    update_manifest(test_range)
    
    # Print summary
    print_summary()
    
    # Verify after generation
    print(f"\n{'='*60}")
    print("Running verification after generation...")
    print(f"{'='*60}")
    verify_audio(test_range)

if __name__ == "__main__":
    asyncio.run(main())