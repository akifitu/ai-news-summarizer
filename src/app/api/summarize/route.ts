import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Redis } from '@upstash/redis';
import { Index } from '@upstash/vector';

// Check if we have valid API keys
const hasOpenAIKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key';
const hasRedisConfig = !!process.env.UPSTASH_REDIS_REST_URL && 
                       !!process.env.UPSTASH_REDIS_REST_TOKEN &&
                       process.env.UPSTASH_REDIS_REST_URL !== 'your_upstash_redis_url' &&
                       process.env.UPSTASH_REDIS_REST_TOKEN !== 'your_upstash_redis_token';
const hasVectorConfig = !!process.env.UPSTASH_VECTOR_REST_URL && 
                        !!process.env.UPSTASH_VECTOR_REST_TOKEN &&
                        process.env.UPSTASH_VECTOR_REST_URL !== 'your_upstash_vector_url' &&
                        process.env.UPSTASH_VECTOR_REST_TOKEN !== 'your_upstash_vector_token';

// Initialize OpenAI client with fallback for missing API key
const openai = hasOpenAIKey
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) 
  : null;

// Initialize Upstash Redis client with fallback
let redis: Redis | null = null;
if (hasRedisConfig) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    });
    console.log('Upstash Redis bağlantısı kuruldu');
  } catch (error) {
    console.error('Upstash Redis bağlantı hatası:', error);
  }
}

// Initialize Upstash Vector client with fallback
let vectorIndex: Index | null = null;
if (hasVectorConfig) {
  try {
    vectorIndex = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL || '',
      token: process.env.UPSTASH_VECTOR_REST_TOKEN || '',
    });
    console.log('Upstash Vector bağlantısı kuruldu');
  } catch (error) {
    console.error('Upstash Vector bağlantı hatası:', error);
  }
}

// Mock summarization function when API keys are missing
const generateMockSummary = (articles: any[]) => {
  const firstArticle = articles[0];
  return `Bu, "${firstArticle.title}" başlıklı haber için oluşturulmuş örnek bir özettir. Haber, ${firstArticle.subreddit || 'bir subreddit'} üzerinde paylaşılmış ve ${firstArticle.score || 'birçok'} puan almıştır. Haberde ${firstArticle.content || 'detaylı bilgi bulunmamaktadır'}.`;
};

export async function POST(request: Request) {
  try {
    console.log('Özet API isteği alındı');
    const body = await request.json();
    const { relatedArticles } = body;
    
    console.log('İstek gövdesi:', JSON.stringify(body, null, 2));
    
    if (!relatedArticles || !Array.isArray(relatedArticles) || relatedArticles.length === 0) {
      console.error('Geçersiz istek: relatedArticles dizisi eksik veya boş');
      return NextResponse.json({ 
        error: 'Invalid or missing relatedArticles array',
        debug: { receivedBody: body }
      }, { status: 400 });
    }
    
    // Check if we have valid Redis connection for caching
    if (redis) {
      try {
        // Check the cache first
        const cacheKey = `summary:${relatedArticles.map(a => a.id || a.title).join(',')}`;
        const cachedSummary = await redis.get(cacheKey);
        
        if (cachedSummary) {
          console.log('Önbellek kullanılıyor:', cacheKey);
          return NextResponse.json({ summary: cachedSummary });
        }
      } catch (error) {
        console.error('Redis önbellek hatası:', error);
      }
    }
    
    // If OpenAI is not configured, return a mock summary
    if (!openai) {
      console.log('OpenAI API anahtarı eksik, mock özet kullanılıyor');
      const mockSummary = generateMockSummary(relatedArticles);
      
      // Cache the mock summary if Redis is available
      if (redis) {
        try {
          const cacheKey = `summary:${relatedArticles.map(a => a.id || a.title).join(',')}`;
          await redis.set(cacheKey, mockSummary, { ex: 3600 }); // Cache for 1 hour
          console.log('Mock özet önbelleğe alındı');
        } catch (error) {
          console.error('Redis önbelleğe alma hatası:', error);
        }
      }
      
      return NextResponse.json({ 
        summary: mockSummary,
        notice: 'Bu bir örnek özettir. Gerçek AI özetleri için OpenAI API anahtarınızı ekleyin.'
      });
    }
    
    // Prepare content for summarization
    const articlesContent = relatedArticles.map((article: any, index: number) => {
      // Daha zengin içerik oluştur
      let content = `Haber ${index + 1}:\n`;
      content += `Başlık: ${article.title}\n`;
      content += `İçerik: ${article.content || 'İçerik bulunmuyor'}\n`;
      
      // Ek bilgiler ekle (varsa)
      if (article.url) content += `URL: ${article.url}\n`;
      if (article.subreddit) content += `Subreddit: ${article.subreddit}\n`;
      if (article.score) content += `Puan: ${article.score}\n`;
      if (article.num_comments) content += `Yorum Sayısı: ${article.num_comments}\n`;
      
      return content;
    }).join('\n\n');
    
    console.log('OpenAI API ile özet oluşturuluyor...');
    console.log('Gönderilen içerik:', articlesContent);
    
    // Generate summary using OpenAI
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Sen bir haber özetleyicisisin. İlgili haberleri özlü ve gerçeklere dayalı bir genel bakış halinde özetle. Eğer içerik yetersizse, mevcut bilgilerden en iyi özeti çıkarmaya çalış."
          },
          {
            role: "user",
            content: `Lütfen bu ilgili haberleri özlü bir genel bakış halinde özetle. Eğer içerik yetersizse, mevcut bilgilerden en iyi özeti çıkar:\n\n${articlesContent}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });
      
      const summary = completion.choices[0]?.message?.content || "Özet oluşturulamadı.";
      console.log('Özet başarıyla oluşturuldu');
      
      // Cache the summary if Redis is available
      if (redis) {
        try {
          const cacheKey = `summary:${relatedArticles.map(a => a.id || a.title).join(',')}`;
          await redis.set(cacheKey, summary, { ex: 3600 }); // Cache for 1 hour
          console.log('Özet önbelleğe alındı');
        } catch (error) {
          console.error('Redis önbelleğe alma hatası:', error);
        }
      }
      
      return NextResponse.json({ 
        summary,
        debug: {
          model: "gpt-3.5-turbo",
          timestamp: new Date().toISOString()
        }
      });
    } catch (openaiError: any) {
      console.error('OpenAI API hatası:', openaiError);
      
      // OpenAI API hatası durumunda mock özet kullan
      const mockSummary = generateMockSummary(relatedArticles);
      return NextResponse.json({ 
        summary: mockSummary,
        error: 'OpenAI API hatası nedeniyle örnek özet kullanıldı',
        debug: {
          error: openaiError.message || 'Bilinmeyen OpenAI hatası',
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error: any) {
    console.error('Haber özetlenirken hata oluştu:', error);
    return NextResponse.json({ 
      error: 'Haberler özetlenirken bir hata oluştu',
      debug: {
        error: error.message || 'Bilinmeyen hata',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
} 