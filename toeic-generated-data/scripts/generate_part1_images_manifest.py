#!/usr/bin/env python3
"""
Generate Part 1 Images Manifest for TOEIC Tests
Creates a manifest file with all Part 1 image prompts needed
"""

import json
import random
from pathlib import Path
from typing import List, Dict

SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / "data/tests"
OUTPUT_DIR = SCRIPT_DIR.parent
IMAGES_MANIFEST_FILE = OUTPUT_DIR / "part1_images_manifest.json"


# Scene descriptions for Part 1 images
SCENE_TEMPLATES = [
    {
        "scene": "office meeting",
        "prompt": "A professional business meeting in a modern office conference room. Several people in business attire are seated around a large table with documents and laptops. Natural light streams through large windows. The atmosphere is professional and collaborative.",
        "correct_option": "The people are having a meeting in an office."
    },
    {
        "scene": "restaurant dining",
        "prompt": "A busy restaurant interior with customers dining at tables. Waiters in uniforms are serving food. The restaurant has warm lighting and elegant decor. People are engaged in conversation and enjoying their meals.",
        "correct_option": "People are dining at a restaurant."
    },
    {
        "scene": "airport terminal",
        "prompt": "A modern airport terminal with passengers walking with luggage. Information screens display flight details. Some passengers are checking in at counters while others wait near gates. The terminal has high ceilings and large windows.",
        "correct_option": "Passengers are in an airport terminal."
    },
    {
        "scene": "factory production",
        "prompt": "A manufacturing factory floor with workers operating machinery. Assembly lines are in motion with products being processed. Workers wear safety equipment including helmets and vests. The space is large and industrial.",
        "correct_option": "Workers are operating machinery in a factory."
    },
    {
        "scene": "retail store",
        "prompt": "A retail store interior with customers browsing merchandise. Shelves are well-stocked with products. Store employees assist customers. The lighting is bright and the layout is organized.",
        "correct_option": "Customers are shopping in a store."
    },
    {
        "scene": "outdoor construction",
        "prompt": "An outdoor construction site with workers in safety gear. Construction equipment including cranes and excavators are visible. Building structures are in various stages of completion. The site is busy with activity.",
        "correct_option": "Construction workers are at a building site."
    },
    {
        "scene": "hotel lobby",
        "prompt": "An elegant hotel lobby with guests checking in at the reception desk. Bellhops assist with luggage. Comfortable seating areas are arranged throughout. The decor is luxurious with chandeliers and marble floors.",
        "correct_option": "Guests are checking into a hotel."
    },
    {
        "scene": "hospital corridor",
        "prompt": "A hospital corridor with medical staff in scrubs walking. Patients in hospital gowns are being transported. Medical equipment and carts are visible. The environment is clean and clinical.",
        "correct_option": "Medical staff are working in a hospital."
    },
    {
        "scene": "outdoor park",
        "prompt": "A beautiful outdoor park with people walking on paths. Some sit on benches while others exercise. Trees and greenery surround the area. The weather appears pleasant with blue skies.",
        "correct_option": "People are enjoying time in a park."
    },
    {
        "scene": "street traffic",
        "prompt": "A busy city street with vehicles and pedestrians. Cars, buses, and taxis are visible. Pedestrians cross at crosswalks. Buildings line both sides of the street. The scene captures urban transportation.",
        "correct_option": "Vehicles and people are on a city street."
    },
    {
        "scene": "kitchen cooking",
        "prompt": "A professional kitchen with chefs preparing food. Stainless steel appliances and cooking equipment are visible. Chefs wear white uniforms and hats. The space is organized and busy with culinary activity.",
        "correct_option": "Chefs are preparing food in a kitchen."
    },
    {
        "scene": "classroom teaching",
        "prompt": "A classroom with students seated at desks. A teacher stands at the front near a whiteboard. Educational materials are displayed on walls. The learning environment is focused and engaged.",
        "correct_option": "A teacher is instructing students in a classroom."
    }
]


def generate_part1_manifest():
    """Generate the Part 1 images manifest"""
    print("Generating Part 1 Images Manifest...")
    print("=" * 50)
    
    all_image_entries = []
    
    # Process all test files to extract Part 1 questions
    test_files = sorted(DATA_DIR.glob("test*.json"))
    
    for test_file in test_files:
        test_num = int(test_file.stem.replace("test", ""))
        
        with open(test_file, 'r', encoding='utf-8') as f:
            test_data = json.load(f)
        
        # Find Part 1 groups
        part1_groups = [g for g in test_data.get("question_groups", []) if g.get("part") == 1]
        
        for i, group in enumerate(part1_groups):
            q_num = i + 1
            image_filename = f"test{test_num:03d}_part01_q{q_num:03d}.jpg"
            image_url = group.get("image_url", "")
            
            # Select a random scene template
            scene_template = random.choice(SCENE_TEMPLATES)
            
            # Generate distractor options
            correct_option = scene_template["correct_option"]
            distractors = generate_distractors(scene_template["scene"])
            
            all_image_entries.append({
                "test_id": test_num,
                "question_id": q_num,
                "image_filename": image_filename,
                "image_url": image_url,
                "image_prompt": scene_template["prompt"],
                "scene_description": scene_template["scene"],
                "correct_answer": correct_option,
                "distractor_options": distractors
            })
    
    # Save manifest
    manifest_data = {
        "total_images": len(all_image_entries),
        "generated_at": str(Path(__file__).stat().st_mtime),
        "images": all_image_entries
    }
    
    with open(IMAGES_MANIFEST_FILE, 'w', encoding='utf-8') as f:
        json.dump(manifest_data, f, indent=2, ensure_ascii=False)
    
    print(f"Part 1 images manifest saved to: {IMAGES_MANIFEST_FILE}")
    print(f"Total images: {len(all_image_entries)}")
    
    # Summary by test
    test_summary = {}
    for entry in all_image_entries:
        test_id = entry.get("test_id")
        test_summary[test_id] = test_summary.get(test_id, 0) + 1
    
    print("\nImages per test (should be 6 each):")
    for test_id in sorted(test_summary.keys())[:10]:
        print(f"  Test {test_id:03d}: {test_summary[test_id]} images")
    print("  ...")
    
    print("\n" + "=" * 50)
    print("Part 1 images manifest generation complete!")


def generate_distractors(scene: str) -> List[str]:
    """Generate distractor options for the image"""
    # Create plausible but incorrect descriptions
    distractors = [
        f"The people are working outdoors.",
        f"The location appears to be a private residence.",
        f"The scene shows a recreational activity."
    ]
    return distractors


if __name__ == "__main__":
    generate_part1_manifest()
