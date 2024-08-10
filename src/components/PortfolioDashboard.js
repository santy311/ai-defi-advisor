import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, VStack, Heading, Select } from "@chakra-ui/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import CryptoTable from "./CryptoTable";

function PortfolioDashboard() {
  const [historicalData, setHistoricalData] = useState([]);
  const [timeRange, setTimeRange] = useState("30"); // Default to 30 days

  useEffect(() => {
    fetchHistoricalData(timeRange);
  }, [timeRange]);

  const fetchHistoricalData = async (days) => {
    try {
      const response = await axios.get(
        `https://min-api.cryptocompare.com/data/v2/histoday`,
        {
          params: {
            fsym: "ETH",
            tsym: "USD",
            limit: days,
            aggregate: 1,
          },
        }
      );
      const data = response.data.Data.Data.map((item) => ({
        date: new Date(item.time * 1000).toISOString().split("T")[0],
        value: item.close,
      }));
      setHistoricalData(data);
    } catch (error) {
      console.error("Error fetching historical data:", error);
    }
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  return (
    <Box p={4} maxWidth="1200px" margin="auto">
      <VStack spacing={6} align="stretch">
        <Heading as="h2" size="xl">
          ETH Price History
        </Heading>

        <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
          <Heading size="md" mb={4}>
            Historical ETH Performance
          </Heading>
          <Select value={timeRange} onChange={handleTimeRangeChange} mb={4}>
            <option value="7">1 Week</option>
            <option value="30">1 Month</option>
            <option value="90">3 Months</option>
            <option value="365">1 Year</option>
          </Select>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
                interval={Math.ceil(historicalData.length / 7)}
              />
              <YAxis domain={["auto", "auto"]} />
              <Tooltip
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                formatter={(value) => [`$${value.toFixed(2)}`, "Price"]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
          <Heading size="md" mb={4}>
            Top Cryptocurrencies
          </Heading>
          <CryptoTable />
        </Box>
      </VStack>
    </Box>
  );
}

export default PortfolioDashboard;
