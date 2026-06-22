import type { Book, Chapter, MCQ } from './types';

const BOOKS_KEY = 'yamin_books';

export function getBooks(): Book[] {
  try {
    const raw = localStorage.getItem(BOOKS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Book[];
  } catch {
    return [];
  }
}

export function saveBooks(books: Book[]): void {
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}

export function addBook(name: string): Book {
  const books = getBooks();
  const book: Book = {
    id: crypto.randomUUID(),
    name,
    chapters: [],
  };
  books.push(book);
  saveBooks(books);
  return book;
}

export function addChapter(bookId: string, chapterName: string): Chapter | null {
  const books = getBooks();
  const book = books.find((b) => b.id === bookId);
  if (!book) return null;
  const chapter: Chapter = {
    id: crypto.randomUUID(),
    name: chapterName,
    bookId,
    mcqs: [],
  };
  book.chapters.push(chapter);
  saveBooks(books);
  return chapter;
}

export function addMCQs(bookId: string, chapterId: string, mcqs: Omit<MCQ, 'id' | 'bookId' | 'chapterId'>[]): MCQ[] | null {
  const books = getBooks();
  const book = books.find((b) => b.id === bookId);
  if (!book) return null;
  const chapter = book.chapters.find((c) => c.id === chapterId);
  if (!chapter) return null;

  const newMCQs: MCQ[] = mcqs.map((mcq) => ({
    ...mcq,
    id: crypto.randomUUID(),
    bookId,
    chapterId,
  }));

  chapter.mcqs.push(...newMCQs);
  saveBooks(books);
  return newMCQs;
}

export function getBookById(bookId: string): Book | undefined {
  return getBooks().find((b) => b.id === bookId);
}

export function getChapterById(bookId: string, chapterId: string): Chapter | undefined {
  const book = getBookById(bookId);
  return book?.chapters.find((c) => c.id === chapterId);
}

export function deleteBook(bookId: string): void {
  const books = getBooks().filter((b) => b.id !== bookId);
  saveBooks(books);
}

export function deleteChapter(bookId: string, chapterId: string): void {
  const books = getBooks();
  const book = books.find((b) => b.id === bookId);
  if (book) {
    book.chapters = book.chapters.filter((c) => c.id !== chapterId);
    saveBooks(books);
  }
}
