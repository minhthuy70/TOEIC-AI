import json
from pathlib import Path
from datetime import datetime

import psycopg2
from psycopg2.extras import RealDictCursor


# ============================================================
# CONFIG
# ============================================================

# File:
# tools/listening/import_part3.py

PROJECT_ROOT = Path(__file__).resolve().parents[2]

JSON_FILE = (
    PROJECT_ROOT
    / "tools"
    / "listening"
    / "part3_scripts.json"
)

AUDIO_DIR = (
    PROJECT_ROOT
    / "output"
    / "listening"
    / "part3"
    / "dataset01"
)

# PostgreSQL đang chạy ở PORT 5433
DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "database": "toeic_ai",
    "user": "postgres",
    "password": "123",
}


# ============================================================
# PART 3 LESSON IDS
# ============================================================

# Part 3:
#
# Stage 1 -> lesson 3
# Stage 2 -> lesson 7
# Stage 3 -> lesson 11
# Stage 4 -> lesson 15
# Stage 5 -> lesson 19
#
# 100 groups chia đều:
#
# 01 - 20  -> lesson 3
# 21 - 40  -> lesson 7
# 41 - 60  -> lesson 11
# 61 - 80  -> lesson 15
# 81 - 100 -> lesson 19

LESSON_IDS = {
    1: 3,
    2: 7,
    3: 11,
    4: 15,
    5: 19,
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
            "part3_scripts.json phải là JSON array."
        )

    if len(data) != 100:
        raise ValueError(
            f"Expected 100 groups, but found {len(data)}"
        )

    return data


# ============================================================
# GET STAGE
# ============================================================

def get_stage(group_number):

    if 1 <= group_number <= 20:
        return 1

    if 21 <= group_number <= 40:
        return 2

    if 41 <= group_number <= 60:
        return 3

    if 61 <= group_number <= 80:
        return 4

    if 81 <= group_number <= 100:
        return 5

    raise ValueError(
        f"Group không hợp lệ: {group_number}"
    )


# ============================================================
# VALIDATE GROUP
# ============================================================

def validate_group(item):

    group_number = item.get("group")

    if not group_number:
        raise ValueError(
            "Group không có trường 'group'."
        )

    dialogue = item.get("dialogue")

    if not isinstance(dialogue, list):
        raise ValueError(
            f"Group {group_number}: "
            "dialogue phải là array."
        )

    # Part 3 của bạn hiện tại có 4 lượt thoại
    if len(dialogue) != 4:
        raise ValueError(
            f"Group {group_number}: "
            f"dialogue phải có đúng 4 lượt nói, "
            f"nhưng đang có {len(dialogue)}."
        )

    for turn in dialogue:

        if "speaker" not in turn:
            raise ValueError(
                f"Group {group_number}: "
                "dialogue thiếu speaker."
            )

        if "text" not in turn:
            raise ValueError(
                f"Group {group_number}: "
                "dialogue thiếu text."
            )

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

    for q in questions:

        if "question" not in q:
            raise ValueError(
                f"Group {group_number}: "
                "question thiếu question."
            )

        if "question_text" not in q:
            raise ValueError(
                f"Group {group_number}: "
                "question thiếu question_text."
            )

        options = q.get("options")

        if not isinstance(options, dict):
            raise ValueError(
                f"Group {group_number}, "
                f"Question {q['question']}: "
                "options phải là object."
            )

        required_labels = ["A", "B", "C", "D"]

        for label in required_labels:

            if label not in options:
                raise ValueError(
                    f"Group {group_number}, "
                    f"Question {q['question']}: "
                    f"thiếu option {label}."
                )

        correct = q.get("correct")

        if correct not in required_labels:
            raise ValueError(
                f"Group {group_number}, "
                f"Question {q['question']}: "
                f"correct không hợp lệ: {correct}"
            )


# ============================================================
# MAIN
# ============================================================

def main():

    scripts = load_scripts()

    print("=" * 70)
    print("IMPORT PART 3")
    print("=" * 70)

    print()
    print(f"JSON  : {JSON_FILE}")
    print(f"Audio : {AUDIO_DIR}")
    print(
        f"DB    : "
        f"{DB_CONFIG['host']}:{DB_CONFIG['port']}/"
        f"{DB_CONFIG['database']}"
    )
    print()

    # --------------------------------------------------------
    # Validate toàn bộ JSON trước khi insert
    # --------------------------------------------------------

    print("Checking JSON...")

    for item in scripts:
        validate_group(item)

    print("JSON OK.")
    print()

    # --------------------------------------------------------
    # Check audio
    # --------------------------------------------------------

    print("Checking audio files...")

    missing_audio = []

    for item in scripts:

        group_number = item["group"]

        audio_file = (
            AUDIO_DIR
            / f"g{group_number:03d}.mp3"
        )

        if not audio_file.exists():
            missing_audio.append(
                str(audio_file)
            )

    if missing_audio:

        print()
        print("THIẾU AUDIO:")

        for file in missing_audio:
            print(file)

        raise FileNotFoundError(
            f"\nThiếu {len(missing_audio)} audio file."
        )

    print("100 audio files OK.")
    print()

    # --------------------------------------------------------
    # CONNECT DATABASE
    # --------------------------------------------------------

    conn = psycopg2.connect(
        **DB_CONFIG
    )

    try:

        with conn.cursor(
            cursor_factory=RealDictCursor
        ) as cursor:

            # ------------------------------------------------
            # IMPORT
            # ------------------------------------------------

            total_groups = 0
            total_questions = 0
            total_options = 0

            for item in scripts:

                group_number = item["group"]

                title = item.get(
                    "title",
                    f"Part 3 - Conversation {group_number:02d}"
                )

                stage = get_stage(
                    group_number
                )

                lesson_id = LESSON_IDS[stage]

                audio_file = (
                    AUDIO_DIR
                    / f"g{group_number:02d}.mp3"
                )

                # ------------------------------------------------
                # AUDIO URL
                # ------------------------------------------------

                audio_url = (
                    f"/listening/part3/"
                    f"dataset01/"
                    f"g{group_number:02d}.mp3"
                )

                # ------------------------------------------------
                # CREATE GROUP
                # ------------------------------------------------

                cursor.execute(
                    """
                    INSERT INTO listening_lesson_groups
                    (
                        lesson_id,
                        title,
                        audio_url,
                        start_seconds,
                        end_seconds,
                        display_order,
                        created_at,
                        updated_at
                    )
                    VALUES
                    (
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        CURRENT_TIMESTAMP,
                        CURRENT_TIMESTAMP
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
                    )
                )

                group_id = cursor.fetchone()["id"]

                total_groups += 1

                # ------------------------------------------------
                # CREATE 3 QUESTIONS
                # ------------------------------------------------

                for question in item["questions"]:

                    question_number = (
                        question["question"]
                    )

                    question_text = (
                        question["question_text"]
                    )

                    explanation = question.get(
                        "explanation"
                    )

                    cursor.execute(
                        """
                        INSERT INTO listening_lesson_questions
                        (
                            group_id,
                            question_number,
                            question_text,
                            explanation,
                            display_order,
                            created_at,
                            updated_at
                        )
                        VALUES
                        (
                            %s,
                            %s,
                            %s,
                            %s,
                            %s,
                            CURRENT_TIMESTAMP,
                            CURRENT_TIMESTAMP
                        )
                        RETURNING id
                        """,
                        (
                            group_id,
                            question_number,
                            question_text,
                            explanation,
                            question_number,
                        )
                    )

                    question_id = (
                        cursor.fetchone()["id"]
                    )

                    total_questions += 1

                    # ------------------------------------------------
                    # CREATE A/B/C/D
                    # ------------------------------------------------

                    correct = question["correct"]

                    for index, label in enumerate(
                        ["A", "B", "C", "D"],
                        start=1
                    ):

                        option_text = (
                            question["options"][label]
                        )

                        is_correct = (
                            label == correct
                        )

                        cursor.execute(
                            """
                            INSERT INTO listening_lesson_options
                            (
                                question_id,
                                option_label,
                                option_text,
                                is_correct,
                                display_order,
                                created_at
                            )
                            VALUES
                            (
                                %s,
                                %s,
                                %s,
                                %s,
                                %s,
                                CURRENT_TIMESTAMP
                            )
                            """,
                            (
                                question_id,
                                label,
                                option_text,
                                is_correct,
                                index,
                            )
                        )

                        total_options += 1

                print(
                    f"Group {group_number:03d} "
                    f"| Stage {stage} "
                    f"| Lesson {lesson_id} "
                    f"| 3 questions "
                    f"| 12 options"
                )

            # ------------------------------------------------
            # COMMIT
            # ------------------------------------------------

            conn.commit()

            print()
            print("=" * 70)
            print("IMPORT DONE")
            print("=" * 70)

            print()
            print(
                f"Groups    : {total_groups}"
            )

            print(
                f"Questions : {total_questions}"
            )

            print(
                f"Options   : {total_options}"
            )

            print()

    except Exception:

        conn.rollback()

        print()
        print(
            "IMPORT FAILED -> "
            "ROLLBACK DATABASE"
        )

        raise

    finally:

        conn.close()


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    main()