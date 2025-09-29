import { SignTransactionsParams } from "./types/snapParam";
import type {
  INetworkConfig,
  IPlainTransactionObject,
} from "@multiversx/sdk-core/out/core/interfaces";
import { Transaction } from "@multiversx/sdk-core/out/core/transaction";
import { TransactionComputer } from "@multiversx/sdk-core/out/core/transactionComputer";

import { DECIMALS, DIGITS, EGLD_LOGO } from "./constants";
import { getNetworkConfig, getNetworkType } from "./network";
import { NetworkType } from "./types/networkType";
import {
  divider,
  image,
  panel,
  row,
  text,
  copyable,
  RowVariant,
} from "@metamask/snaps-sdk";
import { formatAmount } from "./operations";
import { KeyOps } from "./operations/KeyOps";

/**
 * @param params - The transaction(s) to sign.
 */
export const signTransactions = async (
  transactionsParam: SignTransactionsParams
): Promise<string[]> => {
  if (transactionsParam.transactions.length == 0) {
    throw new Error("There must be atleast one transaction");
  }

  const chainId = transactionsParam.transactions[0].chainID;

  if (!validateSameChainId(transactionsParam.transactions, chainId)) {
    throw new Error("All transactions must have the same chainId.");
  }

  const networkType = getNetworkType(chainId);

  if (!networkType) {
    throw new Error(`Cannot identify the network with chainId ${chainId}.`);
  }

  const networkConfig = await getNetworkConfig(networkType.apiAddress);
  if (!networkConfig) {
    throw new Error("Cannot retrieve the network configuration from the api.");
  }

  const transactionsSigned: string[] = [];
  for (const transactionPlain of transactionsParam.transactions) {
    const transaction = Transaction.newFromPlainObject(transactionPlain);

    await processTransaction(
      transaction,
      networkType,
      networkConfig,
      transactionsSigned
    );
  }

  return transactionsSigned;

  async function processTransaction(
    transaction: Transaction,
    networkType: NetworkType,
    networkConfig: INetworkConfig,
    transactionsSigned: string[]
  ) {
    const keyOps = new KeyOps();

    const txValue = formatEGLD(
      transaction.value.toString() ?? "",
      networkType.egldLabel
    );

    const txComputer = new TransactionComputer();
    const fees = txComputer
      .computeTransactionFee(transaction, networkConfig)
      .toString();

    const txFees = formatEGLD(fees, networkType.egldLabel);

    const confirmationResponse = await showConfirmationDialog(
      transaction,
      txValue,
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
    transaction: Transaction,
    txValue: string,
    txFees: string
  ): Promise<string | boolean | null> {
    const plainTx = transaction.toPlainObject();

    console.log("PLAINTX", plainTx);
    return snap.request({
      method: "snap_dialog",
      params: {
        type: "confirmation",
        content: panel([
          text("Send to"),
          text(plainTx.receiver),
          divider(),
          text("Amount"),
          row(txValue, image(EGLD_LOGO), RowVariant.Default),
          divider(),
          text("Fee"),
          row(txFees, image(EGLD_LOGO), RowVariant.Default),
          divider(),
          text("Data"),
          copyable(plainTx.data ? atob(plainTx.data) : ""),
        ]),
      },
    });
  }

  function validateSameChainId(
    transactions: IPlainTransactionObject[],
    targetChainId: string
  ): boolean {
    return transactions.every(
      (transaction) => transaction.chainID === targetChainId
    );
  }

  function formatEGLD(input: string, ticker: string) {
    return formatAmount({
      input: input,
      ticker: ticker,
      decimals: DECIMALS,
      digits: DIGITS,
    });
  }
};
