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
// Grammar Dashboard Types
// ===========================================

export interface GrammarTopicSummary {
  id: number;
  name: string;
  description: string | null;
  stage: number;
  displayOrder: number | null;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  accuracy: number;
  isMastered: boolean;
  isLearning: boolean;
  isNotStarted: boolean;
  isWeak: boolean;
  lastStudied: string | null;
  nextLesson: {
    id: number;
    title: string;
  } | null;
}

export interface GrammarStageStats {
  stage: number;
  name: string;
  range: string;
  title: string;
  color: string;
  isCurrent: boolean;
  totalCategories: number;
  completedCategories: number;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  accuracy: number;
  topics: GrammarTopicSummary[];
}

export interface GrammarRecentActivity {
  id: number;
  lessonId: number;
  lessonTitle: string;
  categoryId: number;
  categoryName: string;
  stage: number;
  score: number;
  lastStudied: string;
}

export interface GrammarDashboardData {
  success: boolean;
  userStage: number;
  overview: {
    totalCategories: number;
    masteredCategories: number;
    learningCategories: number;
    notStartedCategories: number;
    weakCategories: number;
    totalLessons: number;
    completedLessons: number;
    overallProgress: number;
    overallAccuracy: number;
  };
  accuracy: {
    overall: number;
    totalScored: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  };
  masteredTopics: GrammarTopicSummary[];
  learningTopics: GrammarTopicSummary[];
  weakTopics: GrammarTopicSummary[];
  notStartedTopics: GrammarTopicSummary[];
  stages: GrammarStageStats[];
  recentActivities: GrammarRecentActivity[];
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
  difficulty?: string;
  isFavorite?: boolean;
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
  difficulty?: string;

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
  difficulty: string;
  lessonIndex: number;
  totalLessonsInCategory: number;

  category: {
    id: number;
    name: string;
    description?: string | null;
    stage: number;
  };

  progress: {
    completed: boolean;
    score: number;
    lastStudied: string | null;
  };

  previousLesson: {
    id: number;
    title: string;
  } | null;

  nextLesson: {
    id: number;
    title: string;
  } | null;

  siblingLessons: {
    id: number;
    title: string;
    order: number;
    completed: boolean;
    score: number;
  }[];

  relatedCategories: {
    id: number;
    name: string;
    stage: number;
    description: string | null;
  }[];
}