import json
import psycopg2
from pathlib import Path


# ============================================================
# CONFIG DATABASE
# ============================================================

DB_HOST = "localhost"
DB_PORT = 5433
DB_NAME = "toeic_ai"
DB_USER = "postgres"
DB_PASSWORD = "123"


# ============================================================
# CONFIG FILE
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
JSON_FILE = BASE_DIR / "part7_scripts.json"

PART = 7

OPTIONS = ["A", "B", "C", "D"]


# ============================================================
# EXPECTED DATA
# ============================================================

SINGLE_TOTAL = 50
DOUBLE_TOTAL = 25
TRIPLE_TOTAL = 25

TOTAL_GROUPS = 100


# ============================================================
# LOAD JSON
# ============================================================

def load_json():

    print()
    print("==============================================")
    print(" IMPORT READING PART 7")
    print("==============================================")
    print()

    print(f"JSON : {JSON_FILE}")
    print(f"DB   : localhost:5433/toeic_ai")
    print()

    if not JSON_FILE.exists():
        raise FileNotFoundError(
            f"Không tìm thấy file JSON:\n{JSON_FILE}"
        )

    with open(JSON_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    return data


# ============================================================
# VALIDATE JSON
# ============================================================

def validate_json(data):

    if not isinstance(data, dict):
        raise ValueError(
            "JSON Part 7 phải là OBJECT."
        )

    single = data.get("single_passages")
    double = data.get("double_passages")
    triple = data.get("triple_passages")

    if not isinstance(single, list):
        raise ValueError(
            "single_passages phải là ARRAY."
        )

    if not isinstance(double, list):
        raise ValueError(
            "double_passages phải là ARRAY."
        )

    if not isinstance(triple, list):
        raise ValueError(
            "triple_passages phải là ARRAY."
        )

    if len(single) != SINGLE_TOTAL:
        raise ValueError(
            f"single_passages phải có {SINGLE_TOTAL} groups, "
            f"hiện tại có {len(single)}."
        )

    if len(double) != DOUBLE_TOTAL:
        raise ValueError(
            f"double_passages phải có {DOUBLE_TOTAL} groups, "
            f"hiện tại có {len(double)}."
        )

    if len(triple) != TRIPLE_TOTAL:
        raise ValueError(
            f"triple_passages phải có {TRIPLE_TOTAL} groups, "
            f"hiện tại có {len(triple)}."
        )

    print("Checking JSON...")
    print(
        f"JSON OK - "
        f"{len(single)} Single + "
        f"{len(double)} Double + "
        f"{len(triple)} Triple = "
        f"{TOTAL_GROUPS} groups."
    )

    # --------------------------------------------------------
    # SINGLE
    # --------------------------------------------------------

    for index, group in enumerate(single, start=1):

        validate_single_group(
            group,
            index
        )

    # --------------------------------------------------------
    # DOUBLE
    # --------------------------------------------------------

    for index, group in enumerate(double, start=1):

        validate_multiple_group(
            group,
            index,
            expected_passages=2
        )

    # --------------------------------------------------------
    # TRIPLE
    # --------------------------------------------------------

    for index, group in enumerate(triple, start=1):

        validate_multiple_group(
            group,
            index,
            expected_passages=3
        )

    print("Validation OK.")
    print()


# ============================================================
# VALIDATE SINGLE
# ============================================================

def validate_single_group(group, expected_group):

    if not isinstance(group, dict):
        raise ValueError(
            f"Single group {expected_group} không phải object."
        )

    if group.get("group") != expected_group:
        raise ValueError(
            f"Single group sai thứ tự: "
            f"expected {expected_group}, "
            f"got {group.get('group')}"
        )

    if not group.get("title"):
        raise ValueError(
            f"Single group {expected_group} thiếu title."
        )

    if not group.get("passage"):
        raise ValueError(
            f"Single group {expected_group} thiếu passage."
        )

    questions = group.get("questions")

    if not isinstance(questions, list):
        raise ValueError(
            f"Single group {expected_group}: "
            f"questions phải là array."
        )

    # Single Passage: 2-4 câu
    if len(questions) < 2 or len(questions) > 4:
        raise ValueError(
            f"Single group {expected_group} phải có "
            f"2-4 questions, hiện tại có {len(questions)}."
        )

    validate_questions(
        questions,
        expected_group,
        "Single"
    )


# ============================================================
# VALIDATE DOUBLE / TRIPLE
# ============================================================

def validate_multiple_group(
    group,
    expected_group,
    expected_passages
):

    passage_type = (
        "Double"
        if expected_passages == 2
        else "Triple"
    )

    if not isinstance(group, dict):
        raise ValueError(
            f"{passage_type} group {expected_group} "
            f"không phải object."
        )

    if group.get("group") != expected_group:
        raise ValueError(
            f"{passage_type} group sai thứ tự: "
            f"expected {expected_group}, "
            f"got {group.get('group')}"
        )

    if not group.get("title"):
        raise ValueError(
            f"{passage_type} group {expected_group} "
            f"thiếu title."
        )

    passages = group.get("passages")

    if not isinstance(passages, list):
        raise ValueError(
            f"{passage_type} group {expected_group}: "
            f"passages phải là array."
        )

    if len(passages) != expected_passages:
        raise ValueError(
            f"{passage_type} group {expected_group} phải có "
            f"{expected_passages} passages, "
            f"hiện tại có {len(passages)}."
        )

    for p_index, passage in enumerate(
        passages,
        start=1
    ):

        if not isinstance(passage, dict):
            raise ValueError(
                f"{passage_type} group {expected_group}: "
                f"passage {p_index} không hợp lệ."
            )

        if passage.get("passage_number") != p_index:
            raise ValueError(
                f"{passage_type} group {expected_group}: "
                f"passage_number phải là {p_index}."
            )

        if not passage.get("text"):
            raise ValueError(
                f"{passage_type} group {expected_group}: "
                f"passage {p_index} thiếu text."
            )

    questions = group.get("questions")

    if not isinstance(questions, list):
        raise ValueError(
            f"{passage_type} group {expected_group}: "
            f"questions phải là array."
        )

    if len(questions) != 5:
        raise ValueError(
            f"{passage_type} group {expected_group} phải có "
            f"5 questions, hiện tại có {len(questions)}."
        )

    validate_questions(
        questions,
        expected_group,
        passage_type
    )


# ============================================================
# VALIDATE QUESTIONS
# ============================================================

def validate_questions(
    questions,
    group_number,
    passage_type
):

    for q_index, question in enumerate(
        questions,
        start=1
    ):

        if not isinstance(question, dict):
            raise ValueError(
                f"{passage_type} group {group_number}: "
                f"question {q_index} không hợp lệ."
            )

        if question.get("question_number") != q_index:
            raise ValueError(
                f"{passage_type} group {group_number}: "
                f"question_number phải là {q_index}, "
                f"got {question.get('question_number')}"
            )

        if not question.get("question_text"):
            raise ValueError(
                f"{passage_type} group {group_number}, "
                f"question {q_index} thiếu question_text."
            )

        if not question.get("question_type"):
            raise ValueError(
                f"{passage_type} group {group_number}, "
                f"question {q_index} thiếu question_type."
            )

        if not question.get("knowledge"):
            raise ValueError(
                f"{passage_type} group {group_number}, "
                f"question {q_index} thiếu knowledge."
            )

        if not question.get("correct_answer"):
            raise ValueError(
                f"{passage_type} group {group_number}, "
                f"question {q_index} thiếu correct_answer."
            )

        if question["correct_answer"] not in OPTIONS:
            raise ValueError(
                f"{passage_type} group {group_number}, "
                f"question {q_index}: "
                f"correct_answer phải là A/B/C/D."
            )

        if not question.get("explanation"):
            raise ValueError(
                f"{passage_type} group {group_number}, "
                f"question {q_index} thiếu explanation."
            )

        options = question.get("options")

        if not isinstance(options, dict):
            raise ValueError(
                f"{passage_type} group {group_number}, "
                f"question {q_index}: "
                f"options phải là object."
            )

        for option_key in OPTIONS:

            if option_key not in options:
                raise ValueError(
                    f"{passage_type} group {group_number}, "
                    f"question {q_index}: "
                    f"thiếu option {option_key}."
                )

            if not options[option_key]:
                raise ValueError(
                    f"{passage_type} group {group_number}, "
                    f"question {q_index}: "
                    f"option {option_key} rỗng."
                )


# ============================================================
# GET STAGE
# ============================================================

def get_stage(
    passage_type,
    group_number
):

    # --------------------------------------------------------
    # SINGLE
    #
    # 001-010 -> Stage 1
    # 011-020 -> Stage 2
    # 021-030 -> Stage 3
    # 031-040 -> Stage 4
    # 041-050 -> Stage 5
    # --------------------------------------------------------

    if passage_type == "single":

        return (
            (group_number - 1) // 10
        ) + 1

    # --------------------------------------------------------
    # DOUBLE
    #
    # 001-005 -> Stage 1
    # 006-010 -> Stage 2
    # 011-015 -> Stage 3
    # 016-020 -> Stage 4
    # 021-025 -> Stage 5
    # --------------------------------------------------------

    if passage_type == "double":

        return (
            (group_number - 1) // 5
        ) + 1

    # --------------------------------------------------------
    # TRIPLE
    # --------------------------------------------------------

    if passage_type == "triple":

        return (
            (group_number - 1) // 5
        ) + 1

    raise ValueError(
        f"Unknown passage_type: {passage_type}"
    )


# ============================================================
# GET LESSON ID
# ============================================================

def get_lesson_id(
    cursor,
    stage
):

    """
    Part 7 có 5 lesson.

    Dựa vào dữ liệu DB hiện tại:

    Stage 1 -> display_order 11
    Stage 2 -> display_order 12
    Stage 3 -> display_order 13
    Stage 4 -> display_order 14
    Stage 5 -> display_order 15

    Không dùng group_number.
    """

    expected_display_order = 10 + stage

    cursor.execute(
        """
        SELECT id
        FROM reading_lessons
        WHERE part = %s
          AND display_order = %s
        LIMIT 1
        """,
        (
            PART,
            expected_display_order
        )
    )

    row = cursor.fetchone()

    if not row:

        raise ValueError(
            f"Không tìm thấy reading_lesson: "
            f"Part {PART}, "
            f"Stage {stage}, "
            f"display_order {expected_display_order}"
        )

    return row[0]


# ============================================================
# CREATE PASSAGE TEXT
# ============================================================

def build_passage_text(
    group_data,
    passage_type
):

    if passage_type == "single":

        return group_data["passage"]

    passages = group_data["passages"]

    result = []

    for passage in passages:

        number = passage["passage_number"]
        text = passage["text"]

        result.append(
            f"PASSAGE {number}\n{text}"
        )

    return "\n\n".join(result)


# ============================================================
# GET KNOWLEDGE
# ============================================================

def get_group_knowledge(
    group_data,
    passage_type
):

    if group_data.get("knowledge"):
        return group_data["knowledge"]

    if passage_type == "single":
        return "Đọc hiểu TOEIC Reading Part 7"

    if passage_type == "double":
        return "Đọc hiểu hai đoạn văn"

    if passage_type == "triple":
        return "Đọc hiểu ba đoạn văn"

    return "Đọc hiểu TOEIC Reading Part 7"


# ============================================================
# INSERT GROUP
# ============================================================

def insert_group(
    cursor,
    lesson_id,
    group_data,
    group_number,
    passage_type,
    display_order
):

    title = group_data["title"]

    passage = build_passage_text(
        group_data,
        passage_type
    )

    knowledge = get_group_knowledge(
        group_data,
        passage_type
    )

    # --------------------------------------------------------
    # IMPORTANT:
    #
    # group_number được reset riêng cho:
    # Single 1-50
    # Double 1-25
    # Triple 1-25
    #
    # Để tránh trùng group_number trong cùng lesson,
    # tìm theo lesson_id + title.
    # --------------------------------------------------------

    cursor.execute(
        """
        SELECT id
        FROM reading_lesson_groups
        WHERE lesson_id = %s
          AND title = %s
        LIMIT 1
        """,
        (
            lesson_id,
            title
        )
    )

    existing = cursor.fetchone()

    if existing:

        group_id = existing[0]

        cursor.execute(
            """
            UPDATE reading_lesson_groups
            SET
                part = %s,
                group_number = %s,
                title = %s,
                passage = %s,
                knowledge = %s,
                display_order = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            """,
            (
                PART,
                group_number,
                title,
                passage,
                knowledge,
                display_order,
                group_id
            )
        )

    else:

        cursor.execute(
            """
            INSERT INTO reading_lesson_groups
            (
                lesson_id,
                part,
                group_number,
                title,
                passage,
                knowledge,
                display_order
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )
            RETURNING id
            """,
            (
                lesson_id,
                PART,
                group_number,
                title,
                passage,
                knowledge,
                display_order
            )
        )

        group_id = cursor.fetchone()[0]

    return group_id


# ============================================================
# INSERT QUESTION
# ============================================================

def insert_question(
    cursor,
    group_id,
    question
):

    question_number = question["question_number"]

    cursor.execute(
        """
        SELECT id
        FROM reading_questions
        WHERE group_id = %s
          AND question_number = %s
        LIMIT 1
        """,
        (
            group_id,
            question_number
        )
    )

    existing = cursor.fetchone()

    if existing:

        question_id = existing[0]

        cursor.execute(
            """
            UPDATE reading_questions
            SET
                question_text = %s,
                question_type = %s,
                explanation = %s,
                knowledge = %s,
                correct_answer = %s,
                display_order = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            """,
            (
                question["question_text"],
                question["question_type"],
                question["explanation"],
                question["knowledge"],
                question["correct_answer"],
                question_number,
                question_id
            )
        )

    else:

        cursor.execute(
            """
            INSERT INTO reading_questions
            (
                group_id,
                question_number,
                question_text,
                question_type,
                explanation,
                knowledge,
                correct_answer,
                display_order
            )
            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )
            RETURNING id
            """,
            (
                group_id,
                question_number,
                question["question_text"],
                question["question_type"],
                question["explanation"],
                question["knowledge"],
                question["correct_answer"],
                question_number
            )
        )

        question_id = cursor.fetchone()[0]

    return question_id


# ============================================================
# INSERT OPTIONS
# ============================================================

def insert_options(
    cursor,
    question_id,
    question
):

    options = question["options"]

    correct_answer = question["correct_answer"]

    for index, option_key in enumerate(
        OPTIONS,
        start=1
    ):

        option_text = options[option_key]

        is_correct = (
            option_key == correct_answer
        )

        cursor.execute(
            """
            SELECT id
            FROM reading_options
            WHERE question_id = %s
              AND option_key = %s
            LIMIT 1
            """,
            (
                question_id,
                option_key
            )
        )

        existing = cursor.fetchone()

        if existing:

            cursor.execute(
                """
                UPDATE reading_options
                SET
                    option_text = %s,
                    is_correct = %s,
                    display_order = %s
                WHERE id = %s
                """,
                (
                    option_text,
                    is_correct,
                    index,
                    existing[0]
                )
            )

        else:

            cursor.execute(
                """
                INSERT INTO reading_options
                (
                    question_id,
                    option_key,
                    option_text,
                    is_correct,
                    display_order
                )
                VALUES
                (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s
                )
                """,
                (
                    question_id,
                    option_key,
                    option_text,
                    is_correct,
                    index
                )
            )


# ============================================================
# IMPORT PASSAGE TYPE
# ============================================================

def import_passage_type(
    cursor,
    lesson_ids,
    groups,
    passage_type
):

    type_label = {
        "single": "SINGLE",
        "double": "DOUBLE",
        "triple": "TRIPLE"
    }[passage_type]

    print()
    print("----------------------------------------------")
    print(f" IMPORT {type_label} PASSAGES")
    print("----------------------------------------------")

    for group_data in groups:

        group_number = group_data["group"]

        stage = get_stage(
            passage_type,
            group_number
        )

        lesson_id = lesson_ids[stage]

        # ----------------------------------------------------
        # Display order
        #
        # Chỉ dùng để sắp xếp trong lesson.
        #
        # Single:
        # 1-10
        #
        # Double:
        # 11-15
        #
        # Triple:
        # 16-20
        # ----------------------------------------------------

        if passage_type == "single":

            display_order = group_number

        elif passage_type == "double":

            display_order = (
                10 + group_number
            )

        else:

            display_order = (
                35 + group_number
            )

        group_id = insert_group(
            cursor,
            lesson_id,
            group_data,
            group_number,
            passage_type,
            display_order
        )

        for question in group_data["questions"]:

            question_id = insert_question(
                cursor,
                group_id,
                question
            )

            insert_options(
                cursor,
                question_id,
                question
            )

        print(
            f"[OK] "
            f"{type_label} "
            f"Group {group_number:03d} "
            f"| Stage {stage} "
            f"| Lesson ID {lesson_id} "
            f"| {len(group_data['questions'])} questions"
        )


# ============================================================
# MAIN
# ============================================================

def main():

    connection = None
    cursor = None

    try:

        # ----------------------------------------------------
        # LOAD
        # ----------------------------------------------------

        data = load_json()

        # ----------------------------------------------------
        # VALIDATE
        # ----------------------------------------------------

        validate_json(data)

        # ----------------------------------------------------
        # CONNECT
        # ----------------------------------------------------

        connection = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )

        connection.autocommit = False

        cursor = connection.cursor()

        print("Database connected.")
        print()

        # ----------------------------------------------------
        # LESSONS
        # ----------------------------------------------------

        print("Checking Part 7 lessons...")
        print()

        lesson_ids = {}

        for stage in range(1, 6):

            lesson_id = get_lesson_id(
                cursor,
                stage
            )

            lesson_ids[stage] = lesson_id

            print(
                f"[LESSON] "
                f"Part 7 | "
                f"Stage {stage} | "
                f"Lesson ID {lesson_id} | "
                f"display_order {10 + stage}"
            )

        print()

        # ----------------------------------------------------
        # IMPORT SINGLE
        # ----------------------------------------------------

        import_passage_type(
            cursor,
            lesson_ids,
            data["single_passages"],
            "single"
        )

        # ----------------------------------------------------
        # IMPORT DOUBLE
        # ----------------------------------------------------

        import_passage_type(
            cursor,
            lesson_ids,
            data["double_passages"],
            "double"
        )

        # ----------------------------------------------------
        # IMPORT TRIPLE
        # ----------------------------------------------------

        import_passage_type(
            cursor,
            lesson_ids,
            data["triple_passages"],
            "triple"
        )

        # ----------------------------------------------------
        # COMMIT
        # ----------------------------------------------------

        connection.commit()

        # ----------------------------------------------------
        # SUMMARY
        # ----------------------------------------------------

        single_questions = sum(
            len(x["questions"])
            for x in data["single_passages"]
        )

        double_questions = sum(
            len(x["questions"])
            for x in data["double_passages"]
        )

        triple_questions = sum(
            len(x["questions"])
            for x in data["triple_passages"]
        )

        total_questions = (
            single_questions
            + double_questions
            + triple_questions
        )

        print()
        print("==============================================")
        print(" IMPORT SUCCESS")
        print("==============================================")
        print()

        print("Part              : 7")
        print()
        print(
            f"Single passages   : "
            f"{len(data['single_passages'])}"
        )
        print(
            f"Double passages   : "
            f"{len(data['double_passages'])}"
        )
        print(
            f"Triple passages   : "
            f"{len(data['triple_passages'])}"
        )
        print(
            f"Total groups      : "
            f"{TOTAL_GROUPS}"
        )
        print()
        print(
            f"Single questions  : "
            f"{single_questions}"
        )
        print(
            f"Double questions  : "
            f"{double_questions}"
        )
        print(
            f"Triple questions  : "
            f"{triple_questions}"
        )
        print(
            f"Total questions   : "
            f"{total_questions}"
        )
        print()

        print("Stage distribution:")
        print()
        print("Stage 1:")
        print("  Single 001-010")
        print("  Double 001-005")
        print("  Triple 001-005")
        print()
        print("Stage 2:")
        print("  Single 011-020")
        print("  Double 006-010")
        print("  Triple 006-010")
        print()
        print("Stage 3:")
        print("  Single 021-030")
        print("  Double 011-015")
        print("  Triple 011-015")
        print()
        print("Stage 4:")
        print("  Single 031-040")
        print("  Double 016-020")
        print("  Triple 016-020")
        print()
        print("Stage 5:")
        print("  Single 041-050")
        print("  Double 021-025")
        print("  Triple 021-025")
        print()

    except Exception as e:

        print()
        print("==============================================")
        print(" IMPORT ERROR")
        print("==============================================")
        print()
        print(str(e))
        print()

        if connection:
            connection.rollback()

        raise

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    main()