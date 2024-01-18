import BigNumber from "bignumber.js";

export const getAmountPrice = (amount: number | undefined) => {
    if (amount !== undefined) {
      return new BigNumber(amount).shiftedBy(-18).toFixed(6);
    }
    return '';
};