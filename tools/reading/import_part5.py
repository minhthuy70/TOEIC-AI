import json
import psycopg2
from pathlib import Path


# ============================================================
# CONFIG
# ============================================================

DB_HOST = "localhost"
DB_PORT = 5433
DB_NAME = "toeic_ai"
DB_USER = "postgres"
DB_PASSWORD = "123"


# ============================================================
# PATH
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

JSON_FILE = BASE_DIR / "part5_scripts.json"


# ============================================================
# LOAD JSON
# ============================================================

def load_scripts():

    print("Checking JSON...")

    if not JSON_FILE.exists():
        raise FileNotFoundError(
            f"Không tìm thấy file:\n{JSON_FILE}"
        )

    with open(
        JSON_FILE,
        "r",
        encoding="utf-8-sig"
    ) as f:

        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError(
            "JSON phải có cấu trúc ARRAY."
        )

    print(
        f"JSON OK - {len(data)} groups."
    )

    return data


# ============================================================
# VALIDATE GROUP
# ============================================================

def validate_group(item):

    required_fields = [
        "group",
        "title",
        "knowledge",
        "question"
    ]

    for field in required_fields:

        if field not in item:

            raise ValueError(
                f"Group {item.get('group')}: "
                f"thiếu field '{field}'."
            )

    question = item["question"]

    required_question_fields = [
        "question_number",
        "question_text",
        "question_type",
        "knowledge",
        "correct_answer",
        "explanation",
        "options"
    ]

    for field in required_question_fields:

        if field not in question:

            raise ValueError(
                f"Group {item['group']}: "
                f"question thiếu '{field}'."
            )

    options = question["options"]

    for key in ["A", "B", "C", "D"]:

        if key not in options:

            raise ValueError(
                f"Group {item['group']}, "
                f"Question "
                f"{question['question_number']}: "
                f"thiếu option {key}."
            )

    correct_answer = question["correct_answer"]

    if correct_answer not in [
        "A",
        "B",
        "C",
        "D"
    ]:

        raise ValueError(
            f"Group {item['group']}: "
            f"correct_answer không hợp lệ: "
            f"{correct_answer}"
        )


# ============================================================
# GET STAGE
# ============================================================

def get_stage(group_number):

    if 1 <= group_number <= 20:

        return 1

    elif 21 <= group_number <= 40:

        return 2

    elif 41 <= group_number <= 60:

        return 3

    elif 61 <= group_number <= 80:

        return 4

    elif 81 <= group_number <= 100:

        return 5

    else:

        raise ValueError(
            f"Group {group_number} "
            f"không hợp lệ. "
            f"Phải từ 1 đến 100."
        )


# ============================================================
# FIND PART 5 LESSON
# ============================================================

def get_lesson_id(cursor, stage):

    """
    Part 5 có 5 lesson:

    Stage 1 -> reading_lessons display_order = 1
    Stage 2 -> display_order = 2
    Stage 3 -> display_order = 3
    Stage 4 -> display_order = 4
    Stage 5 -> display_order = 5
    """

    cursor.execute(
        """
        SELECT id
        FROM reading_lessons
        WHERE part = 5
          AND display_order = %s
        LIMIT 1
        """,
        (stage,)
    )

    row = cursor.fetchone()

    if not row:

        raise ValueError(
            f"Không tìm thấy reading_lesson "
            f"Part 5 - Stage {stage} "
            f"(display_order = {stage})."
        )

    return row[0]


# ============================================================
# INSERT GROUP
# ============================================================

def insert_group(
    cursor,
    lesson_id,
    group_number,
    title,
    knowledge
):

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
            NULL,
            %s,
            %s
        )
        RETURNING id
        """,
        (
            lesson_id,
            5,
            group_number,
            title,
            knowledge,
            group_number
        )
    )

    row = cursor.fetchone()

    return row[0]


# ============================================================
# INSERT QUESTION
# ============================================================

def insert_question(
    cursor,
    group_id,
    question
):

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
            question["question_number"],
            question["question_text"],
            question["question_type"],
            question["explanation"],
            question["knowledge"],
            question["correct_answer"],
            question["question_number"]
        )
    )

    row = cursor.fetchone()

    return row[0]


# ============================================================
# INSERT OPTIONS
# ============================================================

def insert_options(
    cursor,
    question_id,
    options,
    correct_answer
):

    option_keys = [
        "A",
        "B",
        "C",
        "D"
    ]

    for display_order, key in enumerate(
        option_keys,
        start=1
    ):

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
                key,
                options[key],
                key == correct_answer,
                display_order
            )
        )


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("# IMPORT READING PART 5")
    print()

    print(
        f"JSON : {JSON_FILE}"
    )

    print(
        f"DB   : "
        f"{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )

    print()

    # --------------------------------------------------------
    # LOAD JSON
    # --------------------------------------------------------

    scripts = load_scripts()

    # --------------------------------------------------------
    # CHECK 100 GROUPS
    # --------------------------------------------------------

    if len(scripts) != 100:

        raise ValueError(
            f"Part 5 phải có đúng 100 groups. "
            f"Hiện tại có {len(scripts)}."
        )

    # --------------------------------------------------------
    # VALIDATE
    # --------------------------------------------------------

    for item in scripts:

        validate_group(item)

    print("Validation OK.")
    print()

    # --------------------------------------------------------
    # CONNECT DATABASE
    # --------------------------------------------------------

    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )

    cursor = conn.cursor()

    # --------------------------------------------------------
    # COUNTERS
    # --------------------------------------------------------

    inserted_groups = 0
    inserted_questions = 0
    inserted_options = 0

    try:

        # ====================================================
        # IMPORT
        # ====================================================

        for item in scripts:

            group_number = item["group"]

            stage = get_stage(
                group_number
            )

            # ------------------------------------------------
            # FIND LESSON
            # ------------------------------------------------

            lesson_id = get_lesson_id(
                cursor,
                stage
            )

            # ------------------------------------------------
            # INSERT GROUP
            # ------------------------------------------------

            group_id = insert_group(
                cursor=cursor,
                lesson_id=lesson_id,
                group_number=group_number,
                title=item["title"],
                knowledge=item["knowledge"]
            )

            inserted_groups += 1

            # ------------------------------------------------
            # INSERT QUESTION
            # ------------------------------------------------

            question = item["question"]

            question_id = insert_question(
                cursor=cursor,
                group_id=group_id,
                question=question
            )

            inserted_questions += 1

            # ------------------------------------------------
            # INSERT OPTIONS
            # ------------------------------------------------

            insert_options(
                cursor=cursor,
                question_id=question_id,
                options=question["options"],
                correct_answer=question["correct_answer"]
            )

            inserted_options += 4

            # ------------------------------------------------
            # LOG
            # ------------------------------------------------

            print(
                f"[OK] "
                f"Group {group_number:03d} "
                f"| Stage {stage} "
                f"| Lesson ID {lesson_id}"
            )

        # ====================================================
        # COMMIT
        # ====================================================

        conn.commit()

        print()
        print("=" * 60)
        print("IMPORT SUCCESS")
        print("=" * 60)

        print(
            f"Groups    : {inserted_groups}"
        )

        print(
            f"Questions : {inserted_questions}"
        )

        print(
            f"Options   : {inserted_options}"
        )

        print()

    except Exception as e:

        conn.rollback()

        print()
        print("=" * 60)
        print("IMPORT FAILED - ROLLBACK")
        print("=" * 60)

        print(
            f"Error: {e}"
        )

        print()

        raise

    finally:

        cursor.close()
        conn.close()


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    main()