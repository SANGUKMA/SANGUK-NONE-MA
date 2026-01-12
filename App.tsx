import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, FileText, Send, Loader2, RotateCcw, 
  PenTool, History, MapPin, Users, BookOpen, Music, 
  Heart, Star, ShieldAlert, CheckSquare, Plus, X, Eye, EyeOff, HelpCircle, Info, CheckCircle2
} from 'lucide-react';
import { Header } from './components/Header';
import { InputGroup } from './components/InputGroup';
import { TextAreaGroup } from './components/TextAreaGroup';
import { SuccessAlert } from './components/SuccessAlert';
import { HistoryList } from './components/HistoryList';
import { VisitLogData, SubmissionStatus, TodoItem } from './types';
import { saveVisitLog } from './services/mockSheetService';

type Tab = 'write' | 'history' | 'guide';

interface SectionTitleProps {
  icon: any;
  title: string;
  color?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ icon: Icon, title, color = "text-blue-600" }) => (
  <div className={`flex items-center gap-2 mb-4 border-b border-gray-100 pb-2 ${color}`}>
    <Icon className="w-5 h-5" />
    <h3 className="font-bold text-gray-800 tracking-tight">{title}</h3>
  </div>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('write');
  const [showPrivate, setShowPrivate] = useState(false);
  const [status, setStatus] = useState<SubmissionStatus>(SubmissionStatus.IDLE);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (typeof window.google !== 'undefined' && window.google.script) {
      setIsConnected(true);
    }
  }, []);

  const initialFormData: VisitLogData = {
    visiteeName: '',
    visitDate: '',
    visitTime: '',
    visitType: '구역심방',
    location: '',
    attendees: [],
    bibleVerse: '',
    topic: '',
    hymn: '',
    content: '',
    prayerRequests: [],
    faithLevel: 3,
    interests: [],
    privateNote: '',
    todoItems: [],
    nextVisitDate: '',
  };

  const [formData, setFormData] = useState<VisitLogData>(initialFormData);

  useEffect(() => {
    if (activeTab === 'write' && !formData.visitDate) {
      initializeFormTime();
    }
  }, [activeTab]);

  const initializeFormTime = () => {
    const now = new Date();
    setFormData(prev => ({
      ...prev,
      visitDate: now.toISOString().split('T')[0],
      visitTime: now.toTimeString().slice(0, 5)
    }));
  };

  const setNowTime = () => {
    const now = new Date();
    setFormData(prev => ({
      ...prev,
      visitTime: now.toTimeString().slice(0, 5)
    }));
  };

  const setTodayDate = () => {
    const now = new Date();
    setFormData(prev => ({
      ...prev,
      visitDate: now.toISOString().split('T')[0]
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddListItem = (field: 'prayerRequests' | 'attendees', value: string) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value.trim()]
    }));
  };

  const handleRemoveListItem = (field: 'prayerRequests' | 'attendees', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleToggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleAddTodo = (text: string) => {
    if (!text.trim()) return;
    setFormData(prev => ({
      ...prev,
      todoItems: [...prev.todoItems, { text: text.trim(), completed: false }]
    }));
  };

  const handleReset = () => {
    if (window.confirm("작성 중인 모든 내용을 초기화할까요?")) {
      setFormData(initialFormData);
      initializeFormTime();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.visiteeName) { alert("성도 이름을 입력해주세요."); return; }
    setStatus(SubmissionStatus.LOADING);
    try {
      await saveVisitLog(formData);
      setStatus(SubmissionStatus.SUCCESS);
    } catch (error) {
      setStatus(SubmissionStatus.ERROR);
      alert("저장 실패. 구글 시트 연동 설정을 확인해주세요.");
    }
  };

  const ConnectionGuide = () => (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`${isConnected ? 'bg-green-600' : 'bg-blue-600'} text-white p-6 rounded-2xl shadow-lg transition-all`}>
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          {isConnected ? <CheckCircle2 className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />} 
          {isConnected ? '구글 시트 연동 완료!' : '구글 시트 연동 안내'}
        </h2>
        <p className="opacity-90 text-sm leading-relaxed">
          {isConnected 
            ? '현재 스프레드시트와 성공적으로 연결되었습니다. 작성한 모든 내용은 시트에 기록됩니다.' 
            : '이 앱은 개인 구글 계정의 스프레드시트와 직접 연동됩니다. 아래 단계를 따라 백엔드를 설정해 주세요.'}
        </p>
      </div>

      <div className="space-y-4">
        {[
          { 
            step: '1', 
            title: '스프레드시트 준비', 
            desc: '새 구글 스프레드시트를 만들고 상단 [확장 프로그램] > [Apps Script]를 클릭하세요.',
            done: isConnected
          },
          { 
            step: '2', 
            title: '코드 복사 & 붙여넣기', 
            desc: '제공된 GoogleAppsScript.js 파일 내용을 에디터에 모두 복사해 넣고 저장하세요.',
            done: isConnected
          },
          { 
            step: '3', 
            title: '웹 앱으로 배포', 
            desc: '[배포] > [새 배포] 클릭 후 유형은 "웹 앱", 액세스 권한은 "모든 사용자"로 설정해 배포하세요.',
            done: isConnected
          },
          { 
            step: '4', 
            title: isConnected ? '서비스 정상 작동 중' : '연동 완료!', 
            desc: isConnected 
              ? '이제 안심하고 기록을 남기세요. 시트의 "심방기록" 탭에서 데이터를 확인할 수 있습니다.' 
              : '배포된 URL을 통해 접속하면 앱에서 저장 버튼을 누를 때마다 해당 시트에 기록됩니다.',
            done: isConnected
          }
        ].map((item, i) => (
          <div key={i} className={`bg-white p-4 rounded-xl border flex gap-4 shadow-sm transition-all ${item.done ? 'border-green-100 bg-green-50/20' : 'border-gray-200'}`}>
            <div className={`${item.done ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-600'} w-8 h-8 rounded-full flex items-center justify-center font-bold flex-none transition-colors`}>
              {item.done ? <CheckCircle2 className="w-5 h-5" /> : item.step}
            </div>
            <div>
              <h4 className={`font-bold mb-1 ${item.done ? 'text-green-700' : 'text-gray-800'}`}>{item.title}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-10">
      <Header />

      <div className="max-w-md mx-auto w-full px-4 mt-4 flex-1">
        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex mb-6">
          <button onClick={() => setActiveTab('write')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'write' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
            <PenTool className="w-4 h-4" />작성
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
            <History className="w-4 h-4" />내역
          </button>
          <button onClick={() => setActiveTab('guide')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'guide' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
            <HelpCircle className="w-4 h-4" />가이드
          </button>
        </div>

        {activeTab === 'guide' ? (
          <ConnectionGuide />
        ) : activeTab === 'write' ? (
          <form onSubmit={handleSubmit} className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* 1. 기본 정보 */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <SectionTitle icon={User} title="1. 기본 정보" />
              <div className="space-y-4">
                <InputGroup id="visiteeName" label="성도 이름" value={formData.visiteeName} onChange={handleChange} placeholder="심방 대상자 이름" required icon={<User className="w-4 h-4" />} />
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-500" /> 심방 날짜</label>
                      <button type="button" onClick={setTodayDate} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold hover:bg-blue-100 transition-colors">오늘</button>
                    </div>
                    <input type="date" name="visitDate" value={formData.visitDate} onChange={handleChange} className="block w-full rounded-lg border-gray-300 border p-3 text-sm bg-white" />
                  </div>
                  <div className="relative">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-500" /> 심방 시간</label>
                      <button type="button" onClick={setNowTime} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold hover:bg-blue-100 transition-colors">지금</button>
                    </div>
                    <input type="time" name="visitTime" value={formData.visitTime} onChange={handleChange} className="block w-full rounded-lg border-gray-300 border p-3 text-sm bg-white" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">심방 종류</label>
                  <select 
                    name="visitType" 
                    value={formData.visitType} 
                    onChange={handleChange} 
                    className="w-full rounded-lg border-gray-300 border p-3 text-sm bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  >
                    {['대심방', '구역심방', '환우심방', '심층상담', '새가족', '이사', '개업', '장례', '결혼', '기타'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <InputGroup id="location" label="심방 장소" value={formData.location} onChange={handleChange} placeholder="자택, 병원, 카페 등" icon={<MapPin className="w-4 h-4" />} />
                
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">동석자</label>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {formData.attendees.map((a, i) => (
                      <span key={i} className="bg-blue-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm">
                        {a} <X className="w-3 h-3 cursor-pointer hover:text-red-200 transition-colors" onClick={() => handleRemoveListItem('attendees', i)} />
                      </span>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    placeholder="입력 후 엔터" 
                    className="w-full p-3 text-sm bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddListItem('attendees', (e.target as any).value); (e.target as any).value = ''; } }}
                  />
                </div>
              </div>
            </div>

            {/* 2. 말씀과 예배 */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <SectionTitle icon={BookOpen} title="2. 말씀과 예배" />
              <div className="space-y-4">
                <InputGroup id="bibleVerse" label="성경 본문" value={formData.bibleVerse} onChange={handleChange} placeholder="예: 시편 23:1-6" icon={<BookOpen className="w-4 h-4" />} />
                <InputGroup id="topic" label="설교 제목/핵심" value={formData.topic} onChange={handleChange} placeholder="나눈 말씀의 핵심 요약" icon={<FileText className="w-4 h-4" />} />
                <InputGroup id="hymn" label="찬송가" value={formData.hymn} onChange={handleChange} placeholder="예: 301장" icon={<Music className="w-4 h-4" />} />
              </div>
            </div>

            {/* 3. 상담 및 기도제목 */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <SectionTitle icon={Heart} title="3. 상담 및 기도제목" />
              <div className="space-y-4">
                <TextAreaGroup id="content" label="주요 대화 내용" value={formData.content} onChange={handleChange} placeholder="심방 중 나눈 대화나 성도의 현재 상황을 요약하세요." rows={5} icon={<FileText className="w-4 h-4" />} />
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5 font-bold text-red-600">기도 제목</label>
                  <div className="space-y-2 mb-3">
                    {formData.prayerRequests.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 bg-red-50/50 p-2.5 rounded-lg text-sm group text-gray-900 border border-red-100 shadow-sm">
                        <span className="text-red-500 font-bold">•</span>
                        <span className="flex-1 font-medium">{p}</span>
                        <X className="w-4 h-4 text-red-300 cursor-pointer opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all" onClick={() => handleRemoveListItem('prayerRequests', i)} />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      id="newPrayer" 
                      type="text" 
                      placeholder="기도제목 추가 후 엔터" 
                      className="flex-1 p-3 text-sm bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                      onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddListItem('prayerRequests', (e.target as any).value); (e.target as any).value = ''; } }} 
                    />
                    <button type="button" onClick={() => { const el = document.getElementById('newPrayer') as HTMLInputElement; handleAddListItem('prayerRequests', el.value); el.value = ''; }} className="p-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 transition-all"><Plus className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. 영적 상태 */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <SectionTitle icon={Star} title="4. 영적 상태 체크" />
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-3">현재 신앙의 활력 (1~5)</label>
                  <div className="flex gap-3 justify-center">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button key={v} type="button" onClick={() => setFormData(p => ({...p, faithLevel: v}))} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${formData.faithLevel >= v ? 'bg-yellow-100 text-yellow-600 scale-110 shadow-sm border border-yellow-200' : 'bg-gray-50 text-gray-300 grayscale opacity-40'}`}>
                        <Star className={`w-6 h-6 ${formData.faithLevel >= v ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">현재의 관심사</label>
                  <div className="flex flex-wrap gap-2">
                    {['건강', '자녀', '진로', '재정', '관계', '이단', '우울', '시험', '헌신'].map(tag => (
                      <button key={tag} type="button" onClick={() => handleToggleInterest(tag)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${formData.interests.includes(tag) ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'}`}>
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. 민감 정보 */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-50">
              <div className="flex items-center justify-between mb-4 border-b border-red-50 pb-2">
                <div className="flex items-center gap-2 text-red-600">
                  <ShieldAlert className="w-5 h-5" />
                  <h3 className="font-bold tracking-tight">5. 민감 정보 (보안)</h3>
                </div>
                <button type="button" onClick={() => setShowPrivate(!showPrivate)} className="p-1.5 rounded-full hover:bg-red-50 transition-colors text-red-400">
                  {showPrivate ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {showPrivate ? (
                <textarea name="privateNote" value={formData.privateNote} onChange={handleChange} placeholder="치명적인 가정사 등 보안이 필요한 메모를 작성하세요." rows={4} className="w-full p-4 text-sm border border-red-200 rounded-xl focus:ring-red-500 bg-red-50/20 text-gray-900 leading-relaxed" />
              ) : (
                <div className="py-8 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                  <ShieldAlert className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-400 text-xs font-medium">보안을 위해 잠겨있습니다. 눈 아이콘을 클릭하세요.</p>
                </div>
              )}
            </div>

            {/* 6. 후속 조치 */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <SectionTitle icon={CheckSquare} title="6. 후속 조치" />
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2 font-bold text-blue-700">심방 이후 할 일 (To-Do)</label>
                  <div className="space-y-2 mb-3">
                    {formData.todoItems.map((todo, i) => (
                      <div key={i} className="flex items-center gap-3 bg-blue-50/30 p-3 rounded-xl text-sm border border-blue-100">
                        <input type="checkbox" checked={todo.completed} className="w-4 h-4 text-blue-600 rounded" onChange={() => { const newTodos = [...formData.todoItems]; newTodos[i].completed = !newTodos[i].completed; setFormData(p => ({...p, todoItems: newTodos})); }} />
                        <span className={`flex-1 font-medium ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>{todo.text}</span>
                        <X className="w-4 h-4 text-gray-300 cursor-pointer hover:text-red-500" onClick={() => setFormData(p => ({...p, todoItems: p.todoItems.filter((_, idx) => idx !== i)}))} />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input id="newTodo" type="text" placeholder="예: 도서 선물하기, 다음 주 전화" className="flex-1 p-3 text-sm border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddTodo((e.target as any).value); (e.target as any).value = ''; } }} />
                    <button type="button" onClick={() => { const el = document.getElementById('newTodo') as HTMLInputElement; handleAddTodo(el.value); el.value = ''; }} className="p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-200 transition-all"><Plus className="w-5 h-5" /></button>
                  </div>
                </div>
                <InputGroup id="nextVisitDate" label="다음 권면/심방 예정일" type="date" value={formData.nextVisitDate} onChange={handleChange} icon={<Calendar className="w-4 h-4" />} />
              </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-gray-200 z-30 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
              <div className="max-w-md mx-auto flex gap-3">
                <button type="button" onClick={handleReset} className="flex-none p-4 rounded-2xl bg-gray-100 border border-gray-200 text-gray-500 hover:bg-gray-200 active:scale-95 transition-all"><RotateCcw className="w-6 h-6" /></button>
                <button type="submit" disabled={status === SubmissionStatus.LOADING} className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-all ${status === SubmissionStatus.LOADING ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'}`}>
                  {status === SubmissionStatus.LOADING ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Send className="w-6 h-6" /> 기록 저장하기</>}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <HistoryList />
        )}
      </div>

      {status === SubmissionStatus.SUCCESS && <SuccessAlert onClose={() => setStatus(SubmissionStatus.IDLE)} />}
    </div>
  );
};

export default App;