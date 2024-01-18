import { SLIP10Node, JsonSLIP10Node } from '@metamask/key-tree';
import { UserSecretKey } from '@multiversx/sdk-wallet/out';

/**
 * The path of the account is m/44'/508'/0'/0/0.
 */
export const getWalletKeys = async () => {
  const rootNode = (await snap.request({
    method: 'snap_getBip32Entropy',
    params: {
      path: ['m', "44'", "508'", "0'", "0'", "0'"],
      curve: 'ed25519',
    },
  })) as unknown as JsonSLIP10Node;

  const node = await SLIP10Node.fromJSON(rootNode);

  if (node.privateKeyBytes === undefined) {
    throw new Error('Cannot retrieve the privat key');
  }

  const userSecret = new UserSecretKey(node.privateKeyBytes as Uint8Array);

  return {
    privateKey: node.privateKeyBytes,
    publicKey: userSecret.generatePublicKey().toAddress().bech32(),
    userSecret: userSecret,
  };
};
