import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProfileService {
  async completeFirstLogin(
    userId: number,
    currentScore: number,
    targetScore: number,
    examDate: string,
    dailyStudyTime?: number,
  ) {
    return prisma.userProfile.upsert({
      where: {
        userId: userId, // must be @unique
      },
      create: {
        userId,
        currentScore,
        targetScore,
        examDate: new Date(examDate),
        dailyStudyTime: dailyStudyTime || null,
        firstLoginCompleted: true,
      },
      update: {
        currentScore,
        targetScore,
        examDate: new Date(examDate),
        dailyStudyTime: dailyStudyTime || null,
        firstLoginCompleted: true,
      },
    });
  }
}