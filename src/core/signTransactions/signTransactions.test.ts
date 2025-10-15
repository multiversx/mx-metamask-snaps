import { SnapConfirmationInterface, installSnap } from "@metamask/snaps-jest";
import { expect } from "@jest/globals";
import { assert } from "@metamask/snaps-sdk";
import { serialiseUnknownContent } from "../../utils/testUtils";
import * as network from "../../network";

const mockNetworkConfig = {
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
};

describe("onRpcRequest - signTransactions", () => {
  it("User agrees to sign a single transaction", async () => {
    const { request } = await installSnap();

    const networkModule = await import("../../network");
    jest
      .spyOn(networkModule, "getNetworkProvider")
      .mockImplementation((_apiUrl: string): any => ({
        url: _apiUrl,
        config: mockNetworkConfig,
        getNetworkConfig: async () => mockNetworkConfig,
        doGetGeneric: async (_path: string) => ({
          name: "TOKEN",
          identifier: "T-0",
          decimals: 18,
          type: "SemiFungibleESDT",
        }),
        getDefinitionOfFungibleToken: async (_identifier: string) => ({
          name: "TOKEN",
          identifier: "T-0",
          decimals: 18,
        }),
      }));

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

    const txUi = (await response.getInterface()) as SnapConfirmationInterface;
    const serial = serialiseUnknownContent(txUi.content);

    expect(serial).toContain("To");
    expect(serial).toContain(
      "erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh"
    );
    expect(serial).toContain("Send");
    expect(serial).toContain("Fee");
    expect(serial).toContain("Data");

    assert(txUi.type == "confirmation");
    await txUi.ok();

    expect(await response).toRespondWith([
      '{"nonce":1,"value":"1","receiver":"erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh","sender":"erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh","gasPrice":120000,"gasLimit":120000,"chainID":"D","version":1,"signature":"1e560e0a8d7b5251ed98ab67016f8513d5631a93e2a1273211acab47d18a48780b9b2f51dab53ddba1df6c311afb64845940a7c40d8e732af464ebf27a3a1b04"}',
    ]);
  });

  it("User sign a transaction and refuse the other one", async () => {
    const { request } = await installSnap();

    jest
      .spyOn(network, "getNetworkProvider")
      .mockImplementation((_apiUrl: string): any => ({
        url: _apiUrl,
        config: mockNetworkConfig,
        getNetworkConfig: async () => mockNetworkConfig,
        doGetGeneric: async (_path: string) => ({
          name: "TOKEN",
          identifier: "T-0",
          decimals: 18,
          type: "SemiFungibleESDT",
        }),
        getDefinitionOfFungibleToken: async (_identifier: string) => ({
          name: "TOKEN",
          identifier: "T-0",
          decimals: 18,
        }),
      }));

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

    const txUiInitial =
      (await response.getInterface()) as SnapConfirmationInterface;
    const serialInitial = serialiseUnknownContent(txUiInitial.content);
    expect(serialInitial).toContain("To");
    expect(serialInitial).toContain(
      "erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh"
    );
    expect(serialInitial).toContain("Send");
    expect(serialInitial).toContain("Fee");
    expect(serialInitial).toContain("Data");

    assert(txUiInitial.type == "confirmation");
    await txUiInitial.ok();

    const txUi2 = (await response.getInterface()) as SnapConfirmationInterface;
    const serial2 = serialiseUnknownContent(txUi2.content);
    expect(serial2).toContain("To");
    expect(serial2).toContain(
      "erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh"
    );
    expect(serial2).toContain("Send");
    expect(serial2).toContain("Fee");
    expect(serial2).toContain("Data");

    assert(txUi2.type == "confirmation");
    await txUi2.cancel();

    expect(await response).toRespondWithError({
      code: -32603,
      message: "All transactions must be approved by the user",
      stack: expect.any(String),
    });
  });

  it("User sign all transactions", async () => {
    const { request } = await installSnap();

    jest
      .spyOn(network, "getNetworkProvider")
      .mockImplementation((_apiUrl: string): any => ({
        url: _apiUrl,
        config: mockNetworkConfig,
        getNetworkConfig: async () => mockNetworkConfig,
        doGetGeneric: async (_path: string) => ({
          name: "TOKEN",
          identifier: "T-0",
          decimals: 18,
          type: "SemiFungibleESDT",
        }),
        getDefinitionOfFungibleToken: async (_identifier: string) => ({
          name: "TOKEN",
          identifier: "T-0",
          decimals: 18,
        }),
      }));

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

    const txUi3 = (await response.getInterface()) as SnapConfirmationInterface;
    const serial3 = serialiseUnknownContent(txUi3.content);
    expect(serial3).toContain("To");
    expect(serial3).toContain(
      "erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh"
    );
    expect(serial3).toContain("Send");
    expect(serial3).toContain("Fee");
    expect(serial3).toContain("Data");

    assert(txUi3.type == "confirmation");
    await txUi3.ok();

    const finalUi2 =
      (await response.getInterface()) as SnapConfirmationInterface;

    const finalSerial = serialiseUnknownContent(finalUi2.content);
    expect(finalSerial).toContain("To");
    expect(finalSerial).toContain(
      "erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh"
    );
    expect(finalSerial).toContain("Send");
    expect(finalSerial).toContain("xEGLD");
    expect(finalSerial).toContain("Fee");
    expect(finalSerial).toContain("Data");

    assert(finalUi2.type == "confirmation");
    await finalUi2.ok();

    expect(await response).toRespondWith([
      '{"nonce":1,"value":"1","receiver":"erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh","sender":"erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh","gasPrice":120000,"gasLimit":120000,"chainID":"D","version":1,"signature":"1e560e0a8d7b5251ed98ab67016f8513d5631a93e2a1273211acab47d18a48780b9b2f51dab53ddba1df6c311afb64845940a7c40d8e732af464ebf27a3a1b04"}',
      '{"nonce":2,"value":"2","receiver":"erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh","sender":"erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh","gasPrice":120000,"gasLimit":120000,"chainID":"D","version":1,"signature":"0a6304b7ffd8abde379432572567b9203e150482e028c7b568ab8b0cb603ba136f4a8bb6ba69ed5386c423fd77915fbfbd81e462bfb918c9808fa83b399a820d"}',
    ]);
  });
});
