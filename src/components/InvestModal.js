import React, { useState } from "react";
import { ethers } from "ethers";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  useDisclosure,
  useToast,
  Box,
} from "@chakra-ui/react";

const InvestModal = ({ contractAddress, provider }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleInvest = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid investment amount.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        [
          // ABI for the contract
          "function invest() public payable",
        ],
        signer
      );

      const tx = await contract.invest({
        value: ethers.utils.parseEther(amount),
      });

      await tx.wait();
      toast({
        title: "Investment Successful",
        description: `You have invested ${amount} ETH.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      console.error("Error during investment:", error);
      toast({
        title: "Investment Failed",
        description:
          "There was an issue with your investment. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    setLoading(false);
  };

  return (
    <Box>
      <Button onClick={onOpen} colorScheme="teal">
        Invest
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invest in DeFi</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Enter amount in ETH"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
            />
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleInvest}
              isLoading={loading}
            >
              Invest
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default InvestModal;
