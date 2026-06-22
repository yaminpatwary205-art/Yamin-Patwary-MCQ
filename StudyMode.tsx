import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { getChapterById } from '../storage';
import { toBengaliLetter, toBengaliNumber } from '../utils/mcqParser';

interface StudyModeProps {
  bookId: string;
  chapterId: string;
  onBack: () => void;
}

export default function StudyMode({ bookId, chapterId, onBack }: StudyModeProps) {
  const chapter = getChapterById(bookId, chapterId);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!chapter || chapter.mcqs.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">No MCQs found in this chapter.</p>
          <button onClick={onBack} className="btn-primary mt-4">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const mcq = chapter.mcqs[currentIndex];

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
              <h2 className="text-lg font-bold text-slate-100">{chapter.name}</h2>
              <p className="text-xs text-slate-400">Study Mode</p>
            </div>
          </div>
          <div className="text-sm text-slate-400">
            {toBengaliNumber(currentIndex + 1)} / {toBengaliNumber(chapter.mcqs.length)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-800">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
          animate={{ width: `${((currentIndex + 1) / chapter.mcqs.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <motion.div
          key={mcq.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="glass-card p-6">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center text-sm font-bold">
                {toBengaliNumber(currentIndex + 1)}
              </span>
              <h3 className="text-lg font-medium text-slate-100 leading-relaxed">{mcq.question}</h3>
            </div>
          </div>

          <div className="space-y-3">
            {mcq.options.map((option, idx) => {
              const isCorrect = idx === mcq.correctIndex;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-all ${
                    isCorrect
                      ? 'bg-emerald-500/15 border-emerald-500/40'
                      : 'bg-slate-800/40 border-slate-700/40'
                  }`}
                >
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      isCorrect
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-700/60 text-slate-400'
                    }`}
                  >
                    {isCorrect ? <CheckCircle className="w-4 h-4" /> : toBengaliLetter(idx)}
                  </span>
                  <span className={`flex-1 ${isCorrect ? 'text-emerald-200 font-medium' : 'text-slate-300'}`}>
                    {option}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </motion.button>

          <div className="flex gap-2">
            {chapter.mcqs.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'bg-blue-400 w-6'
                    : idx < currentIndex
                    ? 'bg-slate-500'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setCurrentIndex((i) => Math.min(chapter.mcqs.length - 1, i + 1))}
            disabled={currentIndex === chapter.mcqs.length - 1}
            className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
