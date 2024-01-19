import { defaultSnapOrigin } from '../config';
import { GetSnapsResponse, Snap } from '../types';
import { Transaction } from '@multiversx/sdk-core/out';

/**
 * Get the installed snaps in MetaMask.
 *
 * @returns The snaps installed in MetaMask.
 */
export const getSnaps = async (): Promise<GetSnapsResponse> => {
  return (await window.ethereum.request({
    method: 'wallet_getSnaps',
  })) as unknown as GetSnapsResponse;
};

/**
 * Connect a snap to MetaMask.
 *
 * @param snapId - The ID of the snap.
 * @param params - The params to pass with the snap to connect.
 */
export const connectSnap = async (
  snapId: string = defaultSnapOrigin,
  params: Record<'version' | string, unknown> = {},
) => {
  await window.ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      [snapId]: params,
    },
  });
};

/**
 * Get the snap from MetaMask.
 *
 * @param version - The version of the snap to install (optional).
 * @returns The snap object returned by the extension.
 */
export const getSnap = async (version?: string): Promise<Snap | undefined> => {
  try {
    const snaps = await getSnaps();

    return Object.values(snaps).find(
      (snap) =>
        snap.id === defaultSnapOrigin && (!version || snap.version === version),
    );
  } catch (e) {
    console.log('Failed to obtain installed snap', e);
    return undefined;
  }
};

export const isLocalSnap = (snapId: string) => snapId.startsWith('local:');

/**
 * Invoke the "mvx_getAddress" RPC method from the snap.
 * @returns public address
 */
export const getAddressSnap = async () => {
  return await window.ethereum.request<string>({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'mvx_getAddress',
        params: undefined,
      },
    },
  });
};

/**
 * Invoke the "mvx_signTransactions" RPC method from the snap.
 * Sign an array of transactions
 * @param params - Transactions.
 */
export const signTransactionsSnap = async (transactionToSend: Transaction) => {
  const trans = [transactionToSend];
  const transactionsPlain = trans.map((transaction) =>
    transaction.toPlainObject(),
  );

  const metamaskReponse = await window.ethereum.request<string[]>({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'mvx_signTransactions',
        params: { transactions: transactionsPlain },
      },
    },
  });

  if (metamaskReponse) {
    return metamaskReponse[0];
  } else {
    throw new Error('Error during the signing process');
  }
};

/**
 * Invoke the "mvx_signMessage" RPC method from the snap.
 * Sign a message with Metamask
 * @param message
 * @returns
 */
export const signMessageSnap = async (message: string) => {
  return await window.ethereum.request<string>({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'mvx_signMessage',
        params: { message: message },
      },
    },
  });
};

/**
 * Invoke the "mvx_signAuthToken" RPC method from the snap.
 * Sign an auth token with Metamask
 * @param token
 * @returns
 */
export const authTokenSnap = async (token: string) => {
  const metamaskReponse = await window.ethereum.request<string>({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'mvx_signAuthToken',
        params: { token: token },
      },
    },
  });

  return metamaskReponse;
};
