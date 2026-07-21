import { Controller, Get } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const PART_METADATA: Record<number, any> = {
  1: { title: "Photographs", titleVi: "Mô tả hình ảnh", section: "listening", description: "Nghe 4 câu miêu tả ngắn về một bức tranh và chọn câu miêu tả đúng nhất.", totalQuestions: 6 },
  2: { title: "Question - Response", titleVi: "Hỏi – Đáp", section: "listening", description: "Nghe một câu hỏi hoặc câu nói, sau đó nghe 3 câu trả lời. Chọn câu trả lời phù hợp.", totalQuestions: 25 },
  3: { title: "Conversations", titleVi: "Đoạn hội thoại", section: "listening", description: "Nghe các đoạn hội thoại ngắn trong bối cảnh công việc. Mỗi đoạn có 3 câu hỏi.", totalQuestions: 39 },
  4: { title: "Talks", titleVi: "Bài nói chuyện ngắn", section: "listening", description: "Nghe các đoạn độc thoại như thông báo, bài phát biểu, lời nhắn thoại. Mỗi đoạn có 3 câu hỏi.", totalQuestions: 30 },
  5: { title: "Incomplete Sentences", titleVi: "Hoàn thành câu", section: "reading", description: "Chọn từ/cụm từ phù hợp để hoàn thành câu. Kiểm tra ngữ pháp và từ vựng.", totalQuestions: 30 },
  6: { title: "Text Completion", titleVi: "Hoàn thành đoạn văn", section: "reading", description: "Điền từ/câu phù hợp vào chỗ trống trong đoạn văn. Mỗi đoạn có 4 câu hỏi.", totalQuestions: 16 },
  7: { title: "Reading Comprehension", titleVi: "Đọc hiểu", section: "reading", description: "Đọc hiểu các đoạn văn. Single Passages (29 câu) và Multiple Passages (25 câu).", totalQuestions: 54 }
};

@Controller('placement-test')
export class PlacementTestController {
  @Get()
  async getPlacementTest() {
    try {
      const groups: any[] = await prisma.$queryRaw`SELECT * FROM public.question_groups ORDER BY id ASC`;
      const questions: any[] = await prisma.$queryRaw`SELECT * FROM public.questions ORDER BY id ASC`;
      const options: any[] = await prisma.$queryRaw`SELECT * FROM public.options ORDER BY display_order ASC, id ASC`;

      if (questions && questions.length > 0) {
        const groupMap = new Map();
        groups.forEach((g) => groupMap.set(g.id, g));

        const optionsMap = new Map();
        options.forEach((o) => {
          if (!optionsMap.has(o.question_id)) {
            optionsMap.set(o.question_id, []);
          }
          optionsMap.get(o.question_id).push(o);
        });

        const questionsByPart: Record<number, any[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };

        questions.forEach((q) => {
          const grp = groupMap.get(q.group_id);
          const partNum = grp ? grp.part : 1;

          const qOptionsRaw = optionsMap.get(q.id) || [];
          qOptionsRaw.sort((a: any, b: any) => a.display_order - b.display_order);

          let optionsList = qOptionsRaw.map((o: any) => o.option_text);
          if (optionsList.length === 0) {
            optionsList = partNum === 2 ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D'];
          }

          const questionObj: any = {
            questionNumber: q.question_number,
            correctAnswer: q.correct_answer || 'A',
          };

          if (q.question_text) {
            questionObj.text = q.question_text;
          }

          if (grp) {
            if (grp.image_url) {
              const trimmed = grp.image_url.trim();
              if (trimmed.startsWith('/uploads/')) {
                questionObj.image = trimmed;
              } else if (trimmed.startsWith('uploads/')) {
                questionObj.image = '/' + trimmed;
              } else if (trimmed.startsWith('/')) {
                questionObj.image = '/uploads/tests/placement-test' + trimmed;
              } else {
                questionObj.image = '/uploads/tests/placement-test/' + trimmed;
              }
            }
            if (grp.passage) {
              questionObj.passage = grp.passage;
            }
          }

          questionObj.options = optionsList;

          if (questionsByPart[partNum]) {
            questionsByPart[partNum].push(questionObj);
          }
        });

        Object.keys(questionsByPart).forEach((partNumStr) => {
          const pNum = Number(partNumStr);
          questionsByPart[pNum].sort((a: any, b: any) => a.questionNumber - b.questionNumber);
        });

        const partsArray = [1, 2, 3, 4, 5, 6, 7].map((partNum) => {
          const meta = PART_METADATA[partNum];
          const partQuestions = questionsByPart[partNum] || [];

          const partObj: any = {
            partNumber: partNum,
            title: meta.title,
            titleVi: meta.titleVi,
            section: meta.section,
            description: meta.description,
            totalQuestions: meta.totalQuestions,
            questions: partQuestions,
          };

          if (meta.section === 'listening') {
            partObj.audio = '/uploads/tests/placement-test/audio/placement-test.mp3';
          }

          return partObj;
        });

        return {
          testInfo: {
            title: 'TOEIC Placement Test',
            description: 'Bài test xếp trình độ TOEIC đầu vào',
            totalQuestions: 200,
            listeningQuestions: 100,
            readingQuestions: 100,
            listeningTime: 45,
            readingTime: 75,
          },
          parts: partsArray,
        };
      }
    } catch (e) {
      console.error('Error loading placement test from database, fallback to JSON:', e);
    }

    const filePath = path.join(
      process.cwd(),
      '..',
      '..',
      'data',
      'placement-test.json',
    );
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }
}

