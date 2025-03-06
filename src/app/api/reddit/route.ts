import { NextResponse } from 'next/server';
import axios from 'axios';

// Mock data for development
const MOCK_REDDIT_NEWS = [
  {
    id: 'post1',
    title: '150 ülke yeni iklim anlaşmasını imzaladı',
    url: 'https://example.com/iklim-anlasmasi',
    score: 15400,
    num_comments: 3200,
    created_utc: new Date().getTime() / 1000 - 3600 * 5,
    subreddit: 'news',
    selftext: 'Yeni iklim anlaşması, küresel ısınmayı 1.5 derece ile sınırlamak için önemli adımlar içeriyor.',
    permalink: '/r/news/comments/post1'
  },
  {
    id: 'post2',
    title: 'Yenilenebilir enerji alanında teknolojik atılım duyuruldu',
    url: 'https://example.com/teknoloji-atilimi',
    score: 12800,
    num_comments: 1800,
    created_utc: new Date().getTime() / 1000 - 3600 * 7,
    subreddit: 'news',
    selftext: 'Yeni geliştirilen güneş panelleri, mevcut sistemlere göre %40 daha fazla enerji üretiyor.',
    permalink: '/r/news/comments/post2'
  },
  {
    id: 'post3',
    title: 'Küresel ekonomi yeni rapora göre toparlanma belirtileri gösteriyor',
    url: 'https://example.com/ekonomi-toparlanma',
    score: 9600,
    num_comments: 1500,
    created_utc: new Date().getTime() / 1000 - 3600 * 10,
    subreddit: 'news',
    selftext: 'IMF raporuna göre, küresel ekonomi beklenenden daha hızlı toparlanma gösteriyor.',
    permalink: '/r/news/comments/post3'
  },
  {
    id: 'post4',
    title: 'Önemli sağlık reformu tasarısı açıklandı',
    url: 'https://example.com/saglik-reformu',
    score: 8200,
    num_comments: 2100,
    created_utc: new Date().getTime() / 1000 - 3600 * 12,
    subreddit: 'news',
    selftext: 'Sağlık reformu paketi, temel sağlık hizmetlerinin daha geniş kitlelere ulaşmasını hedefliyor.',
    permalink: '/r/news/comments/post4'
  },
  {
    id: 'post5',
    title: 'Bilim insanları nadir hastalık için potansiyel tedavi keşfetti',
    url: 'https://example.com/bilimsel-kesif',
    score: 7300,
    num_comments: 950,
    created_utc: new Date().getTime() / 1000 - 3600 * 15,
    subreddit: 'news',
    selftext: 'Yapılan araştırmada, nadir görülen genetik bir hastalığın tedavisinde umut verici sonuçlar elde edildi.',
    permalink: '/r/news/comments/post5'
  }
];

/**
 * Fetch news from Reddit API
 */
async function fetchRedditNews() {
  console.log('Reddit API isteği yapılıyor...');
  
  try {
    // Reddit's API doesn't require auth for basic requests, but has rate limits
    const response = await axios.get('https://www.reddit.com/r/news/hot.json', {
      params: { limit: 25 },
      headers: {
        'User-Agent': 'NewsAggregator/1.0.0 (by /u/YourUsername)'
      },
      timeout: 5000 // 5 saniye timeout ekleyelim
    });
    
    console.log('Reddit API yanıt verdi');
    
    if (response.data && response.data.data && response.data.data.children) {
      // Transform the response to match our format
      const posts = response.data.data.children
        .map((child: any) => ({
          id: child.data.id,
          title: child.data.title,
          url: child.data.url,
          score: child.data.score,
          num_comments: child.data.num_comments,
          created_utc: child.data.created_utc,
          subreddit: child.data.subreddit,
          selftext: child.data.selftext || '',
          permalink: child.data.permalink
        }))
        .filter((post: any) => post.title && post.url); // Filter out invalid posts
      
      console.log(`${posts.length} haber alındı`);
      return { posts };
    }
    
    // If API returns unexpected format, use mock data
    console.log('Reddit API beklenmeyen format döndürdü, mock veri kullanılıyor');
    return { posts: MOCK_REDDIT_NEWS, notice: 'API format sorunu nedeniyle örnek veriler kullanılıyor' };
  } catch (error) {
    console.error('Reddit API hatası:', error);
    return { posts: MOCK_REDDIT_NEWS, error: 'Reddit API hatası, örnek veriler kullanılıyor' };
  }
}

export async function GET() {
  try {
    // Always attempt to use the Reddit API since it doesn't require auth
    console.log('Reddit haberleri alınıyor...');
    const redditData = await fetchRedditNews();
    
    // Send telemetry info with response for debugging
    return NextResponse.json({
      ...redditData, 
      debug: {
        timestamp: new Date().toISOString(),
        api_version: 'v1',
        mock_used: !!redditData.notice || !!redditData.error
      }
    });
  } catch (error) {
    console.error('Reddit API route hatası:', error);
    return NextResponse.json({ 
      posts: MOCK_REDDIT_NEWS, 
      error: 'Reddit haberleri alınamadı',
      debug: {
        timestamp: new Date().toISOString(),
        api_version: 'v1',
        mock_used: true,
        error_type: error instanceof Error ? error.name : 'Unknown'
      }
    });
  }
} 