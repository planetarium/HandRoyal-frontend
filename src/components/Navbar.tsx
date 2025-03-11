import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAccount } from '../context/AccountContext';
import { useTip } from '../context/TipContext';
import AddressDisplay from './AddressDisplay';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { address, setPrivateKey } = useAccount();
  const { tip } = useTip();
  const navigate = useNavigate();

  const handleLogout = () => {
    setPrivateKey(null);
    navigate('/');
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center fixed top-0 left-0 w-full h-16 z-10">
      <div className="flex items-center space-x-20">
        <Link className="text-lg font-bold text-white" to="/">
          HandRoyal
        </Link>
        <div className="flex items-center space-x-6">
          <Link className="text-lg text-white" to={"/user/" + address?.toString()}>
            {t('userInfo')}
          </Link>
          <Link className="text-lg text-white" to="/registerGlove">
            {t('registerGlove')}
          </Link>
        </div>
      </div>
      <div className="flex items-center">
        {tip && (
          <div className="ml-4 mr-4 text-sm">
            Tip: #{tip.index} 0x{tip.hash.substring(0, 6)}
          </div>
        )}
        {address && (
          <div className="flex items-center mr-4">
            <div className="text-sm">
              Address: <AddressDisplay address={address.toString()} type='user' />
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
          value={i18n.language}
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
