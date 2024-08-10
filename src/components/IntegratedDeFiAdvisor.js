import React, { useState, useEffect } from "react";
import axios from "axios";
import detectEthereumProvider from "@metamask/detect-provider";
import { ethers } from "ethers"; // Make sure to import ethers
import InvestModal from "./InvestModal";

import {
  Box,
  Flex,
  Grid,
  GridItem,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
} from "@chakra-ui/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register the necessary components with Chart.js
ChartJS.register(
  CategoryScale, // Register the category scale for x-axis
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const provider = new ethers.providers.Web3Provider(window.ethereum);

function IntegratedDeFiAdvisor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [cryptoData, setCryptoData] = useState([]);
  const [portfolio, setPortfolio] = useState({});
  const [totalValue, setTotalValue] = useState(0);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [riskFactor, setRiskFactor] = useState("Low");
  const [news, setNews] = useState([]);
  const [whaleAlerts, setWhaleAlerts] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [selectedToken, setSelectedToken] = useState("");
  const toast = useToast();

  const contractAddress = "0x2331fb827792879D21e11f7e13bA0d57391393D5";

  useEffect(() => {
    fetchCryptoData();
    addWelcomeMessage();
    checkWalletConnection();
    fetchDefaultNews();
  }, []);

  useEffect(() => {
    if (selectedToken) {
      fetchTokenNews();
      fetchWhaleAlerts();
      fetchPriceHistory();
    }
  }, [selectedToken]);

  useEffect(() => {
    const connectWalletOnLoad = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const accounts = await ethersProvider.listAccounts();
        if (accounts.length > 0) {
          setIsWalletConnected(true);
          setAccount(accounts[0]);
          fetchAndUpdateBalance(accounts[0], ethersProvider);
        }
      }
    };
    connectWalletOnLoad();
  }, []);

  useEffect(() => {
    let intervalId;
    if (isWalletConnected) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      intervalId = setInterval(() => {
        fetchAndUpdateBalance(account, provider);
      }, 5000); // Runs every 5 seconds
    }

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [isWalletConnected, account]);

  const fetchAndUpdateBalance = async (address, provider) => {
    try {
      const balance = await provider.getBalance(address);
      const balanceInEth = ethers.utils.formatEther(balance);
      setPortfolio({ ETH: parseFloat(balanceInEth) });
      updateTotalValue(parseFloat(balanceInEth));
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const fetchCryptoData = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/crypto-data");
      setCryptoData(response.data);
    } catch (error) {
      console.error("Error fetching crypto data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch cryptocurrency data.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const addWelcomeMessage = () => {
    setMessages([
      {
        text: "Welcome to your DeFi Advisor! How can I assist you today?",
        sender: "ai",
      },
      {
        text: "You can ask me about DeFi strategies or connect your wallet to view your portfolio.",
        sender: "ai",
      },
    ]);
  };

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = { text: input, sender: "user" };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      try {
        const response = await axios.post("http://localhost:3000/api/chat", {
          message: input,
        });
        const { intent, response: userResponse } = response.data;

        if (intent.token) {
          setSelectedToken(intent.token.toLowerCase());
        }

        const aiMessage = { text: userResponse, sender: "ai" };
        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        console.error("Error calling AI API:", error);
        toast({
          title: "Error",
          description: "Failed to get AI response. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setIsWalletConnected(true);
          setAccount(accounts[0]);
          fetchWalletBalance(accounts[0]);
        } else {
          setIsWalletConnected(false);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
        setIsWalletConnected(false);
      }
    }
  };

  const connectWallet = async () => {
    const provider = await detectEthereumProvider();

    if (provider) {
      try {
        await provider.request({ method: "eth_requestAccounts" });
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        const signer = ethersProvider.getSigner();
        const accountAddress = await signer.getAddress();
        setIsWalletConnected(true);
        setAccount(accountAddress);
        fetchWalletBalance(accountAddress, ethersProvider);
        toast({
          title: "Wallet Connected",
          description: "Your MetaMask wallet has been successfully connected.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
        toast({
          title: "Connection Failed",
          description: "Failed to connect to MetaMask. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to use this feature.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchWalletBalance = async (address, provider) => {
    try {
      const balance = await provider.getBalance(address);
      const balanceInEth = ethers.utils.formatEther(balance);
      setPortfolio({ ETH: parseFloat(balanceInEth) });
      updateTotalValue(parseFloat(balanceInEth));
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const updateTotalValue = (ethBalance) => {
    const ethPrice = 1800; // For example, using a static value for ETH price in EUR
    setTotalValue(ethBalance * ethPrice);
    calculateRiskFactor();
  };

  const calculateRiskFactor = () => {
    let riskLevel = "Low";

    if (news.length > 0) {
      const negativeSentimentArticles = news.filter(
        (article) =>
          article.title.includes("crash") ||
          article.title.includes("fall") ||
          article.title.includes("risk") ||
          article.description.includes("bearish")
      );

      if (negativeSentimentArticles.length > 0) {
        riskLevel = "Medium";
      }
    }

    if (whaleAlerts.length > 0) {
      if (whaleAlerts.length > 10) {
        riskLevel = "High";
      } else if (riskLevel !== "High") {
        riskLevel = "Medium";
      }
    }

    setRiskFactor(riskLevel);
  };

  const fetchDefaultNews = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/news/ethereum"
      );
      setNews(response.data);
    } catch (error) {
      console.error("Error fetching default news:", error);
    }
  };

  const fetchTokenNews = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/news/${selectedToken}`
      );
      setNews(response.data);
      calculateRiskFactor();
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  const fetchWhaleAlerts = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/whale-alerts/${selectedToken}`
      );
      setWhaleAlerts(response.data.transactions);
      calculateRiskFactor();
    } catch (error) {
      console.error("Error fetching whale alerts:", error);
    }
  };

  const fetchPriceHistory = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/price-history/${selectedToken}`
      );
      setPriceHistory(response.data);
    } catch (error) {
      console.error("Error fetching price history:", error);
    }
  };

  return (
    <Box p={4} bg="gray.900">
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="lg" color="white">
          Defidvisor
        </Heading>
        <Button
          onClick={connectWallet}
          colorScheme="teal"
          isDisabled={isWalletConnected}
        >
          {isWalletConnected ? "Wallet Connected" : "Connect MetaMask"}
        </Button>
      </Flex>

      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <GridItem colSpan={1}>
          <VStack spacing={4} align="stretch" height="calc(100vh - 100px)">
            <Heading size="md" color="white">
              AI Advisor Chat
            </Heading>
            <Box
              flex={1}
              overflowY="auto"
              bg="gray.700"
              p={3}
              borderRadius="md"
              borderWidth="1px"
              borderColor="gray.600"
            >
              {messages.map((msg, index) => (
                <Text
                  key={index}
                  bg={msg.sender === "user" ? "blue.600" : "green.600"}
                  color="white"
                  p={2}
                  borderRadius="md"
                  my={1}
                >
                  {msg.text}
                </Text>
              ))}
            </Box>
            <HStack>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about DeFi investments..."
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                bg="gray.800"
                color="white"
                _placeholder={{ color: "gray.400" }}
              />
              <Button onClick={handleSend} colorScheme="blue">
                Send
              </Button>
            </HStack>
          </VStack>
        </GridItem>

        <GridItem colSpan={1}>
          <VStack spacing={4} align="stretch" height="calc(100vh - 100px)">
            <Heading size="md" color="white">
              Portfolio Overview
            </Heading>
            {isWalletConnected || Object.keys(portfolio).length > 0 ? (
              <>
                <Stat>
                  <StatLabel color="gray.400">Connected Wallet</StatLabel>
                  <StatNumber color="white">
                    {account
                      ? `${account.slice(0, 6)}...${account.slice(-4)}`
                      : "Simulated Portfolio"}
                  </StatNumber>
                </Stat>
                <Table variant="simple" size="sm" colorScheme="whiteAlpha">
                  <Thead>
                    <Tr>
                      <Th color="gray.400">Asset</Th>
                      <Th color="gray.400">Balance</Th>
                      <Th color="gray.400">Value (EUR)</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.keys(portfolio).length > 0 &&
                    cryptoData.length > 0 ? (
                      Object.keys(portfolio).map((asset, index) => {
                        const crypto = cryptoData.find(
                          (crypto) =>
                            crypto.symbol.toLowerCase() === asset.toLowerCase()
                        );
                        const balance = portfolio[asset];
                        const value = crypto
                          ? (balance * crypto.current_price).toFixed(2)
                          : 0;

                        return (
                          <Tr key={index}>
                            <Td color="white">{asset.toUpperCase()}</Td>
                            <Td color="white">{balance?.toFixed(4) || 0}</Td>
                            <Td color="white">€{value}</Td>
                          </Tr>
                        );
                      })
                    ) : (
                      <Tr>
                        <Td color="white" colSpan="3">
                          No data available
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
                <Stat>
                  <StatLabel color="gray.400">Total Portfolio Value</StatLabel>
                  <StatNumber color="white">
                    €{totalValue.toFixed(2)}
                  </StatNumber>
                  <StatHelpText color="gray.400">
                    <StatArrow type="increase" />
                    {(totalValue * 0.05).toFixed(2)} (Estimated 5% Monthly
                    Growth)
                  </StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel color="gray.400">Risk Factor</StatLabel>
                  <Progress
                    value={
                      riskFactor === "Low"
                        ? 20
                        : riskFactor === "Medium"
                        ? 50
                        : 80
                    }
                    colorScheme={
                      riskFactor === "Low"
                        ? "green"
                        : riskFactor === "Medium"
                        ? "yellow"
                        : "red"
                    }
                    size="sm"
                  />
                  <StatHelpText color="gray.400">
                    {riskFactor} Risk
                  </StatHelpText>
                </Stat>

                <InvestModal
                  contractAddress={contractAddress}
                  provider={provider}
                />
                {priceHistory.length > 0 && (
                  <Box
                    bg="gray.700"
                    p={3}
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="gray.600"
                    minHeight={400}
                    maxHeight="350px"
                    overflowY="auto"
                  >
                    <Heading size="md" color="white" mt={4}>
                      Price History
                    </Heading>
                    <Line
                      data={{
                        labels: priceHistory.map((point) =>
                          new Date(point[0]).toLocaleDateString()
                        ),
                        datasets: [
                          {
                            label: `${selectedToken.toUpperCase()} Price (EUR)`,
                            data: priceHistory.map((point) => point[1]),
                            fill: false,
                            borderColor: "rgb(75, 192, 192)",
                            tension: 0.1,
                          },
                        ],
                      }}
                    />
                  </Box>
                )}

                <Heading size="md" mt={4} color="white">
                  Relevant News
                </Heading>
                <Box
                  bg="gray.700"
                  p={3}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="gray.600"
                  minHeight={200}
                  maxHeight="350px"
                  overflowY="auto"
                >
                  {news.map((article, index) => (
                    <Box key={index} my={2}>
                      <Text fontWeight="bold" color="white">
                        {article.title}
                      </Text>
                      <Text fontSize="sm" color="gray.400">
                        {article.source.name} -{" "}
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </Text>
                      <Text color="gray.300">{article.description}</Text>
                    </Box>
                  ))}
                </Box>

                <Heading size="md" mt={4} color="white">
                  Whale Alerts
                </Heading>
                <Box
                  bg="gray.700"
                  p={3}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="gray.600"
                  color="white"
                >
                  {whaleAlerts.length > 0 ? (
                    whaleAlerts.map((alert, index) => (
                      <Box key={index} my={2}>
                        <Text fontWeight="bold" color="white">
                          Transaction Hash: {alert.hash}
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                          From: {alert.from} to {alert.to}
                        </Text>
                        <Text color="gray.300">Amount: {alert.value} ETH</Text>
                        <Text fontSize="sm" color="gray.500">
                          Timestamp:{" "}
                          {new Date(alert.timestamp * 1000).toLocaleString()}
                        </Text>
                      </Box>
                    ))
                  ) : (
                    <Text color="gray.400">
                      No whale alerts found for {selectedToken.toUpperCase()}.
                    </Text>
                  )}
                </Box>
              </>
            ) : (
              <Text color="gray.400">
                Connect your MetaMask wallet or simulate a portfolio to view
                your holdings.
              </Text>
            )}
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  );
}

export default IntegratedDeFiAdvisor;
