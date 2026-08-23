import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import * as fs from 'fs';
import * as path from 'path';
import {
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
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
    studySchedule?: string,
    motivationLevel?: number,
    learningStyle?: string,
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
        studySchedule: studySchedule || null,
        motivationLevel: motivationLevel || 5,
        learningStyle: learningStyle || null,
        firstLoginCompleted: true,
      },
      update: {
        currentScore,
        targetScore,
        examDate: new Date(examDate),
        dailyStudyTime: dailyStudyTime || null,
        studySchedule: studySchedule || null,
        motivationLevel: motivationLevel || 5,
        learningStyle: learningStyle || null,
        firstLoginCompleted: true,
      },
    });
  }

  async savePlacementTestResult(userId: number, score: number) {
    return this.prisma.userProfile.upsert({
      where: {
        userId,
      },
      create: {
        userId,
        currentScore: score,
        lastPlacementTestAt: new Date(),
      },
      update: {
        currentScore: score,
        lastPlacementTestAt: new Date(),
      },
    });
  }

  async getPlacementTestCooldown(userId: number) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile || !profile.lastPlacementTestAt) {
      return { canRetake: true, cooldownDays: 0 };
    }

    const lastTest = new Date(profile.lastPlacementTestAt);
    const now = new Date();
    const daysSinceLastTest = Math.floor((now.getTime() - lastTest.getTime()) / (1000 * 60 * 60 * 24));
    const cooldownDays = 7;
    const daysRemaining = Math.max(0, cooldownDays - daysSinceLastTest);

    return {
      canRetake: daysSinceLastTest >= cooldownDays,
      cooldownDays: daysRemaining,
      lastTestDate: profile.lastPlacementTestAt,
    };
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
    avatarUrl: user.avatarUrl || user.profile?.avatar,
    avatar: user.profile?.avatar,
    phone: user.profile?.phone,
    birthday: user.profile?.birthday,
    gender: user.profile?.gender,
    address: user.profile?.address,
    bio: user.profile?.bio,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,

    currentScore: user.profile?.currentScore,
    targetScore: user.profile?.targetScore,
    examDate: user.profile?.examDate,
    dailyStudyTime: user.profile?.dailyStudyTime,
    studySchedule: user.profile?.studySchedule,
    motivationLevel: user.profile?.motivationLevel,
    learningStyle: user.profile?.learningStyle,
    lastPlacementTestAt: user.profile?.lastPlacementTestAt,

    studyNotification: user.profile?.studyNotification,
srsNotification: user.profile?.srsNotification,
autoPronunciation: user.profile?.autoPronunciation,
darkMode: user.profile?.darkMode,
  };
}
async updateProfile(
  userId: number,
  data: any,
) {

  const user = await this.prisma.user.findUnique({
    where:{
      id:userId,
    },
  });


  if(!user){
    return {
      message:"Không tìm thấy người dùng",
    };
  }



  // Cập nhật họ tên trong bảng User
  await this.prisma.user.update({

    where:{
      id:userId,
    },

    data:{
      fullName:data.fullName,
    }

  });



  // Cập nhật thông tin UserProfile
  await this.prisma.userProfile.upsert({

    where:{
      userId,
    },


    create:{

      userId,

      avatar:data.avatar,

      phone:data.phone,

      birthday:data.birthday
      ? new Date(data.birthday)
      : null,

      gender:data.gender,

      address:data.address,

      bio:data.bio,


      // TOEIC
      currentScore:data.currentScore,

      targetScore:data.targetScore,

      examDate:data.examDate
      ? new Date(data.examDate)
      : null,

      dailyStudyTime:data.dailyStudyTime,
      studySchedule:data.studySchedule,
      motivationLevel:data.motivationLevel,
      learningStyle:data.learningStyle,

      studyNotification:data.studyNotification,
srsNotification:data.srsNotification,
autoPronunciation:data.autoPronunciation,
darkMode:data.darkMode,
    },


    update:{

      avatar:data.avatar,

      phone:data.phone,

      birthday:data.birthday
      ? new Date(data.birthday)
      : null,

      gender:data.gender,

      address:data.address,

      bio:data.bio,


      // TOEIC
      currentScore:data.currentScore,

      targetScore:data.targetScore,

      examDate:data.examDate
      ? new Date(data.examDate)
      : null,

      dailyStudyTime:data.dailyStudyTime,
      studySchedule:data.studySchedule,
      motivationLevel:data.motivationLevel,
      learningStyle:data.learningStyle,
      studyNotification:data.studyNotification,
srsNotification:data.srsNotification,
autoPronunciation:data.autoPronunciation,
darkMode:data.darkMode,

    }


  });



  return {

    message:"Cập nhật hồ sơ thành công",

  };

}
async changePassword(
  userId: number,
  data: any,
) {

  const user =
    await this.prisma.user.findUnique({

      where: {
        id: userId,
      },

    });

  if (!user) {

    throw new BadRequestException(
      "Không tìm thấy người dùng"
    );

  }

  if (!user.password) {
    throw new BadRequestException(
      "Tài khoản này đăng nhập bằng Google, không thể đổi mật khẩu"
    );
  }

  const match =
    await bcrypt.compare(
      data.oldPassword,
      user.password,
    );

  if (!match) {

    throw new UnauthorizedException(
      "Mật khẩu hiện tại không đúng"
    );

  }

  const hashed =
    await bcrypt.hash(
      data.newPassword,
      10,
    );

  await this.prisma.user.update({

    where: {
      id: userId,
    },

    data: {
      password: hashed,
    },

  });

  return {

    message: "Đổi mật khẩu thành công",

  };

}

async uploadAvatar(userId: number, file: Express.Multer.File) {
  if (!file) {
    throw new BadRequestException("Không có file được tải lên");
  }

  // File is already saved by multer, just update the database
  const avatarUrl = `/avatars/${file.filename}`;

  // Update user profile with avatar URL
  await this.prisma.userProfile.upsert({
    where: { userId },
    create: {
      userId,
      avatar: avatarUrl,
    },
    update: {
      avatar: avatarUrl,
    },
  });

  // Also update User table avatarUrl for backward compatibility
  await this.prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
  });

  return {
    message: "Tải lên avatar thành công",
    avatarUrl,
  };
}

async deactivateAccount(userId: number) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new BadRequestException("Không tìm thấy người dùng");
  }

  if (!user.isActive) {
    throw new BadRequestException("Tài khoản đã bị vô hiệu hóa");
  }

  await this.prisma.user.update({
    where: { id: userId },
    data: {
      isActive: false,
      deactivatedAt: new Date(),
    },
  });

  return {
    message: "Tài khoản đã được vô hiệu hóa thành công",
  };
}

async deleteAccount(userId: number, password?: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new BadRequestException("Không tìm thấy người dùng");
  }

  // If user has password, verify it before deletion
  if (user.password) {
    if (!password) {
      throw new BadRequestException("Vui lòng nhập mật khẩu để xác nhận xóa tài khoản");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException("Mật khẩu không đúng");
    }
  }

  // For OAuth users, we'll just delete them without password verification
  // as they don't have a password

  // Delete user (cascade will handle related records)
  await this.prisma.user.delete({
    where: { id: userId },
  });

  return {
    message: "Tài khoản đã được xóa thành công",
  };
}
}