import json
from pathlib import Path

# Load all test files
test_dir = Path("toeic-generated-data/data/tests")
test_files = sorted(test_dir.glob("test*.json"))

# Track used content across all files
used_part2_options = {}
used_part7_passages = {}

# Alternative pools for replacement
part2_alternatives = {
    "Lifetime warranty": ["5-year warranty", "3-year warranty", "10-year warranty", "2-year warranty"],
    "No warranty": ["Limited warranty", "Extended warranty", "Basic warranty", "Standard warranty"],
    "No support": ["Limited support", "Basic support", "Standard support", "Premium support"],
    "Email support": ["Online support", "Web support", "Digital support", "Internet support"],
    "No discount": ["Small discount", "Limited discount", "Seasonal discount", "Special discount"]
}

part7_contexts = {
    "regarding the project deadline": ["regarding the quarterly project deadline", "regarding the new project deadline", "regarding the urgent project deadline"],
    "regarding the product launch": ["regarding the new product launch", "regarding the upcoming product launch", "regarding the global product launch"],
    "regarding the office relocation": ["regarding the upcoming office relocation", "regarding the new office relocation", "regarding the planned office relocation"],
    "about the client meeting": ["about the upcoming client meeting", "about the new client meeting", "about the important client meeting"],
    "about the team training": ["about the new team training", "about the upcoming team training", "about the annual team training"],
    "about the holiday schedule": ["about the updated holiday schedule", "about the new holiday schedule", "about the revised holiday schedule"],
    "concerning the budget approval": ["concerning the annual budget approval", "concerning the new budget approval", "concerning the quarterly budget approval"],
    "concerning the security update": ["concerning the system security update", "concerning the new security update", "concerning the critical security update"],
    "concerning the salary review": ["concerning the annual salary review", "concerning the new salary review", "concerning the quarterly salary review"],
    "regarding the schedule change": ["regarding the meeting schedule change", "regarding the work schedule change", "regarding the new schedule change"],
    "regarding the system upgrade": ["regarding the system upgrade schedule", "regarding the new system upgrade", "regarding the planned system upgrade"],
    "regarding the new procedure": ["regarding the new work procedure", "regarding the updated procedure", "regarding the new operational procedure"],
    "about the contract renewal": ["about the annual contract renewal", "about the new contract renewal", "about the upcoming contract renewal"],
    "about the policy change": ["about the company policy change", "about the new policy change", "about the updated policy change"],
    "about the equipment order": ["about the office equipment order", "about the new equipment order", "about the pending equipment order"]
}

alt_indices = {key: 0 for key in part2_alternatives}
context_indices = {key: 0 for key in part7_contexts}

for test_file in test_files:
    with open(test_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    modified = False
    
    # Fix Part 2 options
    for group in data.get("question_groups", []):
        if group.get("part") == 2:
            for option in group.get("options", []):
                opt_text = option.get("option_text", "")
                if opt_text in part2_alternatives:
                    # Get alternative
                    alternatives = part2_alternatives[opt_text]
                    idx = alt_indices[opt_text] % len(alternatives)
                    alt = alternatives[idx]
                    
                    # Check if alternative is already used
                    while alt in used_part2_options:
                        idx = (idx + 1) % len(alternatives)
                        alt = alternatives[idx]
                    
                    option["option_text"] = alt
                    used_part2_options[alt] = test_file.name
                    alt_indices[opt_text] = idx + 1
                    modified = True
                else:
                    if opt_text not in used_part2_options:
                        used_part2_options[opt_text] = test_file.name
    
    # Fix Part 7 passages
    for group in data.get("question_groups", []):
        if group.get("part") == 7:
            passage = group.get("passage", "")
            for context, alternatives in part7_contexts.items():
                if context in passage:
                    # Check if this passage is already used
                    if passage in used_part7_passages:
                        # Get alternative
                        idx = context_indices[context] % len(alternatives)
                        alt = alternatives[idx]
                        
                        # Check if alternative is already used
                        new_passage = passage.replace(context, alt)
                        while new_passage in used_part7_passages:
                            idx = (idx + 1) % len(alternatives)
                            alt = alternatives[idx]
                            new_passage = passage.replace(context, alt)
                        
                        group["passage"] = new_passage
                        used_part7_passages[new_passage] = test_file.name
                        context_indices[context] = idx + 1
                        modified = True
                    else:
                        used_part7_passages[passage] = test_file.name
                    break
    
    if modified:
        with open(test_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Fixed {test_file.name}")

print("Done fixing all JSON files")
