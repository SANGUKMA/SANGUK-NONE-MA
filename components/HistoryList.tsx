import React, { useEffect, useState } from 'react';
import { 
  Calendar, User, Clock, Loader2, FileText, 
  RefreshCw, BookOpen, Heart, CheckCircle2, Star 
} from 'lucide-react';
import { VisitLogData } from '../types';
import { getVisitLogs } from '../services/mockSheetService';

export const HistoryList: React.FC = () => {
  const [logs, setLogs] = useState<VisitLogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getVisitLogs();
      setLogs(data);
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white/50 rounded-2xl border border-gray-100">
      <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
      <p className="font-medium">기록을 불러오는 중...</p>
    </div>
  );

  if (logs.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300">
      <FileText className="w-12 h-12 mb-3 opacity-30" />
      <p className="text-lg font-medium text-gray-500">저장된 기록이 없습니다.</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center px-1 mb-2">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          심방 역사
          <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">{logs.length}</span>
        </h2>
        <button onClick={fetchLogs} className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {logs.map((log, index) => (
          <div key={index} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all border-l-4 border-l-blue-500">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600 font-bold">
                  {log.visiteeName ? log.visiteeName[0] : '?'}
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">{log.visiteeName}</div>
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold uppercase">
                    {log.visitType || '일반심방'}
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-gray-400">
                <div className="flex items-center justify-end gap-1.5 font-medium text-gray-600">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{log.visitDate}</span>
                </div>
                <div className="mt-0.5">{log.visitTime}</div>
              </div>
            </div>

            <div className="space-y-4">
              {(log.bibleVerse || log.topic) && (
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                  <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs mb-1">
                    <BookOpen className="w-3.5 h-3.5" /> 말씀: {log.bibleVerse}
                  </div>
                  <div className="text-gray-700 text-sm italic">{log.topic ? `"${log.topic}"` : ''}</div>
                </div>
              )}

              {log.content && (
                <div>
                  <div className="flex items-center gap-1.5 text-gray-500 font-bold text-xs mb-1.5 uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" /> 주요 대화
                  </div>
                  <div className="text-gray-700 text-[15px] leading-relaxed whitespace-pre-wrap pl-1">
                    {log.content}
                  </div>
                </div>
              )}

              {log.prayerRequests && log.prayerRequests.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-red-500 font-bold text-xs mb-1.5 uppercase tracking-wider">
                    <Heart className="w-3.5 h-3.5" /> 기도 제목
                  </div>
                  <ul className="space-y-1 pl-1">
                    {log.prayerRequests.map((p, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-red-300 mt-1">•</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 pt-2">
                {log.interests && log.interests.map((tag, i) => (
                  <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                    #{tag}
                  </span>
                ))}
                {log.faithLevel > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full font-bold">
                    <Star className="w-2.5 h-2.5 fill-yellow-500" /> {log.faithLevel}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};