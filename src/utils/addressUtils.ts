export const AddressEquals = (address1: string, address2: string): boolean => {
  return ParseAddress(address1) === ParseAddress(address2);
};

export const ParseAddress = (address: string): string => {
  return address.startsWith('0x') ? address.substring(2) : address;
};

export const IsValidAddress = (address: string): boolean => {
  const parsed = ParseAddress(address);
  return /^[0-9a-fA-F]{40}$/.test(parsed);
};
