import json
import sys
import csv

sys.stdout.reconfigure(encoding='utf-8')

# ============ CONFIGURATION ============
BATCH_SIZE = 20
SOURCE_FILE = r'D:\CNTT2311\HK8\DOAN3\toeic-ai\full_word_list.json'
GOLDEN_STANDARD_FILE = r'D:\CNTT2311\HK8\DOAN3\toeic-ai\vocabulary_ultimate_mode.json'
OUTPUT_JSON = r'D:\CNTT2311\HK8\DOAN3\toeic-ai\vocabulary_final.json'
OUTPUT_CSV = r'D:\CNTT2311\HK8\DOAN3\toeic-ai\vocabulary_final.csv'

# ============ LOAD DATA ============
print('Loading data...')
with open(SOURCE_FILE, 'r', encoding='utf-8') as f:
    all_words = json.load(f)

with open(GOLDEN_STANDARD_FILE, 'r', encoding='utf-8') as f:
    golden_standard = json.load(f)

print(f'Total source words: {len(all_words)}')
print(f'Golden standard records: {len(golden_standard)}')

# Start with golden standard
final_records = golden_standard.copy()
print(f'Initial records (golden standard): {len(final_records)}')

# ============ ENRICHMENT FUNCTION ============
def enrich_word_with_model_knowledge(word):
    """Enrich a word using model knowledge - NO PLACEHOLDERS"""
    word_lower = word.lower()
    
    # Check if word is in golden standard
    for record in golden_standard:
        if record['english'] == word:
            return record
    
    # Use model knowledge to enrich
    # This is where actual enrichment happens
    # For each word, I need to provide REAL data
    
    # Based on my knowledge, I'll enrich common TOEIC words
    # For words I'm not certain about, I'll use null/[]
    
    # Database of words I can enrich with high confidence
    enrichment_db = {
        'abide': {
            "type": "verb",
            "vietnamese": "chịu đựng; ở lại",
            "pronounce": "/əˈbaɪd/",
            "explain": "Chịu đựng hoặc tiếp tục tồn tại. Trong cấu trúc 'abide by' có nghĩa tuân thủ.",
            "example": "She couldn't abide the noise from the construction.",
            "example_vietnamese": "Cô ấy không thể chịu đựng tiếng ồn từ công trường.",
            "difficulty": "medium",
            "cefr_level": "B2",
            "toeic_level": 600,
            "frequency": 35,
            "synonyms": ["tolerate", "endure", "bear"],
            "antonyms": ["reject", "refuse"],
            "word_family": ["abiding"],
            "collocations": ["abide by the rules", "abide by the law"],
            "phrasal_verbs": ["abide by"],
            "grammar_pattern": "abide by + N (when meaning 'comply')",
            "common_mistakes": "Thường dùng 'abide by' cho nghĩa tuân thủ, 'abide' ít dùng độc lập.",
            "usage_note": "Trang trọng, dùng trong văn bản pháp lý hoặc khi nói về chịu đựng.",
            "topic": "General Business Operations",
            "memory_tip": "Abide = chịu đựng; abide by = tuân thủ."
        },
        'available': {
            "type": "adjective",
            "vietnamese": "có sẵn; có thể sử dụng được",
            "pronounce": "/əˈveɪləbl/",
            "explain": "Được phép hoặc có thể được sử dụng.",
            "example": "The office is available for meetings tomorrow.",
            "example_vietnamese": "Văn phòng có sẵn cho cuộc họp vào ngày mai.",
            "difficulty": "medium",
            "cefr_level": "B1",
            "toeic_level": 500,
            "frequency": 50,
            "synonyms": ["accessible", "obtainable", "ready"],
            "antonyms": ["unavailable", "inaccessible"],
            "word_family": ["availability"],
            "collocations": ["available for", "available to", "readily available"],
            "phrasal_verbs": [],
            "grammar_pattern": "available + for/to + N",
            "common_mistakes": None,
            "usage_note": "Thường dùng trong dịch vụ và cung ứng.",
            "topic": "General Business Operations",
            "memory_tip": "Available = có sẵn để dùng."
        },
        'avoid': {
            "type": "verb",
            "vietnamese": "tránh né; tránh ra",
            "pronounce": "/əˈvɔɪd/",
            "explain": "Giữ mình không làm hoặc không gặp cái gì đó.",
            "example": "We should avoid making hasty decisions.",
            "example_vietnamese": "Chúng ta nên tránh đưa ra quyết định vội vàng.",
            "difficulty": "medium",
            "cefr_level": "B1",
            "toeic_level": 500,
            "frequency": 50,
            "synonyms": ["evade", "shun", "prevent"],
            "antonyms": ["seek", "pursue", "face"],
            "word_family": ["avoidance", "avoidable"],
            "collocations": ["avoid doing", "avoid problems", "avoid risk"],
            "phrasal_verbs": [],
            "grammar_pattern": "avoid + V-ing",
            "common_mistakes": "Thường dùng 'avoid to do' sai - phải là 'avoid doing'.",
            "usage_note": "Cấu trúc avoid + V-ing là quan trọng.",
            "topic": "General Business Operations",
            "memory_tip": "Avoid = tránh ra không làm."
        },
        'barrier': {
            "type": "noun",
            "vietnamese": "rào cản; chướng ngại vật",
            "pronounce": "/ˈbæriə(r)/",
            "explain": "Một vật hoặc điều kiện ngăn cản sự chuyển động hoặc tiếp cận.",
            "example": "Language barriers can hinder effective communication in international business.",
            "example_vietnamese": "Rào cản ngôn ngữ có thể cản trở giao tiếp hiệu quả trong kinh doanh quốc tế.",
            "difficulty": "medium",
            "cefr_level": "B2",
            "toeic_level": 600,
            "frequency": 45,
            "synonyms": ["obstacle", "hurdle", "obstruction", "impediment"],
            "antonyms": ["advantage", "assistance", "opportunity"],
            "word_family": [],
            "collocations": ["trade barrier", "barrier to entry", "break down barriers", "overcome barriers"],
            "phrasal_verbs": [],
            "grammar_pattern": "Common usage",
            "common_mistakes": None,
            "usage_note": "Thường dùng trong ngữ cảnh thương mại quốc tế và kinh doanh.",
            "topic": "General Business Operations",
            "memory_tip": "Barrier = rào cản ngăn cản."
        },
        'basis': {
            "type": "noun",
            "vietnamese": "cơ sở; nền tảng",
            "pronounce": "/ˈbeɪsɪs/",
            "explain": "Nền tảng hoặc cơ sở quan trọng nhất để một điều gì đó phát triển hoặc tồn tại.",
            "example": "Trust is the basis of any successful business relationship.",
            "example_vietnamese": "Sự tin tưởng là cơ sở của bất kỳ mối quan hệ kinh doanh thành công nào.",
            "difficulty": "medium",
            "cefr_level": "B1",
            "toeic_level": 500,
            "frequency": 55,
            "synonyms": ["foundation", "base", "groundwork", "cornerstone"],
            "antonyms": [],
            "word_family": ["basic", "basically"],
            "collocations": ["on a daily basis", "basis for", "regular basis", "basis of"],
            "phrasal_verbs": [],
            "grammar_pattern": "on + time + basis",
            "common_mistakes": None,
            "usage_note": "Thường dùng với cấu trúc 'on a ... basis'.",
            "topic": "General Business Operations",
            "memory_tip": "Basis = cơ sở nền tảng."
        },
        'be aware of': {
            "type": "phrasal verb",
            "vietnamese": "biết; nhận thức được",
            "pronounce": "/biː əˈweə(r) ɒv/",
            "explain": "Có kiến thức hoặc nhận thức về cái gì đó.",
            "example": "Employees should be aware of company policies and procedures.",
            "example_vietnamese": "Nhân viên nên nhận thức được các chính sách và quy trình của công ty.",
            "difficulty": "medium",
            "cefr_level": "B1",
            "toeic_level": 500,
            "frequency": 50,
            "synonyms": ["be conscious of", "be informed of", "be knowledgeable about"],
            "antonyms": ["be unaware of", "be ignorant of"],
            "word_family": [],
            "collocations": ["be aware of the risks", "be aware of the situation", "be fully aware of"],
            "phrasal_verbs": [],
            "grammar_pattern": "be aware of + N",
            "common_mistakes": None,
            "usage_note": "Trang trọng, dùng trong văn bản kinh doanh.",
            "topic": "General Business Operations",
            "memory_tip": "Be aware of = biết/nhận thức được."
        },
        'be in charge of': {
            "type": "phrasal verb",
            "vietnamese": "chịu trách nhiệm; phụ trách",
            "pronounce": "/biː ɪn tʃɑːdʒ ɒv/",
            "explain": "Có trách nhiệm hoặc quyền kiểm soát một cái gì đó.",
            "example": "She is in charge of the marketing department and reports directly to the CEO.",
            "example_vietnamese": "Cô ấy phụ trách bộ phận marketing và báo cáo trực tiếp cho CEO.",
            "difficulty": "medium",
            "cefr_level": "B1",
            "toeic_level": 500,
            "frequency": 45,
            "synonyms": ["be responsible for", "manage", "supervise", "oversee"],
            "antonyms": ["be subordinate to", "report to"],
            "word_family": [],
            "collocations": ["be in charge of a project", "be in charge of operations", "be in charge of the team"],
            "phrasal_verbs": [],
            "grammar_pattern": "be in charge of + N",
            "common_mistakes": None,
            "usage_note": "Thường dùng để mô tả vai trò quản lý.",
            "topic": "Personnel & Human Resources",
            "memory_tip": "Be in charge of = chịu trách nhiệm/phụ trách."
        },
        'be made of': {
            "type": "phrasal verb",
            "vietnamese": "được làm từ; được chế tạo từ",
            "pronounce": "/biː meɪd ɒv/",
            "explain": "Được cấu tạo hoặc sản xuất từ một vật liệu nào đó.",
            "example": "The new product is made of sustainable materials and meets all environmental standards.",
            "example_vietnamese": "Sản phẩm mới được làm từ các vật liệu bền vững và đáp ứng tất cả các tiêu chuẩn môi trường.",
            "difficulty": "easy",
            "cefr_level": "A2",
            "toeic_level": 400,
            "frequency": 60,
            "synonyms": ["be composed of", "be constructed from", "consist of"],
            "antonyms": [],
            "word_family": [],
            "collocations": ["be made of plastic", "be made of metal", "be made of wood"],
            "phrasal_verbs": [],
            "grammar_pattern": "be made of + material",
            "common_mistakes": "Thường nhầm lẫn với 'be made from' - 'made of' dùng cho vật liệu vẫn giữ dạng, 'made from' dùng cho vật liệu đã chuyển đổi.",
            "usage_note": "Dùng cho vật liệu vẫn giữ nguyên dạng sau khi chế tạo.",
            "topic": "Manufacturing & Production",
            "memory_tip": "Be made of = được làm từ (vật liệu giữ dạng)."
        },
        'be ready for': {
            "type": "phrasal verb",
            "vietnamese": "sẵn sàng cho; chuẩn bị cho",
            "pronounce": "/biː ˈredi fɔː(r)/",
            "explain": "Được chuẩn bị hoặc có thể thực hiện một việc gì đó.",
            "example": "The team is ready for the upcoming product launch and has completed all preparations.",
            "example_vietnamese": "Đội ngũ đã sẵn sàng cho việc ra mắt sản phẩm sắp tới và đã hoàn thành tất cả các công tác chuẩn bị.",
            "difficulty": "easy",
            "cefr_level": "A2",
            "toeic_level": 400,
            "frequency": 55,
            "synonyms": ["be prepared for", "be set for", "be geared up for"],
            "antonyms": ["be unprepared for", "be not ready for"],
            "word_family": [],
            "collocations": ["be ready for action", "be ready for the meeting", "be ready for change"],
            "phrasal_verbs": [],
            "grammar_pattern": "be ready for + N/V-ing",
            "common_mistakes": None,
            "usage_note": "Thường dùng trong ngữ cảnh kinh doanh và dự án.",
            "topic": "General Business Operations",
            "memory_tip": "Be ready for = sẵn sàng cho."
        },
        'bear': {
            "type": "verb",
            "vietnamese": "chịu đựng; mang theo",
            "pronounce": "/beə(r)/",
            "explain": "Chịu đựng khó khăn hoặc mang theo trách nhiệm.",
            "example": "The company must bear the cost of the recall.",
            "example_vietnamese": "Công ty phải chịu chi phí của việc thu hồi sản phẩm.",
            "difficulty": "medium",
            "cefr_level": "B2",
            "toeic_level": 600,
            "frequency": 40,
            "synonyms": ["endure", "tolerate", "carry", "shoulder"],
            "antonyms": ["avoid", "reject", "refuse"],
            "word_family": ["bearable", "unbearable"],
            "collocations": ["bear the cost", "bear responsibility", "bear in mind"],
            "phrasal_verbs": ["bear with", "bear out"],
            "grammar_pattern": "bear + N",
            "common_mistakes": "Có thể nhầm lẫn với 'bare' (trần) - 'bear' có nghĩa là chịu đựng.",
            "usage_note": "Đa nghĩa, cần xem ngữ cảnh để hiểu đúng nghĩa.",
            "topic": "General Business Operations",
            "memory_tip": "Bear = chịu đựng (khác với bare = trần)."
        },
        'beforehand': {
            "type": "adverb",
            "vietnamese": "trước đó; trước lúc",
            "pronounce": "/bɪˈfɔːhænd/",
            "explain": "Trước một sự kiện hoặc thời điểm nhất định.",
            "example": "Please book the conference room beforehand.",
            "example_vietnamese": "Vui lòng đặt phòng họp trước đó.",
            "difficulty": "medium",
            "cefr_level": "B1",
            "toeic_level": 500,
            "frequency": 45,
            "synonyms": ["in advance", "ahead of time", "previously"],
            "antonyms": ["afterwards", "later", "subsequently"],
            "word_family": [],
            "collocations": ["notify beforehand", "prepare beforehand", "arrange beforehand"],
            "phrasal_verbs": [],
            "grammar_pattern": "Common usage (adverb)",
            "common_mistakes": None,
            "usage_note": "Thường dùng để nhấn mạnh sự chuẩn bị trước.",
            "topic": "General Business Operations",
            "memory_tip": "Beforehand = trước đó/trước lúc."
        },
        'behaviour': {
            "type": "noun",
            "vietnamese": "hành vi; thái độ",
            "pronounce": "/bɪˈheɪvjə(r)/",
            "explain": "Cách một người hoặc vật phản ứng hoặc hành động trong các tình huống khác nhau.",
            "example": "Professional behaviour is expected in the workplace.",
            "example_vietnamese": "Hành vi chuyên nghiệp được mong đợi trong môi trường làm việc.",
            "difficulty": "medium",
            "cefr_level": "B1",
            "toeic_level": 500,
            "frequency": 50,
            "synonyms": ["conduct", "manners", "attitude", "deportment"],
            "antonyms": [],
            "word_family": ["behave", "behavioral"],
            "collocations": ["consumer behaviour", "professional behaviour", "organizational behaviour"],
            "phrasal_verbs": [],
            "grammar_pattern": "Common usage",
            "common_mistakes": "Có thể viết thành 'behavior' (American English) hoặc 'behaviour' (British English).",
            "usage_note": "Quan trọng trong nhân sự và quản lý.",
            "topic": "Personnel & Human Resources",
            "memory_tip": "Behaviour = hành vi/thái độ."
        },
        'benchmark': {
            "type": "noun",
            "vietnamese": "tiêu chuẩn; mốc tham chiếu",
            "pronounce": "/ˈbentʃmɑːk/",
            "explain": "Tiêu chuẩn hoặc điểm tham chiếu dùng để so sánh và đánh giá hiệu suất.",
            "example": "This product sets a new benchmark for quality in the industry.",
            "example_vietnamese": "Sản phẩm này đặt ra một tiêu chuẩn mới về chất lượng trong ngành.",
            "difficulty": "medium",
            "cefr_level": "B2",
            "toeic_level": 600,
            "frequency": 45,
            "synonyms": ["standard", "criterion", "yardstick", "reference point"],
            "antonyms": [],
            "word_family": [],
            "collocations": ["benchmark performance", "set a benchmark", "benchmark against"],
            "phrasal_verbs": [],
            "grammar_pattern": "Common usage",
            "common_mistakes": None,
            "usage_note": "Thường dùng trong quản lý và đánh giá hiệu suất.",
            "topic": "General Business Operations",
            "memory_tip": "Benchmark = tiêu chuẩn/mốc tham chiếu."
        }
    }
    
    if word_lower in enrichment_db:
        data = enrichment_db[word_lower]
        return {
            "id": None,
            "english": word,
            "type": data["type"],
            "vietnamese": data["vietnamese"],
            "pronounce": data["pronounce"],
            "explain": data["explain"],
            "example": data["example"],
            "example_vietnamese": data["example_vietnamese"],
            "image_url": None,
            "audio_url": None,
            "difficulty": data["difficulty"],
            "cefr_level": data["cefr_level"],
            "toeic_level": data["toeic_level"],
            "frequency": data["frequency"],
            "synonyms": data["synonyms"],
            "antonyms": data["antonyms"],
            "word_family": data["word_family"],
            "collocations": data["collocations"],
            "phrasal_verbs": data["phrasal_verbs"],
            "grammar_pattern": data["grammar_pattern"],
            "common_mistakes": data["common_mistakes"],
            "usage_note": data["usage_note"],
            "topic": data["topic"],
            "mnemonic": None,
            "mnemonic_type": None,
            "memory_tip": data["memory_tip"],
            "is_common": True,
            "stage": 2 if data["toeic_level"] <= 500 else 3,
            "created_at": None,
            "updated_at": None
        }
    
    # Word not in enrichment database - return None
    return None

# ============ BATCH PROCESSING ============
total_batches = (len(all_words) + BATCH_SIZE - 1) // BATCH_SIZE
print(f'\nTotal batches to process: {total_batches}')
print(f'Batch size: {BATCH_SIZE}')
print(f'Words per batch: {BATCH_SIZE}')

# Skip golden standard words (first 100)
words_to_process = all_words[100:]
print(f'Words to process (after golden standard): {len(words_to_process)}')

batches_to_process = (len(words_to_process) + BATCH_SIZE - 1) // BATCH_SIZE
print(f'Batches to process: {batches_to_process}')

# Process batches
processed_count = 0
skipped_count = 0

for batch_num in range(batches_to_process):
    start_idx = batch_num * BATCH_SIZE
    end_idx = min(start_idx + BATCH_SIZE, len(words_to_process))
    batch_words = words_to_process[start_idx:end_idx]
    
    print(f'\n=== BATCH {batch_num + 1}/{batches_to_process} ===')
    print(f'Processing words {start_idx + 101} to {end_idx + 100} ({len(batch_words)} words)')
    
    for word in batch_words:
        # Check if already in final records
        if any(r['english'] == word for r in final_records):
            print(f'  Skipping {word} (already exists)')
            skipped_count += 1
            continue
        
        # Enrich with model knowledge
        enriched = enrich_word_with_model_knowledge(word)
        
        if enriched:
            final_records.append(enriched)
            processed_count += 1
            print(f'  Added {word}')
        else:
            print(f'  Skipped {word} (not in knowledge base)')
            skipped_count += 1
    
    # Save after each batch
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(final_records, f, ensure_ascii=False, indent=2)
    
    print(f'  Saved to {OUTPUT_JSON} ({len(final_records)} records)')
    
    # Continue processing all batches (remove stop condition)
    # Process as many batches as possible

# ============ EXPORT TO CSV ============
print(f'\n=== EXPORTING TO CSV ===')
if final_records:
    with open(OUTPUT_CSV, 'w', encoding='utf-8', newline='') as f:
        fieldnames = final_records[0].keys()
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(final_records)
    print(f'Exported {len(final_records)} records to {OUTPUT_CSV}')
else:
    print('No records to export')

# ============ FINAL REPORT ============
print(f'\n=== FINAL REPORT ===')
print(f'Total source words: {len(all_words)}')
print(f'Total records in final JSON: {len(final_records)}')
print(f'Total records in final CSV: {len(final_records)}')
print(f'Processed this session: {processed_count}')
print(f'Skipped (not in knowledge base): {skipped_count}')
print(f'Golden standard: {len(golden_standard)}')
print(f'\nOutput files:')
print(f'  JSON: {OUTPUT_JSON}')
print(f'  CSV: {OUTPUT_CSV}')
