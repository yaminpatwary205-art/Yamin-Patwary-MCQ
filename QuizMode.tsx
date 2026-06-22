import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle, XCircle, Trophy, RotateCcw } from 'lucide-react';
import { getChapterById, getBookById } from '../storage';
import { toBengaliLetter, toBengaliNumber } from '../utils/mcqParser';
import type { MCQ, QuizConfig } from '../types';

interface QuizModeProps {
  bookId: string;
  chapterId?: string;
  megaQuizConfig?: QuizConfig;
  onBack: () => void;
}

interface QuizState {
  questions: MCQ[];
  currentIndex: number;
  answers: (number | null)[];
  timeLeft: number;
  totalTime: number;
  isFinished: boolean;
  showFeedback: boolean;
  feedbackCorrect: boolean;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function QuizMode({ bookId, chapterId, megaQuizConfig, onBack }: QuizModeProps) {
  const [quiz, setQuiz] = useState<QuizState | null>(null);

  useEffect(() => {
    let questions: MCQ[] = [];

    if (chapterId) {
      const chapter = getChapterById(bookId, chapterId);
      if (chapter) {
        questions = shuffleArray(chapter.mcqs);
      }
    } else if (megaQuizConfig) {
      const book = getBookById(bookId);
      if (book) {
        const allMCQs = book.chapters.flatMap((ch) => ch.mcqs);
        questions = shuffleArray(allMCQs).slice(0, megaQuizConfig.questionCount);
      }
    }

    if (questions.length === 0) {
      return;
    }

    const totalTime = megaQuizConfig ? megaQuizConfig.timeMinutes * 60 : questions.length * 45;

    setQuiz({
      questions,
      currentIndex: 0,
      answers: new Array(questions.length).fill(null),
      timeLeft: totalTime,
      totalTime,
      isFinished: false,
      showFeedback: false,
      feedbackCorrect: false,
    });
  }, [bookId, chapterId, megaQuizConfig]);

  useEffect(() => {
    if (!quiz || quiz.isFinished) return;

    const interval = setInterval(() => {
      setQuiz((prev) => {
        if (!prev || prev.isFinished) return prev;
        const newTimeLeft = prev.timeLeft - 1;
        if (newTimeLeft <= 0) {
          return { ...prev, timeLeft: 0, isFinished: true };
        }
        return { ...prev, timeLeft: newTimeLeft };
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz?.isFinished]);

  const handleAnswer = useCallback((optionIndex: number) => {
    setQuiz((prev) => {
      if (!prev || prev.isFinished || prev.showFeedback) return prev;

      const currentQ = prev.questions[prev.currentIndex];
      const isCorrect = optionIndex === currentQ.correctIndex;
      const newAnswers = [...prev.answers];
      newAnswers[prev.currentIndex] = optionIndex;

      return {
        ...prev,
        answers: newAnswers,
        showFeedback: true,
        feedbackCorrect: isCorrect,
      };
    });

    // Auto advance after feedback
    setTimeout(() => {
      setQuiz((prev) => {
        if (!prev) return prev;
        const nextIndex = prev.currentIndex + 1;
        const isFinished = nextIndex >= prev.questions.length;
        return {
          ...prev,
          currentIndex: isFinished ? prev.currentIndex : nextIndex,
          isFinished: isFinished || prev.timeLeft <= 0,
          showFeedback: false,
          feedbackCorrect: false,
        };
      });
    }, 1200);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleRestart = () => {
    if (!quiz) return;
    const totalTime = megaQuizConfig ? megaQuizConfig.timeMinutes * 60 : quiz.questions.length * 45;
    setQuiz({
      questions: shuffleArray(quiz.questions),
      currentIndex: 0,
      answers: new Array(quiz.questions.length).fill(null),
      timeLeft: totalTime,
      totalTime,
      isFinished: false,
      showFeedback: false,
      feedbackCorrect: false,
    });
  };

  if (!quiz) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (quiz.isFinished) {
    const correctCount = quiz.answers.filter((a, i) => a === quiz.questions[i].correctIndex).length;
    const wrongCount = quiz.answers.filter((a, i) => a !== null && a !== quiz.questions[i].correctIndex).length;
    const unanswered = quiz.questions.length - quiz.answers.filter((a) => a !== null).length;
    const percentage = Math.round((correctCount / quiz.questions.length) * 100);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-slate-900 flex items-center justify-center p-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass-card p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-xl shadow-blue-500/20">
            <Trophy className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-slate-100 mb-2">Quiz Complete!</h2>
          <p className="text-slate-400 mb-6">
            You scored {toBengaliNumber(correctCount)} out of {toBengaliNumber(quiz.questions.length)}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-emerald-300">{toBengaliNumber(correctCount)}</div>
              <div className="text-xs text-emerald-400/70">Correct</div>
            </div>
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <XCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-300">{toBengaliNumber(wrongCount)}</div>
              <div className="text-xs text-red-400/70">Wrong</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-700/40 border border-slate-600/30">
              <div className="text-2xl font-bold text-slate-300">{toBengaliNumber(unanswered)}</div>
              <div className="text-xs text-slate-400">Skipped</div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
              <span>Accuracy</span>
              <span>{percentage}%</span>
            </div>
            <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRestart}
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retry
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onBack}
              className="flex-1 btn-primary"
            >
              Done
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  const currentQ = quiz.questions[quiz.currentIndex];
  const answeredCount = quiz.answers.filter((a) => a !== null).length;
  const remainingCount = quiz.questions.length - answeredCount;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-slate-900"
    >
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-lg border-b border-slate-700/30 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <p className="text-xs text-slate-400">Chapter Quiz</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
              quiz.timeLeft < 60 ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-300'
            }`}>
              <Clock className="w-4 h-4" />
              {formatTime(quiz.timeLeft)}
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-slate-800">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
          animate={{ width: `${((quiz.currentIndex + 1) / quiz.questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Stats Bar */}
      <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between text-sm text-slate-400">
        <span>
          Answered {toBengaliNumber(answeredCount)} / Remaining {toBengaliNumber(remainingCount)}
        </span>
        <span>
          {toBengaliNumber(quiz.currentIndex + 1)} / {toBengaliNumber(quiz.questions.length)}
        </span>
      </div>

      {/* Question */}
      <div className="max-w-3xl mx-auto px-6 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="glass-card p-6">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center text-sm font-bold">
                  {toBengaliNumber(quiz.currentIndex + 1)}
                </span>
                <h3 className="text-lg font-medium text-slate-100 leading-relaxed">{currentQ.question}</h3>
              </div>
            </div>

            <div className="space-y-3">
              {currentQ.options.map((option, idx) => {
                const isSelected = quiz.answers[quiz.currentIndex] === idx;
                const isCorrect = idx === currentQ.correctIndex;
                const showCorrect = quiz.showFeedback && isCorrect;
                const showWrong = quiz.showFeedback && isSelected && !isCorrect;

                return (
                  <motion.button
                    key={idx}
                    whileHover={!quiz.showFeedback ? { scale: 1.01 } : {}}
                    whileTap={!quiz.showFeedback ? { scale: 0.99 } : {}}
                    onClick={() => handleAnswer(idx)}
                    disabled={quiz.showFeedback}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border text-left transition-all duration-200 ${
                      showCorrect
                        ? 'bg-emerald-500/20 border-emerald-500/60'
                        : showWrong
                        ? 'bg-red-500/20 border-red-500/60'
                        : isSelected
                        ? 'bg-blue-500/15 border-blue-500/40'
                        : 'bg-slate-800/40 border-slate-700/40 hover:bg-slate-700/50 hover:border-slate-600/50'
                    } ${quiz.showFeedback ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        showCorrect
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : showWrong
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-slate-700/60 text-slate-400'
                      }`}
                    >
                      {showCorrect ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : showWrong ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        toBengaliLetter(idx)
                      )}
                    </span>
                    <span
                      className={`flex-1 ${
                        showCorrect
                          ? 'text-emerald-200 font-medium'
                          : showWrong
                          ? 'text-red-200'
                          : 'text-slate-300'
                      }`}
                    >
                      {option}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
