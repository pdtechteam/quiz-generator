function AdminPanel({ onBack }) {
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-8 text-white">
      <div className="text-center max-w-4xl">
        <h1 className="text-7xl font-bold mb-8">Панель Админа</h1>
        
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-12 mb-8">
          <p className="text-3xl mb-6">
            Здесь будет интерфейс для создания квизов
          </p>
          <p className="text-2xl opacity-75">
            Пока используй Django Admin для создания квизов
          </p>
          <p className="text-xl mt-4 opacity-50">
            http://127.0.0.1:8000/admin/
          </p>
        </div>
        
        <button
          onClick={onBack}
          className="px-12 py-6 bg-white text-gray-800 rounded-2xl text-2xl font-bold hover:scale-105 transition-transform"
        >
          ← Назад
        </button>
      </div>
    </div>
  )
}

export default AdminPanel