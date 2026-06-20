import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class AuthService {
  async register(
    fullName: string,
    email: string,
    password: string,
  ) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      return {
        message: 'Email đã tồn tại',
      };
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10,
    );

    const newUser = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,

        profile: {
          create: {
            firstLoginCompleted: false,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return {
      id: newUser.id,
      email: newUser.email,
      firstLoginCompleted:
        newUser.profile?.firstLoginCompleted,
    };
  }

  async login(
    email: string,
    password: string,
  ) {
    const user = await prisma.user.findUnique({
      where: { email },

      include: {
        profile: true,
      },
    });

    if (!user) {
      return {
        message: 'Không tìm thấy tài khoản',
      };
    }

    const match = await bcrypt.compare(
      password,
      user.password,
    );

    if (!match) {
      return {
        message: 'Sai mật khẩu',
      };
    }

    return {
      id: user.id,
      fullName: user.fullName,

      firstLoginCompleted:
        user.profile?.firstLoginCompleted,
    };
  }
}