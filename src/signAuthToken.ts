import {
  Message,
  MessageComputer,
} from "@multiversx/sdk-core/out/core/message";
import { Address } from "@multiversx/sdk-core/out/core/address";
import { SignAuthTokenParams } from "./types/snapParam";
import { panel, text, copyable, heading } from "@metamask/snaps-sdk";
import { KeyOps } from "./operations/KeyOps";

/**
 * @param tokenParam - The token to sign.
 */
export const signAuthToken = async (
  origin: string,
  tokenParam: SignAuthTokenParams
): Promise<string> => {
  const keyOps = new KeyOps();
  const publicKey = await keyOps.getPublicKey();

  const confirmationResponse = await snap.request({
    method: "snap_dialog",
    params: {
      type: "confirmation",
      content: panel([
        heading("Connect to:"),
        text(origin),
        heading("Scam/phising verification"),
        copyable(
          "Double check the browser's address bar and confirm that you are indeed connecting to " +
            origin
        ),
      ]),
    },
  });

  if (confirmationResponse !== true) {
    throw new Error("Token must be signed by the user");
  }

  const msg = new Message({
    address: new Address(publicKey),
    data: new Uint8Array(Buffer.from(`${publicKey}${tokenParam.token}`)),
  });

  const messageComputer = new MessageComputer();
  const cryptoMessage = messageComputer.computeBytesForSigning(msg);

  return keyOps.getMessageSignature(cryptoMessage);
};
