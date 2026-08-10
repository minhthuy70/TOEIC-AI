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

JSON_FILE = BASE_DIR / "part6_scripts.json"


# ============================================================
# PART CONFIG
# ============================================================

PART = 6

# Part 6 có tổng cộng 100 groups
TOTAL_GROUPS = 100

# Mỗi stage có 20 groups
GROUPS_PER_STAGE = 20

# Mỗi group có 4 câu hỏi
QUESTIONS_PER_GROUP = 4

# Mỗi câu có 4 đáp án
OPTIONS = ["A", "B", "C", "D"]


# ============================================================
# LOAD JSON
# ============================================================

def load_json():

    print()
    print("==============================================")
    print(" IMPORT READING PART 6")
    print("==============================================")
    print()

    print(f"JSON : {JSON_FILE}")
    print(f"DB   : localhost:5433/toeic_ai")
    print()

    if not JSON_FILE.exists():

        raise FileNotFoundError(
            f"Không tìm thấy file JSON:\n{JSON_FILE}"
        )

    with open(
        JSON_FILE,
        "r",
        encoding="utf-8"
    ) as f:

        data = json.load(f)

    return data


# ============================================================
# VALIDATE JSON
# ============================================================

def validate_json(data):

    if not isinstance(data, list):

        raise ValueError(
            "JSON phải là một ARRAY."
        )

    if len(data) != TOTAL_GROUPS:

        raise ValueError(
            f"JSON phải có đúng {TOTAL_GROUPS} groups, "
            f"nhưng hiện tại có {len(data)}."
        )

    print(
        f"Checking JSON..."
    )

    print(
        f"JSON OK - {len(data)} groups."
    )

    # --------------------------------------------------------
    # Validate từng group
    # --------------------------------------------------------

    for index, group in enumerate(
        data,
        start=1
    ):

        expected_group = index

        if not isinstance(group, dict):

            raise ValueError(
                f"Group {index} không phải object."
            )

        # ----------------------------------------------------
        # group
        # ----------------------------------------------------

        if group.get("group") != expected_group:

            raise ValueError(
                f"Group sai thứ tự: "
                f"expected {expected_group}, "
                f"got {group.get('group')}"
            )

        # ----------------------------------------------------
        # title
        # ----------------------------------------------------

        if not group.get("title"):

            raise ValueError(
                f"Group {index} thiếu title."
            )

        # ----------------------------------------------------
        # knowledge
        # ----------------------------------------------------

        if not group.get("knowledge"):

            raise ValueError(
                f"Group {index} thiếu knowledge."
            )

        # ----------------------------------------------------
        # passage
        # ----------------------------------------------------

        if not group.get("passage"):

            raise ValueError(
                f"Group {index} thiếu passage."
            )

        # ----------------------------------------------------
        # questions
        # ----------------------------------------------------

        questions = group.get("questions")

        if not isinstance(
            questions,
            list
        ):

            raise ValueError(
                f"Group {index}: "
                f"questions phải là array."
            )

        if len(questions) != QUESTIONS_PER_GROUP:

            raise ValueError(
                f"Group {index} phải có "
                f"{QUESTIONS_PER_GROUP} questions, "
                f"nhưng có {len(questions)}."
            )

        # ----------------------------------------------------
        # Validate từng question
        # ----------------------------------------------------

        for q_index, question in enumerate(
            questions,
            start=1
        ):

            expected_question_number = q_index

            if question.get(
                "question_number"
            ) != expected_question_number:

                raise ValueError(
                    f"Group {index}: "
                    f"question_number phải là "
                    f"{expected_question_number}, "
                    f"got "
                    f"{question.get('question_number')}"
                )

            # ------------------------------------------------
            # question_text
            # ------------------------------------------------

            if not question.get(
                "question_text"
            ):

                raise ValueError(
                    f"Group {index}, "
                    f"question {q_index} "
                    f"thiếu question_text."
                )

            # ------------------------------------------------
            # question_type
            # ------------------------------------------------

            if not question.get(
                "question_type"
            ):

                raise ValueError(
                    f"Group {index}, "
                    f"question {q_index} "
                    f"thiếu question_type."
                )

            # ------------------------------------------------
            # knowledge
            # ------------------------------------------------

            if not question.get(
                "knowledge"
            ):

                raise ValueError(
                    f"Group {index}, "
                    f"question {q_index} "
                    f"thiếu knowledge."
                )

            # ------------------------------------------------
            # correct_answer
            # ------------------------------------------------

            if not question.get(
                "correct_answer"
            ):

                raise ValueError(
                    f"Group {index}, "
                    f"question {q_index} "
                    f"thiếu correct_answer."
                )

            correct_answer = question[
                "correct_answer"
            ]

            if correct_answer not in OPTIONS:

                raise ValueError(
                    f"Group {index}, "
                    f"question {q_index}: "
                    f"correct_answer phải là "
                    f"A/B/C/D."
                )

            # ------------------------------------------------
            # explanation
            # ------------------------------------------------

            if not question.get(
                "explanation"
            ):

                raise ValueError(
                    f"Group {index}, "
                    f"question {q_index} "
                    f"thiếu explanation."
                )

            # ------------------------------------------------
            # options
            # ------------------------------------------------

            options = question.get(
                "options"
            )

            if not isinstance(
                options,
                dict
            ):

                raise ValueError(
                    f"Group {index}, "
                    f"question {q_index}: "
                    f"options phải là object."
                )

            for option_key in OPTIONS:

                if option_key not in options:

                    raise ValueError(
                        f"Group {index}, "
                        f"question {q_index}: "
                        f"thiếu option {option_key}."
                    )

                if not options[
                    option_key
                ]:

                    raise ValueError(
                        f"Group {index}, "
                        f"question {q_index}: "
                        f"option {option_key} rỗng."
                    )

    print(
        "Validation OK."
    )

    print()


# ============================================================
# GET LESSON ID
# ============================================================

def get_lesson_id(
    cursor,
    stage
):

    """
    Part 6 có 5 lesson.

    Database hiện tại:

    Stage 1 -> Lesson ID 6 -> display_order 6
    Stage 2 -> Lesson ID 7 -> display_order 7
    Stage 3 -> Lesson ID 8 -> display_order 8
    Stage 4 -> Lesson ID 9 -> display_order 9
    Stage 5 -> Lesson ID 10 -> display_order 10

    Không dùng display_order = stage.

    display_order của Part 5:
        1 -> 5

    display_order của Part 6:
        6 -> 10
    """

    # --------------------------------------------------------
    # Part 6 bắt đầu từ display_order 6
    #
    # Stage 1 -> 6
    # Stage 2 -> 7
    # Stage 3 -> 8
    # Stage 4 -> 9
    # Stage 5 -> 10
    # --------------------------------------------------------

    display_order = 5 + stage

    cursor.execute(
        """
        SELECT
            id,
            title,
            part,
            display_order
        FROM reading_lessons
        WHERE part = %s
          AND display_order = %s
        LIMIT 1
        """,
        (
            PART,
            display_order
        )
    )

    row = cursor.fetchone()

    if not row:

        raise ValueError(
            f"Không tìm thấy reading_lesson: "
            f"Part {PART}, "
            f"Stage {stage}, "
            f"display_order {display_order}"
        )

    lesson_id = row[0]

    title = row[1]

    print(
        f"[LESSON] "
        f"Part {PART} | "
        f"Stage {stage} | "
        f"Lesson ID {lesson_id} | "
        f"display_order {display_order} | "
        f"{title}"
    )

    return lesson_id


# ============================================================
# INSERT / UPDATE GROUP
# ============================================================

def insert_group(
    cursor,
    lesson_id,
    group_data,
    group_number
):

    title = group_data[
        "title"
    ]

    knowledge = group_data[
        "knowledge"
    ]

    passage = group_data[
        "passage"
    ]

    # --------------------------------------------------------
    # Kiểm tra group đã tồn tại
    # --------------------------------------------------------

    cursor.execute(
        """
        SELECT id
        FROM reading_lesson_groups
        WHERE lesson_id = %s
          AND group_number = %s
        LIMIT 1
        """,
        (
            lesson_id,
            group_number
        )
    )

    existing = cursor.fetchone()

    # --------------------------------------------------------
    # UPDATE
    # --------------------------------------------------------

    if existing:

        group_id = existing[0]

        cursor.execute(
            """
            UPDATE reading_lesson_groups
            SET
                title = %s,
                passage = %s,
                knowledge = %s,
                part = %s,
                display_order = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
            """,
            (
                title,
                passage,
                knowledge,
                PART,
                group_number,
                group_id
            )
        )

    # --------------------------------------------------------
    # INSERT
    # --------------------------------------------------------

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
                group_number
            )
        )

        group_id = cursor.fetchone()[0]

    return group_id


# ============================================================
# INSERT / UPDATE QUESTION
# ============================================================

def insert_question(
    cursor,
    group_id,
    question
):

    question_number = question[
        "question_number"
    ]

    # --------------------------------------------------------
    # Kiểm tra question đã tồn tại
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # UPDATE
    # --------------------------------------------------------

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
                question[
                    "question_text"
                ],

                question[
                    "question_type"
                ],

                question[
                    "explanation"
                ],

                question[
                    "knowledge"
                ],

                question[
                    "correct_answer"
                ],

                question_number,

                question_id
            )
        )

    # --------------------------------------------------------
    # INSERT
    # --------------------------------------------------------

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

                question[
                    "question_text"
                ],

                question[
                    "question_type"
                ],

                question[
                    "explanation"
                ],

                question[
                    "knowledge"
                ],

                question[
                    "correct_answer"
                ],

                question_number
            )
        )

        question_id = cursor.fetchone()[0]

    return question_id


# ============================================================
# INSERT / UPDATE OPTIONS
# ============================================================

def insert_options(
    cursor,
    question_id,
    question
):

    options = question[
        "options"
    ]

    correct_answer = question[
        "correct_answer"
    ]

    # --------------------------------------------------------
    # A B C D
    # --------------------------------------------------------

    for index, option_key in enumerate(
        OPTIONS,
        start=1
    ):

        option_text = options[
            option_key
        ]

        is_correct = (
            option_key == correct_answer
        )

        # ----------------------------------------------------
        # Check option
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # UPDATE
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # INSERT
        # ----------------------------------------------------

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
# MAIN
# ============================================================

def main():

    connection = None
    cursor = None

    try:

        # ====================================================
        # LOAD JSON
        # ====================================================

        data = load_json()

        # ====================================================
        # VALIDATE JSON
        # ====================================================

        validate_json(data)

        # ====================================================
        # CONNECT DATABASE
        # ====================================================

        connection = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )

        connection.autocommit = False

        cursor = connection.cursor()

        print(
            "Database connected."
        )

        print()

        # ====================================================
        # CHECK 5 LESSONS
        # ====================================================

        print(
            "Checking Part 6 lessons..."
        )

        print()

        lesson_ids = {}

        for stage in range(
            1,
            6
        ):

            lesson_id = get_lesson_id(
                cursor,
                stage
            )

            lesson_ids[
                stage
            ] = lesson_id

        print()

        # ====================================================
        # IMPORT 100 GROUPS
        # ====================================================

        for group_data in data:

            group_number = group_data[
                "group"
            ]

            # ------------------------------------------------
            # Stage calculation
            #
            # 001-020 -> Stage 1
            # 021-040 -> Stage 2
            # 041-060 -> Stage 3
            # 061-080 -> Stage 4
            # 081-100 -> Stage 5
            # ------------------------------------------------

            stage = (
                (
                    group_number - 1
                )
                // GROUPS_PER_STAGE
            ) + 1

            lesson_id = lesson_ids[
                stage
            ]

            # ------------------------------------------------
            # GROUP
            # ------------------------------------------------

            group_id = insert_group(
                cursor,
                lesson_id,
                group_data,
                group_number
            )

            # ------------------------------------------------
            # QUESTIONS
            # ------------------------------------------------

            for question in group_data[
                "questions"
            ]:

                question_id = insert_question(
                    cursor,
                    group_id,
                    question
                )

                # --------------------------------------------
                # OPTIONS
                # --------------------------------------------

                insert_options(
                    cursor,
                    question_id,
                    question
                )

            print(
                f"[OK] "
                f"Group {group_number:03d} "
                f"| Stage {stage} "
                f"| Lesson ID {lesson_id} "
                f"| 4 questions"
            )

        # ====================================================
        # COMMIT
        # ====================================================

        connection.commit()

        print()

        print(
            "=============================================="
        )

        print(
            " IMPORT SUCCESS"
        )

        print(
            "=============================================="
        )

        print()

        print(
            f"Part       : {PART}"
        )

        print(
            f"Groups     : {TOTAL_GROUPS}"
        )

        print(
            f"Questions  : "
            f"{TOTAL_GROUPS * QUESTIONS_PER_GROUP}"
        )

        print(
            f"Options    : "
            f"{TOTAL_GROUPS * QUESTIONS_PER_GROUP * 4}"
        )

        print()

        print(
            "Stage distribution:"
        )

        print(
            "  Stage 1 : Group 001 - 020 "
            "-> Lesson ID 6"
        )

        print(
            "  Stage 2 : Group 021 - 040 "
            "-> Lesson ID 7"
        )

        print(
            "  Stage 3 : Group 041 - 060 "
            "-> Lesson ID 8"
        )

        print(
            "  Stage 4 : Group 061 - 080 "
            "-> Lesson ID 9"
        )

        print(
            "  Stage 5 : Group 081 - 100 "
            "-> Lesson ID 10"
        )

        print()

    except Exception as e:

        print()

        print(
            "=============================================="
        )

        print(
            " IMPORT ERROR"
        )

        print(
            "=============================================="
        )

        print()

        print(
            str(e)
        )

        print()

        if connection:

            try:

                connection.rollback()

                print(
                    "Database rollback completed."
                )

            except Exception:
                pass

        raise

    finally:

        if cursor:

            try:

                cursor.close()

            except Exception:
                pass

        if connection:

            try:

                connection.close()

            except Exception:
                pass


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    main()