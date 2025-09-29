import { NetworkType } from "./types/networkType";
import { networks } from "./constants";
import type { INetworkConfig } from "@multiversx/sdk-core/out/core/interfaces";
import { ApiNetworkProvider } from "@multiversx/sdk-core/out/networkProviders/apiNetworkProvider";

export const getNetworkConfig = async (
  apiUrl: string
): Promise<INetworkConfig | undefined> => {
  if (!apiUrl.startsWith("https://")) {
    throw new Error("Insecure connection protocol");
  }

  try {
    const networkProvider = new ApiNetworkProvider(apiUrl);
    const networkConfig = await networkProvider.getNetworkConfig();

    return networkConfig;
  } catch (error) {
    throw new Error("Failed to fetch network config");
  }
};

export const getNetworkType = (chainId: string): NetworkType | undefined => {
  return networks.find((network) => network.chainId === chainId);
};
