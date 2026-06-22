import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, Layers, GraduationCap, Eye, Play, X } from 'lucide-react';
import { getBookById } from '../storage';
import type { Book, Chapter, QuizConfig } from '../types';

interface BookDashboardProps {
  book: Book;
  onBack: () => void;
  onStudy: (bookId: string, chapterId: string) => void;
  onQuiz: (bookId: string, chapterId: string) => void;
  onMegaQuiz: (bookId: string, config: QuizConfig) => void;
}

export default function BookDashboard({ book, onBack, onStudy, onQuiz, onMegaQuiz }: BookDashboardProps) {
  const [showMegaQuizModal, setShowMegaQuizModal] = useState(false);
  const [questionCount, setQuestionCount] = useState(30);
  const [timeMinutes, setTimeMinutes] = useState(30);

  const freshBook = getBookById(book.id) || book;
  const totalMCQs = freshBook.chapters.reduce((sum, ch) => sum + ch.mcqs.length, 0);

  function handleMegaQuizStart() {
    onMegaQuiz(freshBook.id, { questionCount, timeMinutes });
    setShowMegaQuizModal(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-slate-900 p-6"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">{freshBook.name}</h2>
            <p className="text-sm text-slate-400">
              {freshBook.chapters.length} chapters · {totalMCQs} total MCQs
            </p>
          </div>
        </div>

        {/* Mega Quiz Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowMegaQuizModal(true)}
          disabled={totalMCQs === 0}
          className="w-full mb-8 p-6 rounded-2xl bg-gradient-to-r from-blue-500/20 to-violet-500/20 border border-blue-500/30 hover:border-blue-400/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-100">Mega Quiz</h3>
              <p className="text-sm text-slate-400">
                Practice all chapters together with a custom timed session
              </p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </motion.button>

        {/* Chapters List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-violet-400" />
            Chapters
          </h3>

          <div className="space-y-3">
            {freshBook.chapters.map((chapter, index) => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                index={index}
                bookId={freshBook.id}
                onStudy={onStudy}
                onQuiz={onQuiz}
              />
            ))}
            {freshBook.chapters.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                No chapters yet. Use the Admin Panel to add chapters.
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Mega Quiz Config Modal */}
      <AnimatePresence>
        {showMegaQuizModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowMegaQuizModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-100">Mega Quiz Setup</h3>
                <button
                  onClick={() => setShowMegaQuizModal(false)}
                  className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Number of Questions (max {totalMCQs})
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={totalMCQs}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Math.max(1, Math.min(totalMCQs, parseInt(e.target.value) || 1)))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={timeMinutes}
                    onChange={(e) => setTimeMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                    className="input-field"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleMegaQuizStart}
                  className="btn-primary w-full mt-2"
                >
                  Start Mega Quiz
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ChapterCard({
  chapter,
  index,
  bookId,
  onStudy,
  onQuiz,
}: {
  chapter: Chapter;
  index: number;
  bookId: string;
  onStudy: (bookId: string, chapterId: string) => void;
  onQuiz: (bookId: string, chapterId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      className="glass-card overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-700/60 flex items-center justify-center text-sm font-bold text-slate-300">
            {index + 1}
          </div>
          <div>
            <h4 className="font-semibold text-slate-100">{chapter.name}</h4>
            <p className="text-xs text-slate-400">{chapter.mcqs.length} MCQs</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4 flex gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onStudy(bookId, chapter.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition-all"
              >
                <Eye className="w-4 h-4" />
                View Mode
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onQuiz(bookId, chapter.id)}
                disabled={chapter.mcqs.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                Chapter Quiz
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
