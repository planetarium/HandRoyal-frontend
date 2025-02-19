import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAccount } from '../context/AccountContext';
import { useTip } from '../context/TipContext';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { privateKey, address, setPrivateKey } = useAccount();
  const { tip } = useTip();

  const handleLogout = () => {
    setPrivateKey(null);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
      <Link className="text-lg font-bold text-white" to="/">
        HandRoyal
      </Link>
      <div className="flex items-center">
        {tip && (
          <div className="ml-4 mr-4 text-sm">
            Tip: #{tip.index} 0x{tip.hash.substring(0, 6)}
          </div>
        )}
        {address && (
          <div className="flex items-center mr-4">
            <div className="text-sm">
              Address: {address.toString()}
            </div>
            <button
              className="bg-gray-600 text-white py-1 px-2 text-xs rounded border border-gray-500 hover:bg-gray-500 ml-2 cursor-pointer"
              onClick={handleLogout}
            >
              {t('logoutButton')}
            </button>
          </div>
        )}
        <span className="text-sm font-medium mr-2">{t('language')}</span>
        <select
          className="bg-gray-700 text-white p-1 rounded text-sm cursor-pointer"
          defaultValue={i18n.language}
          onChange={(e) => changeLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="ko">한국어</option>
        </select>
        {address && (
          <li>
            <Link to={`/user/${address}`}>User Page</Link>
          </li>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
