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
// Grammar Lesson
// ===========================================

export interface GrammarLesson {
  id: number;
  title: string;
  content: string | null;
  displayOrder: number | null;
  testId: number | null;

  completed: boolean;
  score: number;
  lastStudied: string | null;
}

// ===========================================
// Grammar Category Detail
// ===========================================

export interface GrammarCategoryDetail {
  id: number;
  name: string;
  description: string | null;
  stage: number;
  displayOrder: number | null;

  totalLessons: number;
  completedLessons: number;
  progress: number;

  lessons: GrammarLesson[];
}

// ===========================================
// Grammar Lesson Detail
// ===========================================

export interface GrammarLessonDetail {
  id: number;
  title: string;
  content: string | null;
  displayOrder: number | null;
  testId: number | null;

  category: {
    id: number;
    name: string;
  };

  progress: {
    completed: boolean;
    score: number;
    lastStudied: string | null;
  };
}