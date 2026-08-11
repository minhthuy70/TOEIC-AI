import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface Test {
  title: string;
  duration: number;
  total_questions: number;
  description: string;
  is_active: boolean;
}

interface Question {
  question_number: number;
  question_text: string | null;
  correct_answer: string;
  explanation: string | null;
  options: Option[];
}

interface Option {
  option_label: string;
  option_text: string;
  is_correct: boolean;
  display_order: number;
}

interface QuestionGroup {
  part: number;
  title: string | null;
  passage: string | null;
  image_url: string | null;
  audio_url: string | null;
  display_order: number;
  group_type: string;
  audio_start_time: number;
  audio_end_time: number;
  knowledge: string | null;
  questions: Question[];
}

interface TestData {
  test: Test;
  question_groups: QuestionGroup[];
}

async function importTest(testFilePath: string): Promise<void> {
  console.log(`Importing ${path.basename(testFilePath)}...`);

  const fileContent = fs.readFileSync(testFilePath, 'utf-8');
  const testData: TestData = JSON.parse(fileContent);

  try {
    // Use transaction for each test
    await prisma.$transaction(async (tx) => {
      // Insert test
      const test = await tx.tests.create({
        data: {
          title: testData.test.title,
          duration: testData.test.duration,
          total_questions: testData.test.total_questions,
          description: testData.test.description,
          is_active: testData.test.is_active,
        },
      });

      console.log(`  Created test with ID: ${test.id}`);

      // Insert question groups and questions
      for (const group of testData.question_groups) {
        const questionGroup = await tx.question_groups.create({
          data: {
            test_id: test.id,
            part: group.part,
            title: group.title,
            passage: group.passage,
            image_url: group.image_url,
            audio_url: group.audio_url,
            display_order: group.display_order,
            group_type: group.group_type,
            audio_start_time: group.audio_start_time,
            audio_end_time: group.audio_end_time,
            knowledge: group.knowledge,
          },
        });

        // Insert questions for this group
        for (const question of group.questions) {
          const createdQuestion = await tx.questions.create({
            data: {
              group_id: questionGroup.id,
              question_number: question.question_number,
              question_text: question.question_text,
              correct_answer: question.correct_answer,
              explanation: question.explanation,
              display_order: group.questions.indexOf(question) + 1,
            },
          });

          // Insert options for this question
          for (const option of question.options) {
            await tx.options.create({
              data: {
                question_id: createdQuestion.id,
                option_label: option.option_label,
                option_text: option.option_text,
                display_order: option.display_order,
              },
            });
          }
        }
      }

      console.log(`  Successfully imported test ${test.id}`);
    });

    console.log(`  ✓ ${path.basename(testFilePath)} imported successfully\n`);
  } catch (error) {
    console.error(`  ✗ Error importing ${path.basename(testFilePath)}:`, error);
    throw error;
  }
}

async function importBatch(startTest: number, endTest: number): Promise<void> {
  console.log(`\nImporting Batch: Tests ${startTest.toString().padStart(3, '0')}-${endTest.toString().padStart(3, '0')}`);
  console.log('='.repeat(60));

  const dataDir = path.join(__dirname, '..', '..', '..', 'toeic-generated-data', 'data', 'tests');
  let successCount = 0;
  let failureCount = 0;

  for (let testNum = startTest; testNum <= endTest; testNum++) {
    const testFileName = `test${testNum.toString().padStart(3, '0')}.json`;
    const testFilePath = path.join(dataDir, testFileName);

    if (!fs.existsSync(testFilePath)) {
      console.log(`  ⚠ ${testFileName} not found, skipping...`);
      failureCount++;
      continue;
    }

    try {
      await importTest(testFilePath);
      successCount++;
    } catch (error) {
      console.error(`  Failed to import ${testFileName}`);
      failureCount++;
    }
  }

  console.log('='.repeat(60));
  console.log(`Batch complete: ${successCount} succeeded, ${failureCount} failed\n`);
}

async function importAllTests(): Promise<void> {
  console.log('\nImporting All 100 TOEIC-like Tests');
  console.log('='.repeat(60));

  const dataDir = path.join(__dirname, '..', '..', '..', 'toeic-generated-data', 'data', 'tests');
  const testFiles = fs.readdirSync(dataDir)
    .filter(f => f.startsWith('test') && f.endsWith('.json'))
    .sort();

  let successCount = 0;
  let failureCount = 0;

  for (const testFile of testFiles) {
    const testFilePath = path.join(dataDir, testFile);

    try {
      await importTest(testFilePath);
      successCount++;
    } catch (error) {
      console.error(`  Failed to import ${testFile}`);
      failureCount++;
    }
  }

  console.log('='.repeat(60));
  console.log(`Import complete: ${successCount} succeeded, ${failureCount} failed\n`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const fromArg = args.find(arg => arg.startsWith('--from='));
  const toArg = args.find(arg => arg.startsWith('--to='));

  if (fromArg && toArg) {
    const from = parseInt(fromArg.split('=')[1], 10);
    const to = parseInt(toArg.split('=')[1], 10);
    await importBatch(from, to);
  } else {
    await importAllTests();
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
