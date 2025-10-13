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

import { TransactionsSummary } from "./TransactionsSummary";

import {
  TransactionDecoder,
  TransactionMetadata,
  TransactionMetadataTransfer,
} from "@multiversx/sdk-transaction-decoder/lib/src/transaction.decoder";
import { decodeBase64 } from "./utils/decoder/base64Utils";
import { parseMultiEsdtTransferData } from "./helpers/helpers/parseMultiEsdtTransferData";
import { NftEnum } from "./types/nft.types";

type TokenDetailsType = {
  value?: string;
  name: string;
  identifier: string;
  type?: NftEnum | undefined;
  decimals?: number;
} | null;

const LABELS: Record<string, NftEnum> = {
  SemiFungibleESDT: NftEnum.SFT,
  NonFungibleESDT: NftEnum.NFT,
};

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

    const plainTx = transaction.toPlainObject();

    const metadata = new TransactionDecoder().getTransactionMetadata({
      data: plainTx.data ?? "",
      receiver: plainTx.receiver,
      sender: plainTx.sender,
      value: plainTx.value,
    });

    const fees = txComputer
      .computeTransactionFee(transaction, networkConfig)
      .toString();

    const txFees = formatAmount({
      input: fees,
      showLastNonZeroDecimal: true,
    });

    const decodedData = decodeBase64(plainTx.data ?? "");

    const confirmationResponse = await showConfirmationDialog({
      metadata,
      txFees,
      data: decodedData,
    });

    if (confirmationResponse !== true) {
      throw new Error("All transactions must be approved by the user");
    }

    const serializedTransaction =
      txComputer.computeBytesForSigning(transaction);

    const transactionSignature = await keyOps.getTransactionSignature(
      serializedTransaction
    );

    transaction.signature = transactionSignature;
    transactionsSigned.push(JSON.stringify(transaction.toPlainObject()));
  }

  async function showConfirmationDialog({
    metadata,
    txFees,
    data,
  }: {
    metadata: TransactionMetadata;
    txFees: string;
    data: string;
  }) {
    if (!networkType) {
      throw new Error(`Cannot identify the network with chainId ${chainId}.`);
    }

    const snapTransactions = await getSnapTransactions(metadata, data);

    return snap.request({
      method: "snap_dialog",
      params: {
        type: "confirmation",
        content: TransactionsSummary({
          transactions: snapTransactions,
          fees: txFees,
          networkType,
          networkProvider,
        }),
      },
    });
  }

  async function getSnapTransactions(
    metadata: TransactionMetadata,
    data: string
  ) {
    const transaction = {
      sender: metadata.sender,
      receiver: metadata.receiver,
      method: metadata.functionName ?? "",
      value: metadata.value.toString(),
      data,
    };

    if (metadata.transfers) {
      const transactions = [];

      const multiTx = parseMultiEsdtTransferData(data);

      for (const [index, transfer] of metadata.transfers.entries()) {
        const tokenDetails = await getTokenDetails(transfer);

        if (tokenDetails) {
          const data =
            multiTx.length > 0
              ? (multiTx[index]?.data ?? "")
              : transaction.data;

          transactions.push({
            ...transaction,
            ...tokenDetails,
            data,
            value: transfer.value.toString(),
          });
        }
      }

      return transactions;
    }

    return [transaction];
  }

  async function getTokenDetails(
    transfer?: TransactionMetadataTransfer
  ): Promise<TokenDetailsType> {
    if (!transfer) {
      return null;
    }

    if (transfer.properties?.identifier || transfer.properties?.token) {
      if (transfer.properties.identifier) {
        const [, , nonce] = transfer.properties.identifier?.split("-") ?? [];

        if (nonce) {
          const tokenDetails = await networkProvider.doGetGeneric(
            `nfts/${transfer.properties.identifier}`
          );

          return {
            value: transfer?.value?.toString(),
            name: tokenDetails.name,
            identifier: transfer.properties.identifier,
            type: LABELS[tokenDetails.type],
          };
        }
      }

      const identifier =
        transfer.properties?.identifier || transfer.properties?.token || "";
      const tokenData =
        await networkProvider.getDefinitionOfFungibleToken(identifier);

      if (tokenData) {
        return {
          value: transfer?.value?.toString(),
          decimals: tokenData.decimals,
          name: tokenData.name,
          identifier: tokenData.identifier,
        };
      }
    }

    return null;
  }

  function validateSameChainId(
    transactions: IPlainTransactionObject[],
    targetChainId: string
  ): boolean {
    return transactions.every((tx) => tx.chainID === targetChainId);
  }
};
