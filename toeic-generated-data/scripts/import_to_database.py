#!/usr/bin/env python3
"""
TOEIC Database Import Script

Import TOEIC test JSON files into PostgreSQL using Prisma.

Usage:
    python scripts/import_to_database.py --test 1
    python scripts/import_to_database.py --from 1 --to 100

Features:
    - Windows compatible: uses npx.cmd
    - Linux/macOS compatible: uses npx
    - Uses Prisma from apps/api
    - Automatically runs Prisma generate
    - Checks @prisma/client
    - Upserts tests
    - Upserts question groups
    - Upserts questions
    - Upserts options
    - Keeps image_url / audio_url
    - Deterministic IDs
    - Safe to re-run
    - Continues importing remaining tests if one test fails
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

# Current:
# toeic-ai/toeic-generated-data/scripts/import_to_database.py
#
# BASE_DIR:
# toeic-ai/toeic-generated-data
BASE_DIR = Path(__file__).resolve().parent.parent

# toeic-ai/toeic-generated-data/data/tests
DATA_DIR = BASE_DIR / "data" / "tests"

# toeic-ai/apps/api
API_DIR = BASE_DIR.parent / "apps" / "api"

# Try to find Prisma schema
SCHEMA_CANDIDATES = [
    API_DIR / "prisma" / "schema.prisma",
    API_DIR / "prisma" / "schema" / "schema.prisma",
]


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

        # Windows requires npx.cmd
        self.npx_command = "npx.cmd" if os.name == "nt" else "npx"

        # node is normally node.exe on Windows but "node" works
        self.node_command = "node"

    # ========================================================
    # RUN COMMAND
    # ========================================================

    def run_command(
        self,
        command: List[str],
        cwd: Path,
        timeout: int = 60
    ):
        """
        Run a command safely.

        Important:
        Windows uses npx.cmd instead of npx when
        subprocess.run(..., shell=False).
        """

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

        print()
        print("=" * 70)
        print("CHECKING PROJECT")
        print("=" * 70)

        print(f"Project root : {BASE_DIR}")
        print(f"Data dir     : {DATA_DIR}")
        print(f"API dir      : {API_DIR}")

        # ----------------------------------------------------
        # BASE DIR
        # ----------------------------------------------------

        if not BASE_DIR.exists():
            print()
            print(f"[ERROR] BASE_DIR not found:")
            print(BASE_DIR)
            return False

        # ----------------------------------------------------
        # DATA DIR
        # ----------------------------------------------------

        if not DATA_DIR.exists():
            print()
            print("[ERROR] Data directory not found:")
            print(DATA_DIR)
            return False

        # ----------------------------------------------------
        # API DIR
        # ----------------------------------------------------

        if not API_DIR.exists():
            print()
            print("[ERROR] API directory not found:")
            print(API_DIR)
            return False

        # ----------------------------------------------------
        # package.json
        # ----------------------------------------------------

        package_json = API_DIR / "package.json"

        if not package_json.exists():
            print()
            print("[WARNING] package.json not found:")
            print(package_json)

        # ----------------------------------------------------
        # schema.prisma
        # ----------------------------------------------------

        schema = self.find_schema()

        if schema:
            print(f"Schema        : {schema}")
        else:
            print()
            print("[WARNING] schema.prisma was not found automatically.")

        return True

    # ========================================================
    # FIND PRISMA SCHEMA
    # ========================================================

    def find_schema(self) -> Optional[Path]:

        for candidate in SCHEMA_CANDIDATES:

            if candidate.exists():
                return candidate

        # Recursive fallback
        try:
            schemas = list(
                API_DIR.rglob("schema.prisma")
            )

            if schemas:
                return schemas[0]

        except Exception:
            pass

        return None

    # ========================================================
    # CHECK NODE
    # ========================================================

    def check_node(self) -> bool:

        print()
        print("=" * 70)
        print("CHECKING NODE.JS / NPM / NPX")
        print("=" * 70)

        commands = [
            ([self.node_command, "--version"], "Node.js"),
            (["npm.cmd" if os.name == "nt" else "npm", "--version"], "npm"),
            ([self.npx_command, "--version"], "npx"),
        ]

        for command, name in commands:

            try:

                result = self.run_command(
                    command,
                    BASE_DIR,
                    timeout=20
                )

                if result.returncode == 0:

                    version = (
                        result.stdout.strip()
                        or result.stderr.strip()
                    )

                    print(
                        f"[OK] {name}: {version}"
                    )

                else:

                    print(
                        f"[ERROR] {name} failed."
                    )

                    if result.stderr:
                        print(result.stderr)

                    return False

            except FileNotFoundError:

                print(
                    f"[ERROR] {name} executable was not found."
                )

                return False

            except Exception as e:

                print(
                    f"[ERROR] Failed checking {name}: {e}"
                )

                return False

        return True

    # ========================================================
    # CHECK PRISMA CLI
    # ========================================================

    def check_prisma_cli(self) -> bool:

        print()
        print("=" * 70)
        print("CHECKING PRISMA CLI")
        print("=" * 70)

        print(
            f"Running: {self.npx_command} prisma --version"
        )

        print(
            f"Working directory: {API_DIR}"
        )

        try:

            result = self.run_command(
                [
                    self.npx_command,
                    "prisma",
                    "--version"
                ],
                API_DIR,
                timeout=60
            )

            if result.returncode == 0:

                print(
                    "[OK] Prisma CLI is available."
                )

                if result.stdout:
                    print(result.stdout.strip())

                return True

            print(
                "[ERROR] Prisma CLI command failed."
            )

            if result.stdout:
                print("STDOUT:")
                print(result.stdout)

            if result.stderr:
                print("STDERR:")
                print(result.stderr)

            return False

        except FileNotFoundError:

            print(
                f"[ERROR] `{self.npx_command}` was not found."
            )

            print()
            print(
                "But Node.js should be installed."
            )

            print(
                "Try in PowerShell:"
            )

            print(
                "  node --version"
            )

            print(
                "  npm --version"
            )

            print(
                "  npx --version"
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

        print()
        print("=" * 70)
        print("GENERATING PRISMA CLIENT")
        print("=" * 70)

        schema = self.find_schema()

        command = [
            self.npx_command,
            "prisma",
            "generate"
        ]

        if schema:

            command.extend([
                "--schema",
                str(schema)
            ])

            print(
                f"Schema: {schema}"
            )

        print(
            "Running:",
            " ".join(command)
        )

        try:

            result = self.run_command(
                command,
                API_DIR,
                timeout=300
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

        except FileNotFoundError:

            print()
            print(
                f"[ERROR] `{self.npx_command}` was not found."
            )

            return False

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

        print()
        print("=" * 70)
        print("CHECKING @PRISMA/CLIENT")
        print("=" * 70)

        try:

            result = self.run_command(
                [
                    self.node_command,
                    "-e",
                    (
                        "const p=require('@prisma/client'); "
                        "console.log('PrismaClient:', "
                        "!!p.PrismaClient);"
                    )
                ],
                API_DIR,
                timeout=30
            )

            if result.stdout:
                print(result.stdout.strip())

            if result.returncode != 0:

                print(
                    "[ERROR] @prisma/client cannot be loaded."
                )

                if result.stderr:
                    print(result.stderr)

                return False

            print(
                "[OK] @prisma/client is available."
            )

            return True

        except FileNotFoundError:

            print(
                "[ERROR] Node.js executable not found."
            )

            return False

        except Exception as e:

            print(
                f"[ERROR] Failed to check @prisma/client: {e}"
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

            print()
            print(
                "[ERROR] JSON file not found:"
            )

            print(json_file)

            return None

        try:

            with open(
                json_file,
                "r",
                encoding="utf-8"
            ) as f:

                return json.load(f)

        except json.JSONDecodeError as e:

            print()
            print(
                "[ERROR] Invalid JSON:"
            )

            print(json_file)
            print(e)

            return None

        except Exception as e:

            print()
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

            return str(
                int(value)
            )

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

        script_lines = [

            "const { PrismaClient } = require('@prisma/client');",

            "const prisma = new PrismaClient();",

            "",

            "async function main() {",

            f"  console.log('Importing test{test_num:03d}...');",

            "",

        ]

        # ====================================================
        # TEST
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

        script_lines.extend([

            "  // TEST",

            "  const test = await prisma.tests.upsert({",

            f"    where: {{ id: {test_num} }},",

            "    update: {",

            f"      title: {self.format_nullable_string(test_title)},",

            f"      duration: {self.format_nullable_int(test_duration)},",

            f"      total_questions: {self.format_nullable_int(test_total_questions)},",

            f"      description: {self.format_nullable_string(test_description)},",

            f"      is_active: {self.format_boolean(test_is_active)}",

            "    },",

            "    create: {",

            f"      id: {test_num},",

            f"      title: {self.format_nullable_string(test_title)},",

            f"      duration: {self.format_nullable_int(test_duration)},",

            f"      total_questions: {self.format_nullable_int(test_total_questions)},",

            f"      description: {self.format_nullable_string(test_description)},",

            f"      is_active: {self.format_boolean(test_is_active)}",

            "    }",

            "  });",

            "  console.log('Test:', test.id);",

            "",

        ])

        # ====================================================
        # QUESTION GROUPS
        # ====================================================

        group_counter = 0

        for group in question_groups:

            group_counter += 1

            # Deterministic group ID
            group_id = (
                test_num * 1000
                + group_counter
            )

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

                f"  // QUESTION GROUP {group_counter}",

                f"  const group{group_counter} = "
                f"await prisma.questionGroups.upsert({{",

                f"    where: {{ id: {group_id} }},",

                "    update: {",

                f"      part: {self.format_nullable_int(part)},",

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

                "    },",

                "    create: {",

                f"      id: {group_id},",

                f"      test_id: {test_num},",

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

                f"  console.log("
                f"'Group {group_counter}:', "
                f"group{group_counter}.id);",

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

                # Deterministic question ID
                question_id = (
                    group_id * 100
                    + question_counter
                    + 1
                )

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

                var_name = (
                    f"question_"
                    f"{group_counter}_"
                    f"{question_counter}"
                )

                script_lines.extend([

                    f"  // QUESTION "
                    f"{question_counter + 1}",

                    f"  const {var_name} = "
                    f"await prisma.questions.upsert({{",

                    f"    where: {{ id: {question_id} }},",

                    "    update: {",

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

                    "    },",

                    "    create: {",

                    f"      id: {question_id},",

                    f"      group_id: {group_id},",

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

                    f"  console.log("
                    f"'Question {question_counter + 1}:', "
                    f"{var_name}.id);",

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

                    # Deterministic option ID
                    option_id = (
                        question_id * 10
                        + option_counter
                        + 1
                    )

                    option_label = option.get(
                        "option_label"
                    )

                    option_text = option.get(
                        "option_text"
                    )

                    is_correct = option.get(
                        "is_correct",
                        False
                    )

                    o_display_order = option.get(
                        "display_order",
                        option_counter + 1
                    )

                    script_lines.extend([

                        f"  // OPTION "
                        f"{option_counter + 1}",

                        "  await prisma.options.upsert({",

                        f"    where: {{ id: {option_id} }},",

                        "    update: {",

                        f"      option_label: "
                        f"{self.format_nullable_string(option_label)},",

                        f"      option_text: "
                        f"{self.format_nullable_string(option_text)},",

                        f"      is_correct: "
                        f"{self.format_boolean(is_correct)},",

                        f"      display_order: "
                        f"{self.format_nullable_int(o_display_order)}",

                        "    },",

                        "    create: {",

                        f"      id: {option_id},",

                        f"      question_id: {question_id},",

                        f"      option_label: "
                        f"{self.format_nullable_string(option_label)},",

                        f"      option_text: "
                        f"{self.format_nullable_string(option_text)},",

                        f"      is_correct: "
                        f"{self.format_boolean(is_correct)},",

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
                f"[RUN] node {seed_file.name}"
            )

            result = self.run_command(
                [
                    self.node_command,
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

                print()
                print(
                    f"[SUCCESS] "
                    f"test{test_num:03d} "
                    f"database import completed."
                )

                return True

            print()
            print(
                f"[ERROR] "
                f"test{test_num:03d} "
                f"database import failed."
            )

            return False

        except FileNotFoundError:

            print()
            print(
                "[ERROR] Node.js was not found."
            )

            return False

        except subprocess.TimeoutExpired:

            print()
            print(
                f"[ERROR] "
                f"test{test_num:03d} "
                f"import timed out."
            )

            return False

        except Exception as e:

            print()
            print(
                f"[ERROR] "
                f"Failed to execute seed script: {e}"
            )

            return False

        finally:

            if seed_file.exists():

                try:

                    seed_file.unlink()

                except Exception as e:

                    print(
                        "[WARNING] "
                        "Could not delete temporary file:"
                    )

                    print(seed_file)
                    print(e)

    # ========================================================
    # IMPORT ONE TEST
    # ========================================================

    def import_test_data(
        self,
        test_num: int
    ) -> bool:

        print()
        print("=" * 70)
        print(
            f"IMPORTING TEST {test_num:03d}"
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
                "[ERROR] "
                "JSON does not contain test information."
            )

            self.failed_tests.append(
                f"test{test_num:03d} - "
                f"No test information"
            )

            return False

        # ====================================================
        # COUNT
        # ====================================================

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

        # ====================================================
        # MEDIA
        # ====================================================

        image_count = 0
        audio_count = 0

        for group in question_groups:

            if group.get("image_url"):
                image_count += 1

            if group.get("audio_url"):
                audio_count += 1

        print(
            f"  Image URLs      : "
            f"{image_count}"
        )

        print(
            f"  Audio URLs      : "
            f"{audio_count}"
        )

        # ====================================================
        # CREATE SEED
        # ====================================================

        seed_script = self.create_seed_script(
            test_num,
            test_info,
            question_groups
        )

        # ====================================================
        # EXECUTE
        # ====================================================

        success = self.execute_seed_script(
            seed_script,
            test_num
        )

        if not success:

            self.failed_tests.append(
                f"test{test_num:03d} - "
                f"Database import failed"
            )

            return False

        # ====================================================
        # STATISTICS
        # ====================================================

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

        print()
        print("=" * 70)
        print("DATABASE IMPORT SUMMARY")
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
                "All requested tests imported successfully."
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
        help="Start test number. Default: 1"
    )

    parser.add_argument(
        "--to",
        dest="end_test",
        type=int,
        default=100,
        help="End test number. Default: 100"
    )

    parser.add_argument(
        "--test",
        type=int,
        help="Import only one test."
    )

    args = parser.parse_args()

    importer = DatabaseImporter()

    # ========================================================
    # CHECK PROJECT
    # ========================================================

    if not importer.check_project():
        sys.exit(1)

    # ========================================================
    # CHECK NODE
    # ========================================================

    if not importer.check_node():
        sys.exit(1)

    # ========================================================
    # CHECK PRISMA
    # ========================================================

    if not importer.check_prisma_cli():

        print()
        print(
            "[ERROR] Prisma CLI is not available."
        )

        print()
        print(
            "Run manually from apps/api:"
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
            "[ERROR] "
            "Could not generate Prisma Client."
        )

        print()
        print(
            "Try manually:"
        )

        print(
            "  cd apps/api"
        )

        print(
            "  npx prisma generate"
        )

        sys.exit(1)

    # ========================================================
    # CHECK CLIENT
    # ========================================================

    if not importer.check_prisma_client():

        print()
        print(
            "[ERROR] "
            "@prisma/client is not available."
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
                "[ERROR] "
                "Test number must be >= 1."
            )

            sys.exit(1)

        test_range = [
            args.test
        ]

    else:

        if args.start_test < 1:

            print(
                "[ERROR] "
                "--from must be >= 1."
            )

            sys.exit(1)

        if args.end_test < args.start_test:

            print(
                "[ERROR] "
                "--to must be >= --from."
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
    print("TOEIC DATABASE IMPORT")
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
        f"Data directory   : "
        f"{DATA_DIR}"
    )

    print(
        f"API directory    : "
        f"{API_DIR}"
    )

    print(
        f"npx command      : "
        f"{importer.npx_command}"
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

    # ========================================================
    # EXIT
    # ========================================================

    if importer.failed_tests:
        sys.exit(1)

    sys.exit(0)


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()