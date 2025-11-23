import Search from './pages/Search';

function App() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-40 flex items-center justify-between relative">
          {/* Left: Empty or Mobile Menu Trigger (Future) */}
          <div className="w-24"></div>

          {/* Center: Logo */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <img src="/logo.jpg" alt="KolaycaBul Logo" className="h-36 w-auto object-contain hover:scale-105 transition-transform duration-300 drop-shadow-md" />
          </div>

          {/* Right: Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-gray-500 hover:text-brand-primary font-medium transition-colors">Ana Sayfa</a>
            <a href="#" className="text-gray-500 hover:text-brand-primary font-medium transition-colors">Keşfet</a>
            <a href="#" className="text-gray-500 hover:text-brand-primary font-medium transition-colors">Hakkımızda</a>
            <button className="bg-brand-primary text-white px-5 py-2 rounded-full font-bold hover:bg-brand-primary/90 transition-transform hover:scale-105 shadow-lg shadow-brand-primary/30">
              Giriş Yap
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Banner */}
        <aside className="hidden lg:block lg:col-span-2 space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 text-center group hover:-translate-y-1 transition-transform duration-300">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="absolute inset-0 bg-brand-secondary/20 rounded-full animate-pulse-soft"></div>
                <img src="/mascot_happy.png" alt="Mascot" className="relative z-10 w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h3 className="font-display font-bold text-xl text-brand-dark mb-2">Merhaba! 👋</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Ben <strong>BulBot</strong>! Bugün nereyi keşfetmek istersin?
              </p>
            </div>

            <div className="bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl p-6 shadow-lg text-white text-center">
              <p className="font-bold text-lg mb-2">Reklam Alanı</p>
              <p className="text-white/80 text-sm">Buraya harika bir seyahat fırsatı gelebilir!</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-8">
          <Search />
        </main>

        {/* Right Banner */}
        <aside className="hidden lg:block lg:col-span-2 space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 text-center overflow-hidden relative group">
              <div className="absolute inset-0 bg-brand-primary/5 group-hover:bg-brand-primary/10 transition-colors"></div>
              <span className="text-4xl mb-4 block">🌍</span>
              <h3 className="font-display font-bold text-lg text-brand-dark mb-2">Dünyayı Gez</h3>
              <p className="text-xs text-gray-500">En popüler lokasyonları senin için derledik.</p>
              <button className="mt-4 w-full py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-brand-primary hover:bg-brand-primary hover:text-white transition-all">
                İncele
              </button>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 text-center">
              <span className="text-4xl mb-4 block">📸</span>
              <h3 className="font-display font-bold text-lg text-brand-dark mb-2">Fotoğraf Yükle</h3>
              <p className="text-xs text-gray-500">Gördüğün yerin neresi olduğunu hemen öğren!</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
