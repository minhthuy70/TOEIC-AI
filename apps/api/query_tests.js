const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tests = await prisma.tests.findMany();
  console.log(JSON.stringify(tests, null, 2));
  
  const questionGroups = await prisma.question_groups.findMany();
  console.log('\n--- QUESTION GROUPS ---');
  console.log(JSON.stringify(questionGroups, null, 2));
  
  const questions = await prisma.questions.findMany();
  console.log('\n--- QUESTIONS ---');
  console.log(JSON.stringify(questions, null, 2));
  
  const options = await prisma.options.findMany();
  console.log('\n--- OPTIONS ---');
  console.log(JSON.stringify(options, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
