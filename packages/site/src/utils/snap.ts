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
 * Invoke the "mvx_signAuthToken" RPC method from the snap.
 */
export const getTokenSnap = async (token: string) => {
  return await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'mvx_signAuthToken',
        params: { token: token },
      },
    },
  });
};

/**
 * Invoke the "mvx_getAddress" RPC method from the snap.
 */
export const getAddressSnap = async () => {
  return await window.ethereum.request({
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
 * Invoke the "mvx_makeTransaction" RPC method from the snap.
 *
 * @param params - The transaction.
 */
export const makeTransactionSnap = async (transactionToSend: Transaction) => {
  const trans = [transactionToSend];
  const transactionsPlain = trans.map((transaction) =>
    transaction.toPlainObject(),
  );

  const metamaskReponse = (await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'mvx_signTransactions',
        params: { transactions: transactionsPlain },
      },
    },
  })) as string[];

  return metamaskReponse[0];
};

export const signMessageSnap = async (message: string) => {
  const metamaskReponse = await window.ethereum.request({
    method: 'wallet_invokeSnap',
    params: {
      snapId: defaultSnapOrigin,
      request: {
        method: 'mvx_signMessage',
        params: { message: message },
      },
    },
  });

  return metamaskReponse;
};

export const authTokenSnap = async (token: string) => {
  const metamaskReponse = await window.ethereum.request({
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
