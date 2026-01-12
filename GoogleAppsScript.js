/**
 * ==============================================================================
 * 목회 심방 기록 비서 - 구글 스프레드시트 백엔드 엔진
 * ==============================================================================
 * 
 * [설치 방법]
 * 1. 이 코드를 전체 복사합니다.
 * 2. 구글 스프레드시트의 [확장 프로그램] > [Apps Script]에 붙여넣습니다.
 * 3. 상단 [배포] > [새 배포]를 누릅니다.
 * 4. 유형: 웹 앱 / 나 / 모든 사용자 권한으로 설정 후 배포합니다.
 */

// 1. 앱을 처음 실행할 때 화면을 띄워주는 함수
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('목회 심방 기록 비서')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * 2. 데이터 시트 초기화 (시트가 없으면 자동으로 제목줄을 만듭니다)
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('심방기록');
  
  if (!sheet) {
    sheet = ss.insertSheet('심방기록');
    const headers = [
      '성도 이름', '심방 날짜', '심방 시간', '심방 종류', '장소', 
      '동석자', '성경 본문', '설교 제목', '찬송가', '대화 내용', 
      '기도 제목', '신앙 단계', '관심사', '민감 메모', '할 일 리스트', '다음 심방일', '기록 생성일시'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight('bold')
      .setBackground('#E8F0FE')
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * 3. 앱에서 보낸 데이터를 시트에 저장하는 함수
 */
function processForm(data) {
  try {
    const sheet = getOrCreateSheet();
    
    // 배열 데이터는 시트에 저장하기 좋게 문자열로 변환합니다.
    const row = [
      data.visiteeName,
      data.visitDate,
      data.visitTime,
      data.visitType,
      data.location,
      Array.isArray(data.attendees) ? data.attendees.join(', ') : '',
      data.bibleVerse,
      data.topic,
      data.hymn,
      data.content,
      Array.isArray(data.prayerRequests) ? data.prayerRequests.join('\n') : '',
      data.faithLevel,
      Array.isArray(data.interests) ? data.interests.join(', ') : '',
      data.privateNote,
      Array.isArray(data.todoItems) ? data.todoItems.map(t => (t.completed ? '[V] ' : '[ ] ') + t.text).join('\n') : '',
      data.nextVisitDate,
      new Date() // 서버 기준 현재 시간
    ];
    
    sheet.appendRow(row);
    return { success: true, message: '성공적으로 저장되었습니다.' };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * 4. 시트에 저장된 데이터를 앱으로 불러오는 함수
 */
function getVisitLogs() {
  try {
    const sheet = getOrCreateSheet();
    const rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) return []; // 데이터가 헤더밖에 없는 경우
    
    const logs = [];
    // 최신 기록이 위로 오도록 아래에서부터 읽습니다.
    for (let i = rows.length - 1; i >= 1; i--) {
      const r = rows[i];
      logs.push({
        visiteeName: r[0],
        visitDate: r[1] instanceof Date ? r[1].toISOString().split('T')[0] : r[1],
        visitTime: r[2],
        visitType: r[3],
        location: r[4],
        attendees: r[5] ? r[5].split(', ') : [],
        bibleVerse: r[6],
        topic: r[7],
        hymn: r[8],
        content: r[9],
        prayerRequests: r[10] ? r[10].split('\n') : [],
        faithLevel: Number(r[11]),
        interests: r[12] ? r[12].split(', ') : [],
        privateNote: r[13],
        todoItems: r[14] ? r[14].split('\n').map(t => ({
          text: t.replace(/^\[[ V]\] /, ''),
          completed: t.startsWith('[V]')
        })) : [],
        nextVisitDate: r[15] instanceof Date ? r[15].toISOString().split('T')[0] : r[15]
      });
    }
    return logs;
  } catch (e) {
    return [];
  }
}