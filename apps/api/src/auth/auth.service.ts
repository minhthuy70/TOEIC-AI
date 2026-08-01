import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcryptjs";



@Injectable()
export class AuthService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    fullName: string,
    email: string,
    password: string,
  ) {
    const user = await this.prisma.user.findUnique({
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

    const newUser = await this.prisma.user.create({
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
    const user = await this.prisma.user.findUnique({
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

   const payload = {
  sub: user.id,
  email: user.email,
};

const accessToken = this.jwtService.sign(payload);

return {
  accessToken,
  user: {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    firstLoginCompleted:
      user.profile?.firstLoginCompleted,
  },
};
  }
}