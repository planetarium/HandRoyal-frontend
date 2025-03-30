import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAccount } from '../context/AccountContext';
import { useTip } from '../context/TipContext';
import { useLanguage } from '../context/LanguageContext';
import AddressDisplay from './AddressDisplay';
import logoText from '../assets/logo-text.png';

const ENABLE_REGISTER_GLOVE = false;

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const account = useAccount();
  const { tip } = useTip();
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();

  const handleLogout = () => {
    account?.disconnect();
    navigate('/');
  };

  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center fixed top-0 left-0 w-full h-16 z-10">
      <div className="flex items-center space-x-20">
        <Link to="/">
          <img alt="HandRoyal" className="h-12" src={logoText} />
        </Link>
        <div className="flex items-center space-x-6">
          {account && (
            <>
              <Link className="text-lg text-white" to={"/user/" + account?.address.toString()}>
                {t('ui:userInfo')}
              </Link>
              {ENABLE_REGISTER_GLOVE && (
                <Link className="text-lg text-white" to="/registerGlove">
                  {t('ui:registerGlove')}
                </Link>
              )}
              <Link className="text-lg text-white" to="/pickup">
                {t('ui:pickupGlove')}
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center">
        {tip && (
          <div className="ml-4 mr-4 text-sm">
            {t('ui:tip')}: #{tip.height} 0x{tip.hash.substring(0, 6)}
          </div>
        )}
        {account && (
          <div className="flex items-center mr-4">
            <div className="text-sm">
              {t('ui:address')}: <AddressDisplay address={account.address.toString()} type='user' />
            </div>
            <button
              className="bg-gray-600 text-white py-1 px-2 text-xs rounded border border-gray-500 hover:bg-gray-500 ml-2 cursor-pointer"
              onClick={handleLogout}
            >
              {t('ui:login.logoutButton')}
            </button>
          </div>
        )}
        <span className="text-sm font-medium mr-2">{t('ui:language')}</span>
        <select
          className="bg-gray-700 text-white p-1 rounded text-sm cursor-pointer"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="ko">한국어</option>
        </select>
      </div>
    </nav>
  );
};

export default Navbar;
