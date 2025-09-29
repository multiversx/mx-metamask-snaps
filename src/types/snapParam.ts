import type { IPlainTransactionObject } from "@multiversx/sdk-core/out/core/interfaces";

export interface SignTransactionsParams {
  transactions: IPlainTransactionObject[];
}

export interface SignMessageParams {
  message: string;
}

export interface SignAuthTokenParams {
  token: string;
}
