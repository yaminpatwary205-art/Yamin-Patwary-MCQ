import { motion } from 'framer-motion';
import { BookOpen, ChevronRight } from 'lucide-react';
import { getBooks } from '../storage';
import type { Book } from '../types';

interface HomeDashboardProps {
  onBookClick: (book: Book) => void;
}

const gradients = [
  'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  'from-violet-500/20 to-fuchsia-500/20 border-violet-500/30',
  'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
  'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  'from-rose-500/20 to-pink-500/20 border-rose-500/30',
  'from-sky-500/20 to-indigo-500/20 border-sky-500/30',
];

export default function HomeDashboard({ onBookClick }: HomeDashboardProps) {
  const books = getBooks();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-slate-900 p-6"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h2 className="text-3xl font-bold gradient-text mb-2">My Library</h2>
          <p className="text-slate-400">Select a book to start studying</p>
        </motion.div>

        {books.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No Books Yet</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Go to the Admin Panel to create your first book and start adding chapters and MCQs.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book, index) => {
              const totalMCQs = book.chapters.reduce((sum, ch) => sum + ch.mcqs.length, 0);
              const gradient = gradients[index % gradients.length];

              return (
                <motion.button
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.07 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onBookClick(book)}
                  className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${gradient} p-6 text-left transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group`}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-6 h-6 text-slate-300" />
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center mb-4 shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-100 mb-1 pr-6">{book.name}</h3>

                  <div className="flex items-center gap-4 text-sm text-slate-400 mt-3">
                    <span>{book.chapters.length} chapters</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    <span>{totalMCQs} MCQs</span>
                  </div>

                  <div className="mt-4 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((totalMCQs / 100) * 100, 100)}%` }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-blue-400 to-violet-400 rounded-full"
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
