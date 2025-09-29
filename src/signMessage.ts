import { Message, MessageComputer } from "@multiversx/sdk-core";
import { SignMessageParams } from "./types/snapParam";
import { panel, text, copyable, heading, divider } from "@metamask/snaps-sdk";
import { KeyOps } from "./operations/KeyOps";

/**
 * @param messageParam - The message to sign.
 */
export const signMessage = async (
  messageParam: SignMessageParams
): Promise<string> => {
  const keyOps = new KeyOps();

  const signableMessage = new Message({
    data: new Uint8Array(Buffer.from(messageParam.message)),
  });

  const confirmationResponse = await snap.request({
    method: "snap_dialog",
    params: {
      type: "confirmation",
      content: panel([
        heading("Message signing"),
        divider(),
        text("Message"),
        copyable(messageParam.message),
      ]),
    },
  });

  if (confirmationResponse !== true) {
    throw new Error("Message must be signed by the user");
  }

  const messageComputer = new MessageComputer();
  const cryptoMessage = messageComputer.computeBytesForSigning(signableMessage);

  return keyOps.getMessageSignature(cryptoMessage);
};
