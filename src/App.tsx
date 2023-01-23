import React, { useState, useEffect } from 'react';
import Unknown from './assets/unknown.png';
import GenoProFile from './tools/geno/imp-genopro/GenoProFile';
import { FaBirthdayCake } from "react-icons/fa"
import {
  ChakraProvider,
  Box,
  Heading,
  Flex,
  Slide,
  Table,
  Tbody,
  Td,
  Tr,
  Th,
  Text,
  Spacer,
  IconButton,
  Spinner,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverCloseButton,
  Image,
  theme,
} from "@chakra-ui/react"
import { GenoDiagram } from "./components/GenoDiagram/GenoDiagram"
import Individual from './tools/geno/interface/Individual';

export const App = () => {
  const [ isIndividualDetailsOpen, setIndividualDetailsOpen ] = useState<boolean>(false);
  const [ isBirthdaysOpen, setBirthdaysOpen ] = useState<boolean>(false);
  const [ currentIndividual, setCurrentIndividual ] = useState<Individual>();
  const [ genoData ] = useState<GenoProFile>(new GenoProFile());
  const [ dataLoaded, setDataLoaded ] = useState<boolean>(false);

  const openDrawer = (individual : Individual) => {
    setIndividualDetailsOpen(true);
    setCurrentIndividual(individual);
  };


  useEffect(() => {
    genoData.loadXmlFromUrl('Data.xml')
      .then(() => {
        setDataLoaded(true);
      })
  }); 
  
  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="sm">
        <Flex minWidth="100vw" alignItems="center" position="fixed" direction="row">
          <Box p="2">
            <Heading size="md" color="teal.500">GenoView</Heading>
            <Text size="xs">iterative.engineering</Text>
          </Box>
          <Spacer />
          <Box>
            <IconButton
              size="md"
              fontSize="lg"
              color="white"
              colorScheme="cyan"
              marginLeft="2"
              onClick={() => setBirthdaysOpen(!isBirthdaysOpen)}
              icon={<FaBirthdayCake />}
              aria-label=""
              m="5px"
            />
          </Box>
        </Flex>
        <Flex h="100vh" alignItems="center" justifyContent="center">
          {
            dataLoaded ? (
              <GenoDiagram
                onIndividualClick={openDrawer}
                onCanvasClick={() => {
                  setIndividualDetailsOpen(false);
                  setBirthdaysOpen(false);
                }}
                data={genoData}
              />
            ) : (
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="teal.500"
                size="xl"
              />
            )
          }
          <Slide
            direction="left"
            in={isIndividualDetailsOpen}
            style={{ width: 'auto', height: '100vh' }}
          >
            <Box
              w="xs"
              p="10px"
              h="100vh"
              color="white"
              bg="teal.500"
              rounded="md"
              ml="-10px"
              pl="20px"
              overflowY="auto"
            >
              <Heading size="md">{ currentIndividual?.displayName }</Heading>
              <Image
                backgroundColor="teal.400"
                mt="15px"
                mb="10px"
                align="center"
                objectFit="cover"
                width="100%"
                height="450px"
                rounded="md"
                src={currentIndividual?.primaryPicture?.relativePath}
                fallbackSrc={Unknown}
                shadow="xl"
              />
              <Table>
                <Tbody>
                  <Tr hidden={!currentIndividual?.age}>
                    <Th color="white">Age</Th>
                    <Td>{currentIndividual?.age}</Td>
                  </Tr>
                  <Tr hidden={!currentIndividual?.birthDate}>
                    <Th color="white">Birth date</Th>
                    <Td>{currentIndividual?.birthDate}</Td>
                  </Tr>
                  <Tr hidden={!currentIndividual?.birthPlace}>
                    <Th color="white">Birth place</Th>
                    <Td>
                      <Popover>
                        <PopoverTrigger>
                          <span style={{ cursor: 'pointer' }}>{currentIndividual?.birthPlace}</span>
                        </PopoverTrigger>
                        <PopoverContent color="black">
                          <PopoverCloseButton />
                          <PopoverHeader>Wikipedia</PopoverHeader>
                          <PopoverBody>Should look for the place name in Wikipedia API</PopoverBody>
                          {/* https://en.wikipedia.org/api/rest_v1/page/summary/{page_title} */}
                        </PopoverContent>
                      </Popover>
                    </Td>
                  </Tr>
                  <Tr hidden={!currentIndividual?.deathDate}>
                    <Th color="white">Death date</Th>
                    <Td>{currentIndividual?.deathDate}</Td>
                  </Tr>
                  <Tr hidden={!currentIndividual?.deathPlace}>
                    <Th color="white">Death place</Th>
                    <Td>{currentIndividual?.deathPlace}</Td>
                  </Tr>
                  <Tr hidden={!currentIndividual?.occupation}>
                    <Th color="white">Occupation</Th>
                    <Td>{currentIndividual?.occupation}</Td>
                  </Tr>
                  <Tr hidden={!currentIndividual?.comment}>
                    <Th color="white">Comment</Th>
                    <Td>{currentIndividual?.comment}</Td>
                  </Tr>
                </Tbody>
              </Table>
            </Box>
          </Slide>
          <Slide
            direction="right"
            in={isBirthdaysOpen}
            style={{ width: 'auto', height: '100vh' }}
          >
            <Box
              w="xs"
              p="10px"
              h="100vh"
              color="white"
              bg="cyan.600"
              rounded="md"
              mr="-10px"
              pr="20px"
              overflowY="auto"
            >
              <Heading size="md">Birthdays</Heading>
              <Box>
                {/* Here you should display a list of birth dates  */}
              </Box>
            </Box>
          </Slide>
        </Flex>
      </Box>
    </ChakraProvider>
  );
}
