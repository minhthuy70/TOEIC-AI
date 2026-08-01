import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcryptjs";
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
}