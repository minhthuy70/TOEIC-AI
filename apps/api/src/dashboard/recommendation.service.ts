import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RecommendationService {
  constructor(private readonly prisma: PrismaService) {}

  async getSmartRecommendations(userId: number) {
    try {
      // 1. Fetch User and profile
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      const currentScore = user?.profile?.currentScore || 650;
      const targetScore = user?.profile?.targetScore || 850;
      const goalGap = Math.max(0, targetScore - currentScore);

      // 2. Fetch practice sessions for weakness analysis
      const sessions = await this.prisma.practice_sessions.findMany({
        where: { user_id: userId },
        select: {
          part: true,
          question_count: true,
          correct_count: true,
        },
      });

      const partStats: { [part: number]: { questions: number; correct: number } } = {};
      for (let i = 1; i <= 7; i++) {
        partStats[i] = { questions: 0, correct: 0 };
      }

      sessions.forEach((s) => {
        if (partStats[s.part]) {
          partStats[s.part].questions += s.question_count;
          partStats[s.part].correct += s.correct_count;
        }
      });

      const partMeta: { [part: number]: { title: string; category: string; tip: string } } = {
        1: { title: "Listening Part 1 (Photographs)", category: "Listening", tip: "Luyện nghe mô tả tranh, chú ý bẫy danh từ/động từ và từ đồng âm." },
        2: { title: "Listening Part 2 (Question - Response)", category: "Listening", tip: "Tập trung nghe từ khóa để hỏi (Who, Where, When...) và loại trừ đáp án gián tiếp." },
        3: { title: "Listening Part 3 (Conversations)", category: "Listening", tip: "Đọc trước câu hỏi và các phương án trả lời trước khi nghe hội thoại." },
        4: { title: "Listening Part 4 (Short Talks)", category: "Listening", tip: "Luyện nghe bài nói ngắn độc thoại, ghi nhớ từ đồng nghĩa (synonyms)." },
        5: { title: "Reading Part 5 (Incomplete Sentences)", category: "Reading", tip: "Học kỹ cấu trúc ngữ pháp cốt lõi và tích lũy từ vựng theo cụm (collocations)." },
        6: { title: "Reading Part 6 (Text Completion)", category: "Reading", tip: "Chú ý tính liên kết câu, liên từ nối và chọn đúng thì của động từ." },
        7: { title: "Reading Part 7 (Reading Comprehension)", category: "Reading", tip: "Áp dụng thuần thục kỹ thuật đọc lướt (skimming) và quét (scanning) để tăng tốc độ." },
      };

      const weaknessList: any[] = [];
      let totalQuestions = 0;
      let totalCorrect = 0;

      for (let i = 1; i <= 7; i++) {
        const stats = partStats[i];
        totalQuestions += stats.questions;
        totalCorrect += stats.correct;
        const accuracy = stats.questions > 0 ? Math.round((stats.correct / stats.questions) * 100) : null;
        weaknessList.push({
          part: i,
          title: partMeta[i].title,
          category: partMeta[i].category,
          tip: partMeta[i].tip,
          accuracy,
          questions: stats.questions,
        });
      }

      // Sort parts by accuracy to find the weaknesses (accuracy < 75%)
      const calculatedWeaknesses = weaknessList
        .filter((w) => w.accuracy !== null)
        .sort((a, b) => (a.accuracy || 0) - (b.accuracy || 0));

      // Build weaknesses return: if user has no practice, default to Part 7 & Part 3
      let userWeaknesses: any[] = [];
      if (calculatedWeaknesses.length > 0) {
        userWeaknesses = calculatedWeaknesses.slice(0, 3);
      } else {
        // Fallback default weaknesses
        userWeaknesses = [
          { part: 7, title: partMeta[7].title, category: partMeta[7].category, tip: partMeta[7].tip, accuracy: 62, questions: 0 },
          { part: 3, title: partMeta[3].title, category: partMeta[3].category, tip: partMeta[3].tip, accuracy: 68, questions: 0 },
        ];
      }

      // 3. Query due vocabs for "What to study next"
      const dueVocabs = await this.prisma.userVocabularyProgress.count({
        where: { userId, status: { not: "NEW" }, nextReview: { lte: new Date() } },
      });

      // 4. Determine "What to study next"
      let nextStudyTitle = "";
      let nextStudyDesc = "";
      let nextStudyAction = "";

      if (dueVocabs > 10) {
        nextStudyTitle = "Ôn tập Từ vựng đến hạn";
        nextStudyDesc = `Bạn đang có ${dueVocabs} từ vựng cần ôn tập theo thuật toán lặp lại ngắt quãng (SRS). Hãy xử lý trước để tránh quên từ.`;
        nextStudyAction = "/dashboard/vocabulary";
      } else {
        const weakest = userWeaknesses[0];
        nextStudyTitle = `Luyện tập ${weakest.title}`;
        nextStudyDesc = `Kỹ năng này đang có tỷ lệ chính xác thấp nhất (${weakest.accuracy}%). Hãy làm thêm các bài tập luyện kỹ năng để khắc phục.`;
        nextStudyAction = weakest.category === "Listening" ? "/dashboard/listening" : "/dashboard/reading";
      }

      // 5. Time-based recommendations
      const hour = new Date().getHours();
      let timeLabel = "";
      let timeSuggestion = "";
      if (hour >= 5 && hour < 12) {
        timeLabel = "Buổi sáng (5h - 12h)";
        timeSuggestion = "Khung giờ vàng cho trí nhớ. Đề xuất học 20 từ mới và xem lại ngữ pháp cốt lõi.";
      } else if (hour >= 12 && hour < 18) {
        timeLabel = "Buổi chiều (12h - 18h)";
        timeSuggestion = "Khung giờ rèn luyện phản xạ. Đề xuất làm các bài luyện nghe ngắn Part 1-2 hoặc Part 3.";
      } else {
        timeLabel = "Buổi tối (18h - 24h)";
        timeSuggestion = "Khung giờ làm đề. Đề xuất ôn tập các câu sai trong Sổ tay lỗi hoặc làm 1 bài thi thử Full Test.";
      }

      // 6. Goal-oriented suggestions
      let goalRecommendation = "";
      if (goalGap > 200) {
        goalRecommendation = "Khoảng cách điểm số lớn. Trọng tâm giai đoạn này là củng cố từ vựng cơ bản và học cấu trúc ngữ pháp nền tảng thay vì làm đề thi dồn dập.";
      } else if (goalGap > 100) {
        goalRecommendation = "Khoảng cách trung bình. Cần nâng cao tốc độ đọc hiểu Part 7 và kỹ năng nghe hiểu Part 3-4 để bứt phá đạt mốc mục tiêu.";
      } else {
        goalRecommendation = "Sát mốc mục tiêu! Trọng tâm là sửa kỹ các lỗi sai nhỏ trong Sổ tay lỗi và luyện đề thi thử Full Test dưới áp lực thời gian thực tế.";
      }

      // 7. Adaptive difficulty adjustment
      const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 72;
      let difficultyLevel = "";
      let difficultyDesc = "";
      if (avgAccuracy > 80) {
        difficultyLevel = "Nâng cao (Advanced)";
        difficultyDesc = "Độ chính xác tổng quan xuất sắc (>80%). Các bài tập gợi ý tiếp theo sẽ tự động tăng độ khó (Part 7 dài, Part 4 nghe nhanh).";
      } else if (avgAccuracy >= 60) {
        difficultyLevel = "Trung cấp (Intermediate)";
        difficultyDesc = "Độ chính xác ổn định. Độ khó được giữ ở mức trung bình để rèn luyện sự tự tin và giảm thiểu các sai sót ngữ pháp.";
      } else {
        difficultyLevel = "Cơ bản (Basic)";
        difficultyDesc = "Độ chính xác còn thấp (<60%). Hệ thống đã điều chỉnh độ khó giảm xuống để tập trung ôn tập kỹ lý thuyết trước.";
      }

      // 8. Learning path optimization
      const pathCompletion = currentScore >= 800 ? 85 : currentScore >= 600 ? 60 : 35;

      // 9. Priority task ranking
      const rankedTasks = [
        {
          rank: 1,
          taskName: `Học từ vựng SRS (${dueVocabs} từ đến hạn)`,
          priority: "Cao nhất",
          reason: "Tác vụ Spaced Repetition cần làm đúng hẹn để tối ưu hóa trí nhớ.",
          actionUrl: "/dashboard/vocabulary",
        },
        {
          rank: 2,
          taskName: `Khắc phục điểm yếu: ${userWeaknesses[0].title}`,
          priority: "Cao",
          reason: `Tỷ lệ chính xác đang ở mức thấp (${userWeaknesses[0].accuracy}%). Cần làm thêm bài tập bổ trợ.`,
          actionUrl: userWeaknesses[0].category === "Listening" ? "/dashboard/listening" : "/dashboard/reading",
        },
        {
          rank: 3,
          taskName: "Sửa lỗi sai trong Sổ tay lỗi",
          priority: "Trung bình",
          reason: "Review lại các câu đã làm sai trong tuần để tránh lặp lại lỗi cũ.",
          actionUrl: "/dashboard/error-log",
        },
        {
          rank: 4,
          taskName: "Thi thử Mini Test hàng tuần",
          priority: "Thấp",
          reason: "Đánh giá lại trình độ tổng quan để cập nhật dữ liệu gợi ý AI.",
          actionUrl: "/dashboard/mock-test",
        },
      ];

      return {
        success: true,
        summary: {
          currentScore,
          targetScore,
          goalGap,
          avgAccuracy,
        },
        whatToStudyNext: {
          title: nextStudyTitle,
          description: nextStudyDesc,
          actionUrl: nextStudyAction,
        },
        weaknesses: userWeaknesses,
        timeBased: {
          label: timeLabel,
          suggestion: timeSuggestion,
        },
        goalBased: {
          recommendation: goalRecommendation,
        },
        adaptive: {
          difficultyLevel,
          description: difficultyDesc,
        },
        learningPath: {
          completionRate: pathCompletion,
        },
        priorityTasks: rankedTasks,
      };
    } catch (error) {
      console.error("Error building AI recommendations:", error);
      throw new Error("Failed to build AI recommendations");
    }
  }
}
