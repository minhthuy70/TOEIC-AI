import json
import os
from pathlib import Path

# Load all test files
test_dir = Path("toeic-generated-data/data/tests")
test_files = sorted(test_dir.glob("test*.json"))

# Track used content across all files
used_part1_descriptions = {}
used_part2_options = {}
used_part7_passages = {}

# Alternative content pools
part1_alternatives = [
    "A person is working at their desk with a computer",
    "A professional is reviewing documents in their office",
    "An employee is organizing files on their workstation",
    "A worker is typing on their keyboard in the office",
    "A staff member is analyzing data on their screen",
    "A colleague is preparing reports at their desk",
    "An associate is managing tasks on their computer",
    "A team member is processing information digitally",
    "An office worker is handling emails on their laptop",
    "A business person is coordinating work remotely"
]

part2_alternatives = [
    "Available immediately", "Not available", "Coming soon", "Limited stock",
    "Yes, we can", "No, we cannot", "Maybe later", "Ask again",
    "24 hours", "48 hours", "1 week", "2 weeks",
    "Credit card", "Debit card", "PayPal", "Bank transfer",
    "Full refund", "Partial refund", "Store credit", "No refund",
    "Standard", "Premium", "Basic", "Enterprise",
    "Email only", "Phone only", "Chat support", "In-person",
    "Yes, included", "No, extra cost", "Optional add-on", "Not available",
    "All day", "Business hours", "24/7", "Limited hours",
    "High priority", "Medium priority", "Low priority", "Emergency",
    "Very satisfied", "Satisfied", "Neutral", "Dissatisfied"
]

part7_alternatives = [
    "regarding the project deadline update",
    "about the quarterly meeting schedule",
    "concerning the annual budget review",
    "regarding the new policy implementation",
    "about the team training program",
    "concerning the security protocol update",
    "regarding the system maintenance schedule",
    "about the employee benefits package",
    "concerning the office relocation plan",
    "regarding the holiday calendar update"
]

alt_idx = 0

for test_file in test_files:
    with open(test_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    modified = False
    
    # Fix Part 1 scene descriptions
    for group in data.get("question_groups", []):
        if group.get("part") == 1:
            desc = group.get("description", "")
            if desc in used_part1_descriptions:
                # Find an alternative
                alt = part1_alternatives[alt_idx % len(part1_alternatives)]
                while alt in used_part1_descriptions:
                    alt_idx += 1
                    alt = part1_alternatives[alt_idx % len(part1_alternatives)]
                group["description"] = alt
                used_part1_descriptions[alt] = test_file.name
                modified = True
                alt_idx += 1
            else:
                used_part1_descriptions[desc] = test_file.name
            
            # Fix correct answer
            correct = group.get("correct", "")
            if correct in used_part1_descriptions:
                alt = part1_alternatives[alt_idx % len(part1_alternatives)]
                while alt in used_part1_descriptions:
                    alt_idx += 1
                    alt = part1_alternatives[alt_idx % len(part1_alternatives)]
                group["correct"] = alt
                used_part1_descriptions[alt] = test_file.name
                modified = True
                alt_idx += 1
            
            # Fix distractors
            for i, distractor in enumerate(group.get("distractors", [])):
                if distractor in used_part1_descriptions:
                    alt = part1_alternatives[alt_idx % len(part1_alternatives)]
                    while alt in used_part1_descriptions:
                        alt_idx += 1
                        alt = part1_alternatives[alt_idx % len(part1_alternatives)]
                    group["distractors"][i] = alt
                    used_part1_descriptions[alt] = test_file.name
                    modified = True
                    alt_idx += 1
    
    # Fix Part 2 options
    for group in data.get("question_groups", []):
        if group.get("part") == 2:
            for option in group.get("options", []):
                opt_text = option.get("text", "")
                if opt_text in used_part2_options:
                    alt = part2_alternatives[alt_idx % len(part2_alternatives)]
                    while alt in used_part2_options:
                        alt_idx += 1
                        alt = part2_alternatives[alt_idx % len(part2_alternatives)]
                    option["text"] = alt
                    used_part2_options[alt] = test_file.name
                    modified = True
                    alt_idx += 1
    
    # Fix Part 7 passages
    for group in data.get("question_groups", []):
        if group.get("part") == 7:
            passage = group.get("passage", "")
            if passage in used_part7_passages:
                alt_idx = 0
                alt = part7_alternatives[alt_idx % len(part7_alternatives)]
                while alt in used_part7_passages:
                    alt_idx += 1
                    alt = part7_alternatives[alt_idx % len(part7_alternatives)]
                # Replace the context in the passage
                for context in part7_alternatives:
                    if context in passage:
                        passage = passage.replace(context, alt)
                        break
                group["passage"] = passage
                used_part7_passages[passage] = test_file.name
                modified = True
    
    if modified:
        with open(test_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Fixed {test_file.name}")

print("Done fixing JSON files")
