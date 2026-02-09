import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Plus, Trash2, Save, Play, Loader, Settings, X } from 'lucide-react';
import { API_CONFIG } from '../../utils/config';

const QuizGeneratorScreen = ({ onBack, onQuizCreated }) => {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [baseDifficulty, setBaseDifficulty] = useState('medium');
  const [baseTimeLimit, setBaseTimeLimit] = useState(20);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [questionConfigs, setQuestionConfigs] = useState([]);
  const [showCustomSettings, setShowCustomSettings] = useState(false);

  // Создаём конфигурации вопросов при изменении количества
  useEffect(() => {
    const newConfigs = Array.from({ length: numQuestions }, (_, i) => ({
      order: i + 1,
      use_custom_settings: false,
      difficulty: '',
      time_limit: null,
      question_type: '',
      topic_refinement: ''
    }));
    setQuestionConfigs(newConfigs);
  }, [numQuestions]);

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) {
      alert('Введите тему квиза');
      return;
    }

    setIsGenerating(true);
    try {
      // Создаём черновик
      const draftResponse = await fetch(`${API_CONFIG.API_BASE_URL}/quiz-drafts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          num_questions: numQuestions,
          base_difficulty: baseDifficulty,
          base_time_limit: baseTimeLimit,
          base_question_type: 'text'
        })
      });

      if (!draftResponse.ok) {
        const errorData = await draftResponse.json();
        throw new Error(errorData.error || 'Ошибка создания черновика');
      }

      const draft = await draftResponse.json();

      // Создаём конфигурации вопросов (одним пакетом)
      const configsToCreate = questionConfigs
        .filter(config => config.use_custom_settings)
        .map(config => ({
          ...config,
          quiz_draft: draft.id
        }));

      if (configsToCreate.length > 0) {
        const configResponse = await fetch(`${API_CONFIG.API_BASE_URL}/question-configs/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(configsToCreate)
        });

        if (!configResponse.ok) {
          const errorData = await configResponse.json();
          throw new Error(errorData.error || errorData.detail || 'Ошибка сохранения настроек вопросов');
        }
      }

      // Генерируем квиз
      const generateResponse = await fetch(`${API_CONFIG.API_BASE_URL}/quiz-drafts/${draft.id}/generate/`, {
        method: 'POST'
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || 'Ошибка генерации');
      }

      const quiz = await generateResponse.json();
      setGeneratedQuiz(quiz);

      if (onQuizCreated) {
        onQuizCreated(quiz);
      }
    } catch (error) {
      console.error('❌ Ошибка генерации:', error);
      alert(`Ошибка генерации квиза: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateCustomConfig = (order) => {
    setQuestionConfigs(prev =>
      prev.map(config =>
        config.order === order
          ? { ...config, use_custom_settings: !config.use_custom_settings }
          : config
      )
    );
  };

  const handleUpdateConfig = (order, field, value) => {
    setQuestionConfigs(prev =>
      prev.map(config =>
        config.order === order
          ? { ...config, [field]: value }
          : config
      )
    );
  };

  const handleStartGame = async () => {
    if (!generatedQuiz) return;

    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/sessions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quiz_id: generatedQuiz.id })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка создания сессии');
      }

      const data = await response.json();
      // API возвращает { code: "1234" }
      if (onQuizCreated) {
        onQuizCreated(data.code);
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Не удалось создать сессию');
    }
  };

  if (generatedQuiz) {
    return (
      <div className="fixed inset-0 z-50 w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900
                    p-12 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-purple-500 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 h-full flex flex-col">
          <div className="mb-8">
            <button
              onClick={() => setGeneratedQuiz(null)}
              className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20
                       backdrop-blur-xl border border-white/20 rounded-2xl transition-all
                       text-white font-semibold text-xl group"
            >
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
              ← Назад к настройкам
            </button>
          </div>

          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br
                          from-green-500 to-emerald-500 rounded-2xl mb-6 shadow-2xl shadow-green-500/50">
              <Sparkles className="text-white" size={40} />
            </div>
            <h1 className="text-7xl font-black mb-4 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400">
                Квиз готов!
              </span>
            </h1>
            <p className="text-3xl text-white/60">Можно начинать игру</p>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center">
              <h2 className="text-5xl font-bold mb-4">{generatedQuiz.title}</h2>
              <p className="text-2xl text-white/70 mb-8">{generatedQuiz.description}</p>

              <div className="flex items-center justify-center gap-6 text-2xl text-white/80 mb-12">
                <span>📝 {generatedQuiz.question_count} вопросов</span>
                <span>⏱️ {generatedQuiz.time_per_question}с на вопрос</span>
              </div>

              <button
                onClick={handleStartGame}
                className="w-full px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-500
                         hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl
                         text-4xl font-black transition-all duration-200 shadow-2xl
                         shadow-green-500/50 flex items-center justify-center gap-4 group"
              >
                <Play size={48} className="group-hover:translate-x-2 transition-transform" />
                Начать игру
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900
                  p-6 text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-purple-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        <div className="mb-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20
                     backdrop-blur-xl border border-white/20 rounded-2xl transition-all
                     text-white font-semibold text-xl group"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            Назад в меню
          </button>
        </div>

        <div className="text-center mb-4">
          <h1 className="text-5xl font-black mb-2 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
              ✨ Генератор Квизов
            </span>
          </h1>
          <p className="text-xl text-white/60">Настройте параметры и создайте свой квиз</p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto pb-4">
          <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            {/* Основные настройки */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <Settings className="text-purple-400" size={32} />
                Основные настройки
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-xl text-white/80 mb-3">Тема квиза</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Например: История России, Кино 90-х, География"
                    className="w-full px-6 py-4 bg-white/5 border-2 border-white/20 rounded-2xl text-xl focus:outline-none focus:border-purple-500 transition-colors"
                    disabled={isGenerating}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xl text-white/80 mb-3">Количество вопросов</label>
                    <input
                      type="number"
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(Math.max(3, Math.min(20, parseInt(e.target.value) || 10)))}
                      min="3"
                      max="20"
                      className="w-full px-6 py-4 bg-white/5 border-2 border-white/20 rounded-2xl text-xl focus:outline-none focus:border-purple-500 transition-colors"
                      disabled={isGenerating}
                    />
                  </div>

                  <div>
                    <label className="block text-xl text-white/80 mb-3">Базовая сложность</label>
                    <select
                      value={baseDifficulty}
                      onChange={(e) => setBaseDifficulty(e.target.value)}
                      className="w-full px-6 py-4 bg-white/5 border-2 border-white/20 rounded-2xl text-xl focus:outline-none focus:border-purple-500 transition-colors"
                      disabled={isGenerating}
                    >
                      <option value="easy">Лёгкий</option>
                      <option value="medium">Средний</option>
                      <option value="hard">Сложный</option>
                      <option value="very_hard">Очень сложный</option>
                      <option value="fun">Шуточный</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xl text-white/80 mb-3">Время на вопрос (сек)</label>
                    <input
                      type="number"
                      value={baseTimeLimit}
                      onChange={(e) => setBaseTimeLimit(Math.max(5, Math.min(120, parseInt(e.target.value) || 20)))}
                      min="5"
                      max="120"
                      className="w-full px-6 py-4 bg-white/5 border-2 border-white/20 rounded-2xl text-xl focus:outline-none focus:border-purple-500 transition-colors"
                      disabled={isGenerating}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Индивидуальные настройки вопросов */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Settings className="text-purple-400" size={32} />
                  Индивидуальные настройки
                </h2>
                <button
                  onClick={() => setShowCustomSettings(!showCustomSettings)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-lg transition-colors"
                >
                  {showCustomSettings ? 'Скрыть' : 'Показать'}
                </button>
              </div>

              {showCustomSettings && (
                <div className="space-y-4">
                  {questionConfigs.map((config) => (
                    <div
                      key={config.order}
                      className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleCreateCustomConfig(config.order)}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                            config.use_custom_settings
                              ? 'bg-purple-500 text-white'
                              : 'bg-white/10 text-white/50 hover:bg-white/20'
                          }`}
                        >
                          {config.use_custom_settings ? <Settings size={24} /> : <Plus size={24} />}
                        </button>
                        <span className="text-2xl font-bold text-white/80">Вопрос {config.order}</span>
                      </div>

                      {config.use_custom_settings && (
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                          <select
                            value={config.difficulty}
                            onChange={(e) => handleUpdateConfig(config.order, 'difficulty', e.target.value)}
                            className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-lg focus:outline-none focus:border-purple-500"
                          >
                            <option value="">Базовая</option>
                            <option value="easy">Лёгкий</option>
                            <option value="medium">Средний</option>
                            <option value="hard">Сложный</option>
                            <option value="very_hard">Очень сложный</option>
                            <option value="fun">Шуточный</option>
                          </select>

                          <input
                            type="number"
                            value={config.time_limit || ''}
                            onChange={(e) => handleUpdateConfig(config.order, 'time_limit', parseInt(e.target.value) || null)}
                            placeholder="Время (сек)"
                            className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-lg focus:outline-none focus:border-purple-500"
                          />

                          <select
                            value={config.question_type}
                            onChange={(e) => handleUpdateConfig(config.order, 'question_type', e.target.value)}
                            className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-lg focus:outline-none focus:border-purple-500"
                          >
                            <option value="">Базовый</option>
                            <option value="text">Текстовый</option>
                            <option value="image">С изображением</option>
                            <option value="audio">Аудио</option>
                            <option value="video">Видео</option>
                          </select>

                          <input
                            type="text"
                            value={config.topic_refinement}
                            onChange={(e) => handleUpdateConfig(config.order, 'topic_refinement', e.target.value)}
                            placeholder="Уточнение темы"
                            className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-lg focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Кнопка генерации */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={handleGenerateQuiz}
                disabled={isGenerating || !topic.trim()}
                className="px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl
                         font-bold text-2xl hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50
                         disabled:cursor-not-allowed disabled:transform-none flex items-center gap-4"
              >
                {isGenerating ? (
                  <>
                    <Loader className="animate-spin" size={32} />
                    Генерация...
                  </>
                ) : (
                  <>
                    <Sparkles size={32} />
                    ✨ Сгенерировать квиз
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizGeneratorScreen;
