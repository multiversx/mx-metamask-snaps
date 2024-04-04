import { getWalletKeys } from './private-key';

/**
 * This wallet uses a single account/address.
 */
export const getAddress = async (): Promise<string> => {
  const { publicKey } = await getWalletKeys();

  return publicKey;
};
