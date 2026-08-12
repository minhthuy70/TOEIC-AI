#!/usr/bin/env python3
"""
Script to fix questions with missing options in TOEIC test files
"""

import json
from pathlib import Path
from typing import List, Dict

SCRIPT_DIR = Path(__file__).parent
TESTS_DIR = SCRIPT_DIR.parent / "data/tests"

# Additional distractors for Part 7 questions (contextually appropriate)
PART7_DISTRACTORS = {
    "email": [
        "To request additional information",
        "To confirm a meeting time",
        "To submit a complaint",
        "To cancel a subscription",
        "To update contact details",
        "To request a refund",
        "To schedule a training session",
        "To report a technical issue",
        "To inquire about pricing",
        "To provide feedback on services"
    ],
    "notice": [
        "To announce a new policy",
        "To report a safety hazard",
        "To request maintenance service",
        "To inform about schedule changes",
        "To announce building closure",
        "To request employee feedback",
        "To report equipment failure",
        "To inform about parking restrictions",
        "To announce new security measures",
        "To request budget approval"
    ],
    "advertisement": [
        "To promote a new product",
        "To announce a store opening",
        "To offer a discount coupon",
        "To advertise job openings",
        "To promote seasonal sales",
        "To announce clearance events",
        "To advertise special offers",
        "To promote loyalty programs",
        "To announce new locations",
        "To advertise gift cards"
    ],
    "memo": [
        "To request budget approval",
        "To schedule a team meeting",
        "To report project progress",
        "To request additional resources",
        "To announce policy changes",
        "To submit expense reports",
        "To request time off",
        "To report staffing issues",
        "To coordinate with other departments",
        "To update project timelines"
    ],
    "article": [
        "To announce company achievements",
        "To report financial results",
        "To introduce new products",
        "To announce executive appointments",
        "To report market expansion",
        "To announce partnerships",
        "To report research findings",
        "To introduce new services",
        "To announce awards",
        "To report customer satisfaction"
    ],
    "schedule": [
        "To announce conference dates",
        "To provide event details",
        "To schedule workshop sessions",
        "To announce keynote speakers",
        "To provide venue information",
        "To schedule networking events",
        "To announce registration deadlines",
        "To provide accommodation details",
        "To schedule panel discussions",
        "To announce closing ceremonies"
    ],
    "form": [
        "To request leave approval",
        "To submit expense claims",
        "To report attendance issues",
        "To request training enrollment",
        "To submit project proposals",
        "To request equipment",
        "To report safety incidents",
        "To submit performance reviews",
        "To request travel authorization",
        "To report policy violations"
    ],
    "message": [
        "To schedule a follow-up call",
        "To request a meeting",
        "To provide project updates",
        "To request information",
        "To confirm appointment details",
        "To report completion",
        "To request approval",
        "To provide status updates",
        "To schedule a demonstration",
        "To request feedback"
    ],
    "letter": [
        "To acknowledge a purchase",
        "To request payment",
        "To announce policy changes",
        "To provide warranty information",
        "To confirm order details",
        "To request feedback",
        "To announce service changes",
        "To provide account information",
        "To request documentation",
        "To confirm delivery details"
    ],
    "report": [
        "To analyze sales performance",
        "To report market trends",
        "To evaluate campaign effectiveness",
        "To assess customer satisfaction",
        "To review operational efficiency",
        "To report financial status",
        "To analyze competitor activities",
        "To evaluate product performance",
        "To assess risk factors",
        "To report compliance status"
    ],
    "announcement": [
        "To announce policy changes",
        "To inform about schedule updates",
        "To announce new services",
        "To report system maintenance",
        "To announce staff changes",
        "To inform about facility updates",
        "To announce holiday schedules",
        "To report service interruptions",
        "To announce new procedures",
        "To inform about safety measures"
    ],
    "invoice": [
        "To request payment",
        "To confirm order details",
        "To provide billing information",
        "To request payment method",
        "To confirm delivery address",
        "To provide tax information",
        "To request payment terms",
        "To confirm product details",
        "To provide discount information",
        "To request payment confirmation"
    ],
    "directions": [
        "To provide venue location",
        "To give parking instructions",
        "To provide contact information",
        "To give travel directions",
        "To provide accommodation details",
        "To give registration instructions",
        "To provide emergency contacts",
        "To give security information",
        "To provide accessibility information",
        "To give transportation options"
    ],
    "policy": [
        "To outline travel procedures",
        "To specify expense limits",
        "To define approval requirements",
        "To outline reimbursement processes",
        "To specify accommodation standards",
        "To define meal allowances",
        "To outline insurance requirements",
        "To specify visa procedures",
        "To define booking procedures",
        "To outline emergency procedures"
    ],
    "job_posting": [
        "To announce job openings",
        "To specify job requirements",
        "To provide salary information",
        "To outline application procedures",
        "To specify work hours",
        "To provide benefit details",
        "To outline career opportunities",
        "To specify location requirements",
        "To provide company information",
        "To outline application deadlines"
    ]
}


def get_missing_option_label(existing_labels: List[str]) -> str:
    """Get the missing option label"""
    all_labels = ['A', 'B', 'C', 'D']
    for label in all_labels:
        if label not in existing_labels:
            return label
    return None


def generate_appropriate_option(passage_type: str, existing_options: List[str]) -> str:
    """Generate an appropriate distractor option based on passage type"""
    if passage_type not in PART7_DISTRACTORS:
        passage_type = "email"  # default
    
    distractors = PART7_DISTRACTORS[passage_type]
    
    # Find a distractor that's not already used
    for distractor in distractors:
        if distractor not in existing_options:
            return distractor
    
    # Fallback to generic distractor
    return "To request additional information"


def fix_question(question: Dict, passage_type: str = "email") -> bool:
    """Fix a question with missing options"""
    options = question.get("options", [])
    existing_labels = [opt["option_label"] for opt in options]
    
    if len(options) == 4:
        return False  # No fix needed
    
    if len(options) < 4:
        # Add missing option
        missing_label = get_missing_option_label(existing_labels)
        if missing_label:
            existing_texts = [opt["option_text"] for opt in options]
            new_text = generate_appropriate_option(passage_type, existing_texts)
            
            new_option = {
                "option_label": missing_label,
                "option_text": new_text,
                "is_correct": False,
                "display_order": ord(missing_label) - ord('A') + 1
            }
            
            options.append(new_option)
            # Sort by display_order
            options.sort(key=lambda x: x["display_order"])
            question["options"] = options
            return True
    
    return False


def fix_test_file(test_file: Path) -> Dict:
    """Fix a single test file"""
    with open(test_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    fixes_made = 0
    issues = []
    
    for group in data.get("question_groups", []):
        part = group.get("part")
        passage_type = "email"  # default
        
        # Try to determine passage type from title or passage content
        if part == 7:
            title = group.get("title", "").lower()
            passage = group.get("passage", "").lower()
            
            for ptype in PART7_DISTRACTORS.keys():
                if ptype in title or ptype in passage:
                    passage_type = ptype
                    break
        
        for question in group.get("questions", []):
            q_num = question.get("question_number")
            options = question.get("options", [])
            
            if len(options) != 4:
                if fix_question(question, passage_type):
                    fixes_made += 1
                    issues.append(f"Part {part} | Question {q_num} | Fixed")
    
    if fixes_made > 0:
        with open(test_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    return {
        "file": test_file.name,
        "fixes_made": fixes_made,
        "issues": issues
    }


def main():
    """Main function"""
    print("Fixing questions with missing options...")
    print("=" * 60)
    
    test_files = sorted(TESTS_DIR.glob("test*.json"))
    
    total_fixes = 0
    files_fixed = 0
    
    for test_file in test_files:
        result = fix_test_file(test_file)
        
        if result["fixes_made"] > 0:
            files_fixed += 1
            total_fixes += result["fixes_made"]
            print(f"\n{result['file']}:")
            print(f"  Fixed {result['fixes_made']} question(s)")
            for issue in result["issues"]:
                print(f"    - {issue}")
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Files fixed: {files_fixed}")
    print(f"Total questions fixed: {total_fixes}")
    print("=" * 60)
    
    if total_fixes > 0:
        print("\n✅ Fixes applied. Run check_duplicate_options.py to verify.")
    else:
        print("\n✅ No fixes needed.")


if __name__ == "__main__":
    main()
