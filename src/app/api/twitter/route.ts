import { NextResponse } from 'next/server';
import axios from 'axios';

// Mock Twitter haberler verisi
const MOCK_TWITTER_NEWS = [
  {
    id: "1774000825774944315",
    title: "Ekonomi Bakanlığı: Enflasyonla mücadele programı kapsamında yeni tedbirler açıklandı",
    content: "Ekonomi Bakanlığı tarafından yapılan açıklamada, enflasyonla mücadele programı kapsamında yeni tedbirler açıklandı. Temel gıda ürünlerinde KDV indirimi ve enerji fiyatlarında düzenleme yapılacak.",
    author: "🔴 Anadolu Ajansı (@anadoluajansi)",
    created_at: new Date().toISOString(),
    likes: 1250,
    retweets: 450,
    url: "https://www.aa.com.tr/tr/ekonomi/enflasyon/",
    tweet_url: "https://x.com/anadoluajansi/status/1774000825774944315"
  },
  {
    id: "1773638466428977363",
    title: "A Milli Futbol Takımı, hazırlık maçlarına hazırlanıyor",
    content: "A Milli Futbol Takımı, önümüzdeki hafta oynanacak hazırlık maçları öncesinde Riva'daki kamp çalışmalarına başladı. Teknik direktör, kadro yapısı hakkında açıklamalarda bulundu.",
    author: "📺 TRT Spor (@TRT)",
    created_at: new Date().toISOString(),
    likes: 2300,
    retweets: 890,
    url: "https://www.trtspor.com.tr/haber/futbol/milli-takim/",
    tweet_url: "https://x.com/trtspor/status/1773638466428977363"
  },
  {
    id: "1774000000000000001",
    title: "TOGG'un yeni modeli için ön sipariş tarihi belli oldu",
    content: "Türkiye'nin Otomobili TOGG'un yeni SUV modeli için ön sipariş tarihi açıklandı. Üretim bandından ilk araçların ne zaman çıkacağı da belli oldu.",
    author: "📡 NTV Haber (@NTVHaber)",
    created_at: new Date().toISOString(),
    likes: 3100,
    retweets: 1200,
    url: "https://www.ntv.com.tr/otomobil/togg/",
    tweet_url: "https://x.com/ntv/status/1774000000000000001"
  },
  {
    id: "1773982548472684764",
    title: "Sağlık Bakanlığı'ndan aşı kampanyası başlatıldı",
    content: "Sağlık Bakanlığı mevsimsel hastalıklara karşı yeni aşı kampanyasını duyurdu. 65 yaş üstü ve kronik hastalığı bulunanlar için ücretsiz aşılama başladı.",
    author: "🏥 Sağlık Bakanlığı (@saglikbakanligi)",
    created_at: new Date().toISOString(),
    likes: 1800,
    retweets: 720,
    url: "https://www.saglik.gov.tr/asi-kampanyasi",
    tweet_url: "https://x.com/saglikbakanligi/status/1773982548472684764"
  },
  {
    id: "1773689580448362631",
    title: "İstanbul'da eğitim kurumlarında yeni teknoloji atılımı",
    content: "İstanbul Büyükşehir Belediyesi, okullara yönelik yeni teknoloji atılımını duyurdu. Şehirdeki tüm liselere yapay zeka laboratuvarları kurulacak.",
    author: "🏙️ İBB Haberler (@ibbhaberler)",
    created_at: new Date().toISOString(),
    likes: 2700,
    retweets: 980,
    url: "https://www.ibb.istanbul/news/",
    tweet_url: "https://x.com/ibbajansi/status/1773689580448362631"
  },
  {
    id: "1773730022768419298",
    title: "TÜBA Bilim Ödülleri sahiplerini buldu",
    content: "Türkiye Bilimler Akademisi (TÜBA) 2023 yılı Bilim Ödülleri sahiplerini buldu. Ödül töreni Cumhurbaşkanlığı Külliyesi'nde gerçekleştirildi.",
    author: "📰 Habertürk (@HaberturkTV)",
    created_at: new Date().toISOString(),
    likes: 1450,
    retweets: 630,
    url: "https://www.haberturk.com/bilim-teknoloji",
    tweet_url: "https://x.com/HaberturkTV/status/1773730022768419298"
  },
  {
    id: "1773788887057281417",
    title: "TÜBİTAK, uzay teknolojileri için 500 milyon TL bütçe ayırdı",
    content: "TÜBİTAK, Milli Uzay Programı kapsamındaki projelere 500 milyon TL bütçe ayırdı. Türkiye'nin uzay teknolojileri alanında yeni girişimler desteklenecek.",
    author: "🌐 CNN Türk (@cnnturk)",
    created_at: new Date().toISOString(),
    likes: 1850,
    retweets: 920,
    url: "https://www.cnnturk.com/teknoloji/",
    tweet_url: "https://x.com/cnnturk/status/1773788887057281417"
  },
  {
    id: "1773966171563528423",
    title: "TBMM'de bütçe görüşmeleri devam ediyor",
    content: "Türkiye Büyük Millet Meclisi'nde 2024 yılı bütçe görüşmeleri devam ediyor. Bakanlıkların bütçe sunumları sırasıyla gerçekleştiriliyor.",
    author: "📝 Demirören Haber Ajansı (@DHA_TR)",
    created_at: new Date().toISOString(),
    likes: 1320,
    retweets: 560,
    url: "https://www.dha.com.tr/politika/",
    tweet_url: "https://x.com/dha_tr/status/1773966171563528423"
  },
  {
    id: "1774011358945411520",
    title: "Dolar/TL kurunda son durum: Merkez Bankası'nın kararı bekleniyor",
    content: "Döviz piyasalarında gözler Merkez Bankası'nın faiz kararına çevrildi. Ekonomistler, bankanın bu haftaki toplantısında nasıl bir karar alacağını değerlendirdi.",
    author: "📱 Hürriyet (@Hurriyet)",
    created_at: new Date().toISOString(),
    likes: 1680,
    retweets: 750,
    url: "https://www.hurriyet.com.tr/ekonomi/",
    tweet_url: "https://x.com/Hurriyet/status/1774011358945411520"
  },
  {
    id: "1773986513492320715",
    title: "Türkiye genelinde 112 noktada orman yangınlarıyla mücadele sürüyor",
    content: "Tarım ve Orman Bakanlığı, ülke genelinde devam eden orman yangınlarıyla ilgili son durumu açıkladı. 112 farklı noktada yangın söndürme çalışmaları devam ediyor.",
    author: "☀️ Sabah (@Sabah)",
    created_at: new Date().toISOString(),
    likes: 2100,
    retweets: 1320,
    url: "https://www.sabah.com.tr/gundem/",
    tweet_url: "https://x.com/Sabah/status/1773986513492320715"
  }
];

// Twitter kullanıcı tipi
interface TwitterUser {
  id: string;
  username?: string;
  name?: string;
}

// API istek sayacı ve son istek zamanı
let apiRequestCount = 0;
const API_REQUEST_LIMIT = 5; // Günlük istek limiti (geliştirme için düşük tutuldu)
let lastRequestTime = 0;
const REQUEST_RESET_TIME = 24 * 60 * 60 * 1000; // 24 saat (ms cinsinden)

/**
 * Twitter API'den gelen ham tweet verilerini haber formatına dönüştürür
 */
async function formatTwitterNews(tweets: any[], users: any[]) {
  try {
    // Kullanıcı bilgilerini bir map'e dönüştürelim
    const userMap: Record<string, any> = {};
    if (users && users.length > 0) {
      users.forEach((user) => {
        if (user.id) {
          userMap[user.id] = user;
        }
      });
    }
    
    // Resmi haber kuruluşları ve logoları (emoji olarak)
    const newsOrganizations: Record<string, { name: string, icon: string }> = {
      'anadoluajansi': { name: 'Anadolu Ajansı', icon: '🔴' },
      'aa_turkce': { name: 'Anadolu Ajansı', icon: '🔴' },
      'trthaber': { name: 'TRT Haber', icon: '📺' },
      'TRT': { name: 'TRT', icon: '📺' },
      'NTVHaber': { name: 'NTV Haber', icon: '📡' },
      'ntv': { name: 'NTV', icon: '📡' },
      'cnnturk': { name: 'CNN Türk', icon: '🌐' },
      'HaberturkTV': { name: 'Habertürk', icon: '📰' },
      'haberturk': { name: 'Habertürk', icon: '📰' },
      'DHA_TR': { name: 'DHA', icon: '📝' },
      'Hurriyet': { name: 'Hürriyet', icon: '📱' },
      'Milliyet': { name: 'Milliyet', icon: '📋' },
      'Sabah': { name: 'Sabah', icon: '☀️' },
      'cumhuriyetgzt': { name: 'Cumhuriyet', icon: '🗞️' },
      'bbcturkce': { name: 'BBC Türkçe', icon: '🌍' },
      'sondakika_tv': { name: 'Son Dakika', icon: '⏰' },
      'ibbhaberler': { name: 'İBB Haberler', icon: '🏙️' },
      'yenisafaktr': { name: 'Yeni Şafak', icon: '🌞' },
      'stargazete': { name: 'Star Gazete', icon: '⭐' },
      'Haber7': { name: 'Haber 7', icon: '7️⃣' },
      'FOXhaber': { name: 'FOX Haber', icon: '🦊' }
    };
    
    // Tweet verilerini işleyelim
    const news = tweets.map((tweet) => {
      // URL'leri tweet içeriğinden çıkaralım
      let content = tweet.text;
      let title = '';
      let url = '';
      
      // Tweet'teki URL'leri bul
      if (tweet.entities && tweet.entities.urls && tweet.entities.urls.length > 0) {
        // URL'leri içerikten çıkar ve ilk URL'i al
        for (const urlEntity of tweet.entities.urls) {
          // İçerikten URL'i çıkar
          content = content.replace(urlEntity.url, '');
          
          // İlk URL'i kaydet (Twitter URL'lerini hariç tut)
          if (!url && !urlEntity.expanded_url.includes('twitter.com') && !urlEntity.expanded_url.includes('x.com')) {
            url = urlEntity.expanded_url || urlEntity.url;
            
            // Eğer URL başlığı varsa, onu kullan
            if (urlEntity.title) {
              title = urlEntity.title;
            } else if (urlEntity.description) {
              title = urlEntity.description;
            }
          }
        }
      }
      
      // Eğer başlık hala boşsa, içerikten bir başlık oluştur
      if (!title) {
        // İçeriği temizle (hashtag'leri ve mention'ları kaldır)
        const cleanContent = content
          .replace(/@\w+/g, '') // mention'ları kaldır
          .replace(/#\w+/g, '') // hashtag'leri kaldır
          .trim();
          
        // İlk 60 karakteri başlık olarak kullan
        title = cleanContent.length > 60 
          ? cleanContent.substring(0, 60) + '...' 
          : cleanContent;
      }
      
      // Kullanıcı bilgilerini al
      let author = tweet.author_id;
      let authorUsername = '';
      
      if (tweet.author_id && userMap[tweet.author_id]) {
        const user = userMap[tweet.author_id];
        authorUsername = user.username || '';
        
        // Eğer bilinen bir haber kaynağı ise, formatlı isim kullan
        if (authorUsername && newsOrganizations[authorUsername]) {
          const org = newsOrganizations[authorUsername];
          author = `${org.icon} ${org.name} (@${authorUsername})`;
        } else {
          author = user.name ? `${user.name} (@${authorUsername})` : `@${authorUsername}`;
        }
      }
      
      // URL kontrolü - eğer URL yoksa veya geçersizse, tweet URL'si oluştur
      if (!url || url.trim() === '') {
        url = `https://twitter.com/${authorUsername}/status/${tweet.id}`;
      }
      
      // Tweet URL'sini her zaman oluştur
      const tweetUrl = `https://twitter.com/${authorUsername}/status/${tweet.id}`;
      
      return {
        id: tweet.id,
        title: title || 'Haber Başlığı',
        content: content.trim() || 'İçerik bulunamadı',
        author: author,
        created_at: tweet.created_at,
        likes: tweet.public_metrics?.like_count || 0,
        retweets: tweet.public_metrics?.retweet_count || 0,
        url: url,
        tweet_url: tweetUrl
      };
    });
    
    // Boş veya geçersiz URL'leri filtrele
    return news.filter((item) => {
      if (!item.url || item.url.trim() === '') return false;
      if (!item.title || item.title.trim() === '') return false;
      
      // Uygun başlık ve içerik uzunluğu kontrolü
      return item.title.length > 10 && item.content.length > 20;
    });
  } catch (error) {
    console.error('Tweet formatlama hatası:', error);
    return [];
  }
}

/**
 * Twitter'dan haber getirme fonksiyonu
 * Not: X API (Twitter API) v2 artık farklı erişim seviyelerine sahip:
 * - Ücretsiz: Ayda 100 okuma isteği
 * - Basic ($200/ay): Ayda 10,000 okuma isteği
 * - Pro ($5,000/ay): Ayda 1,000,000 okuma isteği
 * - Enterprise: Özel ihtiyaçlara göre ölçeklenebilir
 */
async function fetchTwitterNews() {
  // Mock verileri güncelleyelim
  const updatedMockNews = MOCK_TWITTER_NEWS.map(news => ({
    ...news,
    created_at: new Date().toISOString() // Her seferinde güncel tarih
  }));
  
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  
  if (!bearerToken) {
    console.log('Twitter API token not found, using mock data');
    console.log('Mock veri örneği:', updatedMockNews[0]);
    return { news: updatedMockNews };
  }
  
  // API istek limitini kontrol et
  const currentTime = Date.now();
  if (currentTime - lastRequestTime > REQUEST_RESET_TIME) {
    // 24 saat geçtiyse sayacı sıfırla
    apiRequestCount = 0;
    lastRequestTime = currentTime;
  }
  
  // Eğer limit aşıldıysa mock veri kullan
  if (apiRequestCount >= API_REQUEST_LIMIT) {
    console.log(`Twitter API istek limiti aşıldı (${API_REQUEST_LIMIT}/${API_REQUEST_LIMIT}), mock veriler kullanılıyor`);
    return { news: updatedMockNews, error: 'API istek limiti aşıldı' };
  }
  
  try {
    console.log(`Twitter API bağlantısı deneniyor... (${apiRequestCount + 1}/${API_REQUEST_LIMIT})`);
    apiRequestCount++; // İstek sayacını artır
    lastRequestTime = currentTime;
    
    // Güvenilir haber kaynakları için kullanıcı listesi
    const trustedNewsSources = [
      'anadoluajansi', 'aa_turkce', 'trthaber', 'TRT', 'NTVHaber', 'ntv', 
      'cnnturk', 'HaberturkTV', 'haberturk', 'DHA_TR', 'Hurriyet', 
      'Milliyet', 'Sabah', 'cumhuriyetgzt', 'bbcturkce', 'sondakika_tv',
      'ibbhaberler', 'yenisafaktr', 'stargazete', 'Haber7', 'FOXhaber'
    ];
    
    // Güvenilir haber kaynaklarından tweets aramak için sorgu oluştur
    const fromQuery = trustedNewsSources.map(source => `from:${source}`).join(' OR ');
    
    // X API v2 ile son tweetleri alalım - güvenilir kaynaklardan
    const response = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
      params: { 
        'query': `(${fromQuery}) (haber OR gündem OR son dakika) -is:retweet has:links`, // Türkçe, haber içerikli, link içeren ve retweet olmayan tweetler
        'max_results': 25,
        'tweet.fields': 'created_at,public_metrics,entities',
        'expansions': 'author_id',
        'user.fields': 'username,name,verified'
      },
      headers: {
        'Authorization': `Bearer ${bearerToken}`
      }
    });
    
    // Yanıt kontrol
    if (response.status !== 200 || !response.data || !response.data.data) {
      console.warn('Twitter API geçerli yanıt dönmedi, mock veriler kullanılıyor', response.status);
      return { 
        news: updatedMockNews, 
        debug: { 
          error: 'API yanıtı geçersiz', 
          status: response.status,
          message: 'Geçerli veri bulunamadı, mock veriler kullanıldı',
          requestCount: apiRequestCount,
          remainingRequests: API_REQUEST_LIMIT - apiRequestCount
        }
      };
    }

    // Eğer burada olursak, başarılı bir yanıt aldık demektir
    // API'den alınan verileri işle ve formatla
    const tweets = response.data.data;
    const users = response.data.includes?.users || [];
    
    if (!tweets || tweets.length === 0) {
      console.warn('Twitter API boş sonuç döndü, mock veriler kullanılıyor');
      return { 
        news: updatedMockNews, 
        debug: { 
          warning: 'API boş sonuç döndü',
          requestCount: apiRequestCount,
          remainingRequests: API_REQUEST_LIMIT - apiRequestCount
        }
      };
    }
    
    // Tweetleri formatla
    const formattedNews = await formatTwitterNews(tweets, users);
    
    // Eğer format sonrası veri yoksa
    if (!formattedNews || formattedNews.length === 0) {
      return { 
        news: updatedMockNews,
        debug: { 
          warning: 'API yanıtı formatlanamadı',
          requestCount: apiRequestCount,
          remainingRequests: API_REQUEST_LIMIT - apiRequestCount
        }
      };
    }
    
    return { 
      news: formattedNews,
      debug: { 
        success: 'API başarıyla çağrıldı',
        tweetCount: tweets.length,
        formattedCount: formattedNews.length,
        requestCount: apiRequestCount,
        remainingRequests: API_REQUEST_LIMIT - apiRequestCount
      }
    };
    
  } catch (error: any) {
    console.error('Twitter API hatası:', error.message || 'Bilinmeyen hata');
    return { 
      news: updatedMockNews, 
      error: error.message || 'Twitter API hatası',
      debug: { 
        errorDetails: error.response?.data || error.message || 'Bilinmeyen hata',
        requestCount: apiRequestCount,
        remainingRequests: API_REQUEST_LIMIT - apiRequestCount
      }
    };
  }
}

export async function GET() {
  try {
    console.log('Twitter haberleri alınıyor...');
    const twitterData = await fetchTwitterNews();
    
    // Debug bilgisi ekle
    return NextResponse.json({
      ...twitterData,
      debug: {
        timestamp: new Date().toISOString(),
        api_version: 'v2',
        mock_used: !!twitterData.error,
        requestCount: apiRequestCount,
        requestLimit: API_REQUEST_LIMIT
      }
    });
  } catch (error) {
    console.error('Error in Twitter API route:', error);
    return NextResponse.json({ 
      news: MOCK_TWITTER_NEWS, 
      error: 'Failed to fetch Twitter news',
      debug: {
        timestamp: new Date().toISOString(),
        mock_used: true
      }
    });
  }
} 