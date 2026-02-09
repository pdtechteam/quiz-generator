import React from 'react';
import * as Icons from 'lucide-react';

const RoundIntro = ({ title, description, iconName }) => {
  // Динамический выбор иконки из Lucide
  const Icon = Icons[iconName] || Icons.HelpCircle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-6 overflow-hidden">
      {/* Фоновые элементы */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-500 rounded-full blur-[100px] opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-500 rounded-full blur-[100px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-3xl w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center shadow-2xl transform animate-in fade-in zoom-in duration-500">
        <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-8 shadow-lg shadow-orange-500/30 animate-bounce">
          <Icon size={64} className="text-white" />
        </div>
        
        <h2 className="text-2xl font-medium text-white/60 mb-4 uppercase tracking-widest">Новый раунд</h2>
        <h1 className="text-6xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 drop-shadow-sm">
          {title}
        </h1>
        
        <p className="text-2xl text-white/90 leading-relaxed font-light">
          {description}
        </p>
      </div>
    </div>
  );
};

export default RoundIntro;