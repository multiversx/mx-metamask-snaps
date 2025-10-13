import { NetworkType } from "./types/networkType";
import { networks } from "./constants";
import { ApiNetworkProvider } from "@multiversx/sdk-core/out/networkProviders/apiNetworkProvider";

export const getNetworkProvider = (apiUrl: string): ApiNetworkProvider => {
  if (!apiUrl.startsWith("https://")) {
    throw new Error("Insecure connection protocol");
  }

  try {
    const networkProvider = new ApiNetworkProvider(apiUrl);

    return networkProvider;
  } catch (error) {
    throw new Error("Failed to fetch network config");
  }
};

export const getNetworkType = (chainId: string): NetworkType | undefined => {
  return networks.find((network) => network.chainId === chainId);
};
