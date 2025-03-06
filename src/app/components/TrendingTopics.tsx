'use client';

type TwitterTrend = {
  name: string;
  tweet_volume: number;
  query: string;
};

type TrendingTopicsProps = {
  trends: TwitterTrend[];
  selectedTopic: string;
  onSelectTopic: (topic: string) => void;
};

export default function TrendingTopics({ 
  trends, 
  selectedTopic, 
  onSelectTopic 
}: TrendingTopicsProps) {
  
  // Handle click on a trend
  const handleTrendClick = (query: string) => {
    onSelectTopic(selectedTopic === query ? '' : query);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-blue-600 text-white">
        <h2 className="text-xl font-bold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
          </svg>
          Gündem Konuları
        </h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {trends.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Gündem konuları yükleniyor...
          </div>
        ) : (
          trends.map((trend, index) => (
            <button
              key={index}
              onClick={() => handleTrendClick(trend.query)}
              className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex justify-between items-center ${
                selectedTopic === trend.query ? 'bg-blue-50' : ''
              }`}
            >
              <div>
                <span className="font-medium text-gray-900">{trend.name}</span>
                {trend.tweet_volume && (
                  <p className="text-sm text-gray-500 mt-1">
                    {trend.tweet_volume.toLocaleString()} tweet
                  </p>
                )}
              </div>
              
              {selectedTopic === trend.query && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
} 