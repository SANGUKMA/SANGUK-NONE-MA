import React, { useEffect, useState } from 'react';
import { BookHeart, Cloud, CloudOff } from 'lucide-react';

export const Header: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if running in Google Apps Script environment
    if (typeof window.google !== 'undefined' && window.google.script) {
      setIsConnected(true);
    }
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between relative">
        <div className="flex items-center gap-2 text-blue-700">
          <BookHeart className="w-6 h-6" />
          <h1 className="text-lg font-bold tracking-tight">목회 심방 기록 비서</h1>
        </div>
        
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
          isConnected 
          ? 'bg-green-50 text-green-600 border-green-200' 
          : 'bg-gray-50 text-gray-400 border-gray-200'
        }`}>
          {isConnected ? (
            <>
              <Cloud className="w-3 h-3" />
              구글 시트 연결됨
            </>
          ) : (
            <>
              <CloudOff className="w-3 h-3" />
              로컬 모드
            </>
          )}
        </div>
      </div>
    </header>
  );
};