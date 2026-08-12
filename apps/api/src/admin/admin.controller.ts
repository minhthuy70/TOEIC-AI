import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

import { UserRole } from "@prisma/client";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  @Get("test")
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.CONTENT_ADMIN,
  )
  test() {
    return {
      success: true,
      message: "Bạn có quyền truy cập Admin",
    };
  }

  @Get("stats")
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.CONTENT_ADMIN,
  )
  async getStats() {
    const [
      users,
      vocabulary,
      grammarLessons,
      tests,
    ] = await Promise.all([
      this.prisma.user.count(),

      this.prisma.vocabulary.count(),

      this.prisma.grammarLesson.count(),

      this.prisma.tests.count(),
    ]);

    return {
      users,
      vocabulary,
      grammarLessons,
      tests,
    };
  }

  @Get("users")
@Roles(UserRole.SUPER_ADMIN)
async getUsers() {
  return this.prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      createdAt: true,
      role: true,
      profile: {
        select: {
          currentScore: true,
          targetScore: true,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });
}
@Patch("users/:id/role")
@Roles(UserRole.SUPER_ADMIN)
async updateUserRole(
  @Param("id") id: string,
  @Body() body: { role: UserRole },
) {
  const userId = Number(id);

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

  const updatedUser =
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: body.role,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
      },
    });

  return {
    message: "Cập nhật quyền thành công",
    user: updatedUser,
  };
}
}