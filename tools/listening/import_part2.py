import json
from pathlib import Path

import psycopg2


# ============================================================
# CONFIG
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

JSON_FILE = (
    PROJECT_ROOT
    / "tools"
    / "listening"
    / "part2_scripts.json"
)

DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "database": "toeic_ai",
    "user": "postgres",
    "password": "123",
}

AUDIO_BASE_URL = "/listening/part2/dataset01"


# ============================================================
# PART 2 LESSON MAPPING
# ============================================================

LESSON_MAP = {
    1: 2,    # Q01-Q20
    2: 6,    # Q21-Q40
    3: 10,   # Q41-Q60
    4: 14,   # Q61-Q80
    5: 18,   # Q81-Q100
}


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
            "part2_scripts.json phải là JSON array."
        )

    if len(data) != 100:
        raise ValueError(
            f"Expected 100 questions, found {len(data)}"
        )

    return data


# ============================================================
# GET LESSON ID
# ============================================================

def get_lesson_id(question_number):

    if 1 <= question_number <= 20:
        return 2

    if 21 <= question_number <= 40:
        return 6

    if 41 <= question_number <= 60:
        return 10

    if 61 <= question_number <= 80:
        return 14

    if 81 <= question_number <= 100:
        return 18

    raise ValueError(
        f"Question number không hợp lệ: {question_number}"
    )


# ============================================================
# MAIN
# ============================================================

def main():

    scripts = load_scripts()

    print("=" * 70)
    print("IMPORT PART 2")
    print("=" * 70)

    print()
    print(f"JSON : {JSON_FILE}")
    print(f"DB   : {DB_CONFIG['database']}")
    print(f"PORT : {DB_CONFIG['port']}")
    print()

    conn = psycopg2.connect(**DB_CONFIG)

    try:

        conn.autocommit = False

        cur = conn.cursor()

        # ====================================================
        # 1. XÓA PART 2 CŨ
        # ====================================================

        print("Removing old Part 2 data...")

        # Xóa options của các question thuộc Part 2
        cur.execute(
            """
            DELETE FROM listening_lesson_options
            WHERE question_id IN (
                SELECT q.id
                FROM listening_lesson_questions q
                JOIN listening_lesson_groups g
                    ON q.group_id = g.id
                WHERE g.lesson_id IN (2, 6, 10, 14, 18)
            )
            """
        )

        deleted_options = cur.rowcount

        # Xóa questions
        cur.execute(
            """
            DELETE FROM listening_lesson_questions
            WHERE group_id IN (
                SELECT id
                FROM listening_lesson_groups
                WHERE lesson_id IN (2, 6, 10, 14, 18)
            )
            """
        )

        deleted_questions = cur.rowcount

        # Xóa groups
        cur.execute(
            """
            DELETE FROM listening_lesson_groups
            WHERE lesson_id IN (2, 6, 10, 14, 18)
            """
        )

        deleted_groups = cur.rowcount

        print(
            f"Deleted options   : {deleted_options}"
        )

        print(
            f"Deleted questions : {deleted_questions}"
        )

        print(
            f"Deleted groups    : {deleted_groups}"
        )

        print()

        # ====================================================
        # 2. TẠO LẠI 100 GROUP
        # ====================================================

        print("Creating Part 2 groups...")

        group_start_id = 101

        for item in scripts:

            q_number = int(item["question"])

            group_id = group_start_id + q_number - 1

            lesson_id = get_lesson_id(q_number)

            audio_url = (
                f"{AUDIO_BASE_URL}"
                f"/q{q_number:02d}.mp3"
            )

            title = (
                f"Part 2 - Question Response "
                f"{q_number:03d}"
            )

            cur.execute(
                """
                INSERT INTO listening_lesson_groups (
                    id,
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
                    NULL,
                    NULL,
                    %s
                )
                """,
                (
                    group_id,
                    lesson_id,
                    title,
                    audio_url,
                    q_number,
                ),
            )

        print("Created 100 groups.")

        # ====================================================
        # 3. TẠO 100 QUESTIONS
        # ====================================================

        print("Creating Part 2 questions...")

        question_start_id = 101

        for item in scripts:

            q_number = int(item["question"])

            question_id = (
                question_start_id
                + q_number
                - 1
            )

            group_id = question_id

            question_text = item["prompt"]

            # Explanation theo đúng Part 2
            correct = item["correct"]

            correct_text = item["options"][correct]

            explanation = (
                f"Correct answer: {correct}. "
                f"{correct_text}"
            )

            cur.execute(
                """
                INSERT INTO listening_lesson_questions (
                    id,
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
                    %s,
                    %s
                )
                """,
                (
                    question_id,
                    group_id,
                    q_number,
                    question_text,
                    explanation,
                    q_number,
                ),
            )

        print("Created 100 questions.")

        # ====================================================
        # 4. TẠO OPTIONS
        # ====================================================

        print("Creating Part 2 options...")

        option_count = 0

        for item in scripts:

            q_number = int(item["question"])

            question_id = (
                question_start_id
                + q_number
                - 1
            )

            correct_answer = item["correct"]

            options = item["options"]

            for display_order, label in enumerate(
                ["A", "B", "C"],
                start=1,
            ):

                option_text = options[label]

                is_correct = (
                    label == correct_answer
                )

                cur.execute(
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
                        display_order,
                    ),
                )

                option_count += 1

        print(
            f"Created {option_count} options."
        )

        # ====================================================
        # 5. UPDATE SEQUENCES
        # ====================================================

        print()
        print("Updating sequences...")

        cur.execute(
            """
            SELECT setval(
                'listening_lesson_groups_id_seq',
                COALESCE(
                    (SELECT MAX(id)
                     FROM listening_lesson_groups),
                    1
                ),
                true
            )
            """
        )

        cur.execute(
            """
            SELECT setval(
                'listening_lesson_questions_id_seq',
                COALESCE(
                    (SELECT MAX(id)
                     FROM listening_lesson_questions),
                    1
                ),
                true
            )
            """
        )

        cur.execute(
            """
            SELECT setval(
                'listening_lesson_options_id_seq',
                COALESCE(
                    (SELECT MAX(id)
                     FROM listening_lesson_options),
                    1
                ),
                true
            )
            """
        )

        # ====================================================
        # COMMIT
        # ====================================================

        conn.commit()

        print()
        print("=" * 70)
        print("PART 2 IMPORT SUCCESS")
        print("=" * 70)

        print()
        print("Groups    : 100")
        print("Questions : 100")
        print("Options   : 300")

        print()
        print("ID mapping:")
        print("Group     : 101 -> 200")
        print("Question  : 101 -> 200")
        print("Question number: 1 -> 100")

        print()
        print("Lessons:")
        print("Q01-Q20   -> Lesson 2")
        print("Q21-Q40   -> Lesson 6")
        print("Q41-Q60   -> Lesson 10")
        print("Q61-Q80   -> Lesson 14")
        print("Q81-Q100  -> Lesson 18")

        print()

    except Exception as e:

        conn.rollback()

        print()
        print("=" * 70)
        print("IMPORT FAILED")
        print("=" * 70)

        print(e)

        raise

    finally:

        conn.close()


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    main()