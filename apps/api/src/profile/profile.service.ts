import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async completeFirstLogin(
    userId: number,
    currentScore: number,
    targetScore: number,
    examDate: string,
    dailyStudyTime?: number,
  ) {
    return this.prisma.userProfile.upsert({
      where: {
        userId,
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
  async getProfile(userId: number) {
  const user = await this.prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      profile: true,
    },
  });

  if (!user) {
    return {
      message: "Không tìm thấy người dùng",
    };
  }

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,

    avatar: user.profile?.avatar,
    phone: user.profile?.phone,
    birthday: user.profile?.birthday,
    gender: user.profile?.gender,
    address: user.profile?.address,
    bio: user.profile?.bio,

    currentScore: user.profile?.currentScore,
    targetScore: user.profile?.targetScore,
    examDate: user.profile?.examDate,
    dailyStudyTime: user.profile?.dailyStudyTime,
  };
}
async updateProfile(
  userId: number,
  data: any,
) {
  const user = await this.prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return {
      message: "Không tìm thấy người dùng",
    };
  }

  await this.prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      fullName: data.fullName,
    },
  });

  await this.prisma.userProfile.update({
    where: {
      userId,
    },
    data: {
      avatar: data.avatar,
      phone: data.phone,
      birthday: data.birthday
        ? new Date(data.birthday)
        : null,
      gender: data.gender,
      address: data.address,
      bio: data.bio,
    },
  });

  return {
    message: "Cập nhật hồ sơ thành công",
  };
}
}