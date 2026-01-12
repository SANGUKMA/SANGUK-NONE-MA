export interface TodoItem {
  text: string;
  completed: boolean;
}

export interface VisitLogData {
  // 1. 기본 정보
  visiteeName: string;
  visitDate: string;
  visitTime: string;
  visitType: string;
  location: string;
  attendees: string[];

  // 2. 말씀과 예배
  bibleVerse: string;
  topic: string;
  hymn: string;

  // 3. 상담 및 기도제목
  content: string; // 주요 대화 요약
  prayerRequests: string[];
  context?: string;

  // 4. 영적 상태
  faithLevel: number;
  interests: string[];

  // 5. 민감 정보
  privateNote: string;

  // 6. 후속 조치
  todoItems: TodoItem[];
  nextVisitDate: string;
}

export enum SubmissionStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

declare global {
  interface Window {
    google?: {
      script: {
        run: {
          withSuccessHandler: (callback: (response: any) => void) => any;
          withFailureHandler: (callback: (error: Error) => void) => any;
          processForm: (data: VisitLogData) => void;
          getVisitLogs: () => void;
        };
      };
    };
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}