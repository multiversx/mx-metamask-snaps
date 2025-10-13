import {
  Box,
  Text,
  Copyable,
  Row,
  Value,
  Address,
  Divider,
} from "@metamask/snaps-sdk/jsx";
import { NftEnum } from "./types/nft.types";
import { formatAmount } from "./operations/formatAmount";

type TransactionDetailsType = {
  receiver: string;
  value?: string | undefined;
  rawData: string;
  isLast: boolean;
  identifier?: string | undefined;
  chainId: string;
  method?: string;
  type?: NftEnum | undefined;
  decimals: number;
  egldLabel: string;
};

export const TransactionDetails = ({
  receiver,
  value,
  rawData,
  isLast,
  chainId,
  method,
  type,
  identifier,
  decimals,
  egldLabel,
}: TransactionDetailsType) => {
  const isNft = type ? [NftEnum.SFT, NftEnum.NFT].includes(type) : false;

  const txValue = isNft
    ? value
    : formatAmount({
        input: String(value),
        decimals,
        digits: 4,
        addCommas: true,
        showLastNonZeroDecimal: false,
      });

  const amount = `${txValue} ${identifier ?? egldLabel}`;

  return (
    <Box>
      <Row label="To">
        <Address address={`mvx:${chainId}:${receiver}`} />
      </Row>

      {method ? (
        <Row label="Method">
          <Value value={method} extra="" />
        </Row>
      ) : null}

      <Row label="Send">
        <Value value={amount} extra="" />
      </Row>

      {type ? (
        <Row label="Type">
          <Value value={type} extra="" />
        </Row>
      ) : null}

      <Text>Data</Text>
      <Copyable value={rawData} />

      {!isLast && <Divider />}
    </Box>
  );
};
