export interface MCQ {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  bookId: string;
  chapterId: string;
}

export interface Chapter {
  id: string;
  name: string;
  bookId: string;
  mcqs: MCQ[];
}

export interface Book {
  id: string;
  name: string;
  chapters: Chapter[];
}

export type Screen = 'home' | 'admin' | 'book' | 'study' | 'quiz' | 'megaQuiz';

export interface QuizConfig {
  questionCount: number;
  timeMinutes: number;
}
