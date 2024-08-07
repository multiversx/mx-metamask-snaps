import { Address, SignableMessage } from "@multiversx/sdk-core";
import { SignAuthTokenParams } from "./types/snapParam";
import { panel, text, copyable, heading } from "@metamask/snaps-sdk";
import { KeyOps } from "./operations/KeyOps";

const allowedDomain = "multiversx.com";

/**
 * @param tokenParam - The token to sign.
 */
export const signAuthToken = async (
  origin: string,
  tokenParam: SignAuthTokenParams
): Promise<string> => {
  const keyOps = new KeyOps();
  const publicKey = await keyOps.getPublicKey();

  const originNotAllowed = !origin.endsWith(allowedDomain);

  if (originNotAllowed) {
    await snap.request({
      method: "snap_dialog",
      params: {
        type: "alert",
        content: panel([
          heading("Error:"),
          text(`Origin ${origin} is not allowed.`),
        ]),
      },
    });

    throw new Error("Token must be signed by the user");
  }
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

  const signableMessage = new SignableMessage({
    address: new Address(publicKey),
    message: Buffer.from(`${publicKey}${tokenParam.token}`, "utf8"),
  });

  const cryptoMessage = Buffer.from(
    signableMessage.serializeForSigning().toString("hex"),
    "hex"
  );

  return await keyOps.getMessageSignature(cryptoMessage);
};
