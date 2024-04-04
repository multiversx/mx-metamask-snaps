import { IPlainTransactionObject } from "@multiversx/sdk-core/out";


export interface SignTransactionsParams
{
  transactions: IPlainTransactionObject[];
}

export interface SignMessageParams
{
  message: string;
}

export interface SignAuthTokenParams
{
  token: string;
}