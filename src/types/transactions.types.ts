import { Transaction } from "@multiversx/sdk-core/out/core/transaction";
import { NftEnum } from "./nft.types";

export interface MultiSignTransactionType {
  multiTxData?: string;
  transactionIndex: number;
  transaction: Transaction;
  needsSigning: boolean;
}

export type TransactionsDataTokensType =
  | Record<string, TransactionDataTokenType>
  | undefined;

export enum TransactionTypesEnum {
  MultiESDTNFTTransfer = "MultiESDTNFTTransfer",
  ESDTTransfer = "ESDTTransfer",
  ESDTNFTBurn = "ESDTNFTBurn",
  ESDTNFTTransfer = "ESDTNFTTransfer",
  esdtTransaction = "esdtTransaction",
  nftTransaction = "nftTransaction",
  scCall = "scCall",
}

interface MultiEsdtType {
  type:
    | TransactionTypesEnum.esdtTransaction
    | TransactionTypesEnum.nftTransaction;
  receiver: string;
  token?: string;
  nonce?: string;
  amount?: string;
  data: string;
}

interface MultiEsdtScCallType {
  type: TransactionTypesEnum.scCall;
  receiver: string;
  token?: string;
  nonce?: string;
  amount?: string;
  data: string;
}

export type MultiEsdtTransactionType = MultiEsdtType | MultiEsdtScCallType;

export interface TransactionDataTokenType {
  tokenId: string;
  amount: string;
  receiver: string;
  type?: MultiEsdtTransactionType["type"] | "";
  nonce?: string;
  multiTxData?: string;
}

export type SnapTransactionType = {
  sender: string;
  receiver: string;
  data: string;
  value?: string;
  decimals?: number;
  name?: string;
  identifier?: string;
  method: string;
  type?: NftEnum | undefined;
};
