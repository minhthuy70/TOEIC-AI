import argparse
from pathlib import Path
import subprocess
import csv
import sys
import re
import psycopg2

# Fix UnicodeEncodeError in Windows terminal
if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr.encoding.lower() != 'utf-8':
    sys.stderr.reconfigure(encoding='utf-8')

# ============================================================
# PATH
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = PROJECT_ROOT / "output"


# ============================================================
# FORMAT TIME
# ============================================================

def format_time(seconds: float) -> str:
    minutes = int(seconds // 60)
    secs = seconds - minutes * 60
    return f"{minutes:02d}:{secs:05.2f}"


# ============================================================
# DETECT SEGMENTS FUNCTIONS
# ============================================================

def get_duration(audio_file: Path) -> float:
    command = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(audio_file),
    ]
    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        check=True,
    )
    return float(result.stdout.strip())


def detect_silence(audio_file: Path):
    command = [
        "ffmpeg",
        "-hide_banner",
        "-i", str(audio_file),
        "-af", "silencedetect=noise=-35dB:d=0.5",
        "-f", "null",
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
        match_start = re.search(r"silence_start:\s*([0-9.]+)", line)
        if match_start:
            silence_start = float(match_start.group(1))

        match_end = re.search(r"silence_end:\s*([0-9.]+)", line)
        if match_end and silence_start is not None:
            silence_end = float(match_end.group(1))
            silences.append((silence_start, silence_end))
            silence_start = None

    return silences


def build_speech_segments(duration, silences):
    segments = []
    current_start = 0.0

    for silence_start, silence_end in silences:
        if silence_start > current_start:
            segments.append({
                "start": current_start,
                "end": silence_start,
            })
        current_start = silence_end

    if current_start < duration:
        segments.append({
            "start": current_start,
            "end": duration,
        })
    return segments


def merge_segments(segments, max_gap=1.5):
    if not segments:
        return []

    merged = [segments[0].copy()]

    for current in segments[1:]:
        previous = merged[-1]
        gap = current["start"] - previous["end"]

        if gap <= max_gap:
            previous["end"] = current["end"]
        else:
            merged.append(current.copy())

    return merged


def save_segments_csv(output_file, segments):
    with open(output_file, "w", newline="", encoding="utf-8-sig") as file:
        writer = csv.writer(file)
        writer.writerow([
            "segment", "start_seconds", "end_seconds", 
            "start_time", "end_time", "duration_seconds"
        ])

        for index, segment in enumerate(segments, start=1):
            start = segment["start"]
            end = segment["end"]
            writer.writerow([
                index,
                round(start, 2),
                round(end, 2),
                format_time(start),
                format_time(end),
                round(end - start, 2),
            ])


# ============================================================
# BUILD QUESTION GROUPS FUNCTIONS
# ============================================================

def build_part1_groups(segments, part2_start_segment):
    # Lấy các segment trước phần Part 2 directions (part2_start_segment - 1)
    # Lọc ra các segment dài hơn 10s
    candidates = [
        seg for seg in segments 
        if seg["segment"] < (part2_start_segment - 1) 
        and (seg["end_seconds"] - seg["start_seconds"]) > 10
    ]
    
    if len(candidates) < 6:
        raise ValueError(f"Không đủ segments cho Part 1. Tìm thấy {len(candidates)}")
        
    # Lấy 6 segment cuối cùng (bỏ qua đoạn intro và example)
    selected = candidates[-6:]
    
    groups = []
    for i, seg in enumerate(selected):
        groups.append({
            "group_id": i + 1,
            "part": 1,
            "start_segment": seg["segment"],
            "end_segment": seg["segment"],
            "audio_start_seconds": seg["start_seconds"],
            "audio_end_seconds": seg["end_seconds"],
            "audio_start_time": seg["start_time"],
            "audio_end_time": seg["end_time"],
            "segment_count": 1,
            "status": "AUTO",
        })
    return groups


def build_part2_groups(segments, part3_first_segment):
    start_seg = part3_first_segment - 25
    end_seg = part3_first_segment - 1
    
    selected = [seg for seg in segments if start_seg <= seg["segment"] <= end_seg]
    
    if len(selected) != 25:
        raise ValueError(f"Part 2 cần 25 segments nhưng tìm thấy {len(selected)}.")
        
    groups = []
    for i, seg in enumerate(selected):
        groups.append({
            "group_id": 7 + i,
            "part": 2,
            "start_segment": seg["segment"],
            "end_segment": seg["segment"],
            "audio_start_seconds": seg["start_seconds"],
            "audio_end_seconds": seg["end_seconds"],
            "audio_start_time": seg["start_time"],
            "audio_end_time": seg["end_time"],
            "segment_count": 1,
            "status": "AUTO",
        })
    return groups


def build_four_segment_groups(segments, part, group_start, group_end, first_segment):
    number_of_groups = group_end - group_start + 1
    required_segments = number_of_groups * 4

    selected = [
        segment for segment in segments
        if (segment["segment"] >= first_segment)
        and (segment["segment"] < (first_segment + required_segments))
    ]

    if len(selected) != required_segments:
        raise ValueError(
            f"Part {part}: cần {required_segments} segments "
            f"nhưng tìm thấy {len(selected)}."
        )

    expected_numbers = list(range(first_segment, first_segment + required_segments))
    actual_numbers = [segment["segment"] for segment in selected]

    if actual_numbers != expected_numbers:
        raise ValueError(
            f"Part {part}: segment numbers không liên tục.\n"
            f"Expected: {expected_numbers}\n"
            f"Actual:   {actual_numbers}"
        )

    groups = []
    for i in range(number_of_groups):
        group_id = group_start + i
        start_index = i * 4
        end_index = start_index + 3
        
        group_segments = selected[start_index : end_index + 1]
        first = group_segments[0]
        last = group_segments[-1]

        groups.append({
            "group_id": group_id,
            "part": part,
            "start_segment": first["segment"],
            "end_segment": last["segment"],
            "audio_start_seconds": first["start_seconds"],
            "audio_end_seconds": last["end_seconds"],
            "audio_start_time": first["start_time"],
            "audio_end_time": last["end_time"],
            "segment_count": len(group_segments),
            "status": "AUTO",
        })

    return groups


def validate_groups(groups):
    if len(groups) != 54:
        raise ValueError(f"Cần 54 groups nhưng có {len(groups)} groups.")

    actual_ids = [g["group_id"] for g in groups]
    expected_ids = list(range(1, 55))
    if actual_ids != expected_ids:
        raise ValueError("Group IDs không đúng.")

    part_counts = {}
    for group in groups:
        part = group["part"]
        part_counts[part] = part_counts.get(part, 0) + 1

    expected_part_counts = {1: 6, 2: 25, 3: 13, 4: 10}
    if part_counts != expected_part_counts:
        raise ValueError(f"Part counts sai. Expected: {expected_part_counts}, Actual: {part_counts}")


def save_groups_csv(output_file, groups):
    fieldnames = [
        "group_id", "part", "start_segment", "end_segment",
        "audio_start_seconds", "audio_end_seconds",
        "audio_start_time", "audio_end_time", "segment_count", "status",
    ]

    with open(output_file, "w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(groups)


def update_database(db_url, test_id, groups):
    print("\n[3/3] Updating database...")
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        updated_count = 0
        for group in groups:
            if group["status"] == "AUTO" and group["audio_start_time"] and group["audio_end_time"]:
                # Tính display_order trong database theo từng part
                part = group["part"]
                group_id = group["group_id"]
                db_display_order = group_id
                
                if part == 3:
                    db_display_order = group_id - 31
                elif part == 4:
                    db_display_order = group_id - 44

                cur.execute(
                    """
                    UPDATE public.question_groups 
                    SET audio_start_time = %s, audio_end_time = %s 
                    WHERE test_id = %s AND part = %s AND display_order = %s
                    """,
                    (int(group["audio_start_seconds"]), int(group["audio_end_seconds"]), test_id, part, db_display_order)
                )
                updated_count += 1
                
        conn.commit()
        cur.close()
        conn.close()
        print(f"-> Đã cập nhật database: updated {updated_count} groups cho test_id={test_id}.")
    except Exception as e:
        print(f"-> LỖI CẬP NHẬT DATABASE: {e}")


# ============================================================
# MAIN
# ============================================================

def auto_detect_boundaries(segments):
    # Lọc ra các segment dài hơn 20s (thường là các đoạn hội thoại/bài nói Part 3, Part 4)
    long_segments = [seg for seg in segments if (seg["end_seconds"] - seg["start_seconds"]) > 20]
    
    # Part 3 có 13 bài, Part 4 có 10 bài -> Tổng cộng 23 bài
    if len(long_segments) >= 23:
        part4_start = long_segments[-10]["segment"]
        part3_start = long_segments[-23]["segment"]
        return part3_start, part4_start
    return None, None

def main():
    parser = argparse.ArgumentParser(description="Chạy một lệnh tự động chia thời gian file nghe lớn cho TOEIC và cập nhật Database.")
    parser.add_argument("input_file", help="Đường dẫn đến file MP3")
    parser.add_argument("--test-id", type=int, default=1, help="ID của bài test trong database (mặc định: 1)")
    parser.add_argument("--db-url", type=str, default="postgresql://postgres:123@localhost:5433/toeic_ai", help="Chuỗi kết nối CSDL PostgreSQL")
    parser.add_argument("--part3-start", type=int, default=None, help="Segment bắt đầu của Part 3 (Tự động nhận diện nếu không truyền)")
    parser.add_argument("--part4-start", type=int, default=None, help="Segment bắt đầu của Part 4 (Tự động nhận diện nếu không truyền)")
    args = parser.parse_args()

    input_file = Path(args.input_file).resolve()
    
    print()
    print("=" * 70)
    print("TOEIC AUDIO PROCESSOR")
    print("=" * 70)
    print(f"Input file: {input_file}")

    if not input_file.exists():
        print("ERROR: Không tìm thấy file audio.")
        sys.exit(1)

    basename = input_file.stem
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # --------------------------------------------------------
    # 1. DETECT SEGMENTS
    # --------------------------------------------------------
    print("\n[1/2] Detecting speech segments...")
    duration = get_duration(input_file)
    print(f"Duration: {format_time(duration)}")

    silences = detect_silence(input_file)
    print(f"Silence intervals detected: {len(silences)}")

    segments = build_speech_segments(duration, silences)
    segments = merge_segments(segments, max_gap=1.5)
    print(f"Speech segments after merge: {len(segments)}")

    # Save segments CSV
    segments_csv = OUTPUT_DIR / f"{basename}_segments.csv"
    save_segments_csv(segments_csv, segments)
    print(f"-> Saved segments to: {segments_csv.name}")

    # --------------------------------------------------------
    # 2. BUILD GROUPS
    # --------------------------------------------------------
    print("\n[2/2] Building question groups...")
    
    formatted_segments = []
    for index, seg in enumerate(segments, start=1):
        formatted_segments.append({
            "segment": index,
            "start_seconds": seg["start"],
            "end_seconds": seg["end"],
            "start_time": format_time(seg["start"]),
            "end_time": format_time(seg["end"]),
        })

    # Tự động nhận diện ranh giới Part 3 và Part 4
    auto_p3, auto_p4 = auto_detect_boundaries(formatted_segments)
    
    part3_start = args.part3_start if args.part3_start else (auto_p3 or 38)
    part4_start = args.part4_start if args.part4_start else (auto_p4 or 92)
    
    print(f"-> Part 3 starts at segment: {part3_start}")
    print(f"-> Part 4 starts at segment: {part4_start}")

    # Cần ít nhất (part4_start + 10 * 4 - 1) segments
    min_required_segments = part4_start + 39
    if len(formatted_segments) < min_required_segments:
        print(f"\nERROR: Cần ít nhất {min_required_segments} segments để build test.")
        print(f"File hiện tại chỉ có {len(formatted_segments)} segments.")
        sys.exit(1)

    part3 = build_four_segment_groups(formatted_segments, 3, 32, 44, part3_start)
    part4 = build_four_segment_groups(formatted_segments, 4, 45, 54, part4_start)
    part2 = build_part2_groups(formatted_segments, part3_start)
    part1 = build_part1_groups(formatted_segments, part3_start - 25)

    all_groups = part1 + part2 + part3 + part4
    validate_groups(all_groups)
    
    groups_csv = OUTPUT_DIR / f"{basename}_question_groups.csv"
    save_groups_csv(groups_csv, all_groups)
    print(f"-> Saved question groups to: {groups_csv.name}")
    
    # --------------------------------------------------------
    # 3. UPDATE DATABASE
    # --------------------------------------------------------
    update_database(args.db_url, args.test_id, all_groups)

    print("\n" + "=" * 70)
    print("HOÀN TẤT THÀNH CÔNG!")
    print("=" * 70)
    print(f"- Output folder: {OUTPUT_DIR}")
    print(f"- Segments file: {segments_csv.name}")
    print(f"- Groups file  : {groups_csv.name}")
    print(f"- Database     : Đã update test_id={args.test_id}")
    print()

if __name__ == "__main__":
    main()
