const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

Promise.all([
  prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'reading_questions'`,
  prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'reading_options'`,
]).then(([q, o]) => {
  console.log("reading_questions:");
  console.log(q);
  console.log("reading_options:");
  console.log(o);
}).finally(() => prisma.$disconnect());
