'use client';

import { useState } from 'react';

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

type NewsCardProps = {
  post: RedditPost;
};

export default function NewsCard({ post }: NewsCardProps) {
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  // Format the timestamp
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('tr-TR');
  };

  // Haber içeriğini almak için yardımcı fonksiyon
  const getArticleContent = async (url: string): Promise<string> => {
    try {
      // Gerçek bir uygulamada, burada haber içeriğini çekmek için bir proxy API kullanabilirsiniz
      // Şimdilik basit bir içerik oluşturalım
      return `Bu haber "${post.title}" başlığıyla ilgilidir. ${post.selftext || 'Detaylı içerik bulunmamaktadır.'}`;
    } catch (error) {
      console.error('Haber içeriği alınamadı:', error);
      return post.selftext || 'İçerik alınamadı';
    }
  };

  // Get summary for a news post
  const getSummary = async () => {
    if (summary) {
      setShowSummary(!showSummary);
      return;
    }
    
    try {
      setSummaryLoading(true);
      setShowSummary(true);
      
      // Haber içeriğini al
      const content = await getArticleContent(post.url);
      
      // API'ye gönderilecek veriyi hazırla
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          relatedArticles: [
            {
              id: post.id,
              title: post.title,
              content: content,
              url: post.url,
              subreddit: post.subreddit,
              score: post.score,
              num_comments: post.num_comments
            },
          ],
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        console.error('Özet API hatası:', data.error);
        setSummary('Özet oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } else {
        setSummary(data.summary || 'Özet bulunamadı');
      }
    } catch (error) {
      console.error('Özet alınırken hata oluştu:', error);
      setSummary('Özet alınamadı');
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-gray-800">
          <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
            {post.title}
          </a>
        </h3>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <span className="mr-3">
            <span className="font-medium text-gray-700">{post.score.toLocaleString()}</span> puan
          </span>
          <span className="mr-3">
            <span className="font-medium text-gray-700">{post.num_comments.toLocaleString()}</span> yorum
          </span>
          <span>
            Paylaşım: {formatDate(post.created_utc)}
          </span>
        </div>
        
        {post.selftext && (
          <p className="text-gray-700 mb-4 line-clamp-3">{post.selftext}</p>
        )}
        
        <div className="flex justify-between items-center">
          <button
            onClick={getSummary}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors"
          >
            {summaryLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Özet alınıyor...
              </>
            ) : showSummary ? 'Özeti gizle' : 'Özeti göster'}
          </button>
          
          <a 
            href={`https://reddit.com${post.permalink}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            Reddit'te görüntüle
          </a>
        </div>
        
        {showSummary && !summaryLoading && summary && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <h4 className="font-medium text-gray-800 mb-2">Yapay Zeka Özeti</h4>
            <p className="text-gray-700">{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
} 