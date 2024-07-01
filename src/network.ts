import { NetworkType } from './types/networkType';
import { networks } from './constants';
import { NetworkConfig } from '@multiversx/sdk-network-providers/out';

export const getNetworkConfig = async (
  apiUrl: string,
): Promise<NetworkConfig | undefined> => {
  if (!apiUrl.startsWith('https://')) {
    throw new Error('Insecure connection protocol');
  }
  
  try {
    const response = await fetch(`${apiUrl}/network/config`);

    if (!response.ok) {
      throw new Error('Bad response from server');
    }

    const json = await response.json();
    return NetworkConfig.fromHttpResponse(json.data.config);
  } catch (error) {
    throw new Error('Failed to fetch network config');
  }
};

export const getNetworkType = (chainId: string): NetworkType | undefined => {
  return networks.find((network) => network.chainId === chainId);
};
