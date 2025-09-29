import { SnapConfirmationInterface, installSnap } from "@metamask/snaps-jest";
import { expect } from "@jest/globals";
import {
  heading,
  divider,
  image,
  panel,
  row,
  text,
  copyable,
  RowVariant,
  assert,
} from "@metamask/snaps-sdk";
import { EGLD_LOGO } from "./constants";

describe("onRpcRequest", () => {
  it("Get public address", async () => {
    const { request, close } = await installSnap();
    const response = await request({
      method: "mvx_getAddress",
    });

    expect(response).toRespondWith(
      "erd184gtfgrrdmfc0qwq93g804w2z4rat453334uelfn5jznameapw6s7kf0f4"
    );

    await close();
  });

  it("Throws an error if the requested method does not exist", async () => {
    const { request, close } = await installSnap();
    const response = await request({
      method: "wrong_method",
    });

    expect(response).toRespondWithError({
      code: -32603,
      message: "Method not found.",
      stack: expect.any(String),
    });

    await close();
  });

  it("User agrees to sign the message", async () => {
    const { request, close } = await installSnap();
    const userMessage = "Jest unit test message !";
    const response = request({
      method: "mvx_signMessage",
      params: {
        message: userMessage,
      },
    });

    const ui = await response.getInterface();

    expect(ui).toRender(
      panel([
        heading("Message signing"),
        divider(),
        text("Message"),
        copyable(userMessage),
      ])
    );

    assert(ui.type == "confirmation");
    await ui.ok();
    const test = await response;
    expect(test).toRespondWith(
      "f017d929054153b165c4f591b64260f990d5836c9f0f5045d88eeeacd5263ec2a459723e826a5a2633a4a57f7d1e5892da22e7b49b6d6fb72455872e2af87e06"
    );

    await close();
  });

  it("User refuses to sign the message", async () => {
    const { request, close } = await installSnap();
    const userMessage = "Jest unit test message !";
    const response = request({
      method: "mvx_signMessage",
      params: {
        message: userMessage,
      },
    });

    const ui = (await response.getInterface()) as SnapConfirmationInterface;

    expect(ui).toRender(
      panel([
        heading("Message signing"),
        divider(),
        text("Message"),
        copyable(userMessage),
      ])
    );

    expect(ui.type).toBe("confirmation");
    await ui.cancel();

    expect(await response).toRespondWithError({
      code: -32603,
      message: "Message must be signed by the user",
      stack: expect.any(String),
    });

    await close();
  });

  it("User agrees to sign the auth token", async () => {
    const { request, close } = await installSnap();
    const authToken =
      "aHR0cHM6Ly9teC10ZW1wbGF0ZS1kYXBwLnZlcmNlbC5hcHA.f587f5591b3c69848bee85aa8225d0030c3c3d77810b8bbebd48dbe55b24e819.86400.eyJ0aW1lc3RhbXAiOjE3MDQ1NDAzMjB9";
    const response = request({
      origin: "http://localtest:8080",
      method: "mvx_signAuthToken",
      params: {
        token: authToken,
      },
    });

    const ui = await response.getInterface();

    expect(ui).toRender(
      panel([
        heading("Connect to:"),
        text("http://localtest:8080"),
        heading("Scam/phising verification"),
        copyable(
          "Double check the browser's address bar and confirm that you are indeed connecting to " +
            "http://localtest:8080"
        ),
      ])
    );

    assert(ui.type == "confirmation");
    await ui.ok();

    expect(await response).toRespondWith(
      "60060590b2d40bea92d9b3aae9a90301d006b037506b604e89240c0444dbdc7b9ebc1c45af3ef5a872ae7fd039738aec407b1441a1926394066c6bcfdba31d00"
    );

    await close();
  });

  it("User refuses to sign the auth token", async () => {
    const { request, close } = await installSnap();
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

    expect(ui).toRender(
      panel([
        heading("Connect to:"),
        text("http://localtest:8080"),
        heading("Scam/phising verification"),
        copyable(
          "Double check the browser's address bar and confirm that you are indeed connecting to " +
            "http://localtest:8080"
        ),
      ])
    );

    expect(ui.type).toBe("confirmation");
    await ui.cancel();

    expect(await response).toRespondWithError({
      code: -32603,
      message: "Token must be signed by the user",
      stack: expect.any(String),
    });

    await close();
  });

  it("User agrees to sign a single transaction", async () => {
    const { mock, request, close } = await installSnap();

    await mock({
      url: "https://devnet-api.multiversx.com/network/config",
      response: {
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            config: {
              erd_adaptivity: "false",
              erd_chain_id: "D",
              erd_denomination: 18,
              erd_extra_gas_limit_guarded_tx: 50000,
              erd_gas_per_data_byte: 1500,
              erd_gas_price_modifier: "0.01",
              erd_hysteresis: "0.200000",
              erd_latest_tag_software_version: "D1.6.10.0",
              erd_max_gas_per_transaction: 600000000,
              erd_meta_consensus_group_size: 58,
              erd_min_gas_limit: 50000,
              erd_min_gas_price: 1000000000,
              erd_min_transaction_version: 1,
              erd_num_metachain_nodes: 58,
              erd_num_nodes_in_shard: 58,
              erd_num_shards_without_meta: 3,
              erd_rewards_top_up_gradient_point: "2000000000000000000000000",
              erd_round_duration: 6000,
              erd_rounds_per_epoch: 2400,
              erd_shard_consensus_group_size: 21,
              erd_start_time: 1694000000,
              erd_top_up_factor: "0.500000",
            },
          },
          code: "successful",
          ok: true,
        }),
      },
    });

    const transactions = [
      {
        nonce: 1,
        value: "1",
        receiver:
          "erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh",
        sender:
          "erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh",
        gasPrice: 120000,
        gasLimit: 120000,
        chainID: "D",
        version: 1,
      },
    ];

    const response = request({
      method: "mvx_signTransactions",
      params: {
        transactions: transactions,
      },
    });

    const ui = await response.getInterface();

    expect(ui).toRender(
      panel([
        text("Send to"),
        text("erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh"),
        divider(),
        text("Amount"),
        row("0.000000000000000001 xEGLD", image(EGLD_LOGO), RowVariant.Default),
        divider(),
        text("Fee"),
        row("0.000000006084 xEGLD", image(EGLD_LOGO), RowVariant.Default),
        divider(),
        text("Data"),
        copyable(""),
      ])
    );

    assert(ui.type == "confirmation");
    await ui.ok();

    expect(await response).toRespondWith([
      '{"nonce":1,"value":"1","receiver":"erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh","sender":"erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh","gasPrice":120000,"gasLimit":120000,"chainID":"D","version":1,"signature":"1e560e0a8d7b5251ed98ab67016f8513d5631a93e2a1273211acab47d18a48780b9b2f51dab53ddba1df6c311afb64845940a7c40d8e732af464ebf27a3a1b04"}',
    ]);

    await close();
  });

  it("User sign a transaction and refuse the other one", async () => {
    const { mock, request, close } = await installSnap();

    await mock({
      url: "https://devnet-api.multiversx.com/network/config",
      response: {
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            config: {
              erd_adaptivity: "false",
              erd_chain_id: "D",
              erd_denomination: 18,
              erd_extra_gas_limit_guarded_tx: 50000,
              erd_gas_per_data_byte: 1500,
              erd_gas_price_modifier: "0.01",
              erd_hysteresis: "0.200000",
              erd_latest_tag_software_version: "D1.6.10.0",
              erd_max_gas_per_transaction: 600000000,
              erd_meta_consensus_group_size: 58,
              erd_min_gas_limit: 50000,
              erd_min_gas_price: 1000000000,
              erd_min_transaction_version: 1,
              erd_num_metachain_nodes: 58,
              erd_num_nodes_in_shard: 58,
              erd_num_shards_without_meta: 3,
              erd_rewards_top_up_gradient_point: "2000000000000000000000000",
              erd_round_duration: 6000,
              erd_rounds_per_epoch: 2400,
              erd_shard_consensus_group_size: 21,
              erd_start_time: 1694000000,
              erd_top_up_factor: "0.500000",
            },
          },
          code: "successful",
          ok: true,
        }),
      },
    });

    const transactions = [
      {
        nonce: 1,
        value: "1",
        receiver:
          "erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh",
        sender:
          "erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh",
        gasPrice: 120000,
        gasLimit: 120000,
        chainID: "D",
        version: 1,
      },
      {
        nonce: 2,
        value: "2",
        receiver:
          "erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh",
        sender:
          "erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh",
        gasPrice: 120000,
        gasLimit: 120000,
        chainID: "D",
        version: 1,
      },
    ];

    const response = request({
      method: "mvx_signTransactions",
      params: {
        transactions: transactions,
      },
    });

    const ui = await response.getInterface();

    expect(ui).toRender(
      panel([
        text("Send to"),
        text("erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh"),
        divider(),
        text("Amount"),
        row("0.000000000000000001 xEGLD", image(EGLD_LOGO), RowVariant.Default),
        divider(),
        text("Fee"),
        row("0.000000006084 xEGLD", image(EGLD_LOGO), RowVariant.Default),
        divider(),
        text("Data"),
        copyable(""),
      ])
    );

    assert(ui.type == "confirmation");
    await ui.ok();

    const ui2 = await response.getInterface();

    expect(ui2).toRender(
      panel([
        text("Send to"),
        text("erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh"),
        divider(),
        text("Amount"),
        row("0.000000000000000002 xEGLD", image(EGLD_LOGO), RowVariant.Default),
        divider(),
        text("Fee"),
        row("0.000000006084 xEGLD", image(EGLD_LOGO), RowVariant.Default),
        divider(),
        text("Data"),
        copyable(""),
      ])
    );

    assert(ui2.type == "confirmation");
    await ui2.cancel();

    expect(await response).toRespondWithError({
      code: -32603,
      message: "All transactions must be approved by the user",
      stack: expect.any(String),
    });

    await close();
  });

  it("User sign all transactions", async () => {
    const { mock, request, close } = await installSnap();

    await mock({
      url: "https://devnet-api.multiversx.com/network/config",
      response: {
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            config: {
              erd_adaptivity: "false",
              erd_chain_id: "D",
              erd_denomination: 18,
              erd_extra_gas_limit_guarded_tx: 50000,
              erd_gas_per_data_byte: 1500,
              erd_gas_price_modifier: "0.01",
              erd_hysteresis: "0.200000",
              erd_latest_tag_software_version: "D1.6.10.0",
              erd_max_gas_per_transaction: 600000000,
              erd_meta_consensus_group_size: 58,
              erd_min_gas_limit: 50000,
              erd_min_gas_price: 1000000000,
              erd_min_transaction_version: 1,
              erd_num_metachain_nodes: 58,
              erd_num_nodes_in_shard: 58,
              erd_num_shards_without_meta: 3,
              erd_rewards_top_up_gradient_point: "2000000000000000000000000",
              erd_round_duration: 6000,
              erd_rounds_per_epoch: 2400,
              erd_shard_consensus_group_size: 21,
              erd_start_time: 1694000000,
              erd_top_up_factor: "0.500000",
            },
          },
          code: "successful",
          ok: true,
        }),
      },
    });

    const transactions = [
      {
        nonce: 1,
        value: "1",
        receiver:
          "erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh",
        sender:
          "erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh",
        gasPrice: 120000,
        gasLimit: 120000,
        chainID: "D",
        version: 1,
      },
      {
        nonce: 2,
        value: "2",
        receiver:
          "erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh",
        sender:
          "erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh",
        gasPrice: 120000,
        gasLimit: 120000,
        chainID: "D",
        version: 1,
      },
    ];

    const response = request({
      method: "mvx_signTransactions",
      params: {
        transactions: transactions,
      },
    });

    const ui = await response.getInterface();

    expect(ui).toRender(
      panel([
        text("Send to"),
        text("erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh"),
        divider(),
        text("Amount"),
        row("0.000000000000000001 xEGLD", image(EGLD_LOGO), RowVariant.Default),
        divider(),
        text("Fee"),
        row("0.000000006084 xEGLD", image(EGLD_LOGO), RowVariant.Default),
        divider(),
        text("Data"),
        copyable(""),
      ])
    );

    assert(ui.type == "confirmation");
    await ui.ok();

    const ui2 = await response.getInterface();

    expect(ui2).toRender(
      panel([
        text("Send to"),
        text("erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh"),
        divider(),
        text("Amount"),
        row("0.000000000000000002 xEGLD", image(EGLD_LOGO), RowVariant.Default),
        divider(),
        text("Fee"),
        row("0.000000006084 xEGLD", image(EGLD_LOGO), RowVariant.Default),
        divider(),
        text("Data"),
        copyable(""),
      ])
    );

    assert(ui2.type == "confirmation");
    await ui2.ok();

    expect(await response).toRespondWith([
      '{"nonce":1,"value":"1","receiver":"erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh","sender":"erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh","gasPrice":120000,"gasLimit":120000,"chainID":"D","version":1,"signature":"1e560e0a8d7b5251ed98ab67016f8513d5631a93e2a1273211acab47d18a48780b9b2f51dab53ddba1df6c311afb64845940a7c40d8e732af464ebf27a3a1b04"}',
      '{"nonce":2,"value":"2","receiver":"erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh","sender":"erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh","gasPrice":120000,"gasLimit":120000,"chainID":"D","version":1,"signature":"0a6304b7ffd8abde379432572567b9203e150482e028c7b568ab8b0cb603ba136f4a8bb6ba69ed5386c423fd77915fbfbd81e462bfb918c9808fa83b399a820d"}',
    ]);

    await close();
  });
});
