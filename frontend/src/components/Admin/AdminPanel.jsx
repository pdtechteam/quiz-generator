import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Play, Download, Upload, Sparkles, X, Users, ArrowLeft } from 'lucide-react';
import QRCode from 'react-qr-code';
import { API_CONFIG } from '../../utils/config';
import QuizGeneratorScreen from './QuizGeneratorScreen';

const AdminPanel = ({ onBack }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    time_limit: 30,
    questions: []
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    loadQuizzes();
    loadSessions();

    // Автообновление сессий каждые 5 секунд
    const interval = setInterval(loadSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadQuizzes = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      console.log('🔍 Загрузка квизов с:', `${API_CONFIG.API_BASE_URL}/quizzes/`);

      const response = await fetch(`${API_CONFIG.API_BASE_URL}/quizzes/`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Квизы загружены:', data);

      if (data.results && Array.isArray(data.results)) {
        setQuizzes(data.results);
      } else if (Array.isArray(data)) {
        setQuizzes(data);
      } else {
        console.error('❌ Неверный формат данных:', data);
        setQuizzes([]);
        setApiError('Неверный формат данных от сервера');
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки квизов:', error);
      setQuizzes([]);
      setApiError(`Не удалось загрузить квизы: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      console.log('🔍 Загрузка сессий с:', `${API_CONFIG.API_BASE_URL}/sessions/`);
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/sessions/`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Сессии загружены:', data);

      if (data.results && Array.isArray(data.results)) {
        // Фильтруем только активные сессии (state != 'finished')
        const activeSessions = data.results.filter(s => s.state !== 'finished');
        setSessions(activeSessions);
      } else if (Array.isArray(data)) {
        const activeSessions = data.filter(s => s.state !== 'finished');
        setSessions(activeSessions);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки сессий:', error);
      setSessions([]);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!generatePrompt.trim()) {
      alert('Введите описание для генерации квиза');
      return;
    }

    setIsGenerating(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      console.log('🎨 Генерация квиза:', generatePrompt);
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/quizzes/generate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: generatePrompt,
          num_questions: numQuestions
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка генерации');
      }

      const data = await response.json();
      console.log('✅ Квиз сгенерирован:', data);

      setGeneratePrompt('');
      await loadQuizzes();
      setSuccessMessage('Квиз успешно сгенерирован!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error('❌ Ошибка генерации:', error);
      setApiError(`Ошибка генерации квиза: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!confirm('Удалить этот квиз?')) return;

    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/quizzes/${quizId}/`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Ошибка удаления');
      }

      await loadQuizzes();
    } catch (error) {
      console.error('❌ Ошибка удаления:', error);
      alert(`Ошибка удаления квиза: ${error.message}`);
    }
  };

  const handleStartGame = async (quizId) => {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/sessions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quiz_id: quizId
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка создания сессии');
      }

      const data = await response.json();
      // API возвращает { code: "1234" }
      if (data.code) {
        setCurrentSession({ code: data.code });
        setShowQR(true);
        await loadSessions();
      } else {
        setCurrentSession(data);
        setShowQR(true);
        await loadSessions();
      }
    } catch (error) {
      console.error('❌ Ошибка старта игры:', error);
      alert(`Ошибка создания игры: ${error.message}`);
    }
  };

  // ✅ НОВАЯ ФУНКЦИЯ: Завершение сессии
  const handleEndSession = async (sessionCode) => {
    if (!confirm('Завершить эту игру? Все игроки будут отключены.')) return;

    try {
      console.log('🛑 Завершение сессии:', sessionCode);
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/sessions/${sessionCode}/end/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Ошибка завершения сессии');
      }

      console.log('✅ Сессия завершена');
      await loadSessions();
      alert('Игра успешно завершена!');
    } catch (error) {
      console.error('❌ Ошибка завершения:', error);
      alert(`Ошибка завершения игры: ${error.message}`);
    }
  };

  const handleImportQuiz = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const quiz = JSON.parse(text);

      const response = await fetch(`${API_CONFIG.API_BASE_URL}/quizzes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quiz)
      });

      if (!response.ok) {
        throw new Error('Ошибка импорта');
      }

      await loadQuizzes();
      alert('Квиз успешно импортирован!');
    } catch (error) {
      console.error('❌ Ошибка импорта:', error);
      alert(`Ошибка импорта квиза: ${error.message}`);
    }
  };

  const handleExportQuiz = async (quizId) => {
    try {
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/quizzes/${quizId}/`);

      if (!response.ok) {
        throw new Error('Ошибка экспорта');
      }

      const quiz = await response.json();
      const blob = new Blob([JSON.stringify(quiz, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quiz-${quiz.title}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('❌ Ошибка экспорта:', error);
      alert(`Ошибка экспорта квиза: ${error.message}`);
    }
  };

  const getJoinUrl = () => {
    if (!currentSession) return '';
    // currentSession может быть объектом с code или полной сессией
    const code = typeof currentSession === 'string' ? currentSession : currentSession.code;
    return `${API_CONFIG.APP_URL}/?session=${code}`;
  };

  // ✅ НОВАЯ ФУНКЦИЯ: Получение статуса сессии
  const getSessionStatus = (session) => {
    switch (session.state) {
      case 'waiting':
        return { text: 'Ожидание игроков', color: 'bg-yellow-100 text-yellow-800' };
      case 'playing':
        return { text: 'Игра идёт', color: 'bg-green-100 text-green-800' };
      case 'paused':
        return { text: 'Пауза', color: 'bg-orange-100 text-orange-800' };
      case 'finished':
        return { text: 'Завершена', color: 'bg-gray-100 text-gray-800' };
      default:
        return { text: session.state, color: 'bg-blue-100 text-blue-800' };
    }
  };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* ✅ ДОБАВЛЕНО: Кнопка "Назад" */}
          {onBack && (
            <div className="mb-6">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3
                         bg-white/90 hover:bg-white backdrop-blur-xl border border-white/50
                         rounded-xl sm:rounded-2xl transition-all text-gray-700 hover:text-purple-600
                         font-semibold text-sm sm:text-base md:text-lg group shadow-lg"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Назад в меню
              </button>
            </div>
          )}

          {/* Header */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
              🎮 Quiz Generator Admin
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Создавай свои квизы и управляй ими</p>
          </div>

        {/* Error Message */}
        {apiError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-2xl mb-6">
            <strong>⚠️ Ошибка подключения:</strong> {apiError}
            <br />
            <small className="text-sm">
              Убедитесь что backend запущен на {API_CONFIG.API_BASE_URL}
            </small>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-2xl mb-6">
            ✅ {successMessage}
          </div>
        )}

        {/* AI Generator Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">AI Генератор Квизов</h2>
            </div>
            <button
              onClick={() => setShowGenerator(true)}
              className="px-6 py-2 bg-purple-100 text-purple-700 rounded-xl font-semibold hover:bg-purple-200 transition-colors flex items-center gap-2"
            >
              <Sparkles size={20} />
              Расширенный
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={generatePrompt}
                onChange={(e) => setGeneratePrompt(e.target.value)}
                placeholder="Опишите тему квиза (например: 'История России 20 века')"
                className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-2xl text-lg focus:outline-none focus:border-purple-500 transition-colors"
                disabled={isGenerating}
              />
              <div className="flex items-center gap-2">
                <label className="text-gray-700 font-medium whitespace-nowrap">Вопросов:</label>
                <input
                  type="number"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  onBlur={(e) => {
                    let val = parseInt(e.target.value) || 10;
                    setNumQuestions(Math.max(3, Math.min(20, val)));
                  }}
                  min="3"
                  max="20"
                  className="w-20 px-4 py-4 border-2 border-gray-300 rounded-2xl text-lg text-center focus:outline-none focus:border-purple-500 transition-colors"
                  disabled={isGenerating}
                />
              </div>
              <button
                onClick={handleGenerateQuiz}
                disabled={isGenerating}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap"
              >
                {isGenerating ? '⏳ Генерация...' : '✨ Сгенерировать'}
              </button>
            </div>
          </div>

          {isGenerating && (
            <div className="mt-4 text-center text-gray-600">
              <div className="animate-pulse">🤖 AI работает над вашим квизом...</div>
            </div>
          )}
        </div>

        {/* Import/Export Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📁 Импорт / Экспорт</h2>
          <div className="flex gap-4">
            <label className="flex-1 px-6 py-4 bg-blue-500 text-white rounded-2xl font-semibold text-center cursor-pointer hover:bg-blue-600 transition-colors">
              <Upload className="w-5 h-5 inline mr-2" />
              Импорт квиза
              <input
                type="file"
                accept=".json"
                onChange={handleImportQuiz}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Active Sessions - УЛУЧШЕННЫЙ БЛОК */}
        {sessions.length > 0 && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">🎯 Активные Игры</h2>
              <span className="text-sm text-gray-500">
                Обновление каждые 5 секунд
              </span>
            </div>
            <div className="space-y-4">
              {sessions.map(session => {
                const status = getSessionStatus(session);
                return (
                  <div key={session.id} className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-6 border border-green-200">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">{session.quiz_title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>Код: <span className="font-mono font-bold text-lg">{session.code}</span></p>
                          <div className="flex items-center gap-2">
                            <Users size={16} />
                            <span>{session.players_count || 0} игроков</span>
                          </div>
                          {session.created_at && (
                            <p className="text-xs text-gray-500">
                              Создана: {new Date(session.created_at).toLocaleString('ru-RU')}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Кнопки управления */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            setCurrentSession(session);
                            setShowQR(true);
                          }}
                          className="px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                        >
                          📱 QR
                        </button>

                        {/* ✅ НОВАЯ КНОПКА: Завершить сессию */}
                        <button
                          onClick={() => handleEndSession(session.code)}
                          className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                          <X size={18} />
                          Завершить
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quizzes List */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📚 Мои Квизы</h2>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin inline-block w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-600">Загрузка квизов...</p>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">📭 Квизов пока нет</p>
              <p className="text-gray-400">Создайте свой первый квиз с помощью AI генератора!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map(quiz => (
                <div key={quiz.id} className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{quiz.title}</h3>
                  <p className="text-gray-600 mb-4">{quiz.description}</p>
                  <div className="text-sm text-gray-500 mb-4">
                    ❓ {quiz.questions?.length || 0} вопросов • ⏱️ {quiz.time_limit}с
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartGame(quiz.id)}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Запустить
                    </button>

                    <button
                      onClick={() => handleExportQuiz(quiz.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QR Code Modal */}
        {showQR && currentSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                🎮 Присоединиться к игре
              </h3>

              <div className="bg-white p-6 rounded-2xl mb-4">
                <QRCode
                  value={getJoinUrl()}
                  size={256}
                  className="mx-auto"
                />
              </div>

              <div className="text-center mb-6">
                <p className="text-gray-600 mb-2">Код для входа:</p>
                <p className="text-4xl font-bold text-purple-600 font-mono">{currentSession.code}</p>
              </div>

              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 break-all">{getJoinUrl()}</p>
              </div>

              <button
                onClick={() => setShowQR(false)}
                className="w-full px-6 py-3 bg-gray-800 text-white rounded-2xl font-semibold hover:bg-gray-900 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quiz Generator Screen */}
      {showGenerator && (
        <QuizGeneratorScreen
          onBack={() => setShowGenerator(false)}
          onQuizCreated={(code) => {
            setShowGenerator(false);
            // Code created, show QR
            if (code) {
              // Find the session with this code from active sessions
              const session = sessions.find(s => s.code === code);
              if (session) {
                setCurrentSession(session);
                setShowQR(true);
              } else {
                // Session not found, reload sessions
                loadSessions().then(() => {
                  const newSession = sessions.find(s => s.code === code);
                  if (newSession) {
                    setCurrentSession(newSession);
                    setShowQR(true);
                  }
                });
              }
            }
          }}
        />
      )}
    </div>
  );
};

export default AdminPanel;