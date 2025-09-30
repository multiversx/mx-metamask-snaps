import { SignTransactionsParams } from "./types/snapParam";
import type {
  INetworkConfig,
  IPlainTransactionObject,
} from "@multiversx/sdk-core/out/core/interfaces";
import { Transaction } from "@multiversx/sdk-core/out/core/transaction";
import { TransactionComputer } from "@multiversx/sdk-core/out/core/transactionComputer";

import { getNetworkProvider, getNetworkType } from "./network";
import { KeyOps } from "./operations/KeyOps";
import { formatAmount } from "./operations";

import { getMultiEsdtTransferData } from "./helpers/getMultiEsdtTransferData";
import { TransactionsSummary } from "./TransactionsSummary";
import {
  MultiSignTransactionType,
  TransactionDataTokenType,
} from "./types/transactions.types";

/**
 * @param params - The transaction(s) to sign.
 */
export const signTransactions = async (
  transactionsParam: SignTransactionsParams
): Promise<string[]> => {
  const chainId = transactionsParam.transactions[0]?.chainID;

  if (!chainId) {
    throw new Error("There must be at least one transaction");
  }

  if (!validateSameChainId(transactionsParam.transactions, chainId)) {
    throw new Error("All transactions must have the same chainId.");
  }

  const networkType = getNetworkType(chainId);
  if (!networkType) {
    throw new Error(`Cannot identify the network with chainId ${chainId}.`);
  }

  const networkProvider = getNetworkProvider(networkType.apiAddress);
  const networkConfig = await networkProvider.getNetworkConfig();

  if (!networkConfig) {
    throw new Error("Cannot retrieve the network configuration from the API.");
  }

  const transactionsSigned: string[] = [];

  for (const transactionPlain of transactionsParam.transactions) {
    const transaction = Transaction.newFromPlainObject(transactionPlain);

    await processTransaction(transaction, networkConfig, transactionsSigned);
  }

  return transactionsSigned;

  async function processTransaction(
    transaction: Transaction,
    networkConfig: INetworkConfig,
    transactionsSigned: string[]
  ) {
    const keyOps = new KeyOps();

    const txComputer = new TransactionComputer();
    const fees = txComputer
      .computeTransactionFee(transaction, networkConfig)
      .toString();

    const txFees = formatAmount({
      input: fees,
      showLastNonZeroDecimal: true,
    });

    const {
      allTransactions,
      parsedTransactionsByDataField,
    } = getMultiEsdtTransferData([transaction]);

    const confirmationResponse = await showConfirmationDialog(
      allTransactions,
      parsedTransactionsByDataField,
      txFees
    );

    if (confirmationResponse !== true) {
      throw new Error("All transactions must be approved by the user");
    }

    const serializedTransaction = txComputer.computeBytesForSigning(
      transaction
    );

    const transactionSignature = await keyOps.getTransactionSignature(
      serializedTransaction
    );

    transaction.signature = transactionSignature;
    transactionsSigned.push(JSON.stringify(transaction.toPlainObject()));
  }

  async function showConfirmationDialog(
    transactions: MultiSignTransactionType[],
    parsedTransactionsByDataField: Record<string, TransactionDataTokenType>,
    txFees: string
  ) {
    if (!networkType) {
      throw new Error(`Cannot identify the network with chainId ${chainId}.`);
    }

    const tokenDetails = await getTokenDetails(parsedTransactionsByDataField);

    return snap.request({
      method: "snap_dialog",
      params: {
        type: "confirmation",
        content: TransactionsSummary({
          transactions,
          parsedTransactionsByDataField,
          fees: txFees,
          networkType,
          networkProvider,
          tokenDetails,
        }),
      },
    });
  }

  async function getTokenDetails(
    parsedTransactions: Record<string, TransactionDataTokenType>
  ) {
    const tokenDetails: Record<string, any> = {};

    for (const [key, value] of Object.entries(parsedTransactions)) {
      if (value.tokenId) {
        const tokenData = await networkProvider.getDefinitionOfFungibleToken(
          value.tokenId
        );

        tokenDetails[key] = {
          decimals: tokenData.decimals,
          name: tokenData.name,
          identifier: tokenData.identifier,
        };
      }
    }

    return tokenDetails;
  }

  function validateSameChainId(
    transactions: IPlainTransactionObject[],
    targetChainId: string
  ): boolean {
    return transactions.every((tx) => tx.chainID === targetChainId);
  }
};
