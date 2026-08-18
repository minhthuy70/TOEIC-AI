import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private getStage(score: number): number {
    if (score >= 800) return 5;
    if (score >= 650) return 4;
    if (score >= 500) return 3;
    if (score >= 300) return 2;
    return 1;
  }

  async getOverview(userId: number) {
    // 1. Lấy thông tin user và profile
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      throw new Error("Không tìm thấy thông tin user");
    }

    const currentScore = user.profile.currentScore ?? 0;
    const targetScore = user.profile.targetScore ?? 600;
    const stage = this.getStage(currentScore);
    const dailyStudyTime = user.profile.dailyStudyTime ?? 30;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Tính Vocabulary Progress
    const totalVocabStage = await this.prisma.vocabulary.count({
      where: { stage },
    });
    const learnedVocabStage = await this.prisma.userVocabularyProgress.count({
      where: {
        userId,
        status: { not: "NEW" },
        vocabulary: { stage },
      },
    });
    const vocabularyProgress = totalVocabStage > 0 ? Math.round((learnedVocabStage / totalVocabStage) * 100) : 0;
    const totalLearnedVocab = await this.prisma.userVocabularyProgress.count({
      where: { userId, status: { not: "NEW" } },
    });

    // 3. Tính Grammar Progress
    const totalGrammar = await this.prisma.grammarLesson.count();
    const completedGrammar = await this.prisma.userGrammarProgress.count({
      where: { userId, completed: true },
    });
    const grammarProgress = totalGrammar > 0 ? Math.round((completedGrammar / totalGrammar) * 100) : 0;

    // 4. Tính Listening Progress
    const totalListeningStage = await this.prisma.listening_lessons.count({
      where: { stage },
    });
    const completedListeningStage = await this.prisma.user_listening_progress.count({
      where: { user_id: userId, completed: true, listening_lessons: { stage } },
    });
    const listeningProgress = totalListeningStage > 0 ? Math.round((completedListeningStage / totalListeningStage) * 100) : 0;
    const totalCompletedListening = await this.prisma.user_listening_progress.count({
      where: { user_id: userId, completed: true },
    });

    // 5. Tính Reading Progress
    const totalReading = await this.prisma.reading_lessons.count();
    const completedReading = await this.prisma.user_reading_progress.count({
      where: { user_id: userId, completed: true },
    });
    const readingProgress = totalReading > 0 ? Math.round((completedReading / totalReading) * 100) : 0;

    // 6. Thống kê chung & Progress tổng
    const overallProgress = Math.round((vocabularyProgress + grammarProgress + listeningProgress + readingProgress) / 4);

    const practiceCount = await this.prisma.practice_sessions.count({
      where: { user_id: userId },
    });
    
    const mockTestCount = await this.prisma.mock_test_attempts.count({
      where: { user_id: userId },
    });

    // 7. Hoạt động hôm nay (Today Tasks)
    const learnedVocabToday = await this.prisma.userVocabularyProgress.count({
      where: { userId, status: { not: "NEW" }, learnedAt: { gte: today } },
    });
    const completedGrammarToday = await this.prisma.userGrammarProgress.count({
      where: { userId, completed: true, lastStudied: { gte: today } },
    });
    const completedListeningToday = await this.prisma.user_listening_progress.count({
      where: { user_id: userId, completed: true, last_studied: { gte: today } },
    });
    const completedReadingToday = await this.prisma.user_reading_progress.count({
      where: { user_id: userId, completed: true, last_studied: { gte: today } },
    });
    const practiceToday = await this.prisma.practice_sessions.count({
      where: { user_id: userId, created_at: { gte: today } },
    });
    const mockTestToday = await this.prisma.mock_test_attempts.count({
      where: { user_id: userId, created_at: { gte: today } },
    });

    const tasksCompletedToday = learnedVocabToday + completedGrammarToday + completedListeningToday + completedReadingToday + practiceToday + mockTestToday;
    const dailyStudyGoal = 5;
    const dailyStudyProgress = Math.min(Math.round((tasksCompletedToday / dailyStudyGoal) * 100), 100);

    // 8. Điểm số
    const remainingScore = Math.max(targetScore - currentScore, 0);
    const scoreProgress = targetScore > 0 ? Math.min(Math.round((currentScore / targetScore) * 100), 100) : 0;

    // 9. Hoạt động gần đây (Top 5)
    const recentVocab = await this.prisma.userVocabularyProgress.findMany({
      where: { userId, learnedAt: { not: null } },
      orderBy: { learnedAt: 'desc' },
      take: 3,
      include: { vocabulary: true }
    });
    const recentGrammar = await this.prisma.userGrammarProgress.findMany({
      where: { userId, completed: true, lastStudied: { not: null } },
      orderBy: { lastStudied: 'desc' },
      take: 3,
      include: { lesson: true }
    });
    const recentListening = await this.prisma.user_listening_progress.findMany({
      where: { user_id: userId, completed: true, last_studied: { not: null } },
      orderBy: { last_studied: 'desc' },
      take: 3,
      include: { listening_lessons: true }
    });
    const recentReading = await this.prisma.user_reading_progress.findMany({
      where: { user_id: userId, completed: true, last_studied: { not: null } },
      orderBy: { last_studied: 'desc' },
      take: 3,
      include: { lesson: true }
    });

    const recentActivities: { id: string; type: string; title: string; date: Date; icon: string }[] = [];
    recentVocab.forEach(v => {
      if(v.learnedAt) recentActivities.push({ id: `voc_${v.id}`, type: "Vocabulary", title: `Học từ vựng: ${v.vocabulary.english}`, date: v.learnedAt, icon: "📖" })
    });
    recentGrammar.forEach(g => {
      if(g.lastStudied) recentActivities.push({ id: `gra_${g.id}`, type: "Grammar", title: `Hoàn thành ngữ pháp: ${g.lesson.title}`, date: g.lastStudied, icon: "📝" })
    });
    recentListening.forEach(l => {
      if(l.last_studied) recentActivities.push({ id: `lis_${l.id}`, type: "Listening", title: `Hoàn thành Listening: ${l.listening_lessons.title}`, date: l.last_studied, icon: "🎧" })
    });
    recentReading.forEach(r => {
      if(r.last_studied) recentActivities.push({ id: `rea_${r.id}`, type: "Reading", title: `Hoàn thành Reading: ${r.lesson.title}`, date: r.last_studied, icon: "📄" })
    });

    recentActivities.sort((a, b) => b.date.getTime() - a.date.getTime());

    return {
      success: true,
      user: {
        fullName: user.fullName,
        avatar: user.profile.avatar,
      },
      score: {
        current: currentScore,
        target: targetScore,
        remaining: remainingScore,
        progress: scoreProgress,
        stage: stage
      },
      progress: {
        overall: overallProgress,
        vocabulary: vocabularyProgress,
        grammar: grammarProgress,
        listening: listeningProgress,
        reading: readingProgress
      },
      statistics: {
        completedLessons: completedGrammar + totalCompletedListening + completedReading,
        learnedVocabulary: totalLearnedVocab,
        completedGrammar,
        completedListening: totalCompletedListening,
        completedReading,
        practiceCount,
        mockTestCount
      },
      daily: {
        tasksCompleted: tasksCompletedToday,
        taskGoal: dailyStudyGoal,
        progress: dailyStudyProgress,
        studyTimeGoal: dailyStudyTime
      },
      recentActivities: recentActivities.slice(0, 5)
    };
  }
}
