import { useState } from 'react';
import { getAddressSnap, makeTransactionSnap } from '../utils';
import { Address, TokenTransfer, Transaction } from '@multiversx/sdk-core/out';
import { ApiNetworkProvider } from '@multiversx/sdk-network-providers';
import { getNetwork } from '../utils/network';
import {
  GasEstimator,
  TransferTransactionsFactory,
} from '@multiversx/sdk-core';

export const useSendTransaction = () => {
  const [lastTxId, setLastTxId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const sendTransaction = async (data: FormData) => {
    if (isLoading) {
      return;
    }

    try {
      setError(undefined);
      setLastTxId(undefined);
      setIsLoading(true);
      const toAddress = data.get('toAddress');
      const amount = data.get('amount');
      const identifier = data.get('tokenIdentifier');

      if (
        typeof toAddress === 'string' &&
        typeof amount === 'string' &&
        typeof identifier === 'string'
      ) {
        const fromAddress = (await getAddressSnap()) as string;
        const network = getNetwork();

        fetch(`${network.apiAddress}/accounts/${fromAddress}`)
          .then((response) => response.json())
          .then(async (data) => {
            const factory = new TransferTransactionsFactory(new GasEstimator());

            var transaction;

            if (identifier == 'EGLD') {
              transaction = factory.createEGLDTransfer({
                sender: Address.fromBech32(fromAddress),
                receiver: Address.fromBech32(toAddress),
                chainID: 'D',
                nonce: data.nonce,
                value: TokenTransfer.egldFromAmount(amount),
              });
            } else {
              transaction = factory.createESDTTransfer({
                tokenTransfer: TokenTransfer.fungibleFromAmount(
                  identifier,
                  amount,
                  2,
                ),
                sender: Address.fromBech32(fromAddress),
                receiver: Address.fromBech32(toAddress),
                chainID: 'D',
                nonce: data.nonce,
              });
            }

            const response = await makeTransactionSnap(transaction);
            const trans = Transaction.fromPlainObject(JSON.parse(response));

            const apiNetworkProvider = new ApiNetworkProvider(
              network.apiAddress,
            );

            let txHash = await apiNetworkProvider.sendTransaction(trans);
            setLastTxId(txHash);
          })
          .catch((error) => console.error('Error fetching nonce:', error));
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError(`An unknown error occurred: ${JSON.stringify(err)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { lastTxId, isLoading, error, sendTransaction };
};
