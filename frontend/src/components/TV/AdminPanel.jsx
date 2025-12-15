import React, { useState, useEffect } from 'react';
import { Trash2, Play, List, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

// Замени на свой IP
const API_BASE_URL = 'http://192.168.2.100:8000/api';

const AdminPanel = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [formData, setFormData] = useState({
    topic: '',
    count: 10,
    description: '',
    time_per_question: 20,
    player_count: 4
  });

  // Загрузка квизов
  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/quizzes/`);
      if (!response.ok) throw new Error('Не удалось загрузить квизы');
      const data = await response.json();
      setQuizzes(data);
    } catch (err) {
      console.error('Load quizzes error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  // Генерация квиза
  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!formData.topic.trim()) {
      alert('Введите тему квиза');
      return;
    }

    try {
      setGenerating(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/quizzes/generate/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка генерации');
      }

      const newQuiz = await response.json();
      setQuizzes([newQuiz, ...quizzes]);
      setShowGenerateForm(false);
      setFormData({
        topic: '',
        count: 10,
        description: '',
        time_per_question: 20,
        player_count: 4
      });

      alert(`✅ Квиз "${newQuiz.title}" создан с ${newQuiz.question_count} вопросами!`);
    } catch (err) {
      console.error('Generate error:', err);
      setError(err.message);
      alert(`❌ Ошибка: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  // Удаление квиза
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Удалить квиз "${title}"?`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/quizzes/${id}/`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Не удалось удалить квиз');

      setQuizzes(quizzes.filter(q => q.id !== id));
      alert('✅ Квиз удалён');
    } catch (err) {
      console.error('Delete error:', err);
      alert(`❌ Ошибка: ${err.message}`);
    }
  };

  // Запуск игры
  const handleStartGame = async (quizId, quizTitle) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz: quizId })
      });

      if (!response.ok) throw new Error('Не удалось создать сессию');

      const session = await response.json();

      // Открываем TV экран
      window.open(`/?mode=tv&code=${session.code}`, '_blank');

      alert(`🎮 Игра запущена!\nКод: ${session.code}\n\nОткрыт TV экран в новом окне.`);
    } catch (err) {
      console.error('Start game error:', err);
      alert(`❌ Ошибка: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-white mb-1 tracking-tight">
                Quiz Admin
              </h1>
              <p className="text-purple-300 text-sm">Управление квизами</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={loadQuizzes}
                disabled={loading}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg
                         transition-all duration-200 flex items-center gap-2 border border-white/20"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                Обновить
              </button>

              <button
                onClick={() => setShowGenerateForm(!showGenerateForm)}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600
                         hover:to-pink-600 text-white rounded-lg font-bold transition-all duration-200
                         flex items-center gap-2 shadow-lg shadow-purple-500/50"
              >
                <Sparkles size={18} />
                {showGenerateForm ? 'Отменить' : 'Создать квиз'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Ошибка */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-400 mt-0.5" size={20} />
            <div>
              <p className="text-red-200 font-medium">Ошибка</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Форма генерации */}
        {showGenerateForm && (
          <div className="mb-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-purple-500/10 animate-slideUp">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="text-purple-400" />
              Генерация квиза через LLM
            </h2>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Тема квиза *
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                    placeholder="Например: Советские фильмы"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                             text-white placeholder-white/40 focus:outline-none focus:ring-2
                             focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Описание
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Квиз о классике советского кино"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                             text-white placeholder-white/40 focus:outline-none focus:ring-2
                             focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Количество вопросов
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="20"
                    value={formData.count}
                    onChange={(e) => setFormData({...formData, count: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                             text-white focus:outline-none focus:ring-2 focus:ring-purple-500
                             focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Время на вопрос (сек)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="60"
                    value={formData.time_per_question}
                    onChange={(e) => setFormData({...formData, time_per_question: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                             text-white focus:outline-none focus:ring-2 focus:ring-purple-500
                             focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Количество игроков (для адаптации)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.player_count}
                    onChange={(e) => setFormData({...formData, player_count: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg
                             text-white focus:outline-none focus:ring-2 focus:ring-purple-500
                             focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={generating}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500
                         hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500
                         disabled:to-gray-600 text-white rounded-lg font-bold text-lg
                         transition-all duration-200 shadow-lg shadow-purple-500/50
                         disabled:shadow-none flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    Генерация... (это может занять до минуты)
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Сгенерировать квиз
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Список квизов */}
        {loading && !showGenerateForm ? (
          <div className="text-center py-12">
            <RefreshCw className="animate-spin text-purple-400 mx-auto mb-4" size={48} />
            <p className="text-white text-lg">Загрузка квизов...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
            <List className="text-purple-400 mx-auto mb-4" size={48} />
            <p className="text-white text-lg mb-2">Квизов пока нет</p>
            <p className="text-purple-300 text-sm">Создайте первый квиз с помощью кнопки выше</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz, idx) => (
              <div
                key={quiz.id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6
                         hover:bg-white/10 transition-all duration-200 shadow-xl
                         hover:shadow-2xl hover:shadow-purple-500/20 group animate-slideIn"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300
                               transition-colors line-clamp-2">
                    {quiz.title}
                  </h3>
                  <p className="text-purple-300 text-sm mb-3 line-clamp-2">
                    {quiz.topic}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <List size={16} />
                      {quiz.question_count} вопросов
                    </span>
                    <span>⏱️ {quiz.time_per_question}s</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleStartGame(quiz.id, quiz.title)}
                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white
                             rounded-lg font-medium transition-all duration-200 flex items-center
                             justify-center gap-2 shadow-lg shadow-green-500/30"
                  >
                    <Play size={16} />
                    Играть
                  </button>

                  <button
                    onClick={() => handleDelete(quiz.id, quiz.title)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300
                             hover:text-red-200 rounded-lg transition-all duration-200
                             flex items-center justify-center border border-red-500/50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-6 text-center text-white/40 text-sm">
        <p>Quiz Generator Admin Panel • Создано с ❤️ и LLM</p>
      </footer>
    </div>
  );
};

export default AdminPanel;