import { NetworkType } from "./types/networkType";

export const DECIMALS = 18;
export const DIGITS = 2;
export const ZERO = "0";
export const EGLD_LOGO =
  '<svg width="20" height="20" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="300" rx="150" fill="black"></rect><path d="M158.482 149.928L228.714 112.529L216.919 90L152.575 115.854C150.923 116.523 149.077 116.523 147.425 115.854L83.0814 90L71.25 112.602L141.482 150L71.25 187.398L83.0814 210L147.425 183.948C149.077 183.279 150.923 183.279 152.575 183.948L216.919 209.874L228.75 187.272L158.482 149.928Z" fill="#23F7DD"></path></svg>';

export const networks: NetworkType[] = [
  {
    id: "testnet",
    name: "Testnet",
    chainId: "T",
    egldLabel: "xEGLD",
    apiAddress: "https://testnet-api.multiversx.com",
  },
  {
    id: "devnet",
    name: "Devnet",
    chainId: "D",
    egldLabel: "xEGLD",
    apiAddress: "https://devnet-api.multiversx.com",
  },
  {
    id: "mainnet",
    name: "Mainnet",
    chainId: "1",
    egldLabel: "EGLD",
    apiAddress: "https://api.multiversx.com",
  },
];
