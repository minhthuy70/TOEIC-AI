const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface MockTest {
  id: number;
  title: string;
  description: string | null;
  duration: number | null;
  totalQuestions: number | null;
  createdAt: string;
  questionGroupsCount: number;
}

export interface MockTestAttempt {
  attemptId: number;
  testId: number;
  title: string;
  description: string | null;
  duration: number | null;
  totalQuestions: number | null;
  startedAt: string;
  status: 'started' | 'in_progress';
  questions?: any[];
}

export interface MockTestResult {
  attemptId: number;
  testId: number;
  listeningScore: number | null;
  readingScore: number | null;
  totalScore: number | null;
  listeningCorrect: number | null;
  readingCorrect: number | null;
  totalCorrect: number | null;
  submittedAt: string | null;
  answers: Record<number, {
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
}

export interface MockTestHistoryItem {
  id: number;
  testId: number;
  testTitle: string;
  totalScore: number | null;
  listeningScore: number | null;
  readingScore: number | null;
  totalCorrect: number | null;
  listeningCorrect: number | null;
  readingCorrect: number | null;
  startedAt: string;
  submittedAt: string | null;
  isCompleted: boolean;
}

class MockTestService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getAvailableTests(): Promise<MockTest[]> {
    const response = await fetch(`${API_BASE}/mock-test/tests`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get available tests');
    }

    return response.json();
  }

  async startFullTest(testId: number): Promise<MockTestAttempt> {
    const response = await fetch(`${API_BASE}/mock-test/start`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ testId }),
    });

    if (!response.ok) {
      throw new Error('Failed to start full test');
    }

    return response.json();
  }

  async submitFullTest(attemptId: number, answers: Record<number, string>): Promise<MockTestResult> {
    const response = await fetch(`${API_BASE}/mock-test/submit`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ attemptId, answers }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit full test');
    }

    return response.json();
  }

  async getHistory(): Promise<MockTestHistoryItem[]> {
    const response = await fetch(`${API_BASE}/mock-test/history`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get test history');
    }

    return response.json();
  }

  async getAttempt(attemptId: number): Promise<any> {
    const response = await fetch(`${API_BASE}/mock-test/attempt/${attemptId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get test attempt');
    }

    return response.json();
  }

  async getTest(testId: number): Promise<MockTestAttempt> {
    const response = await fetch(`${API_BASE}/mock-test/test/${testId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get test');
    }

    return response.json();
  }
}

export const mockTestService = new MockTestService();