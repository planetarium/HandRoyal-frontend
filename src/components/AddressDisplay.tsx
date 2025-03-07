import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface AddressDisplayProps {
  className?: string;
  type: 'glove' | 'user';
  address: string;
  shorten?: boolean;
}

const AddressDisplay: React.FC<AddressDisplayProps> = ({ type, address, className, shorten = true }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClick = (address: string | undefined) => {
    if (address) {
      if (type === 'glove') {
        navigate(`/glove/${address}`);
      } else if (type === 'user') {
        navigate(`/user/${address}`);
      }
    }
  };

  const shortenAddress = (address: string) => {
    return shorten ? '0x' + address.slice(0, 6) : address;
  };

  const displayAddress = (address: string | undefined) => {
    if (address) {
      return <span className={`cursor-pointer hover:underline ${className}`} onClick={() => handleClick(address)}>{shortenAddress(address)}</span>;
    }

    return 'UNDEFINED';
  };

  return (
    displayAddress(address)
  );
};

export default AddressDisplay;
