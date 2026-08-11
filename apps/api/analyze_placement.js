const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get all tests
  const tests = await prisma.tests.findMany();
  console.log('=== TESTS ===');
  console.log(JSON.stringify(tests, null, 2));
  
  // For each test, get question groups by part
  for (const test of tests) {
    console.log(`\n=== TEST ${test.id}: ${test.title} ===`);
    
    const groups = await prisma.question_groups.findMany({
      where: { test_id: test.id },
      orderBy: [{ part: 'asc' }, { display_order: 'asc' }]
    });
    
    console.log(`Total groups: ${groups.length}`);
    
    // Count by part
    const partCounts = {};
    for (const group of groups) {
      if (!partCounts[group.part]) {
        partCounts[group.part] = { groups: 0, questions: 0 };
      }
      partCounts[group.part].groups++;
      
      const questions = await prisma.questions.findMany({
        where: { group_id: group.id }
      });
      partCounts[group.part].questions += questions.length;
    }
    
    console.log('\nQuestions by Part:');
    for (const [part, data] of Object.entries(partCounts).sort((a, b) => a[0] - b[0])) {
      console.log(`Part ${part}: ${data.groups} groups, ${data.questions} questions`);
    }
    
    // Sample group structure for each part
    console.log('\nSample group structure:');
    for (const part of [1, 2, 3, 4, 5, 6, 7]) {
      const sampleGroup = groups.find(g => g.part === part);
      if (sampleGroup) {
        console.log(`\nPart ${part} sample group (ID: ${sampleGroup.id}):`);
        console.log(JSON.stringify(sampleGroup, null, 2));
        
        const questions = await prisma.questions.findMany({
          where: { group_id: sampleGroup.id },
          include: { options: true }
        });
        console.log(`Questions in this group: ${questions.length}`);
        if (questions.length > 0) {
          console.log('Sample question:', JSON.stringify(questions[0], null, 2));
        }
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
