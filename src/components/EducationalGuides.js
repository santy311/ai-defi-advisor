import React from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";

function EducationalGuides() {
  const guides = [
    {
      title: "What is DeFi?",
      content: "DeFi stands for Decentralized Finance...",
    },
    {
      title: "Understanding Yield Farming",
      content: "Yield farming is a way to...",
    },
    {
      title: "Risks in DeFi",
      content: "While DeFi offers many opportunities...",
    },
  ];

  return (
    <Box p={4}>
      <VStack spacing={6} align="stretch">
        <Heading as="h2" size="xl">
          DeFi Learning Center
        </Heading>
        <Text>Expand your knowledge about DeFi concepts and strategies.</Text>
        <Accordion allowMultiple>
          {guides.map((guide, index) => (
            <AccordionItem key={index}>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    {guide.title}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>{guide.content}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </VStack>
    </Box>
  );
}

export default EducationalGuides;
