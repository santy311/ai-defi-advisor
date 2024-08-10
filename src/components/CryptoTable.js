import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  Button,
  Flex,
  Text,
  Tabs,
  TabList,
  Tab,
} from "@chakra-ui/react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
);

function CryptoTable({ cryptoData, onCryptoSelect }) {
  const renderSparkline = (sparklineData) => {
    const data = {
      labels: sparklineData.map((_, index) => index),
      datasets: [
        {
          data: sparklineData,
          fill: false,
          borderColor:
            sparklineData[0] < sparklineData[sparklineData.length - 1]
              ? "green"
              : "red",
          tension: 0.1,
        },
      ],
    };
  };

  return (
    <>
      <Tabs>
        <TabList>
          <Tab>1D</Tab>
          <Tab>1W</Tab>
          <Tab>1M</Tab>
          <Tab>1Y</Tab>
          <Tab>5Y</Tab>
        </TabList>
      </Tabs>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th>Name</Th>
            <Th>Price</Th>
            <Th>1D Chart</Th>
            <Th>Change</Th>
            <Th>Market Cap</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {cryptoData.map((crypto, index) => (
            <Tr
              key={crypto.id}
              onClick={() => onCryptoSelect(crypto)}
              cursor="pointer"
              _hover={{ bg: "gray.100" }}
            >
              <Td>{index + 1}</Td>
              <Td>
                <Flex alignItems="center">
                  <Image
                    src={crypto.image}
                    alt={crypto.name}
                    boxSize="24px"
                    mr={2}
                  />
                  <Text fontWeight="bold">{crypto.name}</Text>
                  <Text ml={2} color="gray.500">
                    {crypto.symbol.toUpperCase()}
                  </Text>
                </Flex>
              </Td>
              <Td>€{crypto.current_price.toLocaleString()}</Td>
              <Td>{renderSparkline(crypto.sparkline_in_7d.price)}</Td>
              <Td
                color={
                  crypto.price_change_percentage_24h > 0
                    ? "green.500"
                    : "red.500"
                }
              >
                {crypto.price_change_percentage_24h.toFixed(2)}%
              </Td>
              <Td>€{crypto.market_cap.toLocaleString()}</Td>
              <Td>
                <Button colorScheme="purple">Buy/Sell</Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
}

export default CryptoTable;
