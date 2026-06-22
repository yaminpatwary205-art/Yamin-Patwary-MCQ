import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, BookOpen, Layers, Upload, CheckCircle } from 'lucide-react';
import { getBooks, addBook, addChapter, addMCQs, deleteBook, deleteChapter } from '../storage';
import { parseMCQBulkText } from '../utils/mcqParser';
import type { Book } from '../types';

interface AdminPanelProps {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [books, setBooks] = useState<Book[]>(getBooks());
  const [newBookName, setNewBookName] = useState('');
  const [selectedBookForChapter, setSelectedBookForChapter] = useState('');
  const [newChapterName, setNewChapterName] = useState('');
  const [selectedBookForMCQ, setSelectedBookForMCQ] = useState('');
  const [selectedChapterForMCQ, setSelectedChapterForMCQ] = useState('');
  const [mcqText, setMcqText] = useState('');
  const [parseResult, setParseResult] = useState<{ count: number; success: boolean } | null>(null);
  const [activeTab, setActiveTab] = useState<'books' | 'chapters' | 'mcqs'>('books');

  function refreshBooks() {
    setBooks(getBooks());
  }

  function handleAddBook() {
    if (!newBookName.trim()) return;
    addBook(newBookName.trim());
    setNewBookName('');
    refreshBooks();
  }

  function handleAddChapter() {
    if (!selectedBookForChapter || !newChapterName.trim()) return;
    addChapter(selectedBookForChapter, newChapterName.trim());
    setNewChapterName('');
    refreshBooks();
  }

  function handleUploadMCQs() {
    if (!selectedBookForMCQ || !selectedChapterForMCQ || !mcqText.trim()) return;
    const parsed = parseMCQBulkText(mcqText);
    if (parsed.length === 0) {
      setParseResult({ count: 0, success: false });
      return;
    }
    addMCQs(selectedBookForMCQ, selectedChapterForMCQ, parsed);
    setParseResult({ count: parsed.length, success: true });
    setMcqText('');
    refreshBooks();
  }

  function handleDeleteBook(bookId: string) {
    if (confirm('Delete this book and all its chapters?')) {
      deleteBook(bookId);
      refreshBooks();
    }
  }

  function handleDeleteChapter(bookId: string, chapterId: string) {
    if (confirm('Delete this chapter and all its MCQs?')) {
      deleteChapter(bookId, chapterId);
      refreshBooks();
    }
  }

  const selectedBookChapters = books.find((b) => b.id === selectedBookForMCQ)?.chapters || [];

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
          <h2 className="text-2xl font-bold gradient-text">Admin Panel</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-slate-800/60 p-1.5 rounded-xl">
          {(['books', 'chapters', 'mcqs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'books' && 'Books'}
              {tab === 'chapters' && 'Chapters'}
              {tab === 'mcqs' && 'Upload MCQs'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'books' && (
            <motion.div
              key="books"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  Create New Book
                </h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newBookName}
                    onChange={(e) => setNewBookName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddBook()}
                    placeholder="Enter book / subject name..."
                    className="input-field flex-1"
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAddBook}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {books.map((book) => (
                  <motion.div
                    key={book.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-5 relative group"
                  >
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <h4 className="text-lg font-semibold text-slate-100 pr-8">{book.name}</h4>
                    <p className="text-sm text-slate-400 mt-1">{book.chapters.length} chapters</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {book.chapters.map((ch) => (
                        <span
                          key={ch.id}
                          className="text-xs px-2 py-1 rounded-md bg-slate-700/60 text-slate-300"
                        >
                          {ch.name} ({ch.mcqs.length})
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
                {books.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-slate-500">
                    No books created yet. Add your first book above!
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'chapters' && (
            <motion.div
              key="chapters"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-violet-400" />
                  Add Chapter
                </h3>
                <div className="space-y-4">
                  <select
                    value={selectedBookForChapter}
                    onChange={(e) => setSelectedBookForChapter(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select a book...</option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newChapterName}
                      onChange={(e) => setNewChapterName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddChapter()}
                      placeholder="Enter chapter name..."
                      className="input-field flex-1"
                    />
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleAddChapter}
                      disabled={!selectedBookForChapter}
                      className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {books.map((book) => (
                  <div key={book.id} className="glass-card p-5">
                    <h4 className="text-base font-semibold text-slate-100 mb-3">{book.name}</h4>
                    <div className="space-y-2">
                      {book.chapters.map((ch) => (
                        <div
                          key={ch.id}
                          className="flex items-center justify-between px-4 py-3 bg-slate-800/40 rounded-xl"
                        >
                          <span className="text-slate-200">{ch.name}</span>
                          <span className="text-xs text-slate-400">{ch.mcqs.length} MCQs</span>
                          <button
                            onClick={() => handleDeleteChapter(book.id, ch.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {book.chapters.length === 0 && (
                        <p className="text-sm text-slate-500 italic">No chapters yet</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'mcqs' && (
            <motion.div
              key="mcqs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-emerald-400" />
                  Bulk MCQ Uploader
                </h3>
                <div className="space-y-4">
                  <select
                    value={selectedBookForMCQ}
                    onChange={(e) => {
                      setSelectedBookForMCQ(e.target.value);
                      setSelectedChapterForMCQ('');
                    }}
                    className="input-field"
                  >
                    <option value="">Select a book...</option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedChapterForMCQ}
                    onChange={(e) => setSelectedChapterForMCQ(e.target.value)}
                    className="input-field"
                    disabled={!selectedBookForMCQ}
                  >
                    <option value="">Select a chapter...</option>
                    {selectedBookChapters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <textarea
                    value={mcqText}
                    onChange={(e) => setMcqText(e.target.value)}
                    placeholder={`Paste raw MCQ text here...\n\nExample format:\n1. What is the capital of Bangladesh?\nA) Dhaka ✓\nB) Chittagong\nC) Rajshahi\nD) Khulna\n\nThe parser will detect checkmarks (✓, ✔) or markers to find correct answers.`}
                    className="input-field h-64 resize-none font-mono text-sm"
                  />

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUploadMCQs}
                    disabled={!selectedBookForMCQ || !selectedChapterForMCQ || !mcqText.trim()}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-4 h-4" />
                    Upload MCQs
                  </motion.button>

                  <AnimatePresence>
                    {parseResult && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-4 rounded-xl flex items-center gap-3 ${
                          parseResult.success
                            ? 'bg-emerald-500/10 border border-emerald-500/30'
                            : 'bg-red-500/10 border border-red-500/30'
                        }`}
                      >
                        <CheckCircle
                          className={`w-5 h-5 ${parseResult.success ? 'text-emerald-400' : 'text-red-400'}`}
                        />
                        <span className={parseResult.success ? 'text-emerald-300' : 'text-red-300'}>
                          {parseResult.success
                            ? `Successfully parsed and uploaded ${parseResult.count} MCQs!`
                            : 'No MCQs could be parsed. Please check your format.'}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
