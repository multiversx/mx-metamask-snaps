import {
  Message,
  MessageComputer,
} from "@multiversx/sdk-core/out/core/message";
import { Address } from "@multiversx/sdk-core/out/core/address";
import { SignAuthTokenParams } from "../../types/snapParam";
import { KeyOps } from "../../operations/KeyOps";

import { Box, Text, Heading, Copyable } from "@metamask/snaps-sdk/jsx";

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
      content: (
        <Box>
          <Heading>Connect to:</Heading>
          <Text>{origin}</Text>
          <Heading>Scam/phishing verification</Heading>
          <Copyable
            value={`Double check the browser's address bar and confirm that you are indeed connecting to ${origin}`}
          />
        </Box>
      ),
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
