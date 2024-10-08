import React from "react";
import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import { IDKitWidget } from "@worldcoin/idkit";
import { useNavigate } from "react-router-dom";

function IDKitVerification() {
  const navigate = useNavigate();

  const handleSuccess = (result) => {
    console.log("Verification successful:", result);

    navigate("/");
  };

  const handleError = (error) => {
    console.log("Error:", error);
    // Handle any errors that occur
  };

  return (
    <Box
      d="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgGradient="linear(to-r, teal.400, blue.500)"
      color="white"
    >
      <VStack spacing={10} maxW="md" mx="auto" textAlign="center">
        <Heading as="h1" size="xl"></Heading>
        <Heading as="h1" size="xl"></Heading>
        <Heading as="h1" size="xl"></Heading>
        <Heading as="h1" size="xl"></Heading>
        <Heading as="h1" size="xl"></Heading>
        <Heading as="h1" size="xl"></Heading>
        <Heading as="h1" size="xl"></Heading>
        <Heading as="h1" size="xl"></Heading>
        <Heading as="h1" size="xl"></Heading>
        <Heading as="h1" size="xl">
          Defidvisor ID Verification
        </Heading>
        <Text fontSize="lg" maxW="sm">
          Securely verify your identity with World ID to access exclusive
          features of our DeFi platform.
        </Text>
        <IDKitWidget
          app_id="app_staging_9fca8326d13d278cca10590318aec952"
          action="DeF"
          signal="user_vote"
          onSuccess={handleSuccess}
          onError={handleError}
          verification_level="device"
        >
          {({ open }) => (
            <Button
              colorScheme="teal"
              size="lg"
              onClick={open}
              _hover={{ bg: "teal.600" }}
              boxShadow="lg"
            >
              Verify with World ID
            </Button>
          )}
        </IDKitWidget>
      </VStack>
    </Box>
  );
}

export default IDKitVerification;
