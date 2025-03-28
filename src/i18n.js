import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      'ui:tip': 'Tip',
      'ui:address': 'Address',
      'ui:login.loginButton': 'Login',
      'ui:login.loggingIn': '...',
      'ui:enterName': 'Enter name',
      'ui:enterPrivateKey': 'Enter private key',
      'ui:or': 'or',
      'ui:connectWithMetamask': 'Connect with MetaMask',
      'ui:testAccounts': 'Test Accounts',
      'ui:name': 'Name',
      'ui:privateKey': 'Private Key',
      'ui:login.networkError': 'Network error occurred',
      'ui:login.failedToLogin': 'Failed to login'
    }
  },
  ko: {
    translation: {
      'ui:tip': '최신 블록',
      'ui:address': '주소',
      'ui:login.loginButton': '로그인',
      'ui:login.loggingIn': '...',
      'ui:enterName': '이름 입력',
      'ui:enterPrivateKey': '프라이빗 키 입력',
      'ui:or': '또는',
      'ui:connectWithMetamask': 'MetaMask로 연결',
      'ui:testAccounts': '테스트 계정',
      'ui:name': '이름',
      'ui:privateKey': '프라이빗 키',
      'ui:login.networkError': '네트워크 오류가 발생했습니다',
      'ui:login.failedToLogin': '로그인에 실패했습니다'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ko',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 