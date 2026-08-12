import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  Post,
  Query,
  UseGuards,
  NotFoundException,
  BadRequestException,
  ConflictException,
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
  @Query("topic") topic?: string,
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
  const stageNumber = Number(stage);

  if (Number.isInteger(stageNumber) && stageNumber >= 1) {
    where.stage = stageNumber;
  }
}

if (topic?.trim()) {
  where.topic = {
    contains: topic.trim(),
    mode: "insensitive",
  };
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

@Post("vocabulary")
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CONTENT_ADMIN,
)
async createVocabulary(
  @Body()
  body: {
    english: string;
    type?: string;
    vietnamese?: string;
    pronounce?: string;
    explain?: string;
    example?: string;
    exampleVietnamese?: string;
    imageUrl?: string;
    audioUrl?: string;
    topic?: string;
    stage: number;
  },
) {
  const vocabulary = await this.prisma.vocabulary.create({
    data: {
      english: body.english.trim(),
      type: body.type?.trim() || null,
      vietnamese: body.vietnamese?.trim() || null,
      pronounce: body.pronounce?.trim() || null,
      explain: body.explain?.trim() || null,
      example: body.example?.trim() || null,
      exampleVietnamese:
        body.exampleVietnamese?.trim() || null,
      imageUrl: body.imageUrl?.trim() || null,
      audioUrl: body.audioUrl?.trim() || null,
      topic: body.topic?.trim() || null,
      stage: Number(body.stage),
    },
  });

  return {
    success: true,
    message: "Thêm từ vựng thành công",
    item: vocabulary,
  };
}

@Patch("vocabulary/:id")
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CONTENT_ADMIN,
)
async updateVocabulary(
  @Param("id") id: string,
  @Body()
  body: {
    english: string;
    type?: string;
    vietnamese?: string;
    pronounce?: string;
    explain?: string;
    example?: string;
    exampleVietnamese?: string;
    imageUrl?: string;
    audioUrl?: string;
    topic?: string;
    stage: number;
  },
) {
  const vocabularyId = Number(id);

  const existing =
    await this.prisma.vocabulary.findUnique({
      where: {
        id: vocabularyId,
      },
    });

  if (!existing) {
    throw new NotFoundException(
      "Không tìm thấy từ vựng",
    );
  }

  const vocabulary =
    await this.prisma.vocabulary.update({
      where: {
        id: vocabularyId,
      },
      data: {
        english: body.english.trim(),
        type: body.type?.trim() || null,
        vietnamese:
          body.vietnamese?.trim() || null,
        pronounce:
          body.pronounce?.trim() || null,
        explain:
          body.explain?.trim() || null,
        example:
          body.example?.trim() || null,
        exampleVietnamese:
          body.exampleVietnamese?.trim() || null,
        imageUrl:
          body.imageUrl?.trim() || null,
        audioUrl:
          body.audioUrl?.trim() || null,
        topic:
          body.topic?.trim() || null,
        stage: Number(body.stage),
      },
    });

  return {
    success: true,
    message: "Cập nhật từ vựng thành công",
    item: vocabulary,
  };
}

@Delete("vocabulary/:id")
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CONTENT_ADMIN,
)
async deleteVocabulary(
  @Param("id") id: string,
) {
  const vocabularyId = Number(id);

  if (
    !Number.isInteger(vocabularyId) ||
    vocabularyId <= 0
  ) {
    throw new NotFoundException(
      "ID từ vựng không hợp lệ",
    );
  }

  const existing =
    await this.prisma.vocabulary.findUnique({
      where: {
        id: vocabularyId,
      },
    });

  if (!existing) {
    throw new NotFoundException(
      "Không tìm thấy từ vựng",
    );
  }

  await this.prisma.$transaction(async (tx) => {
    // Xóa tiến độ học của người dùng trước
    await tx.userVocabularyProgress.deleteMany({
      where: {
        vocabularyId: vocabularyId,
      },
    });

    // Sau đó mới xóa từ vựng
    await tx.vocabulary.delete({
      where: {
        id: vocabularyId,
      },
    });
  });

  return {
    success: true,
    message: "Xóa từ vựng thành công",
    id: vocabularyId,
  };
}

@Get("grammar/categories")
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CONTENT_ADMIN,
)
async getGrammarCategories(
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
        name: {
          contains: search.trim(),
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: search.trim(),
          mode: "insensitive",
        },
      },
    ];
  }

  if (stage) {
    const stageNumber = Number(stage);

    if (
      Number.isInteger(stageNumber) &&
      stageNumber >= 1 &&
      stageNumber <= 5
    ) {
      where.stage = stageNumber;
    }
  }

  const [items, total] =
    await Promise.all([
      this.prisma.grammarCategory.findMany({
        where,
        skip,
        take: limitNumber,

        orderBy: [
          {
            stage: "asc",
          },
          {
            displayOrder: "asc",
          },
          {
            id: "asc",
          },
        ],

        select: {
          id: true,
          name: true,
          description: true,
          displayOrder: true,
          stage: true,
          createdAt: true,
          updatedAt: true,

          _count: {
            select: {
              lessons: true,
            },
          },
        },
      }),

      this.prisma.grammarCategory.count({
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

@Post("grammar/categories")
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CONTENT_ADMIN,
)
async createGrammarCategory(
  @Body()
  body: {
    name: string;
    description?: string;
    displayOrder?: number;
    stage: number;
  },
) {
  if (!body.name?.trim()) {
    throw new Error(
      "Tên danh mục không được để trống",
    );
  }

  const stage = Number(body.stage);

  if (
    !Number.isInteger(stage) ||
    stage < 1 ||
    stage > 5
  ) {
    throw new Error(
      "Stage phải từ 1 đến 5",
    );
  }

  const category =
    await this.prisma.grammarCategory.create({
      data: {
        name: body.name.trim(),

        description:
          body.description?.trim() || null,

        displayOrder:
          body.displayOrder !== undefined
            ? Number(body.displayOrder)
            : 0,

        stage,
      },
    });

  return {
    success: true,
    message: "Thêm danh mục ngữ pháp thành công",
    item: category,
  };
}

@Patch("grammar/categories/:id")
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CONTENT_ADMIN,
)
async updateGrammarCategory(
  @Param("id") id: string,
  @Body()
  body: {
    name: string;
    description?: string;
    displayOrder?: number;
    stage: number;
  },
) {
  const categoryId = Number(id);

  const existing =
    await this.prisma.grammarCategory.findUnique({
      where: {
        id: categoryId,
      },
    });

  if (!existing) {
    throw new NotFoundException(
      "Không tìm thấy danh mục ngữ pháp",
    );
  }

  const stage = Number(body.stage);

  if (
    !Number.isInteger(stage) ||
    stage < 1 ||
    stage > 5
  ) {
    throw new Error(
      "Stage phải từ 1 đến 5",
    );
  }

  const category =
    await this.prisma.grammarCategory.update({
      where: {
        id: categoryId,
      },

      data: {
        name: body.name.trim(),

        description:
          body.description?.trim() || null,

        displayOrder:
          body.displayOrder !== undefined
            ? Number(body.displayOrder)
            : 0,

        stage,
      },
    });

  return {
    success: true,
    message:
      "Cập nhật danh mục ngữ pháp thành công",
    item: category,
  };
}

@Delete("grammar/categories/:id")
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CONTENT_ADMIN,
)
async deleteGrammarCategory(
  @Param("id") id: string,
) {
  const categoryId = Number(id);

  if (
    !Number.isInteger(categoryId) ||
    categoryId <= 0
  ) {
    throw new NotFoundException(
      "ID danh mục không hợp lệ",
    );
  }

  const category =
    await this.prisma.grammarCategory.findUnique({
      where: {
        id: categoryId,
      },
      include: {
        _count: {
          select: {
            lessons: true,
          },
        },
      },
    });

  if (!category) {
    throw new NotFoundException(
      "Không tìm thấy danh mục ngữ pháp",
    );
  }

  // Không cho xóa category nếu vẫn còn lesson
  if (category._count.lessons > 0) {
  throw new ConflictException(
    `Không thể xóa danh mục vì đang có ${category._count.lessons} bài học`,
  );
}

  await this.prisma.grammarCategory.delete({
    where: {
      id: categoryId,
    },
  });

  return {
    success: true,
    message: "Xóa danh mục ngữ pháp thành công",
    id: categoryId,
  };
}

// ======================================================
// GRAMMAR LESSON
// ======================================================

@Get("grammar/lessons")
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CONTENT_ADMIN,
)
async getGrammarLessons(
  @Query("page") page = "1",
  @Query("limit") limit = "10",
  @Query("search") search = "",
  @Query("categoryId") categoryId?: string,
) {
  const pageNumber = Math.max(Number(page), 1);

  const limitNumber = Math.min(
    Math.max(Number(limit), 1),
    100,
  );

  const skip =
    (pageNumber - 1) * limitNumber;

  const where: any = {};

  // Search theo title hoặc content
  if (search.trim()) {
    where.OR = [
      {
        title: {
          contains: search.trim(),
          mode: "insensitive",
        },
      },
      {
        content: {
          contains: search.trim(),
          mode: "insensitive",
        },
      },
    ];
  }

  // Filter theo category
  if (categoryId) {
    const categoryIdNumber = Number(categoryId);

    if (
      Number.isInteger(categoryIdNumber) &&
      categoryIdNumber > 0
    ) {
      where.categoryId = categoryIdNumber;
    }
  }

  const [items, total] =
    await Promise.all([
      this.prisma.grammarLesson.findMany({
        where,
        skip,
        take: limitNumber,

        orderBy: [
          {
            categoryId: "asc",
          },
          {
            displayOrder: "asc",
          },
          {
            id: "asc",
          },
        ],

        select: {
          id: true,
          categoryId: true,
          title: true,
          content: true,
          displayOrder: true,
          testId: true,
          createdAt: true,
          updatedAt: true,

          category: {
            select: {
              id: true,
              name: true,
              stage: true,
            },
          },

          tests: {
            select: {
              id: true,
              title: true,
            },
          },

          _count: {
            select: {
              progresses: true,
            },
          },
        },
      }),

      this.prisma.grammarLesson.count({
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


@Get("grammar/lessons/:id")
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CONTENT_ADMIN,
)
async getGrammarLesson(
  @Param("id") id: string,
) {
  const lessonId = Number(id);

  if (
    !Number.isInteger(lessonId) ||
    lessonId <= 0
  ) {
    throw new BadRequestException(
      "ID bài học không hợp lệ",
    );
  }

  const lesson =
    await this.prisma.grammarLesson.findUnique({
      where: {
        id: lessonId,
      },

      select: {
        id: true,
        categoryId: true,
        title: true,
        content: true,
        displayOrder: true,
        testId: true,
        createdAt: true,
        updatedAt: true,

        category: {
          select: {
            id: true,
            name: true,
            description: true,
            stage: true,
          },
        },

        tests: {
          select: {
            id: true,
            title: true,
          },
        },

        _count: {
          select: {
            progresses: true,
          },
        },
      },
    });

  if (!lesson) {
    throw new NotFoundException(
      "Không tìm thấy bài học ngữ pháp",
    );
  }

  return lesson;
}


@Post("grammar/lessons")
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CONTENT_ADMIN,
)
async createGrammarLesson(
  @Body()
  body: {
    categoryId: number;
    title: string;
    content?: string;
    displayOrder?: number;
    testId?: number | null;
  },
) {
  if (!body.title?.trim()) {
    throw new BadRequestException(
      "Tiêu đề bài học không được để trống",
    );
  }

  const categoryId = Number(body.categoryId);

  if (
    !Number.isInteger(categoryId) ||
    categoryId <= 0
  ) {
    throw new BadRequestException(
      "Category ID không hợp lệ",
    );
  }

  // Kiểm tra category tồn tại
  const category =
    await this.prisma.grammarCategory.findUnique({
      where: {
        id: categoryId,
      },
    });

  if (!category) {
    throw new NotFoundException(
      "Không tìm thấy danh mục ngữ pháp",
    );
  }

  // Test là optional
  let testId: number | null = null;

  if (
    body.testId !== undefined &&
    body.testId !== null
  ) {
    testId = Number(body.testId);

    if (
      !Number.isInteger(testId) ||
      testId <= 0
    ) {
      throw new BadRequestException(
        "Test ID không hợp lệ",
      );
    }

    const test =
      await this.prisma.tests.findUnique({
        where: {
          id: testId,
        },
      });

    if (!test) {
      throw new NotFoundException(
        "Không tìm thấy đề thi",
      );
    }
  }

  const displayOrder =
    body.displayOrder !== undefined
      ? Number(body.displayOrder)
      : 0;

  if (
    !Number.isInteger(displayOrder) ||
    displayOrder < 0
  ) {
    throw new BadRequestException(
      "Display order không hợp lệ",
    );
  }

  const lesson =
    await this.prisma.grammarLesson.create({
      data: {
        categoryId,

        title: body.title.trim(),

        content:
          body.content?.trim() || null,

        displayOrder,

        testId,
      },

      select: {
        id: true,
        categoryId: true,
        title: true,
        content: true,
        displayOrder: true,
        testId: true,
        createdAt: true,
        updatedAt: true,

        category: {
          select: {
            id: true,
            name: true,
            stage: true,
          },
        },
      },
    });

  return {
    success: true,
    message: "Thêm bài học ngữ pháp thành công",
    item: lesson,
  };
}


@Patch("grammar/lessons/:id")
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CONTENT_ADMIN,
)
async updateGrammarLesson(
  @Param("id") id: string,
  @Body()
  body: {
    categoryId: number;
    title: string;
    content?: string;
    displayOrder?: number;
    testId?: number | null;
  },
) {
  const lessonId = Number(id);

  if (
    !Number.isInteger(lessonId) ||
    lessonId <= 0
  ) {
    throw new BadRequestException(
      "ID bài học không hợp lệ",
    );
  }

  const existing =
    await this.prisma.grammarLesson.findUnique({
      where: {
        id: lessonId,
      },
    });

  if (!existing) {
    throw new NotFoundException(
      "Không tìm thấy bài học ngữ pháp",
    );
  }

  if (!body.title?.trim()) {
    throw new BadRequestException(
      "Tiêu đề bài học không được để trống",
    );
  }

  const categoryId = Number(body.categoryId);

  if (
    !Number.isInteger(categoryId) ||
    categoryId <= 0
  ) {
    throw new BadRequestException(
      "Category ID không hợp lệ",
    );
  }

  // Kiểm tra category mới
  const category =
    await this.prisma.grammarCategory.findUnique({
      where: {
        id: categoryId,
      },
    });

  if (!category) {
    throw new NotFoundException(
      "Không tìm thấy danh mục ngữ pháp",
    );
  }

  // Kiểm tra test nếu có
  let testId: number | null = null;

  if (
    body.testId !== undefined &&
    body.testId !== null 
  ) {
    testId = Number(body.testId);

    if (
      !Number.isInteger(testId) ||
      testId <= 0
    ) {
      throw new BadRequestException(
        "Test ID không hợp lệ",
      );
    }

    const test =
      await this.prisma.tests.findUnique({
        where: {
          id: testId,
        },
      });

    if (!test) {
      throw new NotFoundException(
        "Không tìm thấy đề thi",
      );
    }
  }

  const displayOrder =
    body.displayOrder !== undefined
      ? Number(body.displayOrder)
      : 0;

  if (
    !Number.isInteger(displayOrder) ||
    displayOrder < 0
  ) {
    throw new BadRequestException(
      "Display order không hợp lệ",
    );
  }

  const lesson =
    await this.prisma.grammarLesson.update({
      where: {
        id: lessonId,
      },

      data: {
        categoryId,

        title: body.title.trim(),

        content:
          body.content?.trim() || null,

        displayOrder,

        testId,
      },

      select: {
        id: true,
        categoryId: true,
        title: true,
        content: true,
        displayOrder: true,
        testId: true,
        createdAt: true,
        updatedAt: true,

        category: {
          select: {
            id: true,
            name: true,
            stage: true,
          },
        },
      },
    });

  return {
    success: true,
    message: "Cập nhật bài học ngữ pháp thành công",
    item: lesson,
  };
}


@Delete("grammar/lessons/:id")
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CONTENT_ADMIN,
)
async deleteGrammarLesson(
  @Param("id") id: string,
) {
  const lessonId = Number(id);

  if (
    !Number.isInteger(lessonId) ||
    lessonId <= 0
  ) {
    throw new BadRequestException(
      "ID bài học không hợp lệ",
    );
  }

  const lesson =
    await this.prisma.grammarLesson.findUnique({
      where: {
        id: lessonId,
      },

      include: {
        _count: {
          select: {
            progresses: true,
          },
        },
      },
    });

  if (!lesson) {
    throw new NotFoundException(
      "Không tìm thấy bài học ngữ pháp",
    );
  }

  await this.prisma.$transaction(
    async (tx) => {
      // Xóa tiến độ học của người dùng trước
      await tx.userGrammarProgress.deleteMany({
        where: {
          lessonId,
        },
      });

      // Sau đó xóa lesson
      await tx.grammarLesson.delete({
        where: {
          id: lessonId,
        },
      });
    },
  );

  return {
    success: true,
    message: "Xóa bài học ngữ pháp thành công",
    id: lessonId,
  };
}
}