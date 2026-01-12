import { VisitLogData } from '../types';

const LOCAL_STORAGE_KEY = 'pastoral_visit_logs';

/**
 * Saves data to Google Sheets via Google Apps Script (GAS).
 * Falls back to localStorage if GAS environment is not detected.
 */
export const saveVisitLog = async (data: VisitLogData): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if running within Google Apps Script environment
    if (typeof window.google !== 'undefined' && window.google.script && window.google.script.run) {
      window.google.script.run
        .withSuccessHandler((response: any) => {
          console.log('GAS Success:', response);
          resolve();
        })
        .withFailureHandler((error: Error) => {
          console.error('GAS Error:', error);
          reject(error);
        })
        .processForm(data);
    } else {
      // Mock environment (Local Development)
      console.warn('Google Apps Script not detected. Saving to LocalStorage instead.');
      try {
        const existingLogsJson = localStorage.getItem(LOCAL_STORAGE_KEY);
        const existingLogs: (VisitLogData & { timestamp: string })[] = existingLogsJson 
          ? JSON.parse(existingLogsJson) 
          : [];
        
        const newLog = {
          ...data,
          timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([newLog, ...existingLogs]));
        setTimeout(resolve, 800);
      } catch (e) {
        reject(e);
      }
    }
  });
};

/**
 * Fetches visit logs from Google Sheets via GAS.
 * Returns data from localStorage if in mock environment.
 */
export const getVisitLogs = async (): Promise<VisitLogData[]> => {
  return new Promise((resolve, reject) => {
    if (typeof window.google !== 'undefined' && window.google.script && window.google.script.run) {
      window.google.script.run
        .withSuccessHandler((data: any) => {
          resolve(data as VisitLogData[]);
        })
        .withFailureHandler((error: Error) => {
          reject(error);
        })
        .getVisitLogs();
    } else {
      // Mock environment: Read from localStorage
      try {
        const logsJson = localStorage.getItem(LOCAL_STORAGE_KEY);
        let logs: VisitLogData[] = logsJson ? JSON.parse(logsJson) : [];
        
        if (logs.length === 0) {
          logs = [
            {
              visiteeName: "김철수 성도 (예시)",
              visitDate: new Date().toISOString().split('T')[0],
              visitTime: "14:00",
              visitType: "구역심방",
              location: "자택",
              attendees: ["김영희 집사"],
              bibleVerse: "시편 23:1",
              topic: "여호와는 나의 목자시니",
              hymn: "301장",
              content: "이것은 예시 데이터입니다. 실제 구글 스프레드시트와 연동하면 실시간으로 저장된 내용을 볼 수 있습니다.",
              prayerRequests: ["가족의 건강을 위해", "자녀의 진로를 위해"],
              faithLevel: 5,
              interests: ["건강", "자녀"],
              privateNote: "민감한 정보는 보안 영역에 저장됩니다.",
              todoItems: [{ text: "도서 선물하기", completed: false }],
              nextVisitDate: ""
            }
          ];
        }
        
        setTimeout(() => resolve(logs), 600);
      } catch (e) {
        reject(e);
      }
    }
  });
};