import {
  Message,
  MessageComputer,
} from "@multiversx/sdk-core/out/core/message";
import { SignMessageParams } from "./types/snapParam";
import { KeyOps } from "./operations/KeyOps";
import { Box, Heading, Text, Copyable, Divider } from "@metamask/snaps-sdk/jsx";

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
      content: (
        <Box>
          <Heading>Message signing</Heading>
          <Divider />
          <Text>Message</Text>
          <Copyable value={messageParam.message} />
        </Box>
      ),
    },
  });

  if (confirmationResponse !== true) {
    throw new Error("Message must be signed by the user");
  }

  const messageComputer = new MessageComputer();
  const cryptoMessage = messageComputer.computeBytesForSigning(signableMessage);

  return keyOps.getMessageSignature(cryptoMessage);
};
