import { Box, Section, Text, Image, Divider } from "@metamask/snaps-sdk/jsx";
import {
  MultiSignTransactionType,
  TransactionDataTokenType,
} from "./types/transactions.types";
import { TransactionDetails } from "./TransactionDetails";
import { formatAmount } from "./operations";
import { INetworkProvider } from "@multiversx/sdk-core/out";
import { NetworkType } from "./types/networkType";
import { DECIMALS, EGLD_LOGO } from "./constants";
import { decodeBase64 } from "./utils/decoder/base64Utils";

interface TransactionSummaryProps {
  transactions: MultiSignTransactionType[];
  parsedTransactionsByDataField: Record<string, TransactionDataTokenType>;
  fees: string;
  networkType: NetworkType;
  networkProvider: INetworkProvider;
  tokenDetails: Record<string, any>;
}

export const TransactionsSummary = ({
  transactions,
  parsedTransactionsByDataField,
  fees,
  networkType,
  tokenDetails,
}: TransactionSummaryProps) => {
  return (
    <Box>
      {transactions.map((tx, index) => {
        const plainTransaction = tx.transaction.toPlainObject();
        const rawData = decodeBase64(plainTransaction.data ?? "");

        const multiTxTransaction = tx.multiTxData
          ? parsedTransactionsByDataField[tx.multiTxData]
          : null;

        const { decimals = DECIMALS, identifier } =
          tx.multiTxData && tokenDetails[tx.multiTxData]
            ? tokenDetails[tx.multiTxData]
            : {};

        const transactionAmount =
          multiTxTransaction?.amount || plainTransaction.value || 0;

        const txValue = formatAmount({
          input: String(transactionAmount),
          decimals,
          digits: 4,
          addCommas: true,
          showLastNonZeroDecimal: false,
        });

        const receiver =
          multiTxTransaction?.receiver ?? plainTransaction.receiver;
        const amount = `${txValue} ${identifier ?? networkType.egldLabel}`;
        const data = multiTxTransaction?.multiTxData ?? rawData;
        const isLastTransaction = transactions.length - 1 === index;

        return (
          <TransactionDetails
            chainId={networkType.chainId}
            receiver={receiver}
            amount={amount}
            rawData={data}
            isLast={isLastTransaction}
          />
        );
      })}

      <Divider />
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
