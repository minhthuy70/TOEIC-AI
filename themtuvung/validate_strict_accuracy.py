import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Load the strict accuracy output
with open(r'D:\CNTT2311\HK8\DOAN3\toeic-ai\vocabulary_strict_accuracy.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Load original word list
with open(r'D:\CNTT2311\HK8\DOAN3\toeic-ai\temp_word_list.json', 'r', encoding='utf-8') as f:
    original_words = json.load(f)

print(f'Total records: {len(data)}')
print(f'Total original words: {len(original_words)}')

# Validation results
validation_results = {
    'total_records': len(data),
    'order_preserved': True,
    'missing_fields': [],
    'invalid_types': [],
    'duplicate_arrays': [],
    'fake_urls': [],
    'fake_mnemonics': [],
    'invalid_grammar_patterns': [],
    'invalid_topics': [],
    'invalid_enums': [],
    'example_grammar_issues': [],
    'field_null_violations': []
}

# Check order preservation
order_errors = []
for i in range(min(len(data), len(original_words))):
    if data[i]['english'] != original_words[i]:
        order_errors.append(f'Position {i+1}: Expected "{original_words[i]}", Got "{data[i]["english"]}"')

if order_errors:
    validation_results['order_preserved'] = False
    print(f'❌ Order preservation failed: {len(order_errors)} errors')
    for error in order_errors[:5]:  # Show first 5 errors
        print(f'  {error}')
else:
    print('✅ Order preserved correctly')

# Check required fields
required_fields = [
    "id", "english", "type", "vietnamese", "pronounce", "explain", "example",
    "example_vietnamese", "image_url", "audio_url", "difficulty", "cefr_level",
    "toeic_level", "frequency", "synonyms", "antonyms", "word_family",
    "collocations", "phrasal_verbs", "grammar_pattern", "common_mistakes",
    "usage_note", "topic", "mnemonic", "mnemonic_type", "memory_tip",
    "is_common", "stage", "created_at", "updated_at"
]

for i, record in enumerate(data):
    missing = [field for field in required_fields if field not in record]
    if missing:
        validation_results['missing_fields'].append(f'Record {i+1}: {missing}')

if validation_results['missing_fields']:
    print(f'❌ Missing fields in {len(validation_results["missing_fields"])} records')
else:
    print('✅ All required fields present')

# Check null violations (fields that should be null)
should_be_null = ['id', 'image_url', 'audio_url', 'created_at', 'updated_at']
null_violations = []
for i, record in enumerate(data):
    for field in should_be_null:
        if record[field] is not None:
            null_violations.append(f'Record {i+1} ({record["english"]}): {field} should be null but is {record[field]}')

if null_violations:
    validation_results['field_null_violations'] = null_violations
    print(f'❌ Null violations in {len(null_violations)} fields')
    for violation in null_violations[:5]:
        print(f'  {violation}')
else:
    print('✅ Required null fields are correct')

# Check array uniqueness
array_fields = ['synonyms', 'antonyms', 'word_family', 'collocations', 'phrasal_verbs']
duplicate_array_issues = []
for i, record in enumerate(data):
    for field in array_fields:
        if not isinstance(record[field], list):
            validation_results['invalid_types'].append(f'Record {i+1} ({record["english"]}): {field} is not a list')
            continue

        # Check for duplicates
        if len(record[field]) != len(set(record[field])):
            duplicates = [item for item in record[field] if record[field].count(item) > 1]
            duplicate_array_issues.append(f'Record {i+1} ({record["english"]}): {field} has duplicates: {duplicates}')

if duplicate_array_issues:
    validation_results['duplicate_arrays'] = duplicate_array_issues
    print(f'❌ Duplicate array elements in {len(duplicate_array_issues)} records')
    for issue in duplicate_array_issues[:5]:
        print(f'  {issue}')
else:
    print('✅ All arrays are unique')

# Check enum values
valid_difficulty = ['easy', 'medium', 'hard']
valid_cefr = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
valid_toeic = [400, 500, 600, 700, 800, 900]
valid_stage = [1, 2, 3, 4, 5]
valid_topic = [
    'Corporate Development', 'Finance & Banking', 'Offices & Workplace',
    'Personnel & Human Resources', 'Purchasing & Procurement',
    'Sales & Marketing', 'Manufacturing & Production',
    'Technical Areas & IT', 'Travel & Transportation',
    'Entertainment & Media', 'Housing & Real Estate',
    'Dining Out & Food Services', 'Health & Medical Care',
    'Environment & Infrastructure', 'General Business Operations'
]
valid_mnemonic_type = ['sound', 'visual', 'story', 'association', 'word_parts', None]

enum_issues = []
for i, record in enumerate(data):
    if record['difficulty'] not in valid_difficulty:
        enum_issues.append(f'Record {i+1} ({record["english"]}): Invalid difficulty: {record["difficulty"]}')
    if record['cefr_level'] not in valid_cefr:
        enum_issues.append(f'Record {i+1} ({record["english"]}): Invalid CEFR: {record["cefr_level"]}')
    if record['toeic_level'] not in valid_toeic:
        enum_issues.append(f'Record {i+1} ({record["english"]}): Invalid TOEIC level: {record["toeic_level"]}')
    if record['stage'] not in valid_stage:
        enum_issues.append(f'Record {i+1} ({record["english"]}): Invalid stage: {record["stage"]}')
    if record['topic'] not in valid_topic:
        enum_issues.append(f'Record {i+1} ({record["english"]}): Invalid topic: {record["topic"]}')
    if record['mnemonic_type'] not in valid_mnemonic_type:
        enum_issues.append(f'Record {i+1} ({record["english"]}): Invalid mnemonic_type: {record["mnemonic_type"]}')
    if not (1 <= record['frequency'] <= 100):
        enum_issues.append(f'Record {i+1} ({record["english"]}): Invalid frequency: {record["frequency"]}')

if enum_issues:
    validation_results['invalid_enums'] = enum_issues
    print(f'❌ Invalid enum values in {len(enum_issues)} cases')
    for issue in enum_issues[:5]:
        print(f'  {issue}')
else:
    print('✅ All enum values are valid')

# Check data types
type_issues = []
for i, record in enumerate(data):
    if not isinstance(record['toeic_level'], int):
        type_issues.append(f'Record {i+1} ({record["english"]}): toeic_level should be int, got {type(record["toeic_level"])}')
    if not isinstance(record['frequency'], int):
        type_issues.append(f'Record {i+1} ({record["english"]}): frequency should be int, got {type(record["frequency"])}')
    if not isinstance(record['stage'], int):
        type_issues.append(f'Record {i+1} ({record["english"]}): stage should be int, got {type(record["stage"])}')
    if not isinstance(record['is_common'], bool):
        type_issues.append(f'Record {i+1} ({record["english"]}): is_common should be bool, got {type(record["is_common"])}')

if type_issues:
    validation_results['invalid_types'].extend(type_issues)
    print(f'❌ Invalid data types in {len(type_issues)} cases')
    for issue in type_issues[:5]:
        print(f'  {issue}')
else:
    print('✅ All data types are correct')

# Check for fake URLs
fake_urls = []
for i, record in enumerate(data):
    if record['image_url'] not in [None, '']:
        fake_urls.append(f'Record {i+1} ({record["english"]}): image_url should be null')
    if record['audio_url'] not in [None, '']:
        fake_urls.append(f'Record {i+1} ({record["english"]}): audio_url should be null')

if fake_urls:
    validation_results['fake_urls'] = fake_urls
    print(f'❌ Fake URLs found in {len(fake_urls)} cases')
else:
    print('✅ No fake URLs')

# Check for fake mnemonics (that pretend to be etymology)
fake_mnemonics = []
for i, record in enumerate(data):
    if record['mnemonic'] and record['mnemonic_type']:
        mnemonic_text = record['mnemonic'].lower()
        # Check if mnemonic claims to be etymology
        if any(word in mnemonic_text for word in ['nguồn gốc', 'origin', 'etymology', 'xuất xứ', 'lịch sử']):
            fake_mnemonics.append(f'Record {i+1} ({record["english"]}): Mnemonic claims to be etymology')

if fake_mnemonics:
    validation_results['fake_mnemonics'] = fake_mnemonics
    print(f'❌ Fake etymological mnemonics in {len(fake_mnemonics)} cases')
else:
    print('✅ No fake etymological mnemonics')

# Check that common_mistakes can be None
common_mistakes_none_count = sum(1 for record in data if record['common_mistakes'] is None)
print(f'ℹ️ Common mistakes is None in {common_mistakes_none_count}/{len(data)} records (allowed)')

# Check that mnemonic can be None
mnemonic_none_count = sum(1 for record in data if record['mnemonic'] is None)
print(f'ℹ️ Mnemonic is None in {mnemonic_none_count}/{len(data)} records (allowed)')

# Check example contains the word
example_issues = []
for i, record in enumerate(data):
    if record['english'].lower() not in record['example'].lower():
        example_issues.append(f'Record {i+1} ({record["english"]}): Example does not contain the word')

if example_issues:
    validation_results['example_grammar_issues'] = example_issues
    print(f'❌ Example does not contain word in {len(example_issues)} cases')
    for issue in example_issues[:5]:
        print(f'  {issue}')
else:
    print('✅ All examples contain the target word')

# Summary
print('\n' + '='*50)
print('VALIDATION SUMMARY')
print('='*50)

total_issues = (
    len(validation_results['missing_fields']) +
    len(validation_results['invalid_types']) +
    len(validation_results['duplicate_arrays']) +
    len(validation_results['fake_urls']) +
    len(validation_results['fake_mnemonics']) +
    len(validation_results['invalid_enums']) +
    len(validation_results['example_grammar_issues']) +
    len(validation_results['field_null_violations'])
)

if total_issues == 0:
    print('✅ ALL VALIDATIONS PASSED')
else:
    print(f'❌ {total_issues} VALIDATION ISSUES FOUND')
    print(f'  - Missing fields: {len(validation_results["missing_fields"])}')
    print(f'  - Invalid types: {len(validation_results["invalid_types"])}')
    print(f'  - Duplicate arrays: {len(validation_results["duplicate_arrays"])}')
    print(f'  - Fake URLs: {len(validation_results["fake_urls"])}')
    print(f'  - Fake mnemonics: {len(validation_results["fake_mnemonics"])}')
    print(f'  - Invalid enums: {len(validation_results["invalid_enums"])}')
    print(f'  - Example issues: {len(validation_results["example_grammar_issues"])}')
    print(f'  - Null violations: {len(validation_results["field_null_violations"])}')

# Save validation results
with open(r'D:\CNTT2311\HK8\DOAN3\toeic-ai\validation_results.json', 'w', encoding='utf-8') as f:
    json.dump(validation_results, f, ensure_ascii=False, indent=2)

print(f'\nValidation results saved to validation_results.json')
