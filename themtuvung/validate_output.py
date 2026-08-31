import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Load the output file
with open(r'D:\CNTT2311\HK8\DOAN3\toeic-ai\vocabulary_output_100.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f'Total records: {len(data)}')
print(f'First record: {data[0]["english"]}')
print(f'Last record: {data[-1]["english"]}')
print(f'Record 50: {data[49]["english"]}')

# Validate that all required fields are present
required_fields = [
    "id", "english", "type", "vietnamese", "pronounce", "explain", "example",
    "example_vietnamese", "image_url", "audio_url", "difficulty", "cefr_level",
    "toeic_level", "frequency", "synonyms", "antonyms", "word_family",
    "collocations", "phrasal_verbs", "grammar_pattern", "common_mistakes",
    "usage_note", "topic", "mnemonic", "mnemonic_type", "memory_tip",
    "is_common", "stage", "created_at", "updated_at"
]

# Check first record for all fields
first_record = data[0]
missing_fields = []
for field in required_fields:
    if field not in first_record:
        missing_fields.append(field)

if missing_fields:
    print(f'Missing fields: {missing_fields}')
else:
    print('All required fields present in first record')

# Check that English words match the original order
with open(r'D:\CNTT2311\HK8\DOAN3\toeic-ai\temp_word_list.json', 'r', encoding='utf-8') as f:
    original_words = json.load(f)

# Compare first 10 words
print('\nComparing first 10 words:')
for i in range(10):
    original = original_words[i]
    processed = data[i]["english"]
    match = "OK" if original == processed else "FAIL"
    print(f'{i+1}. {match} Original: {original} | Processed: {processed}')

# Validate specific field values
print('\nValidating field values:')
print(f'ID is null: {first_record["id"] is None}')
print(f'Image URL is null: {first_record["image_url"] is None}')
print(f'Audio URL is null: {first_record["audio_url"] is None}')
print(f'Created at is null: {first_record["created_at"] is None}')
print(f'Updated at is null: {first_record["updated_at"] is None}')
print(f'Synonyms is list: {isinstance(first_record["synonyms"], list)}')
print(f'Antonyms is list: {isinstance(first_record["antonyms"], list)}')
print(f'Difficulty valid: {first_record["difficulty"] in ["easy", "medium", "hard"]}')
print(f'CEFR valid: {first_record["cefr_level"] in ["A1", "A2", "B1", "B2", "C1", "C2"]}')
print(f'TOEIC level value: {first_record["toeic_level"]} (type: {type(first_record["toeic_level"])})')
print(f'TOEIC level valid: {first_record["toeic_level"] in [400, 500, 600, 700, 800, 900]}')
print(f'Stage valid: {first_record["stage"] in [1, 2, 3, 4, 5]}')
print(f'Frequency valid: {1 <= first_record["frequency"] <= 100}')
print(f'Example contains word: {first_record["english"].lower() in first_record["example"].lower()}')

# Additional validation for specific fields
print('\nSample data from record 1:')
print(f'English: {first_record["english"]}')
print(f'Type: {first_record["type"]}')
print(f'Topic: {first_record["topic"]}')
print(f'Stage: {first_record["stage"]}')
print(f'Difficulty: {first_record["difficulty"]}')
print(f'Example: {first_record["example"]}')
print(f'Word family count: {len(first_record["word_family"])}')
print(f'Collocations count: {len(first_record["collocations"])}')
