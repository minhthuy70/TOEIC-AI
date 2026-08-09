import json
import os
from pathlib import Path

import psycopg2


# ============================================================
# CONFIG
# ============================================================

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:123@localhost:5433/toeic_ai",
)

PROJECT_ROOT = Path(__file__).resolve().parents[2]

JSON_FILE = PROJECT_ROOT / "tools" / "listening" / "part1_scripts.json"

IMAGE_DIR = (
    PROJECT_ROOT
    / "output"
    / "listening"
    / "part1"
    / "images"
)

AUDIO_DIR = (
    PROJECT_ROOT
    / "output"
    / "listening"
    / "part1"
    / "dataset01"
)

LESSON_ID = 1

LESSON_TITLE = "Part 1 - Photographs 01"

PART = 1


# ============================================================
# HELPERS
# ============================================================

def load_json():
    """Đọc dữ liệu 100 câu từ part1_scripts.json."""

    if not JSON_FILE.exists():
        raise FileNotFoundError(
            f"Không tìm thấy file JSON:\n{JSON_FILE}"
        )

    with open(
        JSON_FILE,
        "r",
        encoding="utf-8",
    ) as file:
        data = json.load(file)

    if not isinstance(data, list):
        raise ValueError(
            "part1_scripts.json phải là một JSON array."
        )

    if len(data) != 100:
        raise ValueError(
            f"Expected 100 questions, but found {len(data)}"
        )

    return data


def validate_question(item, expected_number):
    """Kiểm tra cấu trúc một câu hỏi."""

    if item.get("question") != expected_number:
        raise ValueError(
            f"Câu thứ {expected_number} không đúng question number."
        )

    options = item.get("options")

    if not isinstance(options, list):
        raise ValueError(
            f"Question {expected_number}: options không hợp lệ."
        )

    if len(options) != 4:
        raise ValueError(
            f"Question {expected_number}: "
            f"Expected 4 options, found {len(options)}"
        )

    correct = item.get("correct")

    if correct not in ("A", "B", "C", "D"):
        raise ValueError(
            f"Question {expected_number}: "
            f"correct phải là A/B/C/D."
        )

    for option in options:
        if not isinstance(option, str) or not option.strip():
            raise ValueError(
                f"Question {expected_number}: "
                "option không được rỗng."
            )


def check_files(question_number):
    """Kiểm tra ảnh và audio của câu."""

    image_file = IMAGE_DIR / f"q{question_number:02d}.jpg"

    audio_file = AUDIO_DIR / f"q{question_number:02d}.mp3"

    if not image_file.exists():
        raise FileNotFoundError(
            f"Thiếu ảnh:\n{image_file}"
        )

    if not audio_file.exists():
        raise FileNotFoundError(
            f"Thiếu audio:\n{audio_file}"
        )

    return image_file, audio_file


# ============================================================
# DATABASE
# ============================================================

def connect_database():
    print("=" * 70)
    print("CONNECTING TO POSTGRESQL")
    print("=" * 70)

    print()
    print(f"Database URL: {DATABASE_URL}")
    print()

    connection = psycopg2.connect(DATABASE_URL)

    print("Database connection: OK")
    print()

    return connection


# ============================================================
# LESSON
# ============================================================

def verify_lesson(cursor):
    """Kiểm tra lesson Part 1."""

    cursor.execute(
        """
        SELECT
            id,
            title,
            part
        FROM listening_lessons
        WHERE id = %s
        """,
        (LESSON_ID,),
    )

    lesson = cursor.fetchone()

    if lesson is None:
        raise ValueError(
            f"Không tìm thấy listening_lessons.id = {LESSON_ID}"
        )

    lesson_id, title, part = lesson

    print("LESSON")
    print("-" * 70)
    print(f"ID    : {lesson_id}")
    print(f"Title : {title}")
    print(f"Part  : {part}")
    print()

    if part != PART:
        raise ValueError(
            f"Lesson {LESSON_ID} không phải Part {PART}."
        )


# ============================================================
# IMPORT
# ============================================================

def import_data(connection, data):

    cursor = connection.cursor()

    try:

        # ----------------------------------------------------
        # VERIFY LESSON
        # ----------------------------------------------------

        verify_lesson(cursor)

        # ----------------------------------------------------
        # CHECK FILES FIRST
        # ----------------------------------------------------

        print("=" * 70)
        print("CHECKING 100 IMAGES + 100 AUDIO FILES")
        print("=" * 70)
        print()

        for item in data:

            question_number = item["question"]

            validate_question(
                item,
                question_number,
            )

            check_files(question_number)

        print("Images : 100/100 OK")
        print("Audio  : 100/100 OK")
        print()

        # ----------------------------------------------------
        # CHECK EXISTING DATA
        # ----------------------------------------------------

        cursor.execute(
            """
            SELECT COUNT(*)
            FROM listening_lesson_groups
            WHERE lesson_id = %s
            """,
            (LESSON_ID,),
        )

        existing_groups = cursor.fetchone()[0]

        if existing_groups > 0:

            print("=" * 70)
            print("WARNING")
            print("=" * 70)
            print()
            print(
                f"Lesson {LESSON_ID} đang có "
                f"{existing_groups} group."
            )
            print()

            answer = input(
                "XÓA dữ liệu Part 1 cũ và import lại? (y/n): "
            ).strip().lower()

            if answer != "y":
                print()
                print("Hủy import.")
                return

            print()
            print("Đang xóa dữ liệu Part 1 cũ...")

            # Xóa options trước
            cursor.execute(
                """
                DELETE FROM listening_lesson_options
                WHERE question_id IN (
                    SELECT q.id
                    FROM listening_lesson_questions q
                    JOIN listening_lesson_groups g
                        ON q.group_id = g.id
                    WHERE g.lesson_id = %s
                )
                """,
                (LESSON_ID,),
            )

            # Xóa questions
            cursor.execute(
                """
                DELETE FROM listening_lesson_questions
                WHERE group_id IN (
                    SELECT id
                    FROM listening_lesson_groups
                    WHERE lesson_id = %s
                )
                """,
                (LESSON_ID,),
            )

            # Xóa groups
            cursor.execute(
                """
                DELETE FROM listening_lesson_groups
                WHERE lesson_id = %s
                """,
                (LESSON_ID,),
            )

            print("Dữ liệu cũ đã được xóa.")
            print()

        # ----------------------------------------------------
        # IMPORT 100 QUESTIONS
        # ----------------------------------------------------

        print("=" * 70)
        print("IMPORTING PART 1")
        print("=" * 70)
        print()

        for index, item in enumerate(data, start=1):

            question_number = item["question"]

            options = item["options"]

            correct = item["correct"]

            image_file, audio_file = check_files(
                question_number
            )

            # ------------------------------------------------
            # AUDIO URL
            # ------------------------------------------------

            audio_url = (
                f"/listening/part1/dataset01/"
                f"q{question_number:02d}.mp3"
            )

            # ------------------------------------------------
            # IMAGE URL
            #
            # Hiện tại bảng groups chưa có image_url.
            # Ta sẽ lưu đường dẫn ảnh trong title.
            #
            # Nếu sau này muốn image_url riêng,
            # có thể ALTER TABLE thêm cột.
            # ------------------------------------------------

            group_title = (
                f"Question {question_number:02d}"
            )

            # ------------------------------------------------
            # INSERT GROUP
            # ------------------------------------------------

            cursor.execute(
                """
                INSERT INTO listening_lesson_groups (
                    lesson_id,
                    title,
                    audio_url,
                    start_seconds,
                    end_seconds,
                    display_order
                )
                VALUES (
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
                    LESSON_ID,
                    group_title,
                    audio_url,
                    None,
                    None,
                    question_number,
                ),
            )

            group_id = cursor.fetchone()[0]

            # ------------------------------------------------
            # INSERT QUESTION
            # ------------------------------------------------

            question_text = (
                f"Look at the picture and listen to "
                f"the four statements."
            )

            explanation = (
                f"Correct answer: {correct}. "
                f"Image: /listening/part1/images/"
                f"q{question_number:02d}.jpg"
            )

            cursor.execute(
                """
                INSERT INTO listening_lesson_questions (
                    group_id,
                    question_number,
                    question_text,
                    explanation,
                    display_order
                )
                VALUES (
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
                    question_text,
                    explanation,
                    question_number,
                ),
            )

            question_id = cursor.fetchone()[0]

            # ------------------------------------------------
            # INSERT 4 OPTIONS
            # ------------------------------------------------

            labels = ["A", "B", "C", "D"]

            for option_index, option_text in enumerate(
                options
            ):

                label = labels[option_index]

                is_correct = (
                    label == correct
                )

                cursor.execute(
                    """
                    INSERT INTO listening_lesson_options (
                        question_id,
                        option_label,
                        option_text,
                        is_correct,
                        display_order
                    )
                    VALUES (
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
                        option_text,
                        is_correct,
                        option_index + 1,
                    ),
                )

            # ------------------------------------------------
            # PROGRESS
            # ------------------------------------------------

            print(
                f"[{index:03d}/100] "
                f"Q{question_number:02d} "
                f"-> group_id={group_id} "
                f"question_id={question_id}"
            )

        # ----------------------------------------------------
        # COMMIT
        # ----------------------------------------------------

        connection.commit()

        print()
        print("=" * 70)
        print("IMPORT SUCCESS")
        print("=" * 70)
        print()

    except Exception:

        connection.rollback()

        print()
        print("=" * 70)
        print("IMPORT FAILED")
        print("=" * 70)
        print()
        print(
            "Đã rollback toàn bộ dữ liệu."
        )

        raise

    finally:
        cursor.close()


# ============================================================
# VERIFY RESULT
# ============================================================

def verify_result(connection):

    cursor = connection.cursor()

    print()
    print("=" * 70)
    print("VERIFY DATABASE")
    print("=" * 70)
    print()

    # Groups
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM listening_lesson_groups
        WHERE lesson_id = %s
        """,
        (LESSON_ID,),
    )

    groups_count = cursor.fetchone()[0]

    # Questions
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM listening_lesson_questions q
        JOIN listening_lesson_groups g
            ON q.group_id = g.id
        WHERE g.lesson_id = %s
        """,
        (LESSON_ID,),
    )

    questions_count = cursor.fetchone()[0]

    # Options
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM listening_lesson_options o
        JOIN listening_lesson_questions q
            ON o.question_id = q.id
        JOIN listening_lesson_groups g
            ON q.group_id = g.id
        WHERE g.lesson_id = %s
        """,
        (LESSON_ID,),
    )

    options_count = cursor.fetchone()[0]

    print(
        f"Groups    : {groups_count}"
    )

    print(
        f"Questions : {questions_count}"
    )

    print(
        f"Options   : {options_count}"
    )

    print()

    if (
        groups_count == 100
        and questions_count == 100
        and options_count == 400
    ):

        print(
            "RESULT: 100/100 QUESTIONS + 400 OPTIONS OK"
        )

    else:

        print(
            "WARNING: Số lượng dữ liệu chưa đúng."
        )

    print()

    cursor.close()


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("=" * 70)
    print("PART 1 LISTENING DATA IMPORTER")
    print("=" * 70)
    print()

    print(
        f"JSON   : {JSON_FILE}"
    )

    print(
        f"Images : {IMAGE_DIR}"
    )

    print(
        f"Audio  : {AUDIO_DIR}"
    )

    print(
        f"Lesson : {LESSON_ID}"
    )

    print()

    # --------------------------------------------------------
    # LOAD JSON
    # --------------------------------------------------------

    data = load_json()

    print(
        f"JSON questions: {len(data)}"
    )

    print()

    # --------------------------------------------------------
    # CONNECT DATABASE
    # --------------------------------------------------------

    connection = connect_database()

    try:

        # ----------------------------------------------------
        # IMPORT
        # ----------------------------------------------------

        import_data(
            connection,
            data,
        )

        # ----------------------------------------------------
        # VERIFY
        # ----------------------------------------------------

        verify_result(
            connection
        )

    finally:

        connection.close()

    print("=" * 70)
    print("DONE")
    print("=" * 70)
    print()


if __name__ == "__main__":
    main()