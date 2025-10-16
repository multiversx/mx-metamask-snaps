import { installSnap } from "@metamask/snaps-jest";
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

    jest
      .spyOn(network, "getNetworkProvider")
      .mockImplementation((_apiUrl: string): any => ({
        url: _apiUrl,
        config: mockNetworkConfig,
        getNetworkConfig: async () => mockNetworkConfig,
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
      origin: "https://localhost.multiversx.com",
      method: "mvx_signTransactions",
      params: {
        transactions: transactions,
      },
    });

    const uiResponse = await response.getInterface();
    const content = serialiseUnknownContent(uiResponse.content);

    expect(content).toContain("To");
    expect(content).toContain(
      "erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh"
    );
    expect(content).toContain("Send");
    expect(content).toContain("Fee");
    expect(content).toContain("Data");

    assert(uiResponse.type == "confirmation");
    await uiResponse.ok();

    expect(await response).toRespondWith([
      '{"nonce":1,"value":"1","receiver":"erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh","sender":"erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh","gasPrice":120000,"gasLimit":120000,"chainID":"D","version":1,"signature":"1e560e0a8d7b5251ed98ab67016f8513d5631a93e2a1273211acab47d18a48780b9b2f51dab53ddba1df6c311afb64845940a7c40d8e732af464ebf27a3a1b04"}',
    ]);
  });

  it("User signs and refuses a transaction", async () => {
    const { request } = await installSnap();

    jest
      .spyOn(network, "getNetworkProvider")
      .mockImplementation((_apiUrl: string): any => ({
        url: _apiUrl,
        config: mockNetworkConfig,
        getNetworkConfig: async () => mockNetworkConfig,
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
      origin: "https://localhost.multiversx.com",
      method: "mvx_signTransactions",
      params: {
        transactions: transactions,
      },
    });

    const firstTxUI = await response.getInterface();

    const firstTxContent = serialiseUnknownContent(firstTxUI.content);
    expect(firstTxContent).toContain("To");
    expect(firstTxContent).toContain(
      "erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh"
    );
    expect(firstTxContent).toContain("Send");
    expect(firstTxContent).toContain("Fee");
    expect(firstTxContent).toContain("Data");

    assert(firstTxUI.type == "confirmation");
    await firstTxUI.ok();

    const secondTxUI = await response.getInterface();

    const secondTxContent = serialiseUnknownContent(secondTxUI.content);
    expect(secondTxContent).toContain("To");
    expect(secondTxContent).toContain(
      "erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh"
    );
    expect(secondTxContent).toContain("Send");
    expect(secondTxContent).toContain("Fee");
    expect(secondTxContent).toContain("Data");

    assert(secondTxUI.type == "confirmation");
    await secondTxUI.cancel();

    expect(await response).toRespondWithError({
      code: -32603,
      message: "All transactions must be approved by the user",
      stack: expect.any(String),
    });
  });

  it("User signs all transactions", async () => {
    const { request } = await installSnap();

    jest
      .spyOn(network, "getNetworkProvider")
      .mockImplementation((_apiUrl: string): any => ({
        url: _apiUrl,
        config: mockNetworkConfig,
        getNetworkConfig: async () => mockNetworkConfig,
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
      origin: "https://localhost.multiversx.com",
      method: "mvx_signTransactions",
      params: {
        transactions: transactions,
      },
    });

    const firstTxUI = await response.getInterface();

    assert(firstTxUI.type == "confirmation");
    await firstTxUI.ok();

    const secondTxUI = await response.getInterface();

    assert(secondTxUI.type == "confirmation");
    await secondTxUI.ok();

    expect(await response).toRespondWith([
      '{"nonce":1,"value":"1","receiver":"erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh","sender":"erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh","gasPrice":120000,"gasLimit":120000,"chainID":"D","version":1,"signature":"1e560e0a8d7b5251ed98ab67016f8513d5631a93e2a1273211acab47d18a48780b9b2f51dab53ddba1df6c311afb64845940a7c40d8e732af464ebf27a3a1b04"}',
      '{"nonce":2,"value":"2","receiver":"erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh","sender":"erd1elfck5guq2akmdee9p6lwv6wa8cuf250fajmff99kpu3vhgcnjlqs8radh","gasPrice":120000,"gasLimit":120000,"chainID":"D","version":1,"signature":"0a6304b7ffd8abde379432572567b9203e150482e028c7b568ab8b0cb603ba136f4a8bb6ba69ed5386c423fd77915fbfbd81e462bfb918c9808fa83b399a820d"}',
    ]);
  });

  it("User signs a multi transfer transaction", async () => {
    const { request } = await installSnap();

    jest
      .spyOn(network, "getNetworkProvider")
      .mockImplementation((_apiUrl: string): any => ({
        url: _apiUrl,
        config: mockNetworkConfig,
        getNetworkConfig: async () => mockNetworkConfig,
      }));

    const multiTransferTx = {
      chainID: "D",
      //MultiESDTNFTTransfer@00000000000000000500debadd1870930dfc370948327750eb18738797882fe8@02@5745474c442d613238633539@@06f05b59d3b20000@555344432d333530633465@@0f4240
      data: "TXVsdGlFU0RUTkZUVHJhbnNmZXJAMDAwMDAwMDAwMDAwMDAwMDA1MDBkZWJhZGQxODcwOTMwZGZjMzcwOTQ4MzI3NzUwZWIxODczODc5Nzg4MmZlOEAwMkA1NzQ1NDc0YzQ0MmQ2MTMyMzg2MzM1MzlAQDA2ZjA1YjU5ZDNiMjAwMDBANTU1MzQ0NDMyZDMzMzUzMDYzMzQ2NUBAMGY0MjQw",
      gasLimit: 1493000,
      gasPrice: 1000000000,
      nonce: 0,
      receiver:
        "erd1xysfz4f7hkc4qchshzqky3d4pjet0geuxhgx6tlzt4thdz4m6euq63r83y",
      sender: "erd1xysfz4f7hkc4qchshzqky3d4pjet0geuxhgx6tlzt4thdz4m6euq63r83y",
      value: "0",
      version: 2,
    };

    const response = request({
      origin: "https://localhost.multiversx.com",
      method: "mvx_signTransactions",
      params: { transactions: [multiTransferTx] },
    });

    const uiResponse = await response.getInterface();
    const content = serialiseUnknownContent(uiResponse.content);

    expect(content).toContain("1 USDC-350c4e");
    expect(content).toContain("0.5 WEGLD-a28c59");
    // Check if two send fields exist
    const sendCount = (content.match(/Row label="Send"/g) || []).length;
    expect(sendCount).toBe(2);

    assert(uiResponse.type == "confirmation");
    await uiResponse.ok();

    const result = await response;
    expect(result).toBeDefined();
  });

  it("User signs a MetaESDT transfer transaction", async () => {
    const { request } = await installSnap();

    jest
      .spyOn(network, "getNetworkProvider")
      .mockImplementation((_apiUrl: string): any => ({
        url: _apiUrl,
        config: mockNetworkConfig,
        getNetworkConfig: async () => mockNetworkConfig,
      }));

    const metaEsdtTx = {
      chainID: "D",
      //ESDTTransfer@584d45582d383266326634@0de0b6b3a7640000
      data: "RVNEVFRyYW5zZmVyQDU4NGQ0NTU4MmQzODMyNjYzMjY2MzRAMGRlMGI2YjNhNzY0MDAwMA==",
      gasLimit: 428000,
      gasPrice: 1000000000,
      nonce: 0,
      receiver:
        "erd1xysfz4f7hkc4qchshzqky3d4pjet0geuxhgx6tlzt4thdz4m6euq63r83y",
      sender: "erd1xysfz4f7hkc4qchshzqky3d4pjet0geuxhgx6tlzt4thdz4m6euq63r83y",
      value: "0",
      version: 2,
    };

    const response = request({
      origin: "https://localhost.multiversx.com",
      method: "mvx_signTransactions",
      params: { transactions: [metaEsdtTx] },
    });

    const uiResponse = await response.getInterface();
    const content = serialiseUnknownContent(uiResponse.content);

    expect(content).toContain("1 XMEX-82f2f4");
    const sendCount = (content.match(/Row label="Send"/g) || []).length;
    expect(sendCount).toBe(1);

    assert(uiResponse.type == "confirmation");
    await uiResponse.ok();

    const result = await response;
    expect(result).toBeDefined();
  });

  it("User signs an SFT transfer transaction", async () => {
    const { request } = await installSnap();

    jest
      .spyOn(network, "getNetworkProvider")
      .mockImplementation((_apiUrl: string): any => ({
        url: _apiUrl,
        config: mockNetworkConfig,
        getNetworkConfig: async () => mockNetworkConfig,
      }));

    const sftTx = {
      chainID: "D",
      //ESDTTransfer@42554741545449532d6437653938352d3031@01
      data: "RVNEVFRyYW5zZmVyQDQyNTU0NzQxNTQ1NDQ5NTMyZDY0Mzc2NTM5MzgzNTJkMzAzMUAwMQ==",
      gasLimit: 428000,
      gasPrice: 1000000000,
      nonce: 0,
      receiver:
        "erd1xysfz4f7hkc4qchshzqky3d4pjet0geuxhgx6tlzt4thdz4m6euq63r83y",
      sender: "erd1xysfz4f7hkc4qchshzqky3d4pjet0geuxhgx6tlzt4thdz4m6euq63r83y",
      value: "0",
      version: 2,
    };

    const response = request({
      origin: "https://localhost.multiversx.com",
      method: "mvx_signTransactions",
      params: { transactions: [sftTx] },
    });

    const uiResponse = await response.getInterface();
    const content = serialiseUnknownContent(uiResponse.content);

    expect(content).toContain("1 BUGATTIS-d7e985-01");
    expect(content).toContain("SFT");

    assert(uiResponse.type == "confirmation");
    await uiResponse.ok();

    const result = await response;
    expect(result).toBeDefined();
  });

  it("User signs an NFT transfer transaction", async () => {
    const { request } = await installSnap();

    jest
      .spyOn(network, "getNetworkProvider")
      .mockImplementation((_apiUrl: string): any => ({
        url: _apiUrl,
        config: mockNetworkConfig,
        getNetworkConfig: async () => mockNetworkConfig,
      }));

    const nftTx = {
      chainID: "D",
      //ESDTTransfer@44524b2d3365313439382d3036@01
      data: "RVNEVFRyYW5zZmVyQDQ0NTI0YjJkMzM2NTMxMzQzOTM4MmQzMDM2QDAx",
      gasLimit: 413000,
      gasPrice: 1000000000,
      nonce: 0,
      receiver:
        "erd1xysfz4f7hkc4qchshzqky3d4pjet0geuxhgx6tlzt4thdz4m6euq63r83y",
      sender: "erd1xysfz4f7hkc4qchshzqky3d4pjet0geuxhgx6tlzt4thdz4m6euq63r83y",
      value: "0",
      version: 2,
    };

    const response = request({
      origin: "https://localhost.multiversx.com",
      method: "mvx_signTransactions",
      params: { transactions: [nftTx] },
    });

    const uiResponse = await response.getInterface();
    const content = serialiseUnknownContent(uiResponse.content);

    expect(content).toContain("1 DRK-3e1498-06");
    expect(content).toContain("NFT");

    assert(uiResponse.type == "confirmation");
    await uiResponse.ok();

    const result = await response;
    expect(result).toBeDefined();
  });
});
