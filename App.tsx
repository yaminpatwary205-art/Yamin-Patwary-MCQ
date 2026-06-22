import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import HomeDashboard from './components/HomeDashboard';
import AdminPanel from './components/AdminPanel';
import BookDashboard from './components/BookDashboard';
import StudyMode from './components/StudyMode';
import QuizMode from './components/QuizMode';
import type { Book, Screen, QuizConfig } from './types';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [studyParams, setStudyParams] = useState<{ bookId: string; chapterId: string } | null>(null);
  const [quizParams, setQuizParams] = useState<{ bookId: string; chapterId?: string; megaQuizConfig?: QuizConfig } | null>(null);

  function goHome() {
    setScreen('home');
    setSelectedBook(null);
    setStudyParams(null);
    setQuizParams(null);
  }

  function goAdmin() {
    setScreen('admin');
  }

  function handleBookClick(book: Book) {
    setSelectedBook(book);
    setScreen('book');
  }

  function handleStudy(bookId: string, chapterId: string) {
    setStudyParams({ bookId, chapterId });
    setScreen('study');
  }

  function handleQuiz(bookId: string, chapterId: string) {
    setQuizParams({ bookId, chapterId });
    setScreen('quiz');
  }

  function handleMegaQuiz(bookId: string, config: QuizConfig) {
    setQuizParams({ bookId, megaQuizConfig: config });
    setScreen('megaQuiz');
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Header onAdminClick={goAdmin} />

      <AnimatePresence mode="wait">
        {screen === 'home' && (
          <HomeDashboard key="home" onBookClick={handleBookClick} />
        )}
        {screen === 'admin' && (
          <AdminPanel key="admin" onBack={goHome} />
        )}
        {screen === 'book' && selectedBook && (
          <BookDashboard
            key="book"
            book={selectedBook}
            onBack={goHome}
            onStudy={handleStudy}
            onQuiz={handleQuiz}
            onMegaQuiz={handleMegaQuiz}
          />
        )}
        {screen === 'study' && studyParams && (
          <StudyMode
            key="study"
            bookId={studyParams.bookId}
            chapterId={studyParams.chapterId}
            onBack={() => {
              if (selectedBook) {
                setScreen('book');
              } else {
                goHome();
              }
            }}
          />
        )}
        {(screen === 'quiz' || screen === 'megaQuiz') && quizParams && (
          <QuizMode
            key="quiz"
            bookId={quizParams.bookId}
            chapterId={quizParams.chapterId}
            megaQuizConfig={quizParams.megaQuizConfig}
            onBack={() => {
              if (selectedBook) {
                setScreen('book');
              } else {
                goHome();
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
