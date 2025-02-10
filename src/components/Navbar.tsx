import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
      <Link className="text-lg font-bold text-white" to="/">
        HandRoyal
      </Link>
      <div className="flex items-center">
        <span className="text-sm font-medium mr-2">{t('language')}</span>
        <select
          className="bg-gray-700 text-white p-1 rounded text-sm"
          defaultValue={i18n.language}
          onChange={(e) => changeLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="ko">한국어</option>
        </select>
      </div>
    </nav>
  );
};

export default Navbar;
