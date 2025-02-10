import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "language": "Language",
          "createSession": "Create Session",
          "invalidSessionIdLength": "Length of the session ID must be 40 characters.",
          "sessionId": "Session ID",
          "gameRules": "Game Rules",
          "minPlayers": "Minimum Players",
          "maxPlayers": "Maximum Players",
          "blocksPerRound": "Blocks per Round",
          "prize": "Prize",
          "enterPrize": "Enter prize",
          "createSessionButton": "Create Session",
          "joinSession": "Join Session",
          "enterSessionId": "Enter Session ID",
          "join": "Join",
          "createNewSession": "Or you can create a new session...",
          "cancel": "Cancel",
          "gameBoardTitle": "Game Board",
          "blocksLeft": "Blocks left: {{count}}",
          "rock": "Rock",
          "paper": "Paper",
          "scissors": "Scissors",
          "submit": "Submit",
          "login": "Login",
          "enterPrivateKey": "Enter private key",
          "loginButton": "Login",
          "noSessionFound": "No session found",
          "round": "Round: {{count}}",
          "sessionResults": "Session Results",
          "host": "Host",
          "participants": "Participants",
          "winner": "Winner",
          "matches": "Matches",
          "backToMain": "Back to Main",
          "logoutButton": "Logout"
        }
      },


      ko: {
        translation: {
          "language": "언어",
          "createSession": "새 세션 만들기",
          "invalidSessionIdLength": "세션 ID의 길이는 40자여야 합니다.",
          "sessionId": "세션 ID",
          "gameRules": "게임 규칙",
          "minPlayers": "최소 참가자 수",
          "maxPlayers": "최대 참가자 수",
          "blocksPerRound": "라운드 당 블록 수",
          "prize": "상품",
          "enterPrize": "상품을 입력하세요",
          "createSessionButton": "세션 생성하기",
          "joinSession": "세션 참가",
          "enterSessionId": "세션 ID 입력",
          "join": "참가",
          "createNewSession": "혹은 새 세션 만들기...",
          "cancel": "취소",
          "gameBoardTitle": "게임 보드",
          "blocksLeft": "남은 블록: {{count}}",
          "rock": "바위",
          "paper": "보",
          "scissors": "가위",
          "submit": "제출",
          "login": "로그인",
          "enterPrivateKey": "개인 키 입력",
          "loginButton": "로그인",
          "noSessionFound": "세션을 찾을 수 없습니다.",
          "round": "라운드: {{count}}",
          "sessionResults": "세션 결과",
          "host": "호스트",
          "participants": "참가자",
          "winner": "승자",
          "matches": "경기",
          "backToMain": "메인으로 돌아가기",
          "logoutButton": "로그아웃"
        }
      }




    },
    lng: "en", // 기본 언어 설정
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 