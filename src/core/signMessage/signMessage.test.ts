import { SnapConfirmationInterface, installSnap } from "@metamask/snaps-jest";
import { expect } from "@jest/globals";
import { assert } from "@metamask/snaps-sdk";
import { serialiseUnknownContent } from "../../utils/testUtils";

describe("onRpcRequest - signMessage & basic RPCs", () => {
  it("Get public address", async () => {
    const { request } = await installSnap();
    const response = await request({
      method: "mvx_getAddress",
    });

    expect(response).toRespondWith(
      "erd184gtfgrrdmfc0qwq93g804w2z4rat453334uelfn5jznameapw6s7kf0f4"
    );
  });

  it("Throws an error if the requested method does not exist", async () => {
    const { request } = await installSnap();
    const response = await request({
      method: "wrong_method",
    });

    expect(response).toRespondWithError({
      code: -32603,
      message: "Method not found.",
      stack: expect.any(String),
    });
  });

  it("User agrees to sign the message", async () => {
    const { request } = await installSnap();
    const userMessage = "Jest unit test message !";
    const response = request({
      method: "mvx_signMessage",
      params: {
        message: userMessage,
      },
    });

    const authUi = (await response.getInterface()) as SnapConfirmationInterface;

    const serialMsg = serialiseUnknownContent(authUi.content);
    expect(serialMsg).toContain("Message signing");
    expect(serialMsg).toContain("Message");
    expect(serialMsg).toContain(userMessage);

    assert(authUi.type == "confirmation");
    await authUi.ok();
    const test = await response;
    expect(test).toRespondWith(
      "f017d929054153b165c4f591b64260f990d5836c9f0f5045d88eeeacd5263ec2a459723e826a5a2633a4a57f7d1e5892da22e7b49b6d6fb72455872e2af87e06"
    );
  });

  it("User refuses to sign the message", async () => {
    const { request } = await installSnap();
    const userMessage = "Jest unit test message !";
    const response = request({
      method: "mvx_signMessage",
      params: {
        message: userMessage,
      },
    });

    const authUi2 =
      (await response.getInterface()) as SnapConfirmationInterface;

    const serialMsg2 = serialiseUnknownContent(authUi2.content);
    expect(serialMsg2).toContain("Message signing");
    expect(serialMsg2).toContain("Message");
    expect(serialMsg2).toContain(userMessage);

    expect(authUi2.type).toBe("confirmation");
    await authUi2.cancel();

    expect(await response).toRespondWithError({
      code: -32603,
      message: "Message must be signed by the user",
      stack: expect.any(String),
    });
  });
});
