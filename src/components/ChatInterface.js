import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Input,
  Button,
  Text,
  Flex,
  useToast,
  Select,
  Badge,
} from "@chakra-ui/react";
import axios from "axios";

function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const toast = useToast();

  const defiTopics = [
    "Yield Farming",
    "Liquidity Pools",
    "Stablecoins",
    "DEXs",
    "Lending Protocols",
    "NFTs in DeFi",
    "Governance Tokens",
    "Risk Management",
  ];

  useEffect(() => {
    // Add a welcome message when the component mounts
    setMessages([
      {
        text: "Welcome to the DeFi Investment Advisor! How can I assist you today?",
        sender: "ai",
      },
    ]);
  }, []);

  const handleSend = async () => {
    if (input.trim() || selectedTopic) {
      let message = input.trim();
      if (selectedTopic) {
        message = `${message} ${
          message ? "Also, c" : "C"
        }an you provide information about ${selectedTopic} in DeFi?`;
      }

      const userMessage = { text: message, sender: "user" };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput("");
      setSelectedTopic("");
      setIsLoading(true);

      try {
        const response = await axios.post("/api/chat", { message });
        const aiMessage = { text: response.data.reply, sender: "ai" };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } catch (error) {
        console.error("Error calling API:", error);
        toast({
          title: "Error",
          description: "Failed to get response from AI. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Box p={4} maxWidth="800px" margin="auto">
      <VStack spacing={4} align="stretch" h="80vh">
        <Box flex={1} overflowY="auto" bg="gray.100" p={3} borderRadius="md">
          {messages.map((msg, index) => (
            <Flex
              key={index}
              justifyContent={msg.sender === "user" ? "flex-end" : "flex-start"}
            >
              <Box
                bg={msg.sender === "user" ? "blue.100" : "green.100"}
                p={2}
                borderRadius="md"
                maxWidth="70%"
                my={1}
              >
                <Badge
                  mb={1}
                  colorScheme={msg.sender === "user" ? "blue" : "green"}
                >
                  {msg.sender === "user" ? "You" : "Advisor"}
                </Badge>
                <Text>{msg.text}</Text>
              </Box>
            </Flex>
          ))}
        </Box>
        <Select
          placeholder="Select a DeFi topic"
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
        >
          {defiTopics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </Select>
        <Flex>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about DeFi investments..."
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <Button onClick={handleSend} ml={2} isLoading={isLoading}>
            Send
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}

export default ChatInterface;
