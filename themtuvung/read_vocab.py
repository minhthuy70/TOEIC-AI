import pandas as pd
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

# Read Excel file
df = pd.read_excel(r'D:\CNTT2311\HK8\DOAN3\toeic-ai\vocabularymain.xlsx')

# Get first 100 words
first_100 = df.head(100)

# Save to CSV for reference
first_100.to_csv(r'D:\CNTT2311\HK8\DOAN3\toeic-ai\temp_first_100.csv', index=False)

print(f'Total rows in file: {len(df)}')
print(f'Processing first 100 words')
print('\nWord list:')
for i, word in enumerate(first_100['english']):
    print(f'{i+1}. {word}')

# Save word list to JSON for processing
word_list = first_100['english'].tolist()
with open(r'D:\CNTT2311\HK8\DOAN3\toeic-ai\temp_word_list.json', 'w', encoding='utf-8') as f:
    json.dump(word_list, f, ensure_ascii=False, indent=2)

print(f'\nSaved {len(word_list)} words to temp_word_list.json')
