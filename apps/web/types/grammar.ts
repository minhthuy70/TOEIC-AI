// ===========================================
// Grammar Category
// ===========================================

export interface GrammarCategory {
  id: number;
  name: string;
  description: string | null;
  stage: number;
  displayOrder: number | null;

  totalLessons: number;
  completedLessons: number;
  progress: number;
}

// ===========================================
// Grammar Lesson Progress
// ===========================================

export interface GrammarLessonProgress {
  completed: boolean;
  score: number;
  lastStudied: string | null;
}

// ===========================================
// Grammar Lesson
// ===========================================

export interface GrammarLesson {
  id: number;
  title: string;
  content: string | null;
  displayOrder: number | null;
  testId: number | null;

  progress: GrammarLessonProgress;
}

// ===========================================
// Grammar Category Detail
// ===========================================

export interface GrammarCategoryDetail
  extends GrammarCategory {
  lessons: GrammarLesson[];
}

// ===========================================
// Grammar Lesson Detail
// ===========================================

export interface GrammarLessonDetail
  extends GrammarLesson {
  category: {
    id: number;
    name: string;
  };
}