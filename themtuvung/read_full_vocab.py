import pandas as pd
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Read the Excel file
file_path = r'D:\CNTT2311\HK8\DOAN3\toeic-ai\vocabularymain.xlsx'
df = pd.read_excel(file_path)

print(f'File: {file_path}')
print(f'Total rows: {len(df)}')
print(f'Columns: {list(df.columns)}')
print(f'\nFirst 10 rows:')
print(df.head(10))

# Extract english words
if 'english' in df.columns:
    words = df['english'].dropna().tolist()
    print(f'\nTotal non-null english words: {len(words)}')

    # Check for duplicates
    unique_words = list(set(words))
    print(f'Unique words: {len(unique_words)}')
    print(f'Duplicates: {len(words) - len(unique_words)}')

    # Save word list
    with open(r'D:\CNTT2311\HK8\DOAN3\toeic-ai\full_word_list.json', 'w', encoding='utf-8') as f:
        json.dump(words, f, ensure_ascii=False, indent=2)

    print(f'\nWord list saved to full_word_list.json')
else:
    print('ERROR: No "english" column found in the Excel file')
