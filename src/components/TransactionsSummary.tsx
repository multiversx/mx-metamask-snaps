import { Box, Section, Text, Image } from "@metamask/snaps-sdk/jsx";

import { TransactionDetails } from "./TransactionDetails";
import { INetworkProvider } from "@multiversx/sdk-core/out";
import { NetworkType } from "../types/networkType";
import { DECIMALS, EGLD_LOGO } from "../constants";
import { SnapTransactionType } from "../types/transactions.types";

interface TransactionSummaryProps {
  transactions: SnapTransactionType[];
  fees: string;
  networkType: NetworkType;
  networkProvider: INetworkProvider;
}

export const TransactionsSummary = ({
  transactions,
  fees,
  networkType,
}: TransactionSummaryProps) => {
  return (
    <Box>
      {transactions.map((tx, index) => {
        const isLastTransaction = transactions.length - 1 === index;

        return (
          <TransactionDetails
            chainId={networkType.chainId}
            receiver={tx.receiver}
            value={tx.value}
            rawData={tx.data}
            method={tx.method}
            isLast={isLastTransaction}
            type={tx.type}
            identifier={tx.identifier}
            decimals={tx.decimals ?? DECIMALS}
            egldLabel={networkType.egldLabel}
          />
        );
      })}

      <Text>Fee</Text>
      <Section direction="horizontal" alignment="space-between">
        <Text>
          {fees} {networkType.egldLabel}
        </Text>
        <Image src={EGLD_LOGO} alt="EGLD Logo" />
      </Section>
    </Box>
  );
};
