import { Address, SignableMessage } from '@multiversx/sdk-core';
import { SignAuthTokenParams } from './types/snapParam';
import { getWalletKeys } from './private-key';
import { panel, text, copyable, heading } from '@metamask/snaps-sdk';

/**
 * @param tokenParam - The token to sign.
 */
export const signAuthToken = async (
  origin: string,
  tokenParam: SignAuthTokenParams,
): Promise<string> => {
  const { userSecret, publicKey } = await getWalletKeys();

  const confirmationResponse = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Connect to:'),
        text(origin),
        heading('Scam/phising verification'),
        copyable(
          "Double check the browser's address bar and confirm that you are indeed connecting to " +
            origin,
        ),
      ]),
    },
  });

  if (confirmationResponse !== true) {
    throw new Error('Token must be signed by the user');
  }

  const signableMessage = new SignableMessage({
    address: new Address(publicKey),
    message: Buffer.from(`${publicKey}${tokenParam.token}`, 'utf8'),
  });

  const cryptoMessage = Buffer.from(
    signableMessage.serializeForSigning().toString('hex'),
    'hex',
  );

  return userSecret.sign(cryptoMessage).toString('hex');
};
