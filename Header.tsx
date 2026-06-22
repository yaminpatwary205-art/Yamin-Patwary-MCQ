import { Shield, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  onAdminClick: () => void;
}

export default function Header({ onAdminClick }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between px-6 py-4 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/30 sticky top-0 z-50"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-slate-100">Yamin</h1>
          <p className="text-xs text-slate-400">Student</p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onAdminClick}
        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-violet-500 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-violet-600 transition-all shadow-lg shadow-blue-500/20"
      >
        <Shield className="w-4 h-4" />
        Admin Panel
      </motion.button>
    </motion.header>
  );
}
