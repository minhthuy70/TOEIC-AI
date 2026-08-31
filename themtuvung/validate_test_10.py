import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Read test records
with open(r'D:\CNTT2311\HK8\DOAN3\toeic-ai\test_10_words_model_knowledge.json', 'r', encoding='utf-8') as f:
    records = json.load(f)

print(f'Validating {len(records)} test records\n')

def validate_record(record):
    """Validate a vocabulary record"""
    issues = []
    
    # Check essential fields
    if not record['vietnamese']:
        issues.append("Vietnamese is empty")
    if not record['explain']:
        issues.append("Explain is empty")
    if not record['example']:
        issues.append("Example is empty")
    if not record['example_vietnamese']:
        issues.append("Example Vietnamese is empty")
    if not record['pronounce'] or record['pronounce'] == "/.../":
        issues.append("IPA is invalid or placeholder")
    
    # Check if example contains word (handle phrasal verbs with space)
    word_lower = record['english'].lower()
    # For phrasal verbs, check if the main words are in the example
    if ' ' in word_lower:
        # Remove "be" from checking since it can be conjugated (is, are, was, etc.)
        words = [w for w in word_lower.split() if w != 'be']
        if not all(word in record['example'].lower() for word in words):
            issues.append("Example does not contain the word")
    else:
        if word_lower not in record['example'].lower():
            issues.append("Example does not contain the word")
    
    # Check data types
    if not isinstance(record['toeic_level'], int):
        issues.append("TOEIC level should be int")
    if not isinstance(record['frequency'], int):
        issues.append("Frequency should be int")
    if not isinstance(record['is_common'], bool):
        issues.append("is_common should be bool")
    
    # Check arrays
    array_fields = ['synonyms', 'antonyms', 'word_family', 'collocations', 'phrasal_verbs']
    for field in array_fields:
        if not isinstance(record[field], list):
            issues.append(f"{field} should be list")
    
    # Check self-duplicate
    for field in array_fields:
        if record['english'] in record[field]:
            issues.append(f"Self-duplicate in {field}")
    
    # Check phrasal verbs in word family
    for item in record['word_family']:
        if ' ' in item or '-' in item:
            issues.append("Phrasal verb in word family")
    
    # Check common mistakes absolute wrong
    if record['common_mistakes']:
        if 'là sai' in record['common_mistakes'].lower() or 'is wrong' in record['common_mistakes'].lower():
            issues.append("Common mistakes uses absolute 'wrong'")
    
    return issues

total_issues = 0
valid_records = 0

for i, record in enumerate(records):
    word = record['english']
    issues = validate_record(record)
    
    if issues:
        print(f'Word {i+1} ({word}): {len(issues)} issues')
        for issue in issues:
            print(f'  - {issue}')
        total_issues += len(issues)
    else:
        print(f'Word {i+1} ({word}): VALID')
        valid_records += 1

print(f'\n=== VALIDATION SUMMARY ===')
print(f'Total records: {len(records)}')
print(f'Valid records: {valid_records}')
print(f'Invalid records: {len(records) - valid_records}')
print(f'Total issues: {total_issues}')

if valid_records == len(records):
    print(f'\nStatus: ALL RECORDS VALID - Ready to proceed with full processing')
else:
    print(f'\nStatus: {len(records) - valid_records} records need fixing')
