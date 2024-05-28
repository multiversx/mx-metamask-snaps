import { SLIP10Node, JsonSLIP10Node } from "@metamask/key-tree";
import { UserSecretKey } from "@multiversx/sdk-wallet/out";

export class KeyOps {
  /**
   * The path of the account is m/44'/508'/0'/0/0.
   */

  private async getKeyPair() {
    const rootNode = ((await snap.request({
      method: "snap_getBip32Entropy",
      params: {
        path: ["m", "44'", "508'", "0'", "0'", "0'"],
        curve: "ed25519",
      },
    })) as unknown) as JsonSLIP10Node;

    const node = await SLIP10Node.fromJSON(rootNode);

    if (node.privateKeyBytes === undefined) {
      throw new Error("Cannot retrieve the private key");
    }

    const userSecret = new UserSecretKey(node.privateKeyBytes as Uint8Array);

    return {
      publicKey: userSecret.generatePublicKey().toAddress().bech32(),
      userSecret: userSecret,
    };
  }

  public async getPublicKey() {
    const { publicKey } = await this.getKeyPair();
    return publicKey;
  }

  public async getMessageSignature(message: Buffer) {
    const { userSecret } = await this.getKeyPair();
    return userSecret.sign(message).toString("hex");
  }

  public async getTransactionSignature(serializedTransaction: Buffer) {
    const { userSecret } = await this.getKeyPair();
    return userSecret.sign(serializedTransaction);
  }
}
