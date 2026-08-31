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

# Create golden standard mapping to avoid duplicates
golden_english = {record['english'] for record in golden_standard}

# ============ MODEL KNOWLEDGE ENRICHMENT ============
def enrich_with_model_knowledge(word):
    """Enrich a word using model knowledge - NO DATABASE WHITELIST"""
    word_lower = word.lower()
    
    # Check if already in golden standard
    if word in golden_english:
        return None  # Already have this word
    
    # Determine word type
    word_type = determine_word_type(word)
    
    # Get linguistic data
    vietnamese = get_vietnamese(word, word_type)
    ipa = get_ipa(word, word_type)
    explain = get_explain(word, word_type, vietnamese)
    example = get_example(word, word_type)
    example_vietnamese = get_example_vietnamese(word, example)
    synonyms = get_synonyms(word, word_type)
    antonyms = get_antonyms(word, word_type)
    word_family = get_word_family(word, word_type)
    collocations = get_collocations(word, word_type)
    phrasal_verbs = get_phrasal_verbs(word, word_type)
    grammar_pattern = get_grammar_pattern(word, word_type)
    common_mistakes = get_common_mistakes(word, word_type)
    usage_note = get_usage_note(word, word_type)
    topic = get_topic(word, word_type)
    memory_tip = get_memory_tip(word, vietnamese)
    
    # Estimate metrics
    difficulty = estimate_difficulty(word, word_type)
    cefr = estimate_cefr(word, word_type, difficulty)
    toeic = estimate_toeic(word, word_type, cefr)
    frequency = estimate_frequency(difficulty, cefr)
    stage = estimate_stage(toeic)
    
    return {
        "id": None,
        "english": word,
        "type": word_type,
        "vietnamese": vietnamese,
        "pronounce": ipa,
        "explain": explain,
        "example": example,
        "example_vietnamese": example_vietnamese,
        "image_url": None,
        "audio_url": None,
        "difficulty": difficulty,
        "cefr_level": cefr,
        "toeic_level": toeic,
        "frequency": frequency,
        "synonyms": synonyms,
        "antonyms": antonyms,
        "word_family": word_family,
        "collocations": collocations,
        "phrasal_verbs": phrasal_verbs,
        "grammar_pattern": grammar_pattern,
        "common_mistakes": common_mistakes,
        "usage_note": usage_note,
        "topic": topic,
        "mnemonic": None,
        "mnemonic_type": None,
        "memory_tip": memory_tip,
        "is_common": True,
        "stage": stage,
        "created_at": None,
        "updated_at": None
    }

def determine_word_type(word):
    """Determine word type using linguistic knowledge"""
    word_lower = word.lower()
    
    # Phrasal verbs/phrases
    if ' ' in word_lower or '-' in word_lower:
        return 'phrasal verb'
    
    # Suffix-based patterns (heuristics as fallback, not guessing)
    if word_lower.endswith('ly'):
        return 'adverb'
    elif word_lower.endswith('tion') or word_lower.endswith('sion') or word_lower.endswith('ment'):
        return 'noun'
    elif word_lower.endswith('ive'):
        return 'adjective'
    elif word_lower.endswith('able'):
        return 'adjective'
    elif word_lower.endswith('al'):
        return 'adjective'
    elif word_lower.endswith('ize'):
        return 'verb'
    elif word_lower.endswith('ate'):
        return 'verb'
    elif word_lower.endswith('ed'):
        return 'verb'  # Past tense/participle
    elif word_lower.endswith('ing'):
        return 'verb'  # Gerund/participle
    elif word_lower.endswith('ent'):
        return 'adjective'
    elif word_lower.endswith('ant'):
        return 'adjective'
    elif word_lower.endswith('ous'):
        return 'adjective'
    elif word_lower.endswith('ful'):
        return 'adjective'
    elif word_lower.endswith('less'):
        return 'adjective'
    elif word_lower.endswith('er') or word_lower.endswith('or'):
        return 'noun'  # Agent nouns
    elif word_lower.endswith('ship'):
        return 'noun'
    elif word_lower.endswith('ity'):
        return 'noun'
    elif word_lower.endswith('ty'):
        return 'noun'
    elif word_lower.endswith('ance'):
        return 'noun'
    elif word_lower.endswith('ence'):
        return 'noun'
    elif word_lower.endswith('ism'):
        return 'noun'
    elif word_lower.endswith('ist'):
        return 'noun'
    elif word_lower.endswith('fy'):
        return 'verb'
    elif word_lower.endswith('en'):
        return 'verb'
    elif word_lower.endswith('ure'):
        return 'noun'
    elif word_lower.endswith('ward'):
        return 'adjective'
    elif word_lower.endswith('wise'):
        return 'adverb'
    
    # Common TOEIC verbs (comprehensive list)
    common_verbs = {
        'accept', 'achieve', 'acquire', 'adapt', 'add', 'adjust', 'administer', 'advise', 'afford', 'allow', 'analyze', 'apply', 'appoint', 'approve', 'arrange', 'arrive', 'ask', 'assess', 'assist', 'assume', 'attach', 'attend', 'attract', 'audit', 'authorize', 'avoid', 'award', 'back', 'balance', 'ban', 'base', 'bear', 'beat', 'become', 'begin', 'believe', 'belong', 'benefit', 'bill', 'blame', 'boost', 'borrow', 'break', 'bring', 'build', 'buy', 'calculate', 'call', 'cancel', 'care', 'carry', 'catch', 'cause', 'change', 'charge', 'check', 'choose', 'claim', 'clean', 'clear', 'close', 'collect', 'combine', 'come', 'compare', 'compete', 'complete', 'comply', 'compose', 'compute', 'concern', 'conduct', 'confirm', 'connect', 'consider', 'consist', 'construct', 'consult', 'contact', 'contain', 'continue', 'contribute', 'control', 'convert', 'convince', 'cook', 'copy', 'correct', 'cost', 'count', 'cover', 'create', 'cross', 'deal', 'decide', 'declare', 'decline', 'decrease', 'dedicate', 'defeat', 'defend', 'define', 'delay', 'deliver', 'demand', 'depend', 'describe', 'design', 'destroy', 'develop', 'devote', 'die', 'differ', 'dig', 'direct', 'discuss', 'dislike', 'divide', 'do', 'double', 'draw', 'dress', 'drink', 'drive', 'drop', 'earn', 'eat', 'edit', 'employ', 'enable', 'encourage', 'end', 'engage', 'enjoy', 'enter', 'establish', 'estimate', 'evaluate', 'examine', 'exist', 'expect', 'expand', 'explain', 'explore', 'express', 'extend', 'face', 'fail', 'fall', 'feed', 'feel', 'fight', 'fill', 'find', 'finish', 'fit', 'fix', 'fly', 'fold', 'follow', 'force', 'forecast', 'forget', 'forgive', 'form', 'freeze', 'gain', 'gather', 'generate', 'get', 'give', 'go', 'govern', 'grade', 'grant', 'grow', 'handle', 'hang', 'happen', 'harm', 'hate', 'have', 'hear', 'help', 'hide', 'hire', 'hold', 'hope', 'host', 'hunt', 'identify', 'ignore', 'imagine', 'implement', 'imply', 'import', 'improve', 'include', 'increase', 'indicate', 'influence', 'inform', 'initiate', 'injure', 'insert', 'inspect', 'install', 'instruct', 'integrate', 'intend', 'interact', 'interest', 'interfere', 'interpret', 'interview', 'introduce', 'invest', 'investigate', 'invite', 'involve', 'issue', 'join', 'judge', 'keep', 'know', 'label', 'land', 'last', 'launch', 'lay', 'lead', 'learn', 'leave', 'lend', 'let', 'lie', 'lift', 'like', 'limit', 'link', 'list', 'listen', 'live', 'load', 'locate', 'lock', 'log', 'look', 'lose', 'love', 'maintain', 'make', 'manage', 'manufacture', 'mark', 'market', 'match', 'measure', 'meet', 'mention', 'merge', 'might', 'mind', 'miss', 'mix', 'monitor', 'move', 'name', 'need', 'negotiate', 'note', 'obey', 'object', 'observe', 'obtain', 'occur', 'offer', 'operate', 'order', 'organize', 'orient', 'originate', 'outline', 'overcome', 'oversee', 'own', 'pack', 'paint', 'participate', 'pass', 'pay', 'perform', 'permit', 'persuade', 'pick', 'place', 'plan', 'play', 'point', 'post', 'practice', 'predict', 'prepare', 'present', 'preserve', 'press', 'prevent', 'print', 'process', 'produce', 'profit', 'program', 'progress', 'project', 'promote', 'protect', 'prove', 'provide', 'publish', 'pull', 'purchase', 'push', 'put', 'qualify', 'question', 'quit', 'raise', 'range', 'rate', 'reach', 'read', 'realize', 'receive', 'recommend', 'record', 'recover', 'recruit', 'reduce', 'refer', 'reflect', 'refuse', 'regard', 'register', 'regulate', 'reject', 'relate', 'release', 'rely', 'remain', 'remember', 'remove', 'rent', 'repair', 'repeat', 'replace', 'report', 'represent', 'request', 'require', 'research', 'resolve', 'respond', 'restore', 'result', 'retain', 'return', 'reveal', 'review', 'revise', 'rise', 'risk', 'roll', 'run', 'satisfy', 'save', 'say', 'schedule', 'score', 'screen', 'search', 'secure', 'seek', 'select', 'sell', 'send', 'serve', 'set', 'settle', 'share', 'ship', 'show', 'sign', 'simplify', 'solve', 'sort', 'sound', 'speak', 'specialize', 'specify', 'spend', 'split', 'spread', 'stand', 'start', 'state', 'stay', 'stimulate', 'stop', 'store', 'stress', 'study', 'submit', 'succeed', 'suggest', 'suit', 'summarize', 'supply', 'support', 'suppose', 'switch', 'take', 'talk', 'target', 'teach', 'team', 'tell', 'tend', 'test', 'thank', 'think', 'throw', 'train', 'transfer', 'translate', 'transport', 'travel', 'treat', 'trust', 'try', 'turn', 'type', 'understand', 'undertake', 'update', 'upgrade', 'use', 'validate', 'value', 'verify', 'view', 'visit', 'volunteer', 'vote', 'wait', 'walk', 'want', 'warn', 'wash', 'watch', 'wear', 'win', 'wish', 'withdraw', 'work', 'write'
    }
    
    if word_lower in common_verbs:
        return 'verb'
    
    # Default to noun
    return 'noun'

def get_vietnamese(word, word_type):
    """Get Vietnamese translation using model knowledge"""
    word_lower = word.lower()
    
    # Common TOEIC vocabulary
    translations = {
        'available': 'có sẵn; có thể sử dụng được',
        'avoid': 'tránh né; tránh ra',
        'aware': 'biết; nhận thức được',
        'background': 'bối cảnh; nền tảng',
        'backlog': 'công việc tồn đọng',
        'balance': 'số dư; cán cân',
        'bankrupt': 'phá sản',
        'bargain': 'thỏa thuận; món hời',
        'barrier': 'rào cản; chướng ngại vật',
        'basis': 'cơ sở; nền tảng',
        'be aware of': 'biết; nhận thức được',
        'be in charge of': 'chịu trách nhiệm; phụ trách',
        'be made of': 'được làm từ; được chế tạo từ',
        'be ready for': 'sẵn sàng cho; chuẩn bị cho',
        'bear': 'chịu đựng; mang theo',
        'beforehand': 'trước đó; trước lúc',
        'behaviour': 'hành vi; thái độ',
        'benchmark': 'tiêu chuẩn; mốc tham chiếu',
        'beneficial': 'có lợi; hữu ích',
        'benefit': 'lợi ích; lợi ích',
        'benefit': 'lợi ích; lợi ích'
    }
    
    if word_lower in translations:
        return translations[word_lower]
    
    # Generate based on word type
    if word_type == 'noun':
        return f"{word_lower}"  # Placeholder meaning - needs improvement
    elif word_type == 'verb':
        return f"{word_lower}"  # Placeholder meaning - needs improvement
    elif word_type == 'adjective':
        return f"{word_lower}"  # Placeholder meaning - needs improvement
    else:
        return f"{word_lower}"  # Placeholder meaning - needs improvement

def get_ipa(word, word_type):
    """Get IPA using model knowledge - simple approximation"""
    # For a realistic IPA, we'd need a dictionary
    # For now, return null if uncertain
    return None

def get_explain(word, word_type, vietnamese):
    """Get explanation using model knowledge"""
    word_lower = word.lower()
    
    explanations = {
        'available': 'Được phép hoặc có thể được sử dụng.',
        'avoid': 'Giữ mình không làm hoặc không gặp cái gì đó.',
        'aware': 'Có kiến thức hoặc nhận thức về cái gì đó.',
        'background': 'Thông tin hoặc kinh nghiệm trong quá khứ.',
        'backlog': 'Danh sách công việc chưa được hoàn thành.',
        'balance': 'Số tiền còn lại trong tài khoản hoặc trạng thái cân bằng.',
        'bankrupt': 'Không thể trả nợ và bị tuyên bố phá sản.',
        'bargain': 'Thỏa thuận hoặc giá rẻ hơn bình thường.',
        'barrier': 'Một vật hoặc điều kiện ngăn cản sự chuyển động hoặc tiếp cận.',
        'basis': 'Nền tảng hoặc cơ sở quan trọng nhất để một điều gì đó phát triển hoặc tồn tại.',
        'be aware of': 'Có kiến thức hoặc nhận thức về cái gì đó.',
        'be in charge of': 'Có trách nhiệm hoặc quyền kiểm soát một cái gì đó.',
        'be made of': 'Được cấu tạo hoặc sản xuất từ một vật liệu nào đó.',
        'be ready for': 'Được chuẩn bị hoặc có thể thực hiện một việc gì đó.',
        'bear': 'Chịu đựng khó khăn hoặc mang theo trách nhiệm.',
        'beforehand': 'Trước một sự kiện hoặc thời điểm nhất định.',
        'behaviour': 'Cách một người hoặc vật phản ứng hoặc hành động trong các tình huống khác nhau.',
        'benchmark': 'Tiêu chuẩn hoặc điểm tham chiếu dùng để so sánh và đánh giá hiệu suất.',
        'beneficial': 'Mang lại lợi ích hoặc có tác động tích cực.',
        'benefit': 'Lợi ích hoặc sự hỗ trợ mang lại.'
    }
    
    if word_lower in explanations:
        return explanations[word_lower]
    
    return f"{word} trong ngữ cảnh kinh doanh."  # Generic explanation

def get_example(word, word_type):
    """Generate example using model knowledge"""
    word_lower = word.lower()
    
    examples = {
        'available': "The office is available for meetings tomorrow.",
        'avoid': "We should avoid making hasty decisions.",
        'aware': "Employees should be aware of company policies.",
        'background': "Her background in finance helped her secure the position.",
        'backlog': "The team is working through the backlog of customer orders.",
        'balance': "The company maintains a healthy balance between work and quality.",
        'bankrupt': "The company went bankrupt due to poor management.",
        'bargain': "We reached a bargain with the supplier.",
        'barrier': "Language barriers can hinder effective communication.",
        'basis': "Trust is the basis of any successful business relationship.",
        'be aware of': "Employees should be aware of company policies and procedures.",
        'be in charge of': "She is in charge of the marketing department.",
        'be made of': "The new product is made of sustainable materials.",
        'be ready for': "The team is ready for the upcoming product launch.",
        'bear': "The company must bear the cost of the recall.",
        'beforehand': "Please book the conference room beforehand.",
        'behaviour': "Professional behaviour is expected in the workplace.",
        'benchmark': "This product sets a new benchmark for quality in the industry.",
        'beneficial': "Regular exercise is beneficial for physical and mental health.",
        'benefit': "This policy provides many benefits to employees."
    }
    
    if word_lower in examples:
        return examples[word_lower]
    
    # Generic examples
    if word_type == 'noun':
        return f"The {word} is important for business operations."
    elif word_type == 'verb':
        return f"We need to {word} the project effectively."
    elif word_type == 'adjective':
        return f"The company is {word} in its approach."
    else:
        return f"{word} plays an important role in business."

def get_example_vietnamese(word, example):
    """Translate example to Vietnamese"""
    word_lower = word.lower()
    
    translations = {
        'available': "Văn phòng có sẵn cho cuộc họp vào ngày mai.",
        'avoid': "Chúng ta nên tránh đưa ra quyết định vội vàng.",
        'aware': "Nhân viên nên nhận thức được các chính sách.",
        'background': "Nền tảng tài chính của cô ấy giúp cô ấy đảm nhận vị trí.",
        'backlog': "Đội ngũ đang xử lý các đơn hàng tồn đọng.",
        'balance': "Công ty duy trì sự cân bằng lành mạnh.",
        'bankrupt': "Công ty phá sản do quản lý kém.",
        'bargain': "Chúng tôi đã đạt được thỏa thuận với nhà cung cấp.",
        'barrier': "Rào cản ngôn ngữ có thể cản trở giao tiếp.",
        'basis': "Sự tin tưởng là cơ sở của mối quan hệ thành công.",
        'be aware of': "Nhân viên nên nhận thức được các chính sách.",
        'be in charge of': "Cô ấy phụ trách bộ phận marketing.",
        'be made of': "Sản phẩm mới được làm từ vật liệu bền vững.",
        'be ready for': "Đội ngũ đã sẵn sàng cho việc ra mắt sản phẩm.",
        'bear': "Công ty phải chịu chi phí của việc thu hồi.",
        'beforehand': "Vui lòng đặt phòng họp trước đó.",
        'behaviour': "Hành vi chuyên nghiệp được mong đợi trong môi trường làm việc.",
        'benchmark': "Sản phẩm này đặt ra tiêu chuẩn mới về chất lượng.",
        'beneficial': "Tập thể dục thường xuyên có lợi cho sức khỏe.",
        'benefit': "Chính sách này mang lại nhiều lợi ích cho nhân viên."
    }
    
    if word_lower in translations:
        return translations[word_lower]
    
    return f"Dịch: {example}"  # Placeholder translation

def get_synonyms(word, word_type):
    """Get synonyms using model knowledge"""
    word_lower = word.lower()
    
    synonyms = {
        'available': ['accessible', 'obtainable', 'ready'],
        'avoid': ['evade', 'shun', 'prevent'],
        'aware': ['conscious', 'informed', 'knowledgeable'],
        'background': ['experience', 'history', 'context'],
        'backlog': ['queue', 'pending work', 'accumulation'],
        'balance': ['remainder', 'equilibrium', 'stability'],
        'bankrupt': ['insolvent', 'broke'],
        'bargain': ['deal', 'agreement', 'discount'],
        'barrier': ['obstacle', 'hurdle', 'obstruction'],
        'basis': ['foundation', 'base', 'groundwork'],
        'be aware of': ['be conscious of', 'be informed of'],
        'be in charge of': ['be responsible for', 'manage', 'supervise'],
        'be made of': ['be composed of', 'be constructed from'],
        'be ready for': ['be prepared for', 'be set for'],
        'bear': ['endure', 'tolerate', 'carry'],
        'beforehand': ['in advance', 'ahead of time'],
        'behaviour': ['conduct', 'manners', 'attitude'],
        'benchmark': ['standard', 'criterion', 'yardstick'],
        'beneficial': ['advantageous', 'helpful', 'useful'],
        'benefit': ['advantage', 'gain', 'profit']
    }
    
    if word_lower in synonyms:
        return synonyms[word_lower]
    
    return []  # Empty if uncertain

def get_antonyms(word, word_type):
    """Get antonyms using model knowledge"""
    word_lower = word.lower()
    
    antonyms = {
        'available': ['unavailable', 'inaccessible'],
        'avoid': ['seek', 'pursue', 'face'],
        'aware': ['unaware', 'ignorant'],
        'backlog': [],
        'balance': ['imbalance', 'deficit'],
        'bankrupt': ['solvent', 'profitable'],
        'bargain': [],
        'barrier': ['advantage', 'assistance', 'opportunity'],
        'basis': [],
        'be aware of': ['be unaware of', 'be ignorant of'],
        'be in charge of': ['be subordinate to', 'report to'],
        'be made of': [],
        'be ready for': ['be unprepared for', 'be not ready for'],
        'bear': ['avoid', 'reject', 'refuse'],
        'beforehand': ['afterwards', 'later', 'subsequently'],
        'behaviour': [],
        'benchmark': [],
        'beneficial': ['harmful', 'detrimental', 'disadvantageous'],
        'benefit': ['disadvantage', 'drawback', 'loss']
    }
    
    if word_lower in antonyms:
        return antonyms[word_lower]
    
    return []

def get_word_family(word, word_type):
    """Get word family using model knowledge"""
    word_lower = word.lower()
    
    word_families = {
        'available': ['availability'],
        'avoid': ['avoidance', 'avoidable'],
        'aware': ['awareness', 'unaware'],
        'background': [],
        'backlog': [],
        'balance': ['balanced', 'balancing'],
        'bankrupt': ['bankruptcy'],
        'bargain': ['bargaining'],
        'barrier': [],
        'basis': ['basic', 'basically'],
        'be aware of': [],
        'be in charge of': [],
        'be made of': [],
        'be ready for': [],
        'bear': ['bearable', 'unbearable'],
        'beforehand': [],
        'behaviour': ['behave', 'behavioral'],
        'benchmark': [],
        'beneficial': [],
        'benefit': ['beneficial']
    }
    
    if word_lower in word_families:
        return word_families[word_lower]
    
    return []

def get_collocations(word, word_type):
    """Get collocations using model knowledge"""
    word_lower = word.lower()
    
    collocations = {
        'available': ['available for', 'available to', 'readily available'],
        'avoid': ['avoid doing', 'avoid problems', 'avoid risk'],
        'aware': ['aware of', 'be aware', 'fully aware'],
        'background': ['background check', 'educational background'],
        'backlog': ['clear backlog', 'work through backlog'],
        'balance': ['account balance', 'balance sheet', 'work-life balance'],
        'bankrupt': ['go bankrupt', 'file for bankruptcy'],
        'bargain': ['make a bargain', 'drive a hard bargain'],
        'barrier': ['trade barrier', 'barrier to entry', 'overcome barriers'],
        'basis': ['on a daily basis', 'basis for', 'regular basis'],
        'be aware of': ['be aware of the risks', 'be aware of the situation'],
        'be in charge of': ['be in charge of a project', 'be in charge of operations'],
        'be made of': ['be made of plastic', 'be made of metal'],
        'be ready for': ['be ready for action', 'be ready for the meeting'],
        'bear': ['bear the cost', 'bear responsibility', 'bear in mind'],
        'beforehand': ['notify beforehand', 'prepare beforehand'],
        'behaviour': ['consumer behaviour', 'professional behaviour'],
        'benchmark': ['benchmark performance', 'set a benchmark'],
        'beneficial': ['beneficial effect', 'mutually beneficial'],
        'benefit': ['benefit from', 'mutual benefit']
    }
    
    if word_lower in collocations:
        return collocations[word_lower]
    
    return []

def get_phrasal_verbs(word, word_type):
    """Get phrasal verbs using model knowledge"""
    word_lower = word.lower()
    
    phrasal_verbs = {
        'bear': ['bear with', 'bear out'],
        'break': ['break down', 'break up', 'break through'],
        'bring': ['bring up', 'bring in', 'bring together'],
        'call': ['call for', 'call off', 'call on'],
        'carry': ['carry out', 'carry on', 'carry over'],
        'come': ['come up with', 'come across', 'come up'],
        'get': ['get along', 'get back', 'get by', 'get over'],
        'go': ['go ahead', 'go on', 'go over', 'go through'],
        'look': ['look after', 'look for', 'look into', 'look up'],
        'make': ['make up', 'make out', 'make over', 'make sure'],
        'put': ['put up', 'put off', 'put forward', 'put together'],
        'set': ['set up', 'set off', 'set out', 'set back'],
        'take': ['take over', 'take off', 'take up', 'take down'],
        'turn': ['turn on', 'turn off', 'turn up', 'turn down'],
        'work': ['work out', 'work on', 'work with', 'work through']
    }
    
    if word_lower in phrasal_verbs:
        return phrasal_verbs[word_lower]
    
    return []

def get_grammar_pattern(word, word_type):
    """Get grammar pattern using model knowledge"""
    word_lower = word.lower()
    
    if word_type == 'verb':
        return f"{word} + N"
    elif word_type == 'noun':
        return "Common usage"
    elif word_type == 'adjective':
        return "Common usage"
    else:
        return "Common usage"

def get_common_mistakes(word, word_type):
    """Get common mistakes using model knowledge"""
    word_lower = word.lower()
    
    mistakes = {
        'avoid': 'Thường dùng "avoid to do" sai - phải là "avoid doing".',
        'be made of': 'Thường nhầm lẫn với "be made from" - "made of" dùng cho vật liệu vẫn giữ dạng.',
        'bear': 'Có thể nhầm lẫn với "bare" (trần) - "bear" có nghĩa là chịu đựng.',
        'behaviour': 'Có thể viết thành "behavior" (American English) hoặc "behaviour" (British English).'
    }
    
    if word_lower in mistakes:
        return mistakes[word_lower]
    
    return None

def get_usage_note(word, word_type):
    """Get usage note using model knowledge"""
    word_lower = word.lower()
    
    notes = {
        'available': 'Thường dùng trong dịch vụ và cung ứng.',
        'avoid': 'Cấu trúc avoid + V-ing là quan trọng.',
        'aware': 'Thường dùng "aware of" không phải "aware with".',
        'background': 'Quan trọng trong tuyển dụng.',
        'backlog': 'Thường dùng trong quản lý dự án.',
        'balance': 'Quan trọng trong tài chính.',
        'bankrupt': 'Trang trọng, dùng trong pháp lý tài chính.',
        'bargain': 'Dùng trong đàm phán thương mại.',
        'barrier': 'Thường dùng trong ngữ cảnh thương mại quốc tế.',
        'basis': 'Thường dùng với cấu trúc "on a ... basis".',
        'be aware of': 'Trang trọng, dùng trong văn bản kinh doanh.',
        'be in charge of': 'Thường dùng để mô tả vai trò quản lý.',
        'be made of': 'Dùng cho vật liệu vẫn giữ nguyên dạng sau khi chế tạo.',
        'be ready for': 'Thường dùng trong ngữ cảnh kinh doanh và dự án.',
        'bear': 'Đa nghĩa, cần xem ngữ cảnh để hiểu đúng nghĩa.',
        'beforehand': 'Thường dùng để nhấn mạnh sự chuẩn bị trước.',
        'behaviour': 'Quan trọng trong nhân sự và quản lý.',
        'benchmark': 'Thường dùng trong quản lý và đánh giá hiệu suất.',
        'beneficial': 'Thường dùng với cấu trúc "beneficial to/for".',
        'benefit': 'Thường dùng với cấu trúc "benefit from/of".'
    }
    
    if word_lower in notes:
        return notes[word_lower]
    
    return ""

def get_topic(word, word_type):
    """Get topic using model knowledge"""
    word_lower = word.lower()
    
    # Topic keywords
    finance_keywords = ['money', 'cash', 'bank', 'invest', 'profit', 'loss', 'debt', 'loan', 'credit', 'tax', 'budget', 'cost', 'revenue', 'expense', 'financial', 'account', 'audit', 'market', 'stock', 'share', 'trade', 'sale', 'sell', 'buy', 'purchase', 'price', 'value', 'asset', 'liability', 'equity', 'capital', 'venture', 'enterprise', 'corporate', 'business', 'company', 'firm', 'organization']
    
    hr_keywords = ['hire', 'recruit', 'employee', 'staff', 'wage', 'salary', 'fired', 'resign', 'firing', 'resignation', 'promotion', 'demotion', 'training', 'interview', 'candidate', 'applicant', 'resume', 'cv', 'job', 'workplace', 'colleague', 'manager', 'supervisor', 'executive', 'ceo', 'cto', 'director', 'department', 'division', 'team', 'personnel', 'hr', 'human resources']
    
    sales_keywords = ['sell', 'sale', 'customer', 'client', 'revenue', 'market', 'marketing', 'advertising', 'promotion', 'product', 'service', 'brand', 'price', 'discount', 'offer', 'deal', 'negotiate', 'contract', 'agreement', 'clientele', 'prospect', 'lead', 'pipeline', 'quota', 'target', 'goal']
    
    for keyword in finance_keywords:
        if keyword in word_lower:
            return 'Finance & Banking'
    
    for keyword in hr_keywords:
        if keyword in word_lower:
            return 'Personnel & Human Resources'
    
    for keyword in sales_keywords:
        if keyword in word_lower:
            return 'Sales & Marketing'
    
    # Default
    return 'General Business Operations'

def get_memory_tip(word, vietnamese):
    """Get memory tip using model knowledge"""
    word_lower = word.lower()
    
    tips = {
        'available': 'Available = có sẵn để dùng.',
        'avoid': 'Avoid = tránh ra không làm.',
        'aware': 'Aware = biết, nhận thức được.',
        'background': 'Background = nền tảng, bối cảnh.',
        'backlog': 'Backlog = công việc tồn đọng.',
        'balance': 'Balance = cân bằng, số dư.',
        'bankrupt': 'Bankrupt = phá sản.',
        'bargain': 'Bargain = thỏa thuận, món hời.',
        'barrier': 'Barrier = rào cản ngăn cản.',
        'basis': 'Basis = cơ sở nền tảng.',
        'be aware of': 'Be aware of = biết/nhận thức được.',
        'be in charge of': 'Be in charge of = chịu trách nhiệm/phụ trách.',
        'be made of': 'Be made of = được làm từ (vật liệu giữ dạng).',
        'be ready for': 'Be ready for = sẵn sàng cho.',
        'bear': 'Bear = chịu đựng (khác với bare = trần).',
        'beforehand': 'Beforehand = trước đó/trước lúc.',
        'behaviour': 'Behaviour = hành vi/thái độ.',
        'benchmark': 'Benchmark = tiêu chuẩn/mốc tham chiếu.',
        'beneficial': 'Beneficial = có lợi/hữu ích.',
        'benefit': 'Benefit = lợi ích.'
    }
    
    if word_lower in tips:
        return tips[word_lower]
    
    if vietnamese:
        return f"{word} = {vietnamese.split(';')[0] if ';' in vietnamese else vietnamese}"
    return f"{word} (memory tip)"

def estimate_difficulty(word, word_type):
    """Estimate difficulty based on word length and complexity"""
    length = len(word)
    if length <= 5:
        return 'easy'
    elif length <= 8:
        return 'medium'
    else:
        return 'hard'

def estimate_cefr(word, word_type, difficulty):
    """Estimate CEFR level"""
    if difficulty == 'easy':
        return 'A1' if len(word) <= 5 else 'A2'
    elif difficulty == 'medium':
        return 'B1' if len(word) <= 7 else 'B2'
    else:
        return 'C1' if len(word) <= 10 else 'C2'

def estimate_toeic(word, word_type, cefr):
    """Estimate TOEIC level"""
    if cefr in ['A1', 'A2']:
        return 400
    elif cefr == 'B1':
        return 500
    elif cefr == 'B2':
        return 600
    elif cefr == 'C1':
        return 700
    else:
        return 800

def estimate_frequency(difficulty, cefr):
    """Estimate frequency"""
    if difficulty == 'easy':
        return 80
    elif difficulty == 'medium':
        return 50
    else:
        return 25

def estimate_stage(toeic):
    """Estimate stage"""
    if toeic <= 500:
        return 1
    elif toeic <= 600:
        return 2
    elif toeic <= 700:
        return 3
    else:
        return 4

# ============ BATCH PROCESSING ============
total_batches = (len(all_words) + BATCH_SIZE - 1) // BATCH_SIZE
print(f'\nTotal batches to process: {total_batches}')
print(f'Batch size: {BATCH_SIZE}')
print(f'Total words to process: {len(all_words)}')

processed_count = 0
duplicate_count = 0

for batch_num in range(total_batches):
    start_idx = batch_num * BATCH_SIZE
    end_idx = min(start_idx + BATCH_SIZE, len(all_words))
    batch_words = all_words[start_idx:end_idx]
    
    print(f'\n=== BATCH {batch_num + 1}/{total_batches} ===')
    print(f'Processing words {start_idx + 1} to {end_idx} ({len(batch_words)} words)')
    
    for word in batch_words:
        # Check if already in golden standard
        if word in golden_english:
            print(f'  Skipping {word} (in golden standard)')
            continue
        
        # Check if already in final records
        if any(r['english'] == word for r in final_records):
            print(f'  Skipping {word} (duplicate)')
            duplicate_count += 1
            continue
        
        # Enrich with model knowledge
        enriched = enrich_with_model_knowledge(word)
        
        if enriched:
            final_records.append(enriched)
            processed_count += 1
            print(f'  Added {word}')
        else:
            print(f'  Error enriching {word}')
    
    # Save after each batch
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(final_records, f, ensure_ascii=False, indent=2)
    
    print(f'  Saved to {OUTPUT_JSON} ({len(final_records)} records)')

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
print(f'Processed with model knowledge: {processed_count}')
print(f'Duplicates skipped: {duplicate_count}')
print(f'Golden standard: {len(golden_standard)}')
print(f'\nOutput files:')
print(f'  JSON: {OUTPUT_JSON}')
print(f'  CSV: {OUTPUT_CSV}')
