import json
import re
from pathlib import Path
from collections import defaultdict


# ============================================================
# CONFIG
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent
TESTS_DIR = BASE_DIR / "data" / "tests"

REPORT_FILE = BASE_DIR / "duplicate_questions_report.txt"


# ============================================================
# NORMALIZE
# ============================================================

def normalize_text(value):
    """
    Chuẩn hóa text để so sánh:
    - lowercase
    - bỏ khoảng trắng thừa
    - chuẩn hóa dấu ngoặc kép
    - chuẩn hóa apostrophe
    - chuẩn hóa dash
    """

    if value is None:
        return ""

    value = str(value).strip().lower()

    value = value.replace("\u2018", "'")
    value = value.replace("\u2019", "'")
    value = value.replace("\u201c", '"')
    value = value.replace("\u201d", '"')
    value = value.replace("\u2013", "-")
    value = value.replace("\u2014", "-")

    # Chuẩn hóa whitespace
    value = re.sub(r"\s+", " ", value)

    return value


# ============================================================
# GET FIELD
# ============================================================

def get_first(obj, keys, default=None):

    if not isinstance(obj, dict):
        return default

    for key in keys:

        if key in obj and obj[key] is not None:

            return obj[key]

    return default


# ============================================================
# GET QUESTION TEXT
# ============================================================

def get_question_text(question):

    value = get_first(
        question,
        [
            "question",
            "questionText",
            "question_text",
            "prompt",
            "text",
        ],
    )

    if isinstance(value, str):
        return value.strip()

    return ""


# ============================================================
# GET QUESTION NUMBER
# ============================================================

def get_question_number(question, fallback):

    value = get_first(
        question,
        [
            "questionNumber",
            "question_number",
            "number",
            "questionNo",
            "id",
        ],
        fallback,
    )

    return value


# ============================================================
# GET CORRECT ANSWER
# ============================================================

def get_correct_answer(question):

    value = get_first(
        question,
        [
            "correctAnswer",
            "correct_answer",
            "answer",
            "correct",
        ],
        "",
    )

    return str(value).strip().upper()


# ============================================================
# GET OPTIONS
# ============================================================

def get_options(question):

    options = get_first(
        question,
        [
            "options",
            "answers",
        ],
        [],
    )

    if not isinstance(options, list):
        return []

    result = []

    for option in options:

        if isinstance(option, dict):

            label = get_first(
                option,
                [
                    "label",
                    "key",
                    "option",
                    "letter",
                ],
                "",
            )

            text = get_first(
                option,
                [
                    "text",
                    "content",
                    "value",
                ],
                "",
            )

            result.append(
                (
                    normalize_text(label),
                    normalize_text(text),
                )
            )

        elif isinstance(option, str):

            result.append(
                (
                    "",
                    normalize_text(option),
                )
            )

    return result


# ============================================================
# OPTION SIGNATURE
# ============================================================

def make_option_signature(question):

    options = get_options(question)

    # Không quan tâm thứ tự nếu cần xác định
    # cùng một bộ option.
    option_texts = sorted(
        text
        for _, text in options
        if text
    )

    return tuple(option_texts)


# ============================================================
# GET PART
# ============================================================

def get_part(question, current_part=None):

    value = get_first(
        question,
        [
            "part",
            "partNumber",
            "part_number",
        ],
        current_part,
    )

    return value


# ============================================================
# GROUP TEXT EXTRACTION
# ============================================================

def extract_group_context(group):

    """
    Lấy nội dung ngữ cảnh của group.

    Hỗ trợ các tên field thường gặp:
    transcript, passage, text, content, script...
    """

    if not isinstance(group, dict):
        return ""

    parts = []

    keys = [
        "title",
        "context",
        "passage",
        "transcript",
        "script",
        "text",
        "content",
        "conversation",
        "dialogue",
        "announcement",
        "notice",
        "email",
        "memo",
        "article",
    ]

    for key in keys:

        value = group.get(key)

        if isinstance(value, str) and value.strip():

            parts.append(value.strip())

    return "\n".join(parts)


# ============================================================
# GET GROUP ID / NUMBER
# ============================================================

def get_group_identifier(group, fallback):

    if not isinstance(group, dict):
        return fallback

    value = get_first(
        group,
        [
            "groupId",
            "group_id",
            "id",
            "groupNumber",
            "group_number",
            "number",
        ],
        fallback,
    )

    return value


# ============================================================
# EXTRACT QUESTIONS FROM FILE
# ============================================================

def extract_questions(data):

    """
    Cố gắng hỗ trợ các cấu trúc JSON phổ biến:

    {
        "questions": [...]
    }

    hoặc:

    {
        "parts": [
            {
                "part": 1,
                "questions": [...]
            }
        ]
    }

    hoặc:

    {
        "parts": [
            {
                "part": 3,
                "groups": [
                    {
                        "questions": [...]
                    }
                ]
            }
        ]
    }
    """

    result = []

    # --------------------------------------------------------
    # CASE 1: questions trực tiếp
    # --------------------------------------------------------

    if isinstance(data, dict):

        questions = data.get("questions")

        if isinstance(questions, list):

            for index, question in enumerate(
                questions,
                start=1,
            ):

                if isinstance(question, dict):

                    result.append(
                        {
                            "question": question,
                            "part": get_part(question),
                            "group_context": "",
                            "group_id": "N/A",
                        }
                    )

            return result

    # --------------------------------------------------------
    # CASE 2: parts
    # --------------------------------------------------------

    parts = []

    if isinstance(data, dict):

        parts = data.get("parts", [])

    elif isinstance(data, list):

        parts = data

    if not isinstance(parts, list):
        return result

    # --------------------------------------------------------

    for part_index, part_data in enumerate(
        parts,
        start=1,
    ):

        if not isinstance(part_data, dict):
            continue

        part_number = get_part(
            part_data,
            part_index,
        )

        # ====================================================
        # Questions trực tiếp trong part
        # ====================================================

        questions = part_data.get(
            "questions",
            [],
        )

        if isinstance(questions, list):

            for question in questions:

                if not isinstance(question, dict):
                    continue

                result.append(
                    {
                        "question": question,
                        "part": get_part(
                            question,
                            part_number,
                        ),
                        "group_context": "",
                        "group_id": "N/A",
                    }
                )

        # ====================================================
        # Groups
        # ====================================================

        groups = part_data.get(
            "groups",
            []
        )

        if not isinstance(groups, list):
            continue

        for group_index, group in enumerate(
            groups,
            start=1,
        ):

            if not isinstance(group, dict):
                continue

            group_id = get_group_identifier(
                group,
                group_index,
            )

            group_context = extract_group_context(
                group
            )

            group_questions = group.get(
                "questions",
                [],
            )

            if not isinstance(
                group_questions,
                list,
            ):
                continue

            for question in group_questions:

                if not isinstance(question, dict):
                    continue

                result.append(
                    {
                        "question": question,
                        "part": get_part(
                            question,
                            part_number,
                        ),
                        "group_context": group_context,
                        "group_id": group_id,
                    }
                )

    return result


# ============================================================
# MAKE DUPLICATE SIGNATURE
# ============================================================

def make_signature(item):

    question = item["question"]

    part = str(item["part"])

    question_text = normalize_text(
        get_question_text(question)
    )

    option_signature = make_option_signature(
        question
    )

    group_context = normalize_text(
        item.get("group_context", "")
    )

    # --------------------------------------------------------
    # PART 1 / PART 2 / PART 5
    # --------------------------------------------------------
    #
    # Các part này không phụ thuộc passage/group.
    #
    # --------------------------------------------------------

    if part in {"1", "2", "5"}:

        return (
            part,
            question_text,
            option_signature,
        )

    # --------------------------------------------------------
    # PART 3 / 4 / 6 / 7
    # --------------------------------------------------------
    #
    # Phải bao gồm group context.
    #
    # --------------------------------------------------------

    return (
        part,
        group_context,
        question_text,
        option_signature,
    )


# ============================================================
# LOAD ALL FILES
# ============================================================

def load_all_questions():

    all_questions = []

    files = sorted(
        TESTS_DIR.glob("test*.json")
    )

    print("=" * 75)
    print("KIỂM TRA TRÙNG CÂU HỎI")
    print("=" * 75)

    print(
        f"Thư mục : {TESTS_DIR}"
    )

    print(
        f"Số file : {len(files)}"
    )

    print()

    for file_path in files:

        try:

            with open(
                file_path,
                "r",
                encoding="utf-8",
            ) as f:

                data = json.load(f)

        except Exception as e:

            print(
                f"❌ Lỗi đọc {file_path.name}: {e}"
            )

            continue

        questions = extract_questions(
            data
        )

        for index, item in enumerate(
            questions,
            start=1,
        ):

            question = item["question"]

            question_number = (
                get_question_number(
                    question,
                    index,
                )
            )

            correct_answer = (
                get_correct_answer(
                    question
                )
            )

            options = get_options(
                question
            )

            all_questions.append(
                {
                    "file": file_path.name,
                    "path": str(file_path),
                    "part": item["part"],
                    "question_number": question_number,
                    "group_id": item[
                        "group_id"
                    ],
                    "group_context": item[
                        "group_context"
                    ],
                    "question_text": (
                        get_question_text(
                            question
                        )
                    ),
                    "correct_answer": (
                        correct_answer
                    ),
                    "options": options,
                    "signature": make_signature(
                        item
                    ),
                }
            )

    return all_questions


# ============================================================
# FIND DUPLICATES
# ============================================================

def find_duplicates(questions):

    groups = defaultdict(list)

    for question in questions:

        groups[
            question["signature"]
        ].append(question)

    duplicates = {}

    for signature, items in groups.items():

        if len(items) > 1:

            duplicates[
                signature
            ] = items

    return duplicates


# ============================================================
# PRINT ONE DUPLICATE GROUP
# ============================================================

def print_duplicate_group(
    index,
    items,
):

    print()
    print("=" * 75)
    print(
        f"❌ NHÓM TRÙNG #{index}"
    )
    print("=" * 75)

    first = items[0]

    print()
    print(
        f"PART: {first['part']}"
    )

    print()
    print(
        "QUESTION:"
    )

    print(
        first["question_text"]
    )

    # --------------------------------------------------------
    # GROUP CONTEXT
    # --------------------------------------------------------

    if first["group_context"]:

        print()
        print(
            "GROUP CONTEXT:"
        )

        context = first[
            "group_context"
        ]

        if len(context) > 1000:

            context = (
                context[:1000]
                + "..."
            )

        print(context)

    # --------------------------------------------------------
    # OPTIONS
    # --------------------------------------------------------

    print()
    print(
        "OPTIONS:"
    )

    for label, text in first[
        "options"
    ]:

        if label:

            print(
                f"  {label.upper()}: {text}"
            )

        else:

            print(
                f"  - {text}"
            )

    print()
    print(
        f"CORRECT: "
        f"{first['correct_answer']}"
    )

    # --------------------------------------------------------
    # LOCATIONS
    # --------------------------------------------------------

    print()
    print(
        "XUẤT HIỆN TẠI:"
    )

    for i, item in enumerate(
        items,
        start=1,
    ):

        print()

        print(
            f"  [{i}] "
            f"{item['file']}"
        )

        print(
            f"      Part     : "
            f"{item['part']}"
        )

        print(
            f"      Question : "
            f"{item['question_number']}"
        )

        print(
            f"      Group    : "
            f"{item['group_id']}"
        )

        print(
            f"      Path     : "
            f"{item['path']}"
        )


# ============================================================
# SAVE REPORT
# ============================================================

def save_report(
    duplicates,
):

    with open(
        REPORT_FILE,
        "w",
        encoding="utf-8",
    ) as f:

        f.write(
            "BÁO CÁO TRÙNG CÂU HỎI TOEIC\n"
        )

        f.write(
            "=" * 75
        )

        f.write("\n\n")

        if not duplicates:

            f.write(
                "KHÔNG PHÁT HIỆN CÂU HỎI TRÙNG.\n"
            )

            return

        f.write(
            f"Số nhóm trùng: "
            f"{len(duplicates)}\n\n"
        )

        for index, items in enumerate(
            duplicates.values(),
            start=1,
        ):

            first = items[0]

            f.write(
                "=" * 75
            )

            f.write("\n")

            f.write(
                f"NHÓM TRÙNG #{index}\n"
            )

            f.write(
                "=" * 75
            )

            f.write("\n\n")

            f.write(
                f"PART: {first['part']}\n"
            )

            f.write(
                f"QUESTION:\n"
            )

            f.write(
                first["question_text"]
            )

            f.write("\n\n")

            if first[
                "group_context"
            ]:

                f.write(
                    "GROUP CONTEXT:\n"
                )

                f.write(
                    first[
                        "group_context"
                    ]
                )

                f.write("\n\n")

            f.write(
                "OPTIONS:\n"
            )

            for label, text in first[
                "options"
            ]:

                f.write(
                    f"{label.upper()}: "
                    f"{text}\n"
                )

            f.write("\n")

            f.write(
                f"CORRECT: "
                f"{first['correct_answer']}\n"
            )

            f.write("\n")

            f.write(
                "XUẤT HIỆN TẠI:\n"
            )

            for item in items:

                f.write(
                    f"- FILE: "
                    f"{item['file']}\n"
                )

                f.write(
                    f"  PART: "
                    f"{item['part']}\n"
                )

                f.write(
                    f"  QUESTION: "
                    f"{item['question_number']}\n"
                )

                f.write(
                    f"  GROUP: "
                    f"{item['group_id']}\n"
                )

                f.write(
                    f"  PATH: "
                    f"{item['path']}\n"
                )

                f.write("\n")

    print()
    print(
        f"📄 Báo cáo đã lưu:"
    )

    print(
        REPORT_FILE
    )


# ============================================================
# MAIN
# ============================================================

def main():

    if not TESTS_DIR.exists():

        print(
            "❌ Không tìm thấy thư mục:"
        )

        print(
            TESTS_DIR
        )

        return

    questions = load_all_questions()

    print(
        f"Đã đọc: "
        f"{len(questions)} câu hỏi"
    )

    duplicates = find_duplicates(
        questions
    )

    print()
    print("=" * 75)
    print("TỔNG KẾT")
    print("=" * 75)

    print(
        f"Tổng câu hỏi : "
        f"{len(questions)}"
    )

    print(
        f"Nhóm bị trùng: "
        f"{len(duplicates)}"
    )

    total_duplicate_occurrences = sum(
        len(items)
        for items in duplicates.values()
    )

    print(
        f"Câu nằm trong nhóm trùng: "
        f"{total_duplicate_occurrences}"
    )

    # --------------------------------------------------------
    # PRINT DETAILS
    # --------------------------------------------------------

    if duplicates:

        print()

        for index, items in enumerate(
            duplicates.values(),
            start=1,
        ):

            print_duplicate_group(
                index,
                items,
            )

        print()

        print(
            "=" * 75
        )

        print(
            "⚠️ PHÁT HIỆN CÂU HỎI TRÙNG."
        )

        print(
            "Chỉ cần sửa các group được "
            "liệt kê trong báo cáo."
        )

    else:

        print()

        print(
            "🎉 KHÔNG PHÁT HIỆN CÂU HỎI TRÙNG!"
        )

        print(
            "Có thể chuyển sang bước import."
        )

    print()

    print(
        "=" * 75
    )

    save_report(
        duplicates
    )


if __name__ == "__main__":
    main()