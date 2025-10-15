import { SnapConfirmationInterface, installSnap } from "@metamask/snaps-jest";
import { expect } from "@jest/globals";
import { assert } from "@metamask/snaps-sdk";
import { serialiseUnknownContent } from "../../utils/testUtils";

describe("onRpcRequest - signAuthToken", () => {
  it("User agrees to sign the auth token", async () => {
    const { request } = await installSnap();
    const authToken =
      "aHR0cHM6Ly9teC10ZW1wbGF0ZS1kYXBwLnZlcmNlbC5hcHA.f587f5591b3c69848bee85aa8225d0030c3c3d77810b8bbebd48dbe55b24e819.86400.eyJ0aW1lc3RhbXAiOjE3MDQ1NDAzMjB9";
    const response = request({
      origin: "http://localtest:8080",
      method: "mvx_signAuthToken",
      params: {
        token: authToken,
      },
    });

    const ui = (await response.getInterface()) as SnapConfirmationInterface;

    const serial = serialiseUnknownContent(ui.content);
    expect(serial).toContain("Connect to:");
    expect(serial).toContain("http://localtest:8080");
    expect(serial).toContain("Scam/phishing verification");
    expect(serial).toContain("Double check the browser's address bar");

    assert(ui.type == "confirmation");
    await ui.ok();

    expect(await response).toRespondWith(
      "60060590b2d40bea92d9b3aae9a90301d006b037506b604e89240c0444dbdc7b9ebc1c45af3ef5a872ae7fd039738aec407b1441a1926394066c6bcfdba31d00"
    );
  });

  it("User refuses to sign the auth token", async () => {
    const { request } = await installSnap();
    const authToken =
      "aHR0cHM6Ly9teC10ZW1wbGF0ZS1kYXBwLnZlcmNlbC5hcHA.f587f5591b3c69848bee85aa8225d0030c3c3d77810b8bbebd48dbe55b24e819.86400.eyJ0aW1lc3RhbXAiOjE3MDQ1NDAzMjB9";
    const response = request({
      origin: "http://localtest:8080",
      method: "mvx_signAuthToken",
      params: {
        token: authToken,
      },
    });

    const ui = (await response.getInterface()) as SnapConfirmationInterface;

    const serial = serialiseUnknownContent(ui.content);
    expect(serial).toContain("Connect to:");
    expect(serial).toContain("http://localtest:8080");
    expect(serial).toContain("Scam/phishing verification");
    expect(serial).toContain("Double check the browser's address bar");

    expect(ui.type).toBe("confirmation");
    await ui.cancel();

    expect(await response).toRespondWithError({
      code: -32603,
      message: "Token must be signed by the user",
      stack: expect.any(String),
    });
  });
});
