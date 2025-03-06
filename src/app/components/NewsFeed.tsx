'use client';

import { useState, useEffect } from 'react';
import NewsCard from '@/app/components/NewsCard';

type RedditPost = {
  id: string;
  title: string;
  url: string;
  score: number;
  num_comments: number;
  created_utc: number;
  subreddit: string;
  selftext: string;
  permalink: string;
};

type TwitterNews = {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
  likes: number;
  retweets: number;
  url?: string;
  tweet_url?: string;
};

// Birleştirilmiş haber tipi
type NewsItem = {
  id: string;
  title: string;
  content: string;
  url: string;
  source: 'twitter' | 'reddit';
  author?: string;
  score?: number;
  comments?: number;
  likes?: number;
  retweets?: number;
  created_at: string | number;
  permalink?: string;
  tweet_url?: string;
};

export default function NewsFeed() {
  const [redditPosts, setRedditPosts] = useState<RedditPost[]>([]);
  const [twitterNews, setTwitterNews] = useState<TwitterNews[]>([]);
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'twitter' | 'reddit'>('all');
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Fetch data from our API routes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Reddit haberlerini al
        const redditResponse = await fetch('/api/reddit');
        const redditData = await redditResponse.json();
        
        // Twitter haberlerini al
        const twitterResponse = await fetch('/api/twitter');
        const twitterData = await twitterResponse.json();
        
        console.log('Twitter API yanıtı:', twitterData);
        setDebugInfo(JSON.stringify(twitterData.debug || {}, null, 2));
        
        if (redditData.posts) {
          setRedditPosts(redditData.posts);
        }
        
        if (twitterData.news) {
          console.log('Twitter haberleri alındı:', twitterData.news);
          setTwitterNews(twitterData.news);
        }
        
        setError('');
      } catch (err) {
        console.error('Haber verileri alınırken hata oluştu:', err);
        setError('Haber verileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Haberleri birleştir ve sırala
  useEffect(() => {
    try {
      // Reddit haberlerini dönüştür
      const redditNews: NewsItem[] = redditPosts.map(post => ({
        id: `reddit-${post.id}`,
        title: post.title,
        content: post.selftext || 'İçerik bulunmuyor',
        url: post.url,
        source: 'reddit',
        score: post.score,
        comments: post.num_comments,
        created_at: post.created_utc,
        permalink: post.permalink
      }));
      
      // Twitter haberlerini dönüştür
      const twitterItems: NewsItem[] = twitterNews.map(news => {
        console.log('Twitter haber verisi:', news);
        console.log('Tweet URL:', news.tweet_url);
        
        return {
          id: `twitter-${news.id}`,
          title: news.title || 'Başlık yok',
          content: news.content || 'İçerik yok',
          url: news.url && news.url !== '' ? news.url : '#',
          source: 'twitter',
          author: news.author || 'Anonim',
          likes: news.likes || 0,
          retweets: news.retweets || 0,
          created_at: news.created_at || new Date().toISOString(),
          tweet_url: news.tweet_url
        };
      });
      
      console.log('Twitter haberleri:', twitterItems);
      console.log('Reddit haberleri:', redditNews.length);
      
      // Tüm haberleri birleştir ve tarihe göre sırala (en yeniler önce)
      const combined = [...redditNews, ...twitterItems].sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });
      
      setAllNews(combined);
    } catch (err) {
      console.error('Haberleri birleştirirken hata oluştu:', err);
    }
  }, [redditPosts, twitterNews]);

  // Aktif sekmeye göre haberleri filtrele
  const filteredNews = activeTab === 'all' 
    ? allNews 
    : allNews.filter(item => item.source === activeTab);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Sekme Menüsü */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('all')}
        >
          Tüm Haberler ({allNews.length})
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'twitter' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('twitter')}
        >
          Twitter ({allNews.filter(item => item.source === 'twitter').length})
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'reddit' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('reddit')}
        >
          Reddit ({allNews.filter(item => item.source === 'reddit').length})
        </button>
      </div>
      
      <h2 className="text-2xl font-bold mb-6">
        {activeTab === 'all' ? 'Tüm Haberler' : 
         activeTab === 'twitter' ? 'Twitter Haberleri' : 
         'Reddit Haberleri'}
      </h2>
      
      {debugInfo && (
        <div className="mb-4 p-2 bg-gray-100 text-xs rounded">
          <details>
            <summary className="cursor-pointer">Debug Bilgisi</summary>
            <pre>{debugInfo}</pre>
          </details>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Haber bulunamadı.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map(news => {
            // Reddit haberlerini NewsCard bileşenine dönüştür
            if (news.source === 'reddit') {
              const redditPost: RedditPost = {
                id: news.id.replace('reddit-', ''),
                title: news.title,
                url: news.url,
                score: news.score || 0,
                num_comments: news.comments || 0,
                created_utc: typeof news.created_at === 'number' ? news.created_at : new Date(news.created_at).getTime() / 1000,
                subreddit: 'news',
                selftext: news.content,
                permalink: news.permalink || ''
              };
              
              return <NewsCard key={news.id} post={redditPost} />;
            }
            
            // Twitter haberleri için özel bir kart oluştur
            return (
              <div key={news.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{news.author}</p>
                      <p className="text-xs text-gray-500">{new Date(news.created_at).toLocaleString('tr-TR')}</p>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    {news.url && news.url !== '#' ? (
                      <a href={news.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                        {news.title}
                      </a>
                    ) : (
                      news.title
                    )}
                  </h3>
                  
                  <p className="text-gray-700 mb-4">{news.content}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="font-medium text-gray-700">{news.likes}</span>
                      </span>
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span className="font-medium text-gray-700">{news.retweets}</span>
                      </span>
                      <button 
                        className="ml-4 text-blue-600 hover:text-blue-800 transition-colors text-sm flex items-center"
                        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                          // Convert Twitter news to format expected by NewsCard
                          const redditPost = {
                            id: news.id.replace('twitter-', ''),
                            title: news.title,
                            url: news.url || '#',
                            score: news.likes || 0,
                            num_comments: news.retweets || 0,
                            created_utc: typeof news.created_at === 'number' ? news.created_at : new Date(news.created_at).getTime() / 1000,
                            subreddit: 'twitter',
                            selftext: news.content,
                            permalink: ''
                          };
                          
                          // Call the summarize API with this post
                          fetch('/api/summarize', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              relatedArticles: [{
                                id: redditPost.id,
                                title: redditPost.title,
                                content: redditPost.selftext,
                                url: redditPost.url,
                              }]
                            }),
                          })
                          .then(response => response.json())
                          .then(data => {
                            // Create a temporary element to show the summary
                            const summaryEl = document.createElement('div');
                            summaryEl.className = 'mt-4 p-3 bg-gray-50 rounded text-sm border border-gray-200';
                            summaryEl.innerHTML = `<strong>Özet:</strong> ${data.summary || 'Özet oluşturulamadı.'}`;
                            
                            // Find the content paragraph and append the summary after it
                            const button = event.currentTarget;
                            const card = button.closest('.bg-white') as HTMLElement | null;
                            if (card) {
                              const contentEl = card.querySelector('p.text-gray-700');
                              if (contentEl) {
                                const nextEl = contentEl.nextElementSibling;
                                if (!nextEl || !nextEl.classList.contains('bg-gray-50')) {
                                  contentEl.after(summaryEl);
                                }
                              }
                            }
                          })
                          .catch(error => {
                            console.error('Özet alınırken hata oluştu:', error);
                            alert('Özet oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
                          });
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Özetle
                      </button>
                    </div>
                    
                    {news.source === 'twitter' ? (
                      <div className="flex items-center">
                        <a 
                          href={`https://x.com/i/status/${news.id.replace('twitter-', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                          onClick={(e) => {
                            console.log(`Tweet açılıyor: https://x.com/i/status/${news.id.replace('twitter-', '')}`);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Twitter'da Gör
                        </a>
                      </div>
                    ) : (
                      news.url && news.url !== '#' && (
                        <a 
                          href={news.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Kaynağa Git
                        </a>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 