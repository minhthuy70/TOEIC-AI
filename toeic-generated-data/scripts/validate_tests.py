#!/usr/bin/env python3
"""
Validation Script for TOEIC Tests
Validates generated test data against requirements
"""

import json
from pathlib import Path
from typing import Dict, List
from collections import defaultdict

SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent / "data/tests"
OUTPUT_DIR = SCRIPT_DIR.parent
VALIDATION_REPORT_FILE = OUTPUT_DIR / "validation_report.json"


def validate_test(test_file: Path) -> Dict:
    """Validate a single test file"""
    with open(test_file, 'r', encoding='utf-8') as f:
        test_data = json.load(f)
    
    test_num = int(test_file.stem.replace("test", ""))
    validation_result = {
        "test_id": test_num,
        "test_name": test_data.get("test", {}).get("title"),
        "is_valid": True,
        "errors": [],
        "warnings": [],
        "part_counts": defaultdict(int),
        "total_questions": 0,
        "total_groups": 0
    }
    
    # Expected structure
    expected_parts = {
        1: {"groups": 6, "questions": 6},
        2: {"groups": 25, "questions": 25},
        3: {"groups": 13, "questions": 39},
        4: {"groups": 10, "questions": 30},
        5: {"groups": 30, "questions": 30},
        6: {"groups": 4, "questions": 16},
        7: {"groups": 15, "questions": 54}
    }
    
    question_groups = test_data.get("question_groups", [])
    validation_result["total_groups"] = len(question_groups)
    
    # Count questions by part
    part_question_counts = defaultdict(int)
    part_group_counts = defaultdict(int)
    
    for group in question_groups:
        part = group.get("part")
        if part is None:
            validation_result["errors"].append(f"Group missing part field")
            validation_result["is_valid"] = False
            continue
        
        part_group_counts[part] += 1
        
        questions = group.get("questions", [])
        part_question_counts[part] += len(questions)
        
        # Validate each question
        for q in questions:
            validation_result["total_questions"] += 1
            
            # Check required fields
            if q.get("correct_answer") is None:
                validation_result["errors"].append(f"Question {q.get('question_number')} missing correct_answer")
                validation_result["is_valid"] = False
            
            # Check options
            options = q.get("options", [])
            if len(options) != 4:
                validation_result["errors"].append(f"Question {q.get('question_number')} has {len(options)} options (expected 4)")
                validation_result["is_valid"] = False
            
            # Check exactly one correct answer
            correct_count = sum(1 for opt in options if opt.get("is_correct"))
            if correct_count != 1:
                validation_result["errors"].append(f"Question {q.get('question_number')} has {correct_count} correct answers (expected 1)")
                validation_result["is_valid"] = False
    
    # Validate part counts
    for part, expected in expected_parts.items():
        actual_groups = part_group_counts.get(part, 0)
        actual_questions = part_question_counts.get(part, 0)
        
        validation_result["part_counts"][part] = {
            "groups": actual_groups,
            "questions": actual_questions
        }
        
        if actual_groups != expected["groups"]:
            validation_result["errors"].append(
                f"Part {part}: Expected {expected['groups']} groups, got {actual_groups}"
            )
            validation_result["is_valid"] = False
        
        if actual_questions != expected["questions"]:
            validation_result["errors"].append(
                f"Part {part}: Expected {expected['questions']} questions, got {actual_questions}"
            )
            validation_result["is_valid"] = False
    
    # Check total questions
    if validation_result["total_questions"] != 200:
        validation_result["errors"].append(
            f"Expected 200 total questions, got {validation_result['total_questions']}"
        )
        validation_result["is_valid"] = False
    
    return validation_result


def generate_validation_report():
    """Generate comprehensive validation report"""
    print("Generating Validation Report...")
    print("=" * 60)
    
    test_files = sorted(DATA_DIR.glob("test*.json"))
    
    all_results = []
    total_valid = 0
    total_invalid = 0
    total_questions = 0
    total_groups = 0
    
    for test_file in test_files:
        print(f"Validating {test_file.name}...")
        result = validate_test(test_file)
        all_results.append(result)
        
        if result["is_valid"]:
            total_valid += 1
        else:
            total_invalid += 1
        
        total_questions += result["total_questions"]
        total_groups += result["total_groups"]
    
    # Generate summary
    summary = {
        "total_tests": len(test_files),
        "valid_tests": total_valid,
        "invalid_tests": total_invalid,
        "total_questions": total_questions,
        "total_groups": total_groups,
        "expected_questions_per_test": 200,
        "expected_total_questions": len(test_files) * 200,
        "validation_passed": total_invalid == 0
    }
    
    # Detailed results
    report = {
        "summary": summary,
        "test_results": all_results,
        "invalid_tests": [r for r in all_results if not r["is_valid"]]
    }
    
    # Save report
    with open(VALIDATION_REPORT_FILE, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\nValidation report saved to: {VALIDATION_REPORT_FILE}")
    print("\n" + "=" * 60)
    print("VALIDATION SUMMARY")
    print("=" * 60)
    print(f"Total tests: {summary['total_tests']}")
    print(f"Valid tests: {summary['valid_tests']}")
    print(f"Invalid tests: {summary['invalid_tests']}")
    print(f"Total questions: {summary['total_questions']}")
    print(f"Expected questions: {summary['expected_total_questions']}")
    print(f"Validation passed: {summary['validation_passed']}")
    
    if summary['invalid_tests'] > 0:
        print("\nInvalid tests:")
        for result in report["invalid_tests"]:
            print(f"  Test {result['test_id']}: {len(result['errors'])} errors")
            for error in result["errors"][:3]:  # Show first 3 errors
                print(f"    - {error}")
    
    print("\n" + "=" * 60)
    print("Validation complete!")


def generate_statistics():
    """Generate statistics comparing generated tests with placement test"""
    print("\nGenerating Statistics Report...")
    print("=" * 60)
    
    # Placement test statistics (from earlier analysis)
    placement_stats = {
        "part_1": {"avg_question_words": 0, "avg_option_words": 0},
        "part_2": {"avg_question_words": 0, "avg_option_words": 0},
        "part_3": {"avg_question_words": 8, "avg_option_words": 4},
        "part_4": {"avg_question_words": 9, "avg_option_words": 4},
        "part_5": {"avg_question_words": 15, "avg_option_words": 1},
        "part_6": {"avg_question_words": 7, "avg_option_words": 3, "avg_passage_words": 120},
        "part_7": {"avg_question_words": 10, "avg_option_words": 5, "avg_passage_words": 220}
    }
    
    # Calculate generated test statistics
    test_files = sorted(DATA_DIR.glob("test*.json"))
    
    generated_stats = {
        "part_1": {"total_questions": 0, "total_question_words": 0, "total_option_words": 0},
        "part_2": {"total_questions": 0, "total_question_words": 0, "total_option_words": 0},
        "part_3": {"total_questions": 0, "total_question_words": 0, "total_option_words": 0},
        "part_4": {"total_questions": 0, "total_question_words": 0, "total_option_words": 0},
        "part_5": {"total_questions": 0, "total_question_words": 0, "total_option_words": 0},
        "part_6": {"total_questions": 0, "total_question_words": 0, "total_option_words": 0, "total_passage_words": 0},
        "part_7": {"total_questions": 0, "total_question_words": 0, "total_option_words": 0, "total_passage_words": 0}
    }
    
    for test_file in test_files[:10]:  # Sample first 10 tests for statistics
        with open(test_file, 'r', encoding='utf-8') as f:
            test_data = json.load(f)
        
        for group in test_data.get("question_groups", []):
            part = group.get("part")
            part_key = f"part_{part}"
            
            # Count passage words
            if group.get("passage"):
                passage_words = len(group["passage"].split())
                if "total_passage_words" in generated_stats[part_key]:
                    generated_stats[part_key]["total_passage_words"] += passage_words
            
            for question in group.get("questions", []):
                # Count question words
                if question.get("question_text"):
                    question_words = len(question["question_text"].split())
                    generated_stats[part_key]["total_question_words"] += question_words
                
                # Count option words
                for option in question.get("options", []):
                    if option.get("option_text"):
                        option_words = len(option["option_text"].split())
                        generated_stats[part_key]["total_option_words"] += option_words
                
                generated_stats[part_key]["total_questions"] += 1
    
    # Calculate averages
    for part in generated_stats:
        stats = generated_stats[part]
        if stats["total_questions"] > 0:
            stats["avg_question_words"] = stats["total_question_words"] / stats["total_questions"]
            stats["avg_option_words"] = stats["total_option_words"] / (stats["total_questions"] * 4)
        if "total_passage_words" in stats and stats["total_questions"] > 0:
            stats["avg_passage_words"] = stats["total_passage_words"] / (stats["total_questions"] / 4)  # Approximate
    
    # Save statistics
    stats_file = OUTPUT_DIR / "validation" / "generated_statistics.json"
    stats_file.parent.mkdir(exist_ok=True)
    
    placement_file = OUTPUT_DIR / "validation" / "placement_statistics.json"
    
    with open(placement_file, 'w', encoding='utf-8') as f:
        json.dump(placement_stats, f, indent=2)
    
    with open(stats_file, 'w', encoding='utf-8') as f:
        json.dump(generated_stats, f, indent=2)
    
    print(f"Statistics saved to:")
    print(f"  - {placement_file}")
    print(f"  - {stats_file}")
    
    print("\n" + "=" * 60)
    print("Statistics generation complete!")


def main():
    """Main function"""
    generate_validation_report()
    generate_statistics()


if __name__ == "__main__":
    main()
