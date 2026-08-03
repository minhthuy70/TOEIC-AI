// ===========================================
// Dashboard
// ===========================================

export interface DashboardResponse {
  success: boolean;

  stage: number;

  currentScore: number | null;

  targetScore: number | null;

  totalWords: number;

  totalLearned: number;

  totalStageWords: number;

  learnedToday: number;

  dailyGoal: number;

  remainToday: number;

  learning: number;

  review: number;

  mastered: number;

  progress: number;
}

// ===========================================
// Topic
// ===========================================

export interface Topic {
  topic: string;

  totalWords: number;
}

// ===========================================
// Vocabulary
// ===========================================

export interface VocabularyWord {
  id: number;

  english: string;

  vietnamese: string;

  type: string | null;

  pronounce: string | null;

  explain: string | null;

  example: string | null;

  exampleVietnamese: string | null;

  imageUrl: string | null;

  audioUrl: string | null;

  topic: string;

  stage: number;

  isReview?: boolean;
}

// ===========================================
// Vocabulary List
// ===========================================

export interface VocabularyListResponse {
  success: boolean;

  total: number;

  page: number;

  limit: number;

  totalPages: number;

  items: VocabularyWord[];
}

// ===========================================
// Today Learning
// ===========================================

export interface TodayLearningResponse {
  success: boolean;

  mode:
    | "NEW"
    | "REVIEW"
    | "DONE_TODAY"
    | "PRACTICE";

  words: VocabularyWord[];
}

// ===========================================
// Learn
// ===========================================

export interface LearnResponse {
  success: boolean;

  message: string;

  nextReview: string;
}

// ===========================================
// Review
// ===========================================

export interface ReviewResponse {
  success: boolean;

  reviewLevel: number;

  status: string;

  nextReview: string;
}

// ===========================================
// SRS Dashboard
// ===========================================

export interface SrsResponse {
  success: boolean;

  stage: number;

  currentScore: number;

  targetScore: number;

  dailyGoal: number;

  learnedToday: number;

  remainToday: number;

  totalLearned: number;

  learningCount: number;

  masteredCount: number;

  reviewNow: number;

  nextReview: string | null;

  totalStageWords: number;

  learnedStage: number;

  progress: number;

  srsLevels: Record<string, number>;

  streak: number;
}

// ===========================================
// Lessons
// ===========================================

export interface Lesson {
  lessonNumber: number;
  totalWords: number;
  learnedWords: number;
  status: "completed" | "in_progress" | "locked";
}

export interface LessonsResponse {
  success: boolean;
  stage: number;
  totalLessons: number;
  lessons: Lesson[];
}

export interface VocabularyWordWithProgress extends VocabularyWord {
  status: "NEW" | "LEARNING" | "REVIEW" | "MASTERED";

  reviewLevel: number;

  learnedAt: string | null;

  nextReview: string | null;

  isReview: boolean;
}

export interface LessonWordsResponse {
  success: boolean;
  lessonNumber: number;
  words: VocabularyWordWithProgress[];
}

// ===========================================
// SRS Review Levels
// ===========================================

export interface ReviewLevel {
  level: number;
  label: string;
  icon: string;
  count: number;
}

export interface ReviewLevelsResponse {
  success: boolean;
  levels: ReviewLevel[];
}

export interface ReviewWordsResponse {
  success: boolean;
  level: number;
  words: VocabularyWordWithProgress[];
}