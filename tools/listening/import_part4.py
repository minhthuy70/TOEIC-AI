import json
from pathlib import Path

import psycopg2
from psycopg2.extras import RealDictCursor


# ============================================================
# CONFIG
# ============================================================

from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]

# ============================================================
# PART 4 DATA
# ============================================================

# JSON:
# D:\CNTT2311\HK8\DOAN3\toeic-ai\tools\listening\part4_scripts.json

JSON_FILE = (
    PROJECT_ROOT
    / "tools"
    / "listening"
    / "part4_scripts.json"
)

# AUDIO:
# D:\CNTT2311\HK8\DOAN3\toeic-ai\output\listening\part4\dataset01

AUDIO_DIR = (
    PROJECT_ROOT
    / "output"
    / "listening"
    / "part4"
    / "dataset01"
)

# ------------------------------------------------------------
# PostgreSQL
# ------------------------------------------------------------

DB_HOST = "localhost"
DB_PORT = 5433
DB_NAME = "toeic_ai"
DB_USER = "postgres"
DB_PASSWORD = "123"

# ------------------------------------------------------------
# Part 4 lessons
#
# 4  = Part 4 - Talks 01 -> Stage 1
# 8  = Part 4 - Talks 02 -> Stage 2
# 12 = Part 4 - Talks 03 -> Stage 3
# 16 = Part 4 - Talks 04 -> Stage 4
# 20 = Part 4 - Talks 05 -> Stage 5
# ------------------------------------------------------------

LESSON_IDS = {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
}

PART = 4

AUDIO_BASE_URL = "/listening/part4/dataset01"


# ============================================================
# DATABASE
# ============================================================

def get_connection():

    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
    )


# ============================================================
# LOAD JSON
# ============================================================

def load_scripts():

    if not JSON_FILE.exists():

        raise FileNotFoundError(
            f"Không tìm thấy file:\n{JSON_FILE}"
        )

    with open(
        JSON_FILE,
        "r",
        encoding="utf-8",
    ) as f:

        data = json.load(f)

    if not isinstance(data, list):

        raise ValueError(
            "part4_scripts.json phải là JSON array."
        )

    if len(data) != 100:

        raise ValueError(
            f"Expected 100 groups, "
            f"but found {len(data)}"
        )

    return data


# ============================================================
# VALIDATE GROUP
# ============================================================

def validate_group(item):

    if "group" not in item:

        raise ValueError(
            "Group thiếu field 'group'."
        )

    group_number = item["group"]

    if group_number < 1 or group_number > 100:

        raise ValueError(
            f"Group {group_number}: "
            "group phải nằm trong 1-100."
        )

    # --------------------------------------------------------
    # Monologue
    # --------------------------------------------------------

    if "monologue" not in item:

        raise ValueError(
            f"Group {group_number}: "
            "thiếu monologue."
        )

    monologue = item["monologue"]

    if not isinstance(monologue, dict):

        raise ValueError(
            f"Group {group_number}: "
            "monologue phải là object."
        )

    if not monologue.get("text"):

        raise ValueError(
            f"Group {group_number}: "
            "monologue.text đang rỗng."
        )

    # --------------------------------------------------------
    # Questions
    # --------------------------------------------------------

    questions = item.get("questions")

    if not isinstance(questions, list):

        raise ValueError(
            f"Group {group_number}: "
            "questions phải là array."
        )

    if len(questions) != 3:

        raise ValueError(
            f"Group {group_number}: "
            f"phải có đúng 3 câu hỏi, "
            f"nhưng đang có {len(questions)}."
        )

    for index, question in enumerate(
        questions,
        start=1,
    ):

        if "question_text" not in question:

            raise ValueError(
                f"Group {group_number}, "
                f"Question {index}: "
                "thiếu question_text."
            )

        options = question.get("options")

        if not isinstance(options, dict):

            raise ValueError(
                f"Group {group_number}, "
                f"Question {index}: "
                "options phải là object."
            )

        # ----------------------------------------------------
        # Bắt buộc A/B/C/D
        # ----------------------------------------------------

        for label in ["A", "B", "C", "D"]:

            if label not in options:

                raise ValueError(
                    f"Group {group_number}, "
                    f"Question {index}: "
                    f"thiếu option {label}."
                )

            if not options[label]:

                raise ValueError(
                    f"Group {group_number}, "
                    f"Question {index}: "
                    f"option {label} đang rỗng."
                )

        # ----------------------------------------------------
        # Correct answer
        # ----------------------------------------------------

        correct = question.get("correct")

        if correct not in ["A", "B", "C", "D"]:

            raise ValueError(
                f"Group {group_number}, "
                f"Question {index}: "
                "correct phải là A/B/C/D."
            )


# ============================================================
# CHECK AUDIO
# ============================================================

def check_audio_files(scripts):

    missing = []

    for item in scripts:

        group_number = item["group"]

        audio_file = (
            AUDIO_DIR
            / f"g{group_number:03d}.mp3"
        )

        if not audio_file.exists():

            missing.append(
                str(audio_file)
            )

    if missing:

        print()
        print("THIẾU AUDIO:")

        for file in missing:
            print(file)

        raise FileNotFoundError(
            f"Thiếu {len(missing)} file audio."
        )


# ============================================================
# GET LESSON
# ============================================================

def get_lesson_id(
    group_number: int,
) -> int:

    # --------------------------------------------------------
    # 100 groups chia 5 stage
    #
    # 1 - 20   -> Stage 1
    # 21 - 40  -> Stage 2
    # 41 - 60  -> Stage 3
    # 61 - 80  -> Stage 4
    # 81 - 100 -> Stage 5
    # --------------------------------------------------------

    stage = (
        (group_number - 1) // 20
    ) + 1

    return LESSON_IDS[stage]


# ============================================================
# INSERT GROUP
# ============================================================

def insert_group(
    cursor,
    item,
):

    group_number = item["group"]

    lesson_id = get_lesson_id(
        group_number
    )

    audio_url = (
        f"{AUDIO_BASE_URL}/"
        f"g{group_number:03d}.mp3"
    )

    title = item.get(
        "title",
        f"Part 4 - Talk {group_number:02d}"
    )

    # --------------------------------------------------------
    # Tạo 1 group cho mỗi đoạn Part 4
    # --------------------------------------------------------

    cursor.execute(
        """
        INSERT INTO listening_lesson_groups
        (
            lesson_id,
            title,
            audio_url,
            start_seconds,
            end_seconds,
            display_order
        )
        VALUES
        (
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
            title,
            audio_url,
            0,
            None,
            group_number,
        ),
    )

    group_id = cursor.fetchone()["id"]

    return group_id


# ============================================================
# INSERT QUESTION
# ============================================================

def insert_question(
    cursor,
    group_id,
    question,
):

    cursor.execute(
        """
        INSERT INTO listening_lesson_questions
        (
            group_id,
            question_number,
            question_text,
            explanation,
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
        RETURNING id
        """,
        (
            group_id,
            question["question"],
            question["question_text"],
            question.get("explanation"),
            question["question"],
        ),
    )

    return cursor.fetchone()["id"]


# ============================================================
# INSERT OPTIONS
# ============================================================

def insert_options(
    cursor,
    question_id,
    question,
):

    correct = question["correct"]

    options = question["options"]

    for order, label in enumerate(
        ["A", "B", "C", "D"],
        start=1,
    ):

        cursor.execute(
            """
            INSERT INTO listening_lesson_options
            (
                question_id,
                option_label,
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
                label,
                options[label],
                label == correct,
                order,
            ),
        )


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)
    print("IMPORT PART 4")
    print("=" * 70)

    print()
    print(f"JSON  : {JSON_FILE}")
    print(f"Audio : {AUDIO_DIR}")
    print(
        f"DB    : "
        f"{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    print()

    # --------------------------------------------------------
    # Load
    # --------------------------------------------------------

    print("Checking JSON...")

    scripts = load_scripts()

    for item in scripts:

        validate_group(item)

    print(
        "JSON validation passed."
    )

    print()

    # --------------------------------------------------------
    # Check audio
    # --------------------------------------------------------

    print("Checking audio files...")

    check_audio_files(scripts)

    print(
        "Audio validation passed."
    )

    print()

    # --------------------------------------------------------
    # Connect DB
    # --------------------------------------------------------

    connection = get_connection()

    connection.autocommit = False

    try:

        with connection.cursor(
            cursor_factory=RealDictCursor
        ) as cursor:

            # ------------------------------------------------
            # Import từng group
            # ------------------------------------------------

            for item in scripts:

                group_number = item["group"]

                lesson_id = get_lesson_id(
                    group_number
                )

                print(
                    f"Group "
                    f"{group_number:03d}"
                    f" -> Lesson {lesson_id}"
                )

                # --------------------------------------------
                # Group
                # --------------------------------------------

                group_id = insert_group(
                    cursor,
                    item,
                )

                print(
                    f"  Group ID : {group_id}"
                )

                # --------------------------------------------
                # 3 Questions
                # --------------------------------------------

                for question in item["questions"]:

                    question_id = insert_question(
                        cursor,
                        group_id,
                        question,
                    )

                    print(
                        f"  Question "
                        f"{question['question']} "
                        f"-> ID {question_id}"
                    )

                    # ----------------------------------------
                    # 4 Options
                    # ----------------------------------------

                    insert_options(
                        cursor,
                        question_id,
                        question,
                    )

        # ----------------------------------------------------
        # Commit
        # ----------------------------------------------------

        connection.commit()

        print()
        print("=" * 70)
        print("IMPORT SUCCESS")
        print("=" * 70)

        print()
        print("Imported:")
        print("  Groups    : 100")
        print("  Questions : 300")
        print("  Options   : 1200")

        print()
        print(
            "Stage distribution:"
        )

        print(
            "  Stage 1 : Groups 001-020 "
            "-> Lesson 4"
        )

        print(
            "  Stage 2 : Groups 021-040 "
            "-> Lesson 8"
        )

        print(
            "  Stage 3 : Groups 041-060 "
            "-> Lesson 12"
        )

        print(
            "  Stage 4 : Groups 061-080 "
            "-> Lesson 16"
        )

        print(
            "  Stage 5 : Groups 081-100 "
            "-> Lesson 20"
        )

    except Exception:

        connection.rollback()

        print()
        print(
            "IMPORT FAILED."
        )

        print(
            "Database đã được ROLLBACK."
        )

        raise

    finally:

        connection.close()


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    main()