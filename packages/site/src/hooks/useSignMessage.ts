import { useState } from 'react';
import { getAddressSnap, signMessageSnap } from '../utils';
import { Address, SignableMessage } from '@multiversx/sdk-core/out';
import { Signature } from '@multiversx/sdk-core/out/signature';

export const useSignMessage = () => {
  const [messageSigned, setMessageSigned] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const signMessage = async (data: FormData) => {
    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      const textMessage = data.get('message');

      if (typeof textMessage === 'string') {
        const fromAddress = await getAddressSnap();

        if (fromAddress) {
          const message = new SignableMessage({
            address: Address.fromBech32(fromAddress),
            message: Buffer.from(textMessage, 'ascii'),
          });

          const messageSigned = await signMessageSnap(textMessage);

          if (messageSigned) {
            const sign = new Signature(messageSigned);
            message.applySignature(sign);
            setMessageSigned(JSON.stringify(message.toJSON()));
          }
        }
      }
    } catch (err: unknown) {
      console.log(`An unknown error occurred: ${JSON.stringify(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return { messageSigned, isLoading, signMessage };
};
