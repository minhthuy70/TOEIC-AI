const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.listening_lesson_questions.updateMany({
  where: { group_id: 9 },
  data: { knowledge: 'Mẹo Part 1: Hãy chú ý thì hiện tại tiếp diễn (V-ing) để mô tả hành động đang xảy ra trong hình.' }
}).then(console.log).finally(() => prisma.$disconnect());
