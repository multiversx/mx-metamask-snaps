import { OnRpcRequestHandler } from "@metamask/snaps-sdk";
import {
  SignMessageParams,
  SignAuthTokenParams,
  SignTransactionsParams,
} from "./types/snapParam";
import { getAddress } from "./helpers/getAddress";
import { signTransactions } from "./core/signTransactions/signTransactions";
import { signMessage } from "./core/signMessage/signMessage";
import { signAuthToken } from "./core/signAuthToken/signAuthToken";
import { SnapRequests } from "./constants";

export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  if (!origin.endsWith(".multiversx.com")) {
    throw new Error("Unauthorized");
  }

  switch (request.method) {
    case SnapRequests.GET_ADDRESS:
      return getAddress();

    case SnapRequests.SIGN_TRANSACTIONS: {
      const signTransactionParam =
        request?.params as unknown as SignTransactionsParams;
      return signTransactions(signTransactionParam);
    }
    case SnapRequests.SIGN_MESSAGE: {
      const snapParams = request?.params as unknown as SignMessageParams;
      return signMessage(snapParams);
    }
    case SnapRequests.SIGN_TOKEN: {
      const signTokenParams = request?.params as unknown as SignAuthTokenParams;
      return signAuthToken(origin, signTokenParams);
    }
    default:
      throw new Error("Method not found.");
  }
};
