#!/usr/bin/env python3
"""
Generate Audio Manifest for TOEIC Tests
Creates a manifest file with all audio files needed for the generated tests
"""

import json
from pathlib import Path
from typing import List, Dict

SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / "data/tests"
OUTPUT_DIR = SCRIPT_DIR.parent
AUDIO_MANIFEST_FILE = OUTPUT_DIR / "audio_manifest.json"


def extract_audio_from_test(test_file: Path) -> List[Dict]:
    """Extract audio information from a test JSON file"""
    with open(test_file, 'r', encoding='utf-8') as f:
        test_data = json.load(f)
    
    audio_entries = []
    test_num = int(test_file.stem.replace("test", ""))
    
    for group in test_data.get("question_groups", []):
        if group.get("audio_url"):
            audio_entries.append({
                "test_id": test_num,
                "part": group.get("part"),
                "group_type": group.get("group_type"),
                "audio_url": group.get("audio_url"),
                "audio_start_time": group.get("audio_start_time"),
                "audio_end_time": group.get("audio_end_time"),
                "knowledge": group.get("knowledge"),
                "transcript": generate_transcript(group)
            })
    
    return audio_entries


def generate_transcript(group: Dict) -> str:
    """Generate a transcript based on the group type and part"""
    part = group.get("part")
    group_type = group.get("group_type")
    
    if part == 1:
        return "Look at the picture. Choose the statement that best describes what you see."
    elif part == 2:
        return "Listen to the question and the three responses. Choose the best response."
    elif part == 3:
        return generate_conversation_transcript()
    elif part == 4:
        return generate_talk_transcript()
    else:
        return ""


def generate_conversation_transcript() -> str:
    """Generate a sample conversation transcript"""
    templates = [
        """Man: I'd like to schedule a meeting for next week.
Woman: What day works best for you?
Man: Tuesday afternoon would be ideal.
Woman: I'll check the calendar and confirm.""",
        
        """Woman: Have you finished the report yet?
Man: I'm working on it now.
Woman: When do you think it'll be ready?
Man: By the end of the day.""",
        
        """Man: The new software is causing some issues.
Woman: What kind of problems are you experiencing?
Man: It crashes when I try to save files.
Woman: Let me contact technical support."""
    ]
    
    import random
    return random.choice(templates)


def generate_talk_transcript() -> str:
    """Generate a sample talk transcript"""
    templates = [
        """Good morning, everyone. I'd like to announce that our company will be implementing a new flexible work schedule starting next month. Employees will have the option to work from home up to two days per week. This change is based on feedback from our recent employee satisfaction survey. We believe this will improve work-life balance and productivity.""",
        
        """Attention shoppers. Today only, all electronics items are 20% off. This includes laptops, tablets, and smartphones. Sale ends at closing time. Don't miss this opportunity to save on your favorite tech products. Thank you for shopping with us.""",
        
        """This is a weather update for the metropolitan area. Expect clear skies throughout the day with temperatures reaching 25 degrees Celsius. Light winds from the northeast. Perfect weather for outdoor activities. Enjoy your day."""
    ]
    
    import random
    return random.choice(templates)


def generate_audio_manifest():
    """Generate the complete audio manifest"""
    print("Generating Audio Manifest...")
    print("=" * 50)
    
    all_audio_entries = []
    
    # Process all test files
    test_files = sorted(DATA_DIR.glob("test*.json"))
    
    for test_file in test_files:
        print(f"Processing {test_file.name}...")
        audio_entries = extract_audio_from_test(test_file)
        all_audio_entries.extend(audio_entries)
    
    # Save manifest
    manifest_data = {
        "total_audio_files": len(all_audio_entries),
        "generated_at": str(Path(__file__).stat().st_mtime),
        "audio_files": all_audio_entries
    }
    
    with open(AUDIO_MANIFEST_FILE, 'w', encoding='utf-8') as f:
        json.dump(manifest_data, f, indent=2, ensure_ascii=False)
    
    print(f"\nAudio manifest saved to: {AUDIO_MANIFEST_FILE}")
    print(f"Total audio files: {len(all_audio_entries)}")
    
    # Summary by part
    part_summary = {}
    for entry in all_audio_entries:
        part = entry.get("part")
        part_summary[part] = part_summary.get(part, 0) + 1
    
    print("\nAudio files by part:")
    for part in sorted(part_summary.keys()):
        print(f"  Part {part}: {part_summary[part]} files")
    
    print("\n" + "=" * 50)
    print("Audio manifest generation complete!")


if __name__ == "__main__":
    generate_audio_manifest()
