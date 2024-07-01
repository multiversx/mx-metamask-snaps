import { KeyOps } from "./operations/KeyOps";

/**
 * This wallet uses a single account/address.
 */
export const getAddress = async (): Promise<string> => {
  const keyOps = new KeyOps();
  return await keyOps.getPublicKey();
};
