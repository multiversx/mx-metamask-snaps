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

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  switch (request.method) {
    case "mvx_getAddress":
      return getAddress();
    case "mvx_signTransactions":
      const signTransactionParam =
        request?.params as unknown as SignTransactionsParams;
      return signTransactions(signTransactionParam);
    case "mvx_signMessage":
      const snapParams = request?.params as unknown as SignMessageParams;
      return signMessage(snapParams);
    case "mvx_signAuthToken":
      const signTokenParams = request?.params as unknown as SignAuthTokenParams;
      return signAuthToken(origin, signTokenParams);
    default:
      throw new Error("Method not found.");
  }
};
