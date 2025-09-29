import { SLIP10Node, JsonSLIP10Node } from "@metamask/key-tree";
import { UserSecretKey } from "@multiversx/sdk-core/out";

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

    const userSecret = new UserSecretKey(node.privateKeyBytes);

    return {
      publicKey: userSecret.generatePublicKey().toAddress().toBech32(),
      userSecret: userSecret,
    };
  }

  public async getPublicKey() {
    const { publicKey } = await this.getKeyPair();
    return publicKey;
  }

  public async getMessageSignature(message: Uint8Array<ArrayBufferLike>) {
    const { userSecret } = await this.getKeyPair();
    const signature = userSecret.sign(message);

    return Buffer.from(signature).toString("hex");
  }

  public async getTransactionSignature(
    serializedTransaction: Uint8Array<ArrayBufferLike>
  ) {
    const { userSecret } = await this.getKeyPair();
    const signature = userSecret.sign(serializedTransaction);

    return signature;
  }
}
