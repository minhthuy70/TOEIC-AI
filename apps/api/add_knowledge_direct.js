const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Add knowledge column directly using raw SQL
  try {
    await prisma.$executeRaw`ALTER TABLE question_groups ADD COLUMN IF NOT EXISTS knowledge TEXT`;
    console.log('Successfully added knowledge column to question_groups table');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('Knowledge column already exists in question_groups table');
    } else {
      console.error('Error adding knowledge column:', error);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
