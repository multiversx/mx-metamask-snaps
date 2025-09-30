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
import { KeyOps } from "./operations/KeyOps";
import { formatAmount } from "./operations";
import {
  Box,
  Text,
  Divider,
  Copyable,
  Image,
  Section,
} from "@metamask/snaps-sdk/jsx";

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

  const networkConfig = await getNetworkConfig(networkType.apiAddress);
  if (!networkConfig) {
    throw new Error("Cannot retrieve the network configuration from the API.");
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
  ) {
    const plainTx = transaction.toPlainObject();

    return snap.request({
      method: "snap_dialog",
      params: {
        type: "confirmation",
        content: (
          <Box>
            <Text>Send to</Text>
            <Text>{plainTx.receiver}</Text>
            <Divider />

            <Text>Amount</Text>
            <Section direction="horizontal" alignment="space-between">
              <Text>{txValue}</Text>
              <Image src={EGLD_LOGO} alt="EGLD Logo" />
            </Section>

            <Divider />

            <Text>Fee</Text>

            <Section direction="horizontal" alignment="space-between">
              <Text>{txFees}</Text>
              <Image src={EGLD_LOGO} alt="EGLD Logo" />
            </Section>

            <Divider />

            <Text>Data</Text>
            <Copyable value={plainTx.data ? atob(plainTx.data) : ""} />
          </Box>
        ),
      },
    });
  }

  function validateSameChainId(
    transactions: IPlainTransactionObject[],
    targetChainId: string
  ): boolean {
    return transactions.every((tx) => tx.chainID === targetChainId);
  }

  function formatEGLD(input: string, ticker: string) {
    return formatAmount({
      input,
      ticker,
      decimals: DECIMALS,
      digits: DIGITS,
    });
  }
};
