export interface BaseNetworkType {
    id: string;
    chainId: string;
    name: string;
    egldLabel: string;
    decimals: string;
    digits: string;
    gasPerDataByte: string;
    walletConnectDeepLink: string;
    walletAddress: string;
    apiAddress: string;
    explorerAddress: string;
    apiTimeout: string;
    walletConnectV2ProjectId?: string;
    walletConnectV2Options?: Record<string, any>;
}
  
  
export interface NetworkType extends BaseNetworkType {
  walletConnectBridgeAddresses: string[];
  walletConnectV2RelayAddresses: string[];
}