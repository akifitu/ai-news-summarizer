import NewsFeed from './components/NewsFeed';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Gündem Haberleri
          </h1>
          <p className="text-gray-600 mt-2">
            Sosyal medya kullanmadan Twitter ve Reddit'teki gündem konularını takip edin.
          </p>
        </div>
      </header>
      
      <NewsFeed />
      
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Gündem Haberleri | Twitter, Reddit ve OpenAI altyapısı ile çalışır
          </p>
        </div>
      </footer>
    </main>
  );
}
