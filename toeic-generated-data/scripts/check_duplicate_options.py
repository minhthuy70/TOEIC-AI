import json
import re
from pathlib import Path


# ============================================================
# CẤU HÌNH ĐƯỜNG DẪN
# ============================================================

# Thư mục scripts/
SCRIPT_DIR = Path(__file__).resolve().parent

# Thư mục toeic-generated-data/data/tests/
DATA_DIR = SCRIPT_DIR.parent / "data" / "tests"


# ============================================================
# CHUẨN HÓA TEXT
# ============================================================

def normalize_text(text):
    """
    Chuẩn hóa nội dung option để phát hiện trùng nhau.

    Ví dụ:
        "The correct answer"
        " the correct answer "
        "THE   CORRECT ANSWER"

    đều được xem là giống nhau.
    """

    if text is None:
        return ""

    text = str(text).strip().lower()

    # Gom nhiều khoảng trắng thành 1
    text = re.sub(r"\s+", " ", text)

    return text


# ============================================================
# KIỂM TRA 1 FILE JSON
# ============================================================

def check_test(file_path):

    print("\n" + "=" * 70)
    print(f"FILE: {file_path.name}")
    print("=" * 70)

    # --------------------------------------------------------
    # Đọc JSON
    # --------------------------------------------------------

    try:
        with open(
            file_path,
            "r",
            encoding="utf-8-sig"
        ) as f:

            data = json.load(f)

    except Exception as e:

        print(f"❌ LỖI ĐỌC JSON: {e}")

        return {
            "total_questions": 0,
            "duplicate_questions": 0,
            "invalid_questions": 1,
            "problems": 1
        }

    total_questions = 0
    duplicate_questions = 0
    invalid_questions = 0

    problems = []

    # --------------------------------------------------------
    # Lấy question_groups
    # --------------------------------------------------------

    question_groups = data.get("question_groups", [])

    if not isinstance(question_groups, list):

        print("❌ question_groups không phải array")

        return {
            "total_questions": 0,
            "duplicate_questions": 0,
            "invalid_questions": 1,
            "problems": 1
        }

    # ========================================================
    # DUYỆT GROUP
    # ========================================================

    for group in question_groups:

        part = group.get("part")

        questions = group.get("questions", [])

        if not isinstance(questions, list):

            invalid_questions += 1

            problems.append({
                "part": part,
                "question": "?",
                "type": "SAI CẤU TRÚC",
                "details": "questions không phải array"
            })

            continue

        # ====================================================
        # DUYỆT QUESTION
        # ====================================================

        for question in questions:

            total_questions += 1

            question_number = question.get(
                "question_number"
            )

            correct_answer = str(
                question.get(
                    "correct_answer",
                    ""
                )
            ).strip().upper()

            options = question.get(
                "options",
                []
            )

            # =================================================
            # 1. KIỂM TRA ĐỦ 4 OPTION
            # =================================================

            if not isinstance(options, list):

                invalid_questions += 1

                problems.append({
                    "part": part,
                    "question": question_number,
                    "type": "SAI CẤU TRÚC OPTION",
                    "details": "options không phải array"
                })

                continue

            if len(options) != 4:

                invalid_questions += 1

                problems.append({
                    "part": part,
                    "question": question_number,
                    "type": "THIẾU/SAI SỐ OPTION",
                    "details": (
                        f"Có {len(options)} option "
                        f"(cần đúng 4)"
                    )
                })

                continue

            # =================================================
            # 2. KIỂM TRA LABEL A/B/C/D
            # =================================================

            labels = []

            for option in options:

                label = str(
                    option.get(
                        "option_label",
                        ""
                    )
                ).strip().upper()

                labels.append(label)

            expected_labels = [
                "A",
                "B",
                "C",
                "D"
            ]

            if sorted(labels) != sorted(
                expected_labels
            ):

                invalid_questions += 1

                problems.append({
                    "part": part,
                    "question": question_number,
                    "type": "SAI LABEL OPTION",
                    "details": (
                        f"Labels hiện tại: {labels}; "
                        f"cần A, B, C, D"
                    )
                })

            # =================================================
            # 3. KIỂM TRA TRÙNG NỘI DUNG OPTION
            # =================================================

            text_map = {}

            for option in options:

                label = str(
                    option.get(
                        "option_label",
                        ""
                    )
                ).strip().upper()

                option_text = normalize_text(
                    option.get(
                        "option_text",
                        ""
                    )
                )

                if option_text not in text_map:

                    text_map[option_text] = []

                text_map[option_text].append(
                    label
                )

            # Tìm text xuất hiện >= 2 lần
            duplicates = {
                text: labels
                for text, labels in text_map.items()
                if len(labels) > 1
            }

            if duplicates:

                duplicate_questions += 1

                duplicate_details = []

                for text, duplicate_labels in duplicates.items():

                    duplicate_details.append(
                        f'{",".join(duplicate_labels)} = "{text}"'
                    )

                problems.append({
                    "part": part,
                    "question": question_number,
                    "type": "TRÙNG OPTION",
                    "details": " | ".join(
                        duplicate_details
                    )
                })

            # =================================================
            # 4. KIỂM TRA ĐÁP ÁN ĐÚNG
            # =================================================

            if correct_answer not in expected_labels:

                invalid_questions += 1

                problems.append({
                    "part": part,
                    "question": question_number,
                    "type": "SAI ĐÁP ÁN",
                    "details": (
                        f"CORRECT = {correct_answer}; "
                        f"phải là A/B/C/D"
                    )
                })

            elif correct_answer not in labels:

                invalid_questions += 1

                problems.append({
                    "part": part,
                    "question": question_number,
                    "type": "KHÔNG TÌM THẤY ĐÁP ÁN",
                    "details": (
                        f"CORRECT = {correct_answer}, "
                        f"nhưng không có option "
                        f"tương ứng"
                    )
                })

    # ========================================================
    # KẾT QUẢ FILE
    # ========================================================

    print(
        f"Tổng câu hỏi        : {total_questions}"
    )

    print(
        f"Câu bị trùng option : {duplicate_questions}"
    )

    print(
        f"Câu không hợp lệ    : {invalid_questions}"
    )

    # ========================================================
    # IN CHI TIẾT LỖI
    # ========================================================

    if not problems:

        print()
        print("✅ KHÔNG PHÁT HIỆN LỖI")
        print(
            "Tất cả câu hỏi đều có 4 option "
            "khác nhau."
        )

    else:

        print()
        print("❌ PHÁT HIỆN LỖI:")
        print()

        for problem in problems:

            print(
                f"PART {problem['part']} | "
                f"QUESTION {problem['question']} | "
                f"{problem['type']}"
            )

            print(
                f"  {problem['details']}"
            )

            print()

    return {
        "total_questions": total_questions,
        "duplicate_questions": duplicate_questions,
        "invalid_questions": invalid_questions,
        "problems": len(problems)
    }


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("=" * 70)
    print("KIỂM TRA TRÙNG OPTION TOÀN BỘ TEST")
    print("=" * 70)

    print()
    print(
        f"Thư mục dữ liệu: {DATA_DIR}"
    )

    # --------------------------------------------------------
    # Kiểm tra thư mục
    # --------------------------------------------------------

    if not DATA_DIR.exists():

        print()
        print(
            "❌ KHÔNG TÌM THẤY THƯ MỤC:"
        )

        print(DATA_DIR)

        return

    # --------------------------------------------------------
    # Lấy toàn bộ test JSON
    # --------------------------------------------------------

    test_files = list(
        DATA_DIR.glob("test*.json")
    )

    # Sắp xếp đúng thứ tự test001, test002...
    test_files.sort(
        key=lambda p: p.name.lower()
    )

    if not test_files:

        print()
        print(
            "❌ KHÔNG TÌM THẤY FILE test*.json"
        )

        return

    print()
    print(
        f"Tìm thấy {len(test_files)} file JSON"
    )

    # ========================================================
    # TỔNG
    # ========================================================

    total_questions = 0
    total_duplicate_questions = 0
    total_invalid_questions = 0
    files_with_errors = 0

    # ========================================================
    # CHECK TỪNG FILE
    # ========================================================

    for file_path in test_files:

        result = check_test(
            file_path
        )

        total_questions += (
            result["total_questions"]
        )

        total_duplicate_questions += (
            result["duplicate_questions"]
        )

        total_invalid_questions += (
            result["invalid_questions"]
        )

        if result["problems"] > 0:

            files_with_errors += 1

    # ========================================================
    # TỔNG KẾT
    # ========================================================

    print()
    print()
    print("=" * 70)
    print("TỔNG KẾT")
    print("=" * 70)

    print(
        f"Số file test              : "
        f"{len(test_files)}"
    )

    print(
        f"Tổng số câu hỏi           : "
        f"{total_questions}"
    )

    print(
        f"Câu bị trùng option       : "
        f"{total_duplicate_questions}"
    )

    print(
        f"Câu không hợp lệ          : "
        f"{total_invalid_questions}"
    )

    print(
        f"File có lỗi               : "
        f"{files_with_errors}"
    )

    # ========================================================
    # KẾT LUẬN
    # ========================================================

    print()

    if (
        total_duplicate_questions == 0
        and total_invalid_questions == 0
    ):

        print(
            "🎉 DỮ LIỆU SẠCH!"
        )

        print(
            "Có thể tiến hành import."
        )

    else:

        print(
            "⚠️ CHƯA NÊN IMPORT!"
        )

        print(
            "Hãy sửa các file có lỗi trước."
        )

    print("=" * 70)
    print()


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    main()