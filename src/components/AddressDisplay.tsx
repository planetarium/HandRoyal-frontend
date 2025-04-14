import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ParseAddress } from "../utils/addressUtils";

interface AddressDisplayProps {
  className?: string;
  type: 'glove' | 'user';
  address: string | undefined;
  shorten?: boolean;
}

const AddressDisplay: React.FC<AddressDisplayProps> = ({ type, address, className, shorten = true }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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

  const processedAddress = address ? ParseAddress(address) : undefined;

  const displayAddress = (address: string | undefined) => {
    if (address) {
      return <span className={`cursor-pointer hover:underline ${className}`} onClick={() => handleClick(address)}>{type === 'glove' ? t(`glove:${address}.name`) : shortenAddress(address)}</span>;
    }

    return 'UNDEFINED';
  };

  return (
    displayAddress(processedAddress)
  );
};

export default AddressDisplay;
