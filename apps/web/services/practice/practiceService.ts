const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface PracticeQuestion {
  id: number;
  question_number: number;
  question_text: string;
  group_id: number | null;
  options: {
    id: number;
    option_label: string | null;
    option_text: string | null;
  }[];
}

export interface PracticeSession {
  sessionId: number;
  part: number;
  questionCount: number;
  questions: PracticeQuestion[];
}

export interface PracticeResult {
  sessionId: number;
  part: number;
  questionCount: number;
  correctCount: number;
  score: number;
  completedAt: string;
  answers: Record<number, {
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
}

export interface PracticeHistoryItem {
  id: number;
  part: number;
  questionCount: number;
  correctCount: number;
  score: number;
  startedAt: string;
  completedAt: string | null;
}

class PracticeService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async startPractice(part: number, questionCount?: number, random: boolean = false): Promise<PracticeSession> {
    const response = await fetch(`${API_BASE}/practice/start`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ part, questionCount, random }),
    });

    if (!response.ok) {
      throw new Error('Failed to start practice');
    }

    return response.json();
  }

  async submitPractice(sessionId: number, answers: Record<number, string>): Promise<PracticeResult> {
    const response = await fetch(`${API_BASE}/practice/submit`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ sessionId, answers }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit practice');
    }

    return response.json();
  }

  async getHistory(part?: number): Promise<PracticeHistoryItem[]> {
    const url = part 
      ? `${API_BASE}/practice/history?part=${part}`
      : `${API_BASE}/practice/history`;

    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get practice history');
    }

    return response.json();
  }

  async getSession(sessionId: number): Promise<any> {
    const response = await fetch(`${API_BASE}/practice/session/${sessionId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get practice session');
    }

    return response.json();
  }

  async getQuestions(part: number, questionCount?: number, random: boolean = false): Promise<PracticeSession> {
    const params = new URLSearchParams({
      part: part.toString(),
      ...(questionCount && { questionCount: questionCount.toString() }),
      ...(random && { random: 'true' }),
    });

    const response = await fetch(`${API_BASE}/practice/questions?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get practice questions');
    }

    return response.json();
  }
}

export const practiceService = new PracticeService();