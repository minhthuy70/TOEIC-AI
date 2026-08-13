#!/usr/bin/env python3

"""
TOEIC Database Import Script

Import TOEIC test JSON files into PostgreSQL using Prisma.

IMPORTANT:
The Prisma schema uses snake_case model names:

    tests
    question_groups
    questions
    options

Therefore the generated JavaScript MUST use:

    prisma.tests
    prisma.question_groups
    prisma.questions
    prisma.options

ID RULE:
    tests            -> MAX(id) + 1
    question_groups  -> MAX(id) + 1
    questions        -> MAX(id) + 1
    options          -> MAX(id) + 1

The IDs inside the JSON are NEVER used.

Example:

    tests max id            = 1
    question_groups max id  = 103
    questions max id        = 200
    options max id          = 676

Then the next imported test will use:

    test id       = 2
    first group   = 104
    first question= 201
    first option  = 677
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Optional


# ============================================================
# PATH CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data" / "tests"

API_DIR = BASE_DIR.parent / "apps" / "api"

SCHEMA_FILE = API_DIR / "prisma" / "schema.prisma"

NPM_COMMAND = "npm.cmd" if os.name == "nt" else "npm"

NPX_COMMAND = "npx.cmd" if os.name == "nt" else "npx"


# ============================================================
# DATABASE IMPORTER
# ============================================================

class DatabaseImporter:

    def __init__(self):

        self.imported_tests = 0

        self.imported_groups = 0

        self.imported_questions = 0

        self.imported_options = 0

        self.failed_tests: List[str] = []

    # ========================================================
    # RUN COMMAND
    # ========================================================

    def run_command(
        self,
        command: List[str],
        cwd: Path,
        timeout: int = 60
    ):

        return subprocess.run(
            command,
            cwd=str(cwd),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=timeout,
            shell=False
        )

    # ========================================================
    # CHECK PROJECT
    # ========================================================

    def check_project(self) -> bool:

        print("\n" + "=" * 70)
        print("CHECKING PROJECT")
        print("=" * 70)

        print(f"Project root : {BASE_DIR}")
        print(f"Data dir     : {DATA_DIR}")
        print(f"API dir      : {API_DIR}")
        print(f"Schema       : {SCHEMA_FILE}")

        if not BASE_DIR.exists():

            print(
                "[ERROR] BASE_DIR not found:\n"
                f"{BASE_DIR}"
            )

            return False

        if not DATA_DIR.exists():

            print(
                "[ERROR] Data directory not found:\n"
                f"{DATA_DIR}"
            )

            return False

        if not API_DIR.exists():

            print(
                "[ERROR] API directory not found:\n"
                f"{API_DIR}"
            )

            return False

        if not SCHEMA_FILE.exists():

            print(
                "[ERROR] Prisma schema not found:\n"
                f"{SCHEMA_FILE}"
            )

            return False

        package_json = API_DIR / "package.json"

        if not package_json.exists():

            print(
                "[WARNING] package.json not found in:\n"
                f"{API_DIR}"
            )

        return True

    # ========================================================
    # CHECK NODE / NPM / NPX
    # ========================================================

    def check_node_tools(self) -> bool:

        print("\n" + "=" * 70)
        print("CHECKING NODE.JS / NPM / NPX")
        print("=" * 70)

        commands = [

            (
                "Node.js",
                ["node", "--version"]
            ),

            (
                "npm",
                [NPM_COMMAND, "--version"]
            ),

            (
                "npx",
                [NPX_COMMAND, "--version"]
            ),

        ]

        for name, command in commands:

            try:

                result = self.run_command(
                    command,
                    API_DIR,
                    timeout=30
                )

                if result.returncode != 0:

                    print(
                        f"[ERROR] {name} check failed."
                    )

                    print(result.stderr)

                    return False

                print(
                    f"[OK] {name}: "
                    f"{result.stdout.strip()}"
                )

            except FileNotFoundError:

                print(
                    f"[ERROR] {name} executable "
                    "was not found."
                )

                return False

            except Exception as e:

                print(
                    f"[ERROR] Failed checking "
                    f"{name}: {e}"
                )

                return False

        return True

    # ========================================================
    # CHECK PRISMA CLI
    # ========================================================

    def check_prisma_cli(self) -> bool:

        print("\n" + "=" * 70)
        print("CHECKING PRISMA CLI")
        print("=" * 70)

        try:

            print(
                f"Running: "
                f"{NPX_COMMAND} prisma --version"
            )

            print(
                f"Working directory: {API_DIR}"
            )

            result = self.run_command(
                [
                    NPX_COMMAND,
                    "prisma",
                    "--version"
                ],
                API_DIR,
                timeout=30
            )

            if result.returncode == 0:

                print(
                    "[OK] Prisma CLI is available."
                )

                print(result.stdout.strip())

                return True

            print(
                "[ERROR] Prisma CLI command failed."
            )

            print("STDOUT:")
            print(result.stdout)

            print("STDERR:")
            print(result.stderr)

            return False

        except FileNotFoundError:

            print(
                f"[ERROR] `{NPX_COMMAND}` was not found."
            )

            return False

        except subprocess.TimeoutExpired:

            print(
                "[ERROR] Prisma CLI check timed out."
            )

            return False

        except Exception as e:

            print(
                f"[ERROR] Prisma CLI check failed: {e}"
            )

            return False

    # ========================================================
    # GENERATE PRISMA CLIENT
    # ========================================================

    def generate_prisma_client(self) -> bool:

        print("\n" + "=" * 70)
        print("GENERATING PRISMA CLIENT")
        print("=" * 70)

        try:

            print(
                f"Schema: {SCHEMA_FILE}"
            )

            print(
                f"Running: "
                f"{NPX_COMMAND} prisma generate "
                f"--schema {SCHEMA_FILE}"
            )

            result = self.run_command(
                [
                    NPX_COMMAND,
                    "prisma",
                    "generate",
                    "--schema",
                    str(SCHEMA_FILE),
                ],
                API_DIR,
                timeout=180
            )

            if result.stdout:
                print(result.stdout)

            if result.stderr:
                print(result.stderr)

            if result.returncode != 0:

                print(
                    "[ERROR] Prisma generate failed."
                )

                return False

            print(
                "[OK] Prisma Client generated."
            )

            return True

        except subprocess.TimeoutExpired:

            print(
                "[ERROR] Prisma generate timed out."
            )

            return False

        except Exception as e:

            print(
                f"[ERROR] Prisma generate failed: {e}"
            )

            return False

    # ========================================================
    # CHECK PRISMA CLIENT
    # ========================================================

    def check_prisma_client(self) -> bool:

        print("\n" + "=" * 70)
        print("CHECKING @PRISMA/CLIENT")
        print("=" * 70)

        try:

            result = self.run_command(
                [
                    "node",
                    "-e",
                    (
                        "const p=require('@prisma/client'); "
                        "console.log('PrismaClient:', "
                        "!!p.PrismaClient);"
                    ),
                ],
                API_DIR,
                timeout=30
            )

            if result.stdout:
                print(result.stdout)

            if result.returncode != 0:

                print(
                    "[ERROR] @prisma/client "
                    "cannot be loaded."
                )

                if result.stderr:
                    print(result.stderr)

                print()
                print("Try:")
                print("npm install")
                print("npx prisma generate")

                return False

            print(
                "[OK] @prisma/client is available."
            )

            return True

        except Exception as e:

            print(
                "[ERROR] Failed to check "
                f"@prisma/client: {e}"
            )

            return False

    # ========================================================
    # LOAD JSON
    # ========================================================

    def load_test_json(
        self,
        test_num: int
    ) -> Optional[Dict]:

        json_file = (
            DATA_DIR /
            f"test{test_num:03d}.json"
        )

        if not json_file.exists():

            print(
                "[ERROR] JSON file not found:\n"
                f"{json_file}"
            )

            return None

        try:

            with open(
                json_file,
                "r",
                encoding="utf-8"
            ) as f:

                return json.load(f)

        except json.JSONDecodeError as e:

            print(
                "[ERROR] Invalid JSON:\n"
                f"{json_file}"
            )

            print(e)

            return None

        except Exception as e:

            print(
                "[ERROR] Failed to read JSON:"
            )

            print(e)

            return None

    # ========================================================
    # JAVASCRIPT STRING ESCAPE
    # ========================================================

    def escape_string(
        self,
        value
    ) -> str:

        if value is None:
            return ""

        text = str(value)

        return (
            text
            .replace("\\", "\\\\")
            .replace("'", "\\'")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t")
        )

    # ========================================================
    # FORMAT NULLABLE STRING
    # ========================================================

    def format_nullable_string(
        self,
        value
    ) -> str:

        if value is None:
            return "null"

        text = str(value)

        if text == "":
            return "null"

        return (
            f"'{self.escape_string(text)}'"
        )

    # ========================================================
    # FORMAT NULLABLE INT
    # ========================================================

    def format_nullable_int(
        self,
        value
    ) -> str:

        if value is None:
            return "null"

        try:

            return str(int(value))

        except (
            ValueError,
            TypeError
        ):

            return "null"

    # ========================================================
    # FORMAT BOOLEAN
    # ========================================================

    def format_boolean(
        self,
        value
    ) -> str:

        return (
            "true"
            if bool(value)
            else "false"
        )

    # ========================================================
    # CREATE SEED SCRIPT
    # ========================================================

    def create_seed_script(
        self,
        test_num: int,
        test_info: Dict,
        question_groups: List[Dict]
    ) -> str:

        # ----------------------------------------------------
        # HEADER
        # ----------------------------------------------------

        script_lines = [

            "const { PrismaClient } = require('@prisma/client');",

            "",

            "const prisma = new PrismaClient();",

            "",

            "async function main() {",

            f"  console.log('Importing test{test_num:03d}...');",

            "",

            "  // ==================================================",
            "  // GET CURRENT MAX IDS",
            "  // ==================================================",

            "",

            "  const maxTest = await prisma.tests.aggregate({",
            "    _max: { id: true }",
            "  });",

            "",

            "  const maxGroup = await prisma.question_groups.aggregate({",
            "    _max: { id: true }",
            "  });",

            "",

            "  const maxQuestion = await prisma.questions.aggregate({",
            "    _max: { id: true }",
            "  });",

            "",

            "  const maxOption = await prisma.options.aggregate({",
            "    _max: { id: true }",
            "  });",

            "",

            "  // ==================================================",
            "  // NEXT IDS",
            "  // ==================================================",

            "",

            "  let nextTestId = (maxTest._max.id || 0) + 1;",

            "  let nextGroupId = (maxGroup._max.id || 0) + 1;",

            "  let nextQuestionId = (maxQuestion._max.id || 0) + 1;",

            "  let nextOptionId = (maxOption._max.id || 0) + 1;",

            "",

            "  console.log('Current max IDs:');",

            "  console.log('  tests           :', maxTest._max.id);",

            "  console.log('  question_groups :', maxGroup._max.id);",

            "  console.log('  questions       :', maxQuestion._max.id);",

            "  console.log('  options         :', maxOption._max.id);",

            "",

            "  console.log('Next IDs:');",

            "  console.log('  tests           :', nextTestId);",

            "  console.log('  question_groups :', nextGroupId);",

            "  console.log('  questions       :', nextQuestionId);",

            "  console.log('  options         :', nextOptionId);",

            "",
        ]

        # ====================================================
        # TEST INFORMATION
        # ====================================================

        test_title = test_info.get(
            "title",
            f"TOEIC Test {test_num:03d}"
        )

        test_duration = test_info.get(
            "duration",
            120
        )

        test_total_questions = test_info.get(
            "total_questions",
            200
        )

        test_description = test_info.get(
            "description",
            ""
        )

        test_is_active = test_info.get(
            "is_active",
            True
        )

        # ====================================================
        # TEST
        # ====================================================

        script_lines.extend([

            "  // ==================================================",
            "  // TEST",
            "  // ==================================================",

            "",

            "  const currentTestId = nextTestId++;",

            "",

            "  const test = await prisma.tests.create({",

            "    data: {",

            "      id: currentTestId,",

            f"      title: {self.format_nullable_string(test_title)},",

            f"      duration: {self.format_nullable_int(test_duration)},",

            f"      total_questions: "
            f"{self.format_nullable_int(test_total_questions)},",

            f"      description: "
            f"{self.format_nullable_string(test_description)},",

            f"      is_active: "
            f"{self.format_boolean(test_is_active)}",

            "    }",

            "  });",

            "",

            "  console.log('Test:', test.id);",

            "",
        ])

        # ====================================================
        # QUESTION GROUPS
        # ====================================================

        group_counter = 0

        for group in question_groups:

            group_counter += 1

            # ------------------------------------------------
            # CREATE UNIQUE GROUP ID
            #
            # IMPORTANT:
            # Do NOT use const currentGroupId here.
            #
            # We use a unique variable name for every generated
            # group so there is NO duplicate declaration.
            # ------------------------------------------------

            group_variable = (
                f"group_{group_counter}"
            )

            group_id_variable = (
                f"groupId_{group_counter}"
            )

            script_lines.extend([

                "",

                "  // ==================================================",

                f"  // QUESTION GROUP {group_counter}",

                "  // ==================================================",

                "",

                f"  const {group_id_variable} = "
                "nextGroupId++;",

            ])

            # ------------------------------------------------
            # GROUP DATA
            # ------------------------------------------------

            part = group.get("part")

            group_type = group.get(
                "group_type"
            )

            title = group.get(
                "title"
            )

            passage = group.get(
                "passage"
            )

            image_url = group.get(
                "image_url"
            )

            audio_url = group.get(
                "audio_url"
            )

            display_order = group.get(
                "display_order",
                group_counter
            )

            audio_start_time = group.get(
                "audio_start_time"
            )

            audio_end_time = group.get(
                "audio_end_time"
            )

            knowledge = group.get(
                "knowledge"
            )

            script_lines.extend([

                "",

                f"  const {group_variable} = "
                "await prisma.question_groups.create({",

                "    data: {",

                f"      id: {group_id_variable},",

                "      test_id: currentTestId,",

                f"      part: "
                f"{self.format_nullable_int(part)},",

                f"      group_type: "
                f"{self.format_nullable_string(group_type)},",

                f"      title: "
                f"{self.format_nullable_string(title)},",

                f"      passage: "
                f"{self.format_nullable_string(passage)},",

                f"      image_url: "
                f"{self.format_nullable_string(image_url)},",

                f"      audio_url: "
                f"{self.format_nullable_string(audio_url)},",

                f"      display_order: "
                f"{self.format_nullable_int(display_order)},",

                f"      audio_start_time: "
                f"{self.format_nullable_int(audio_start_time)},",

                f"      audio_end_time: "
                f"{self.format_nullable_int(audio_end_time)},",

                f"      knowledge: "
                f"{self.format_nullable_string(knowledge)}",

                "    }",

                "  });",

                "",

                "  console.log(",

                f"    'Group {group_counter}:',",

                f"    {group_variable}.id",

                "  );",

                "",
            ])

            # =================================================
            # QUESTIONS
            # =================================================

            questions = group.get(
                "questions",
                []
            )

            for question_counter, question in enumerate(
                questions
            ):

                # ------------------------------------------------
                # UNIQUE VARIABLE NAMES
                # ------------------------------------------------

                question_variable = (
                    f"question_{group_counter}_"
                    f"{question_counter + 1}"
                )

                question_id_variable = (
                    f"questionId_{group_counter}_"
                    f"{question_counter + 1}"
                )

                script_lines.extend([

                    "",

                    f"  // Question "
                    f"{question_counter + 1}",

                    "",

                    f"  const {question_id_variable} = "
                    "nextQuestionId++;",

                ])

                # ------------------------------------------------
                # QUESTION DATA
                # ------------------------------------------------

                question_number = question.get(
                    "question_number"
                )

                question_text = question.get(
                    "question_text"
                )

                correct_answer = question.get(
                    "correct_answer"
                )

                explanation = question.get(
                    "explanation"
                )

                q_display_order = question.get(
                    "display_order",
                    question_counter + 1
                )

                script_lines.extend([

                    "",

                    f"  const {question_variable} = "
                    "await prisma.questions.create({",

                    "    data: {",

                    f"      id: {question_id_variable},",

                    f"      group_id: {group_id_variable},",

                    f"      question_number: "
                    f"{self.format_nullable_int(question_number)},",

                    f"      question_text: "
                    f"{self.format_nullable_string(question_text)},",

                    f"      correct_answer: "
                    f"{self.format_nullable_string(correct_answer)},",

                    f"      explanation: "
                    f"{self.format_nullable_string(explanation)},",

                    f"      display_order: "
                    f"{self.format_nullable_int(q_display_order)}",

                    "    }",

                    "  });",

                    "",

                    "  console.log(",

                    f"    'Question "
                    f"{question_counter + 1}:',",

                    f"    {question_variable}.id",

                    "  );",

                    "",
                ])

                # =============================================
                # OPTIONS
                # =============================================

                options = question.get(
                    "options",
                    []
                )

                for option_counter, option in enumerate(
                    options
                ):

                    # -----------------------------------------
                    # UNIQUE VARIABLE NAME
                    # -----------------------------------------

                    option_variable = (
                        f"option_"
                        f"{group_counter}_"
                        f"{question_counter + 1}_"
                        f"{option_counter + 1}"
                    )

                    option_id_variable = (
                        f"optionId_"
                        f"{group_counter}_"
                        f"{question_counter + 1}_"
                        f"{option_counter + 1}"
                    )

                    script_lines.extend([

                        "",

                        f"  // Option "
                        f"{option_counter + 1}",

                        "",

                        f"  const {option_id_variable} = "
                        "nextOptionId++;",

                        "",

                    ])

                    option_label = option.get(
                        "option_label"
                    )

                    option_text = option.get(
                        "option_text"
                    )

                    o_display_order = option.get(
                        "display_order",
                        option_counter + 1
                    )

                    script_lines.extend([

                        f"  const {option_variable} = "
                        "await prisma.options.create({",

                        "    data: {",

                        f"      id: {option_id_variable},",

                        f"      question_id: "
                        f"{question_id_variable},",

                        f"      option_label: "
                        f"{self.format_nullable_string(option_label)},",

                        f"      option_text: "
                        f"{self.format_nullable_string(option_text)},",

                        f"      display_order: "
                        f"{self.format_nullable_int(o_display_order)}",

                        "    }",

                        "  });",

                    ])

                script_lines.append("")

        # ====================================================
        # FINISH
        # ====================================================

        script_lines.extend([

            "  console.log('IMPORT_COMPLETED_SUCCESSFULLY');",

            "}",

            "",

            "main()",

            "  .then(async () => {",

            "    await prisma.$disconnect();",

            "  })",

            "  .catch(async (error) => {",

            "    console.error('IMPORT_FAILED');",

            "    console.error(error);",

            "    await prisma.$disconnect();",

            "    process.exit(1);",

            "  });",

        ])

        return "\n".join(script_lines)

    # ========================================================
    # EXECUTE SEED
    # ========================================================

    def execute_seed_script(
        self,
        script: str,
        test_num: int
    ) -> bool:

        seed_file = (
            API_DIR /
            f"temp_seed_test{test_num:03d}.cjs"
        )

        try:

            with open(
                seed_file,
                "w",
                encoding="utf-8"
            ) as f:

                f.write(script)

            print()

            print(
                f"[RUN] node "
                f"{seed_file.name}"
            )

            result = self.run_command(
                [
                    "node",
                    str(seed_file)
                ],
                API_DIR,
                timeout=300
            )

            if result.stdout:
                print(result.stdout)

            if result.stderr:
                print(result.stderr)

            if result.returncode == 0:

                print(
                    f"[SUCCESS] test"
                    f"{test_num:03d} "
                    "database import completed."
                )

                return True

            print(
                f"[ERROR] test"
                f"{test_num:03d} "
                "database import failed."
            )

            return False

        except subprocess.TimeoutExpired:

            print(
                f"[ERROR] test"
                f"{test_num:03d} "
                "import timed out."
            )

            return False

        except Exception as e:

            print(
                "[ERROR] Failed to execute "
                f"seed script: {e}"
            )

            return False

        finally:

            if seed_file.exists():

                try:

                    seed_file.unlink()

                except Exception as e:

                    print(
                        "[WARNING] Could not delete "
                        "temporary file: "
                        f"{seed_file}"
                    )

                    print(e)

    # ========================================================
    # IMPORT ONE TEST
    # ========================================================

    def import_test_data(
        self,
        test_num: int
    ) -> bool:

        print("\n")

        print("=" * 70)

        print(
            f"IMPORTING TEST "
            f"{test_num:03d}"
        )

        print("=" * 70)

        data = self.load_test_json(
            test_num
        )

        if not data:

            self.failed_tests.append(
                f"test{test_num:03d} - JSON load error"
            )

            return False

        test_info = data.get(
            "test",
            {}
        )

        question_groups = data.get(
            "question_groups",
            []
        )

        if not test_info:

            print(
                "[ERROR] JSON does not contain "
                "test information."
            )

            self.failed_tests.append(
                f"test{test_num:03d} - "
                "No test information"
            )

            return False

        if not question_groups:

            print(
                "[WARNING] "
                f"test{test_num:03d} "
                "has no question groups."
            )

        question_count = 0

        option_count = 0

        for group in question_groups:

            questions = group.get(
                "questions",
                []
            )

            question_count += len(
                questions
            )

            for question in questions:

                option_count += len(
                    question.get(
                        "options",
                        []
                    )
                )

        print()

        print("JSON CONTENT:")

        print(
            f"  Test            : "
            f"test{test_num:03d}"
        )

        print(
            f"  Groups          : "
            f"{len(question_groups)}"
        )

        print(
            f"  Questions       : "
            f"{question_count}"
        )

        print(
            f"  Options         : "
            f"{option_count}"
        )

        image_count = sum(

            1

            for group in question_groups

            if group.get("image_url")

        )

        audio_count = sum(

            1

            for group in question_groups

            if group.get("audio_url")

        )

        print(
            f"  Image URLs      : "
            f"{image_count}"
        )

        print(
            f"  Audio URLs      : "
            f"{audio_count}"
        )

        # ----------------------------------------------------
        # CREATE JS SEED
        # ----------------------------------------------------

        seed_script = self.create_seed_script(
            test_num,
            test_info,
            question_groups
        )

        # ----------------------------------------------------
        # EXECUTE
        # ----------------------------------------------------

        success = self.execute_seed_script(
            seed_script,
            test_num
        )

        if not success:

            self.failed_tests.append(
                f"test{test_num:03d} - "
                "Database import failed"
            )

            return False

        self.imported_tests += 1

        self.imported_groups += (
            len(question_groups)
        )

        self.imported_questions += (
            question_count
        )

        self.imported_options += (
            option_count
        )

        return True

    # ========================================================
    # SUMMARY
    # ========================================================

    def print_summary(self):

        print("\n")

        print("=" * 70)

        print(
            "DATABASE IMPORT SUMMARY"
        )

        print("=" * 70)

        print(
            f"Tests imported       : "
            f"{self.imported_tests}"
        )

        print(
            f"Question groups      : "
            f"{self.imported_groups}"
        )

        print(
            f"Questions            : "
            f"{self.imported_questions}"
        )

        print(
            f"Options              : "
            f"{self.imported_options}"
        )

        if self.failed_tests:

            print()

            print(
                f"FAILED TESTS "
                f"({len(self.failed_tests)}):"
            )

            for test in self.failed_tests:

                print(
                    f"  - {test}"
                )

        else:

            print()

            print(
                "[SUCCESS] "
                "All requested tests "
                "imported successfully."
            )


# ============================================================
# MAIN
# ============================================================

def main():

    parser = argparse.ArgumentParser(

        description=(

            "Import TOEIC test JSON files "
            "into PostgreSQL using Prisma."

        )

    )

    parser.add_argument(

        "--from",

        dest="start_test",

        type=int,

        default=1,

        help=(
            "Start test number. "
            "Default: 1"
        )

    )

    parser.add_argument(

        "--to",

        dest="end_test",

        type=int,

        default=100,

        help=(
            "End test number. "
            "Default: 100"
        )

    )

    parser.add_argument(

        "--test",

        type=int,

        help=(
            "Import only one test."
        )

    )

    args = parser.parse_args()

    importer = DatabaseImporter()

    # ========================================================
    # CHECK PROJECT
    # ========================================================

    if not importer.check_project():

        sys.exit(1)

    # ========================================================
    # CHECK NODE TOOLS
    # ========================================================

    if not importer.check_node_tools():

        sys.exit(1)

    # ========================================================
    # CHECK PRISMA CLI
    # ========================================================

    if not importer.check_prisma_cli():

        print()

        print(
            "[ERROR] Prisma CLI "
            "is not available."
        )

        print()

        print(
            "Run from apps/api:"
        )

        print(
            "  npx prisma --version"
        )

        sys.exit(1)

    # ========================================================
    # GENERATE CLIENT
    # ========================================================

    if not importer.generate_prisma_client():

        print()

        print(
            "[ERROR] Could not generate "
            "Prisma Client."
        )

        sys.exit(1)

    # ========================================================
    # CHECK CLIENT
    # ========================================================

    if not importer.check_prisma_client():

        print()

        print(
            "[ERROR] @prisma/client "
            "is not available."
        )

        print()

        print(
            "From apps/api run:"
        )

        print(
            "  npm install"
        )

        print(
            "  npx prisma generate"
        )

        sys.exit(1)

    # ========================================================
    # DETERMINE TEST RANGE
    # ========================================================

    if args.test is not None:

        if args.test < 1:

            print(
                "[ERROR] Test number "
                "must be >= 1."
            )

            sys.exit(1)

        test_range = [
            args.test
        ]

    else:

        if args.start_test < 1:

            print(
                "[ERROR] --from "
                "must be >= 1."
            )

            sys.exit(1)

        if args.end_test < args.start_test:

            print(
                "[ERROR] --to "
                "must be >= --from."
            )

            sys.exit(1)

        test_range = list(

            range(

                args.start_test,

                args.end_test + 1

            )

        )

    # ========================================================
    # START
    # ========================================================

    print()

    print("=" * 70)

    print(
        "TOEIC DATABASE IMPORT"
    )

    print("=" * 70)

    if len(test_range) == 1:

        print(
            f"Test range       : "
            f"test{test_range[0]:03d}"
        )

    else:

        print(
            f"Test range       : "
            f"test{test_range[0]:03d} "
            f"-> "
            f"test{test_range[-1]:03d}"
        )

    print(
        f"Data directory    : "
        f"{DATA_DIR}"
    )

    print(
        f"API directory     : "
        f"{API_DIR}"
    )

    print(
        f"npx command       : "
        f"{NPX_COMMAND}"
    )

    print()

    # ========================================================
    # IMPORT
    # ========================================================

    for test_num in test_range:

        importer.import_test_data(
            test_num
        )

    # ========================================================
    # SUMMARY
    # ========================================================

    importer.print_summary()

    if importer.failed_tests:

        sys.exit(1)

    sys.exit(0)


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()