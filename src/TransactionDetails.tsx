import {
  Box,
  Text,
  Copyable,
  Row,
  Value,
  Address,
  Divider,
} from "@metamask/snaps-sdk/jsx";

interface TransactionDetailsProps {
  receiver: string;
  amount: string;
  rawData: string;
  isLast: boolean;
  identifier?: string;
  chainId: string;
}

export const TransactionDetails = ({
  receiver,
  amount,
  rawData,
  isLast,
  chainId,
}: TransactionDetailsProps) => {
  console.log({ receiver });
  return (
    <Box>
      <Row label="To">
        <Address address={`mvx:${chainId}:${receiver}`} />
      </Row>

      <Row label="Amount">
        <Value value={amount} extra="" />
      </Row>

      <Text>Data</Text>
      <Copyable value={rawData} />

      {!isLast && <Divider />}
    </Box>
  );
};
