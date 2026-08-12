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

@Get("listening/lessons")
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CONTENT_ADMIN,
)
async getListeningLessons(
  @Query("page") page = "1",
  @Query("limit") limit = "10",
  @Query("search") search = "",
  @Query("part") part?: string,
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

  // Tìm kiếm theo title
  if (search.trim()) {
    where.title = {
      contains: search.trim(),
      mode: "insensitive",
    };
  }

  // Lọc Part
  if (part) {
    const partNumber = Number(part);

    if (
      Number.isInteger(partNumber) &&
      partNumber >= 1 &&
      partNumber <= 4
    ) {
      where.part = partNumber;
    }
  }

  // Lọc Stage
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
      this.prisma.listening_lessons.findMany({
        where,
        skip,
        take: limitNumber,

        orderBy: [
          {
            stage: "asc",
          },
          {
            part: "asc",
          },
          {
            display_order: "asc",
          },
          {
            id: "asc",
          },
        ],

        select: {
          id: true,
          title: true,
          part: true,
          question_group_id: true,
          display_order: true,
          stage: true,
          created_at: true,
          updated_at: true,

          _count: {
            select: {
              listening_lesson_groups: true,
              user_listening_progress: true,
            },
          },
        },
      }),

      this.prisma.listening_lessons.count({
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

@Get("listening/lessons/:id")
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CONTENT_ADMIN,
)
async getListeningLesson(
  @Param("id") id: string,
) {
  const lessonId = Number(id);

  if (
    !Number.isInteger(lessonId) ||
    lessonId <= 0
  ) {
    throw new BadRequestException(
      "ID bài Listening không hợp lệ",
    );
  }

  const lesson =
    await this.prisma.listening_lessons.findUnique({
      where: {
        id: lessonId,
      },

      select: {
        id: true,
        title: true,
        part: true,
        question_group_id: true,
        display_order: true,
        stage: true,
        created_at: true,
        updated_at: true,

        listening_lesson_groups: {
          orderBy: [
            {
              display_order: "asc",
            },
            {
              id: "asc",
            },
          ],

          select: {
            id: true,
            lesson_id: true,
            title: true,
            audio_url: true,
            start_seconds: true,
            end_seconds: true,
            display_order: true,
            image_url: true,
            knowledge: true,

            _count: {
              select: {
                listening_lesson_questions: true,
                user_listening_group_progress: true,
              },
            },
          },
        },

        _count: {
          select: {
            listening_lesson_groups: true,
            user_listening_progress: true,
          },
        },
      },
    });

  if (!lesson) {
    throw new NotFoundException(
      "Không tìm thấy bài Listening",
    );
  }

  return lesson;
}

@Post("listening/lessons")
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CONTENT_ADMIN,
)
async createListeningLesson(
  @Body()
  body: {
    title: string;
    part: number;
    stage: number;
    displayOrder?: number;
    questionGroupId?: number | null;
  },
) {
  if (!body.title?.trim()) {
    throw new BadRequestException(
      "Tiêu đề bài Listening không được để trống",
    );
  }

  const part = Number(body.part);

  if (
    !Number.isInteger(part) ||
    part < 1 ||
    part > 4
  ) {
    throw new BadRequestException(
      "Part phải từ 1 đến 4",
    );
  }

  const stage = Number(body.stage);

  if (
    !Number.isInteger(stage) ||
    stage < 1 ||
    stage > 5
  ) {
    throw new BadRequestException(
      "Stage phải từ 1 đến 5",
    );
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

  let questionGroupId:
    | number
    | null = null;

  if (
    body.questionGroupId !== undefined &&
    body.questionGroupId !== null
  ) {
    questionGroupId = Number(
      body.questionGroupId,
    );

    if (
      !Number.isInteger(questionGroupId) ||
      questionGroupId <= 0
    ) {
      throw new BadRequestException(
        "Question Group ID không hợp lệ",
      );
    }

    const questionGroup =
      await this.prisma.question_groups.findUnique({
        where: {
          id: questionGroupId,
        },
      });

    if (!questionGroup) {
      throw new NotFoundException(
        "Không tìm thấy Question Group",
      );
    }
  }

  const lesson =
    await this.prisma.listening_lessons.create({
      data: {
        title: body.title.trim(),
        part,
        stage,
        display_order: displayOrder,
        question_group_id: questionGroupId,
      },

      select: {
        id: true,
        title: true,
        part: true,
        stage: true,
        display_order: true,
        question_group_id: true,
        created_at: true,
        updated_at: true,
      },
    });

  return {
    success: true,
    message:
      "Thêm bài Listening thành công",
    item: lesson,
  };
}

@Patch("listening/lessons/:id")
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CONTENT_ADMIN,
)
async updateListeningLesson(
  @Param("id") id: string,
  @Body()
  body: {
    title: string;
    part: number;
    stage: number;
    displayOrder?: number;
    questionGroupId?: number | null;
  },
) {
  const lessonId = Number(id);

  if (
    !Number.isInteger(lessonId) ||
    lessonId <= 0
  ) {
    throw new BadRequestException(
      "ID bài Listening không hợp lệ",
    );
  }

  const existing =
    await this.prisma.listening_lessons.findUnique({
      where: {
        id: lessonId,
      },
    });

  if (!existing) {
    throw new NotFoundException(
      "Không tìm thấy bài Listening",
    );
  }

  if (!body.title?.trim()) {
    throw new BadRequestException(
      "Tiêu đề bài Listening không được để trống",
    );
  }

  const part = Number(body.part);

  if (
    !Number.isInteger(part) ||
    part < 1 ||
    part > 4
  ) {
    throw new BadRequestException(
      "Part phải từ 1 đến 4",
    );
  }

  const stage = Number(body.stage);

  if (
    !Number.isInteger(stage) ||
    stage < 1 ||
    stage > 5
  ) {
    throw new BadRequestException(
      "Stage phải từ 1 đến 5",
    );
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

  let questionGroupId:
    | number
    | null = null;

  if (
    body.questionGroupId !== undefined &&
    body.questionGroupId !== null
  ) {
    questionGroupId = Number(
      body.questionGroupId,
    );

    if (
      !Number.isInteger(questionGroupId) ||
      questionGroupId <= 0
    ) {
      throw new BadRequestException(
        "Question Group ID không hợp lệ",
      );
    }

    const questionGroup =
      await this.prisma.question_groups.findUnique({
        where: {
          id: questionGroupId,
        },
      });

    if (!questionGroup) {
      throw new NotFoundException(
        "Không tìm thấy Question Group",
      );
    }
  }

  const lesson =
    await this.prisma.listening_lessons.update({
      where: {
        id: lessonId,
      },

      data: {
        title: body.title.trim(),
        part,
        stage,
        display_order: displayOrder,
        question_group_id: questionGroupId,
      },

      select: {
        id: true,
        title: true,
        part: true,
        stage: true,
        display_order: true,
        question_group_id: true,
        created_at: true,
        updated_at: true,
      },
    });

  return {
    success: true,
    message:
      "Cập nhật bài Listening thành công",
    item: lesson,
  };
}

@Delete("listening/lessons/:id")
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CONTENT_ADMIN,
)
async deleteListeningLesson(
  @Param("id") id: string,
) {
  const lessonId = Number(id);

  if (
    !Number.isInteger(lessonId) ||
    lessonId <= 0
  ) {
    throw new BadRequestException(
      "ID bài Listening không hợp lệ",
    );
  }

  const lesson =
    await this.prisma.listening_lessons.findUnique({
      where: {
        id: lessonId,
      },

      include: {
        _count: {
          select: {
            listening_lesson_groups: true,
            user_listening_progress: true,
          },
        },
      },
    });

  if (!lesson) {
    throw new NotFoundException(
      "Không tìm thấy bài Listening",
    );
  }

  await this.prisma.$transaction(
    async (tx) => {
      // Xóa progress của người dùng
      await tx.user_listening_progress.deleteMany({
        where: {
          lesson_id: lessonId,
        },
      });

      // Xóa lesson.
      // Group → Question → Option
      // sẽ cascade theo FK.
      await tx.listening_lessons.delete({
        where: {
          id: lessonId,
        },
      });
    },
  );

  return {
    success: true,
    message:
      "Xóa bài Listening thành công",
    id: lessonId,
  };
}

@Get("listening/lessons/:lessonId/groups")
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CONTENT_ADMIN,
)
async getListeningGroups(
  @Param("lessonId") lessonId: string,
) {
  const lessonIdNumber = Number(lessonId);

  if (
    !Number.isInteger(lessonIdNumber) ||
    lessonIdNumber <= 0
  ) {
    throw new BadRequestException(
      "ID bài Listening không hợp lệ",
    );
  }

  const lesson =
    await this.prisma.listening_lessons.findUnique({
      where: {
        id: lessonIdNumber,
      },
    });

  if (!lesson) {
    throw new NotFoundException(
      "Không tìm thấy bài Listening",
    );
  }

  return this.prisma.listening_lesson_groups.findMany({
    where: {
      lesson_id: lessonIdNumber,
    },
    orderBy: [
      {
        display_order: "asc",
      },
      {
        id: "asc",
      },
    ],
    select: {
      id: true,
      lesson_id: true,
      title: true,
      audio_url: true,
      image_url: true,
      knowledge: true,
      display_order: true,
      created_at: true,
      updated_at: true,

      listening_lesson_questions: {
        orderBy: [
          {
            question_number: "asc",
          },
          {
            display_order: "asc",
          },
        ],
        select: {
          id: true,
          group_id: true,
          question_number: true,
          question_text: true,
          explanation: true,
          knowledge: true,
          display_order: true,

          listening_lesson_options: {
            orderBy: {
              display_order: "asc",
            },
            select: {
              id: true,
              question_id: true,
              option_label: true,
              option_text: true,
              is_correct: true,
              display_order: true,
            },
          },
        },
      },
    },
  });
}

@Get("listening/groups/:id")
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CONTENT_ADMIN,
)
async getListeningGroup(
  @Param("id") id: string,
) {
  const groupId = Number(id);

  if (
    !Number.isInteger(groupId) ||
    groupId <= 0
  ) {
    throw new BadRequestException(
      "ID Group không hợp lệ",
    );
  }

  const group =
    await this.prisma.listening_lesson_groups.findUnique({
      where: {
        id: groupId,
      },
      select: {
        id: true,
        lesson_id: true,
        title: true,
        audio_url: true,
        image_url: true,
        knowledge: true,
        display_order: true,
        created_at: true,
        updated_at: true,

        listening_lesson_questions: {
          orderBy: {
            question_number: "asc",
          },
          select: {
            id: true,
            group_id: true,
            question_number: true,
            question_text: true,
            explanation: true,
            knowledge: true,
            display_order: true,

            listening_lesson_options: {
              orderBy: {
                display_order: "asc",
              },
              select: {
                id: true,
                question_id: true,
                option_label: true,
                option_text: true,
                is_correct: true,
                display_order: true,
              },
            },
          },
        },
      },
    });

  if (!group) {
    throw new NotFoundException(
      "Không tìm thấy Group Listening",
    );
  }

  return group;
}

@Post("listening/lessons/:lessonId/groups")
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CONTENT_ADMIN,
)
async createListeningGroup(
  @Param("lessonId") lessonId: string,
  @Body()
  body: {
    title?: string;
    audioUrl?: string;
    imageUrl?: string;
    knowledge?: string;
    displayOrder?: number;

    questions: {
      questionNumber: number;
      questionText: string;
      explanation?: string;
      knowledge?: string;
      displayOrder?: number;

      options: {
        optionLabel: string;
        optionText: string;
        isCorrect: boolean;
        displayOrder?: number;
      }[];
    }[];
  },
) {
  const lessonIdNumber = Number(lessonId);

  if (
    !Number.isInteger(lessonIdNumber) ||
    lessonIdNumber <= 0
  ) {
    throw new BadRequestException(
      "ID bài Listening không hợp lệ",
    );
  }

  const lesson =
    await this.prisma.listening_lessons.findUnique({
      where: {
        id: lessonIdNumber,
      },
    });

  if (!lesson) {
    throw new NotFoundException(
      "Không tìm thấy bài Listening",
    );
  }

  if (
    !Array.isArray(body.questions) ||
    body.questions.length < 1 ||
    body.questions.length > 3
  ) {
    throw new BadRequestException(
      "Mỗi Group phải có từ 1 đến 3 câu hỏi",
    );
  }

  for (const [index, question] of body.questions.entries()) {
    if (!question.questionText?.trim()) {
      throw new BadRequestException(
        `Câu hỏi ${index + 1} không được để trống`,
      );
    }

    if (
      !Array.isArray(question.options) ||
      question.options.length !== 4
    ) {
      throw new BadRequestException(
        `Câu hỏi ${index + 1} phải có đúng 4 đáp án`,
      );
    }

    const labels = question.options.map(
      (option) => option.optionLabel,
    );

    const expectedLabels = ["A", "B", "C", "D"];

    if (
      labels.some(
        (label, i) =>
          label.toUpperCase() !== expectedLabels[i],
      )
    ) {
      throw new BadRequestException(
        `Câu hỏi ${index + 1} phải có đáp án A, B, C, D`,
      );
    }

    const correctCount =
      question.options.filter(
        (option) => option.isCorrect === true,
      ).length;

    if (correctCount !== 1) {
      throw new BadRequestException(
        `Câu hỏi ${index + 1} phải có đúng 1 đáp án đúng`,
      );
    }

    for (const option of question.options) {
      if (!option.optionText?.trim()) {
        throw new BadRequestException(
          `Đáp án ${option.optionLabel} của câu ${index + 1} không được để trống`,
        );
      }
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

  const group =
    await this.prisma.$transaction(async (tx) => {
      const newGroup =
        await tx.listening_lesson_groups.create({
          data: {
            lesson_id: lessonIdNumber,
            title: body.title?.trim() || null,
            audio_url: body.audioUrl?.trim() || null,

            // Không sử dụng thời gian bắt đầu/kết thúc
            start_seconds: null,
            end_seconds: null,

            image_url:
              body.imageUrl?.trim() || null,

            knowledge:
              body.knowledge?.trim() || null,

            display_order: displayOrder,
          },
        });

      for (let i = 0; i < body.questions.length; i++) {
        const question = body.questions[i];

        const newQuestion =
          await tx.listening_lesson_questions.create({
            data: {
              group_id: newGroup.id,

              question_number:
                question.questionNumber ||
                i + 1,

              question_text:
                question.questionText.trim(),

              explanation:
                question.explanation?.trim() ||
                null,

              knowledge:
                question.knowledge?.trim() ||
                null,

              display_order:
                question.displayOrder !== undefined
                  ? Number(question.displayOrder)
                  : i + 1,
            },
          });

        for (
          let j = 0;
          j < question.options.length;
          j++
        ) {
          const option = question.options[j];

          await tx.listening_lesson_options.create({
            data: {
              question_id: newQuestion.id,

              option_label:
                option.optionLabel
                  .trim()
                  .toUpperCase(),

              option_text:
                option.optionText.trim(),

              is_correct:
                option.isCorrect === true,

              display_order:
                option.displayOrder !== undefined
                  ? Number(option.displayOrder)
                  : j + 1,
            },
          });
        }
      }

      return newGroup;
    });

  return {
    success: true,
    message: "Thêm Group Listening thành công",
    item: group,
  };
}

@Patch("listening/groups/:id")
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CONTENT_ADMIN,
)
async updateListeningGroup(
  @Param("id") id: string,
  @Body()
  body: {
    title?: string;
    audioUrl?: string;
    imageUrl?: string;
    knowledge?: string;
    displayOrder?: number;

    questions?: {
      id?: number;
      questionNumber: number;
      questionText: string;
      explanation?: string;
      knowledge?: string;
      displayOrder?: number;

      options: {
        id?: number;
        optionLabel: string;
        optionText: string;
        isCorrect: boolean;
        displayOrder?: number;
      }[];
    }[];
  },
) {
  // ======================================================
  // VALIDATE GROUP ID
  // ======================================================

  const groupId = Number(id);

  if (
    !Number.isInteger(groupId) ||
    groupId <= 0
  ) {
    throw new BadRequestException(
      "ID group không hợp lệ",
    );
  }

  // ======================================================
  // KIỂM TRA GROUP
  // ======================================================

  const existingGroup =
    await this.prisma.listening_lesson_groups.findUnique({
      where: {
        id: groupId,
      },
      include: {
        listening_lesson_questions: {
          include: {
            listening_lesson_options: true,
          },
        },
      },
    });

  if (!existingGroup) {
    throw new NotFoundException(
      "Không tìm thấy group Listening",
    );
  }

  // ======================================================
  // VALIDATE QUESTIONS
  // ======================================================

  if (
    body.questions !== undefined &&
    body.questions.length > 3
  ) {
    throw new BadRequestException(
      "Một group tối đa 3 câu hỏi",
    );
  }

  if (body.questions !== undefined) {
    for (const question of body.questions) {
      // ----------------------------------------------
      // Question number
      // ----------------------------------------------

      if (
        !Number.isInteger(
          Number(question.questionNumber),
        ) ||
        Number(question.questionNumber) <= 0
      ) {
        throw new BadRequestException(
          "Question number không hợp lệ",
        );
      }

      // ----------------------------------------------
      // Question text
      // ----------------------------------------------

      if (!question.questionText?.trim()) {
        throw new BadRequestException(
          `Câu ${question.questionNumber} không được để trống`,
        );
      }

      // ----------------------------------------------
      // Options
      // ----------------------------------------------

      if (
        !Array.isArray(question.options) ||
        question.options.length === 0
      ) {
        throw new BadRequestException(
          `Câu ${question.questionNumber} phải có ít nhất 1 đáp án`,
        );
      }

      // ----------------------------------------------
      // Chỉ cho A/B/C/D
      // ----------------------------------------------

      const labels =
        question.options.map((option) =>
          option.optionLabel
            ?.trim()
            .toUpperCase(),
        );

      const uniqueLabels =
        new Set(labels);

      if (
        uniqueLabels.size !==
        labels.length
      ) {
        throw new BadRequestException(
          `Câu ${question.questionNumber} có option bị trùng`,
        );
      }

      // ----------------------------------------------
      // Kiểm tra đúng 1 đáp án
      // ----------------------------------------------

      const correctCount =
        question.options.filter(
          (option) => option.isCorrect === true,
        ).length;

      if (correctCount !== 1) {
        throw new BadRequestException(
          `Câu ${question.questionNumber} phải có đúng 1 đáp án đúng`,
        );
      }

      // ----------------------------------------------
      // Validate từng option
      // ----------------------------------------------

      for (const option of question.options) {
        const label =
          option.optionLabel
            ?.trim()
            .toUpperCase();

        if (!label) {
          throw new BadRequestException(
            `Câu ${question.questionNumber} có option không hợp lệ`,
          );
        }

        if (!["A", "B", "C", "D"].includes(label)) {
          throw new BadRequestException(
            `Option ${label} không hợp lệ. Chỉ được A, B, C hoặc D`,
          );
        }

        if (!option.optionText?.trim()) {
          throw new BadRequestException(
            `Option ${label} của câu ${question.questionNumber} không được để trống`,
          );
        }
      }
    }
  }

  // ======================================================
  // TRANSACTION
  // ======================================================

  const updatedGroup =
    await this.prisma.$transaction(
      async (tx) => {
        // ==================================================
        // 1. UPDATE GROUP
        // ==================================================

        await tx.listening_lesson_groups.update({
          where: {
            id: groupId,
          },

          data: {
  ...(body.title !== undefined && {
    title:
      body.title?.trim() || null,
  }),

  ...(body.audioUrl !== undefined && {
    audio_url:
      body.audioUrl?.trim() || null,
  }),

  ...(body.imageUrl !== undefined && {
    image_url:
      body.imageUrl?.trim() || null,
  }),

  ...(body.knowledge !== undefined && {
    knowledge:
      body.knowledge?.trim() || null,
  }),

  ...(body.displayOrder !== undefined && {
    display_order: Number(
      body.displayOrder,
    ),
  }),
},
        });

        // ==================================================
        // 2. XỬ LÝ QUESTIONS
        // ==================================================

        if (body.questions !== undefined) {
          // ----------------------------------------------
          // Lấy danh sách question ID hiện tại
          // ----------------------------------------------

          const existingQuestionIds =
            existingGroup.listening_lesson_questions.map(
              (question) => question.id,
            );

          // ----------------------------------------------
          // ID questions được gửi lên
          // ----------------------------------------------

          const incomingQuestionIds =
            body.questions
              .filter(
                (question) =>
                  question.id !== undefined &&
question.id !== null,
              )
              .map(
                (question) =>
                  Number(question.id),
              );

          // ----------------------------------------------
          // Xóa question cũ không còn trong request
          // ----------------------------------------------

          const questionIdsToDelete =
            existingQuestionIds.filter(
              (existingId) =>
                !incomingQuestionIds.includes(
                  existingId,
                ),
            );

          if (
            questionIdsToDelete.length > 0
          ) {
            await tx.listening_lesson_questions.deleteMany(
              {
                where: {
                  id: {
                    in: questionIdsToDelete,
                  },
                  group_id: groupId,
                },
              },
            );
          }

          // ==================================================
          // 3. UPDATE / CREATE QUESTIONS
          // ==================================================

          for (
            let questionIndex = 0;
            questionIndex <
            body.questions.length;
            questionIndex++
          ) {
            const question =
              body.questions[questionIndex];

            const questionId =
              question.id !== undefined &&
question.id !== null
                ? Number(question.id)
                : null;

            // ==================================================
            // UPDATE QUESTION
            // ==================================================

            if (questionId !== null) {
              const existingQuestion =
                await tx.listening_lesson_questions.findFirst(
                  {
                    where: {
                      id: questionId,
                      group_id: groupId,
                    },
                  },
                );

              if (!existingQuestion) {
                throw new BadRequestException(
                  `Question ID ${questionId} không thuộc group ${groupId}`,
                );
              }

              await tx.listening_lesson_questions.update(
                {
                  where: {
                    id: questionId,
                  },

                  data: {
                    question_number:
                      Number(
                        question.questionNumber,
                      ),

                    question_text:
                      question.questionText.trim(),

                    explanation:
                      question.explanation?.trim() ||
                      null,

                    knowledge:
                      question.knowledge?.trim() ||
                      null,

                    display_order:
                      question.displayOrder ??
                      questionIndex,
                  },
                },
              );
            }

            // ==================================================
            // CREATE QUESTION
            // ==================================================

            else {
              const createdQuestion =
                await tx.listening_lesson_questions.create(
                  {
                    data: {
                      group_id: groupId,

                      question_number:
                        Number(
                          question.questionNumber,
                        ),

                      question_text:
                        question.questionText.trim(),

                      explanation:
                        question.explanation?.trim() ||
                        null,

                      knowledge:
                        question.knowledge?.trim() ||
                        null,

                      display_order:
                        question.displayOrder ??
                        questionIndex,
                    },
                  },
                );

              // Gán ID vừa tạo để xử lý options
              question.id =
                createdQuestion.id;
            }

            // ==================================================
            // QUESTION ID SAU KHI CREATE / UPDATE
            // ==================================================

            const finalQuestionId =
              Number(question.id);

            // ==================================================
            // LẤY OPTIONS HIỆN TẠI
            // ==================================================

            const existingOptions =
              await tx.listening_lesson_options.findMany(
                {
                  where: {
                    question_id:
                      finalQuestionId,
                  },
                },
              );

            const existingOptionIds =
              existingOptions.map(
                (option) => option.id,
              );

            // ==================================================
            // OPTION IDS ĐƯỢC GỬI LÊN
            // ==================================================

            const incomingOptionIds =
              question.options
                .filter(
                  (option) =>
                    option.id !== undefined &&
        option.id !== null,
                )
                .map(
                  (option) =>
                    Number(option.id),
                );

            // ==================================================
            // XÓA OPTIONS KHÔNG CÒN
            // ==================================================

            const optionIdsToDelete =
              existingOptionIds.filter(
                (existingId) =>
                  !incomingOptionIds.includes(
                    existingId,
                  ),
              );

            if (
              optionIdsToDelete.length > 0
            ) {
              await tx.listening_lesson_options.deleteMany(
                {
                  where: {
                    id: {
                      in: optionIdsToDelete,
                    },
                    question_id:
                      finalQuestionId,
                  },
                },
              );
            }

            // ==================================================
            // UPDATE / CREATE OPTIONS
            // ==================================================

            for (
              let optionIndex = 0;
              optionIndex <
              question.options.length;
              optionIndex++
            ) {
              const option =
                question.options[
                  optionIndex
                ];

              const optionId =
                option.id !== undefined &&
        option.id !== null
                  ? Number(option.id)
                  : null;

              // ==============================================
              // UPDATE OPTION
              // ==============================================

              if (optionId !== null) {
                const existingOption =
                  await tx.listening_lesson_options.findFirst(
                    {
                      where: {
                        id: optionId,
                        question_id:
                          finalQuestionId,
                      },
                    },
                  );

                if (!existingOption) {
                  throw new BadRequestException(
                    `Option ID ${optionId} không thuộc question ${finalQuestionId}`,
                  );
                }

                await tx.listening_lesson_options.update(
                  {
                    where: {
                      id: optionId,
                    },

                    data: {
                      option_label:
                        option.optionLabel
                          .trim()
                          .toUpperCase(),

                      option_text:
                        option.optionText.trim(),

                      is_correct:
                        Boolean(
                          option.isCorrect,
                        ),

                      display_order:
                        option.displayOrder ??
                        optionIndex,
                    },
                  },
                );
              }

              // ==============================================
              // CREATE OPTION
              // ==============================================

              else {
                await tx.listening_lesson_options.create(
                  {
                    data: {
                      question_id:
                        finalQuestionId,

                      option_label:
                        option.optionLabel
                          .trim()
                          .toUpperCase(),

                      option_text:
                        option.optionText.trim(),

                      is_correct:
                        Boolean(
                          option.isCorrect,
                        ),

                      display_order:
                        option.displayOrder ??
                        optionIndex,
                    },
                  },
                );
              }
            }
          }
        }

        // ==================================================
        // 4. GET GROUP SAU KHI UPDATE
        // ==================================================

        return tx.listening_lesson_groups.findUnique({
          where: {
            id: groupId,
          },

          include: {
            listening_lesson_questions: {
              orderBy: {
                display_order: "asc",
              },

              include: {
                listening_lesson_options: {
                  orderBy: {
                    display_order: "asc",
                  },
                },
              },
            },
          },
        });
      },
    );

  // ======================================================
  // RESPONSE
  // ======================================================

  return {
    success: true,
    message:
      "Cập nhật group Listening thành công",
    item: updatedGroup,
  };
}

@Delete("listening/groups/:id")
@Roles(
  UserRole.SUPER_ADMIN,
  UserRole.CONTENT_ADMIN,
)
async deleteListeningGroup(
  @Param("id") id: string,
) {
  const groupId = Number(id);

  if (
    !Number.isInteger(groupId) ||
    groupId <= 0
  ) {
    throw new BadRequestException(
      "ID group không hợp lệ",
    );
  }

  const group =
    await this.prisma.listening_lesson_groups.findUnique({
      where: {
        id: groupId,
      },
      include: {
        _count: {
          select: {
            listening_lesson_questions: true,
            user_listening_group_progress: true,
          },
        },
      },
    });

  if (!group) {
    throw new NotFoundException(
      "Không tìm thấy group Listening",
    );
  }

  await this.prisma.$transaction(
    async (tx) => {
      // ==========================================
      // XÓA TIẾN ĐỘ USER
      // ==========================================

      await tx.user_listening_group_progress.deleteMany({
        where: {
          group_id: groupId,
        },
      });

      // ==========================================
      // XÓA GROUP
      // ==========================================
      //
      // listening_lesson_questions
      //   -> listening_lesson_options
      //
      // đều có onDelete: Cascade
      //

      await tx.listening_lesson_groups.delete({
        where: {
          id: groupId,
        },
      });
    },
  );

  return {
    success: true,
    message: "Xóa group Listening thành công",
    id: groupId,
  };
}


}