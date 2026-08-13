#!/usr/bin/env python3
"""
Script to analyze duplication between TOEIC test files
"""

import json
from pathlib import Path
from collections import defaultdict

SCRIPT_DIR = Path(__file__).parent
TESTS_DIR = SCRIPT_DIR.parent / "data/tests"


def analyze_duplication():
    """Analyze duplication across all test files"""
    print("Analyzing duplication across test files...")
    print("=" * 60)
    
    test_files = sorted(TESTS_DIR.glob("test*.json"))
    
    # Track content by type
    part1_descriptions = defaultdict(list)  # scene descriptions
    part2_qa = defaultdict(list)  # question-answer pairs
    part3_conversations = defaultdict(list)
    part4_talks = defaultdict(list)
    part5_sentences = defaultdict(list)
    part6_passages = defaultdict(list)
    part7_passages = defaultdict(list)
    
    # Track question texts
    all_questions = defaultdict(list)
    
    for test_file in test_files:
        test_num = test_file.stem.replace("test", "")
        
        with open(test_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        for group in data.get("question_groups", []):
            part = group.get("part")
            
            if part == 1:
                for q in group.get("questions", []):
                    for opt in q.get("options", []):
                        part1_descriptions[opt["option_text"]].append(test_num)
            
            elif part == 2:
                for q in group.get("questions", []):
                    q_text = q.get("question_text", "")
                    all_questions[q_text].append(test_num)
                    for opt in q.get("options", []):
                        part2_qa[opt["option_text"]].append(test_num)
            
            elif part == 3:
                passage = group.get("passage", "")
                part3_conversations[passage].append(test_num)
                for q in group.get("questions", []):
                    q_text = q.get("question_text", "")
                    all_questions[q_text].append(test_num)
            
            elif part == 4:
                passage = group.get("passage", "")
                part4_talks[passage].append(test_num)
                for q in group.get("questions", []):
                    q_text = q.get("question_text", "")
                    all_questions[q_text].append(test_num)
            
            elif part == 5:
                for q in group.get("questions", []):
                    q_text = q.get("question_text", "")
                    all_questions[q_text].append(test_num)
                    part5_sentences[q_text].append(test_num)
            
            elif part == 6:
                passage = group.get("passage", "")
                part6_passages[passage].append(test_num)
                for q in group.get("questions", []):
                    q_text = q.get("question_text", "")
                    all_questions[q_text].append(test_num)
            
            elif part == 7:
                passage = group.get("passage", "")
                part7_passages[passage].append(test_num)
                for q in group.get("questions", []):
                    q_text = q.get("question_text", "")
                    all_questions[q_text].append(test_num)
    
    # Report duplication
    print("\nPART 1 - Scene Descriptions:")
    dup_part1 = {k: v for k, v in part1_descriptions.items() if len(v) > 1}
    print(f"  Total unique descriptions: {len(part1_descriptions)}")
    print(f"  Duplicated descriptions: {len(dup_part1)}")
    if dup_part1:
        print("  Top 5 most duplicated:")
        for desc, tests in sorted(dup_part1.items(), key=lambda x: len(x[1]), reverse=True)[:5]:
            print(f"    '{desc[:50]}...' appears in {len(tests)} tests")
    
    print("\nPART 2 - Question-Response:")
    dup_part2 = {k: v for k, v in part2_qa.items() if len(v) > 1}
    print(f"  Total unique options: {len(part2_qa)}")
    print(f"  Duplicated options: {len(dup_part2)}")
    if dup_part2:
        print("  Top 5 most duplicated:")
        for opt, tests in sorted(dup_part2.items(), key=lambda x: len(x[1]), reverse=True)[:5]:
            print(f"    '{opt[:50]}...' appears in {len(tests)} tests")
    
    print("\nPART 3 - Conversations:")
    dup_part3 = {k: v for k, v in part3_conversations.items() if len(v) > 1}
    print(f"  Total unique conversations: {len(part3_conversations)}")
    print(f"  Duplicated conversations: {len(dup_part3)}")
    if dup_part3:
        print("  Top 5 most duplicated:")
        for conv, tests in sorted(dup_part3.items(), key=lambda x: len(x[1]), reverse=True)[:5]:
            print(f"    '{conv[:50]}...' appears in {len(tests)} tests")
    
    print("\nPART 4 - Talks:")
    dup_part4 = {k: v for k, v in part4_talks.items() if len(v) > 1}
    print(f"  Total unique talks: {len(part4_talks)}")
    print(f"  Duplicated talks: {len(dup_part4)}")
    if dup_part4:
        print("  Top 5 most duplicated:")
        for talk, tests in sorted(dup_part4.items(), key=lambda x: len(x[1]), reverse=True)[:5]:
            print(f"    '{talk[:50]}...' appears in {len(tests)} tests")
    
    print("\nPART 5 - Sentences:")
    dup_part5 = {k: v for k, v in part5_sentences.items() if len(v) > 1}
    print(f"  Total unique sentences: {len(part5_sentences)}")
    print(f"  Duplicated sentences: {len(dup_part5)}")
    if dup_part5:
        print("  Top 5 most duplicated:")
        for sent, tests in sorted(dup_part5.items(), key=lambda x: len(x[1]), reverse=True)[:5]:
            print(f"    '{sent[:50]}...' appears in {len(tests)} tests")
    
    print("\nPART 6 - Passages:")
    dup_part6 = {k: v for k, v in part6_passages.items() if len(v) > 1}
    print(f"  Total unique passages: {len(part6_passages)}")
    print(f"  Duplicated passages: {len(dup_part6)}")
    if dup_part6:
        print("  Top 5 most duplicated:")
        for passg, tests in sorted(dup_part6.items(), key=lambda x: len(x[1]), reverse=True)[:5]:
            print(f"    '{passg[:50]}...' appears in {len(tests)} tests")
    
    print("\nPART 7 - Passages:")
    dup_part7 = {k: v for k, v in part7_passages.items() if len(v) > 1}
    print(f"  Total unique passages: {len(part7_passages)}")
    print(f"  Duplicated passages: {len(dup_part7)}")
    if dup_part7:
        print("  Top 5 most duplicated:")
        for passg, tests in sorted(dup_part7.items(), key=lambda x: len(x[1]), reverse=True)[:5]:
            print(f"    '{passg[:50]}...' appears in {len(tests)} tests")
    
    print("\n" + "=" * 60)
    print("OVERALL QUESTION TEXTS:")
    dup_questions = {k: v for k, v in all_questions.items() if len(v) > 1}
    print(f"  Total unique question texts: {len(all_questions)}")
    print(f"  Duplicated question texts: {len(dup_questions)}")
    if dup_questions:
        print("  Top 5 most duplicated:")
        for q, tests in sorted(dup_questions.items(), key=lambda x: len(x[1]), reverse=True)[:5]:
            print(f"    '{q[:50]}...' appears in {len(tests)} tests")
    
    print("\n" + "=" * 60)
    print("SUMMARY:")
    print("=" * 60)
    total_dup = (len(dup_part1) + len(dup_part2) + len(dup_part3) + 
                 len(dup_part4) + len(dup_part5) + len(dup_part6) + len(dup_part7))
    print(f"Total duplicated content items: {total_dup}")
    print("=" * 60)


if __name__ == "__main__":
    analyze_duplication()
