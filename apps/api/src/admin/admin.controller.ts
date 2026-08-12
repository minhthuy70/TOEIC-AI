import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
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
@Get("vocabulary")
@Roles(UserRole.SUPER_ADMIN, UserRole.CONTENT_ADMIN)
async getVocabulary(
  @Query("page") page = "1",
  @Query("limit") limit = "10",
  @Query("search") search = "",
  @Query("stage") stage?: string,
) {
  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.min(
    Math.max(Number(limit), 1),
    100,
  );

  const skip =
    (pageNumber - 1) * limitNumber;

  const where: any = {};

  if (search.trim()) {
    where.OR = [
      {
        english: {
          contains: search.trim(),
          mode: "insensitive",
        },
      },
      {
        vietnamese: {
          contains: search.trim(),
          mode: "insensitive",
        },
      },
    ];
  }

  if (stage) {
    where.stage = Number(stage);
  }

  const [items, total] =
    await Promise.all([
      this.prisma.vocabulary.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: {
          id: "asc",
        },
        select: {
          id: true,
          english: true,
          type: true,
          vietnamese: true,
          pronounce: true,
          explain: true,
          example: true,
          exampleVietnamese: true,
          imageUrl: true,
          audioUrl: true,
          topic: true,
          stage: true,
          createdAt: true,
        },
      }),

      this.prisma.vocabulary.count({
        where,
      }),
    ]);

  return {
    items,
    total,
    page: pageNumber,
    limit: limitNumber,
    totalPages: Math.ceil(
      total / limitNumber,
    ),
  };
}
}