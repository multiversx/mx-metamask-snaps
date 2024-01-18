import { fallbackNetworkConfigurations } from "../constants/network";
import { EnvironmentsEnum } from "../types/enums.types";

export const getNetwork = () => {
  return fallbackNetworkConfigurations[EnvironmentsEnum.devnet];
};