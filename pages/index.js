'use client'
import {
  Container, Input, Button, VStack, Flex, Heading, Text, Stack, HStack,
  Textarea, Box, Select, FormControl, FormLabel, useToast, Spinner,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton
} from '@chakra-ui/react'
import { ArrowForwardIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import { useEffect } from 'react'

export default function ContentScheduler() {

  const toast = useToast()
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [title, setTitle] = useState('');
  const [scheduledThreads, setScheduledThreads] = useState([]);
  const [frequency, setFrequency] = useState('6');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // user management
  const [users, setUsers] = useState([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserToken, setNewUserToken] = useState('');
  const [activeUserToken, setActiveUserToken] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoadingThreads(true);
      const res = await fetch('/api/schedule', { method: 'GET', headers: { 'Content-Type': 'application/json', 'x-api-key': activeUserToken } });
      setLoadingThreads(false);
      const threads = await res.json();
      threads.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
      setScheduledThreads(threads);
    }

    let userData = []
    if (typeof window !== 'undefined') {
      // Perform localStorage action
      userData = localStorage.getItem('users')
      setUsers(JSON.parse(userData) || []);

      // fetch active user
      let localStoredActiveUser = localStorage.getItem('activeUser');
      if (localStoredActiveUser) {
        setActiveUserToken(JSON.parse(localStoredActiveUser));
      }
    }

    if (activeUserToken) {
      fetchData();
    }
  }, [activeUserToken])

  const onRephraseClick = async () => {
    setTitle('Generating title...');
    setSummary('Summarizing...');

    const res = await fetch('/api/summarize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: url }) });
    const data = await res.json();

    console.log(data);
    if (data.summary) {
      setTitle(data.title);
      setSummary(data.summary);
    } else {
      setSummary('Error while summarizing');
    }
  }

  const onClickSchedule = async () => {
    if (!title || !summary) {
      toast({
        title: 'Error!',
        description: "Need title and summary to post.",
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!activeUserToken) {
      toast({
        title: 'Error!',
        description: "Add/select a user for posting.",
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const latestScheduledThread = scheduledThreads[scheduledThreads.length - 1];
    const latestScheduledAt = new Date(latestScheduledThread.scheduledAt);
    const randomMinutes = Math.floor(Math.random() * 60);
    const nextScheduledAt = new Date(latestScheduledAt.getTime() + Number(frequency) * 60 * 60 * 1000 + randomMinutes * 60 * 1000);
    const res = await fetch('/api/schedule', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': activeUserToken }, body: JSON.stringify({ title, summary, time: nextScheduledAt.toISOString() }) });

    if (res.status === 200) {
      toast({
        title: 'Success!',
        description: "The thread is scheduled successfully.",
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // clear fields
      setTitle('');
      setSummary('');

      // get fresh scheduled threads
      console.log('fetching fresh threads');

      await new Promise((res, rej) => setTimeout(() => { res() }, 1000))
      setLoadingThreads(true);
      const newResponse = await fetch('/api/schedule', { method: 'GET', headers: { 'Content-Type': 'application/json', 'x-api-key': activeUserToken } });
      setLoadingThreads(false);
      const threads = await newResponse.json();
      threads.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
      setScheduledThreads(threads);
      console.log('new thread list set: ', threads);
    }
  }

  const onUserSelect = (e) => {
    if (e.target.value === 'addUser') {
      setIsModalOpen(true);
    } else {
      setActiveUserToken(e.target.value);
      localStorage.setItem('activeUser', JSON.stringify(e.target.value));
    }
  }

  const onAddUserClick = () => {
    const newUser = { name: newUserName, token: newUserToken };
    const newUsers = [...users, newUser];
    setUsers(newUsers);
    if (typeof window !== 'undefined') {
      localStorage.setItem('users', JSON.stringify(newUsers));
    }

    toast({
      title: 'Success!',
      description: "User added successfully.",
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    setIsModalOpen(false);
  }

  console.log('active user', activeUserToken);
  return (
    <Container maxW={'5xl'} py={6}>
      <Heading as='h2' size='3xl' my="4" >Thread scheduler</Heading>
      <Flex gap={8}>
        <Flex flexGrow={1} direction='column' flexBasis={1} p={2}>
          <HStack spacing={2} mb={4}>
            <Input placeholder='Link to content' size='md' onChange={e => setUrl(e.target.value)} />
            <Button colorScheme='blue' variant='outline' onClick={onRephraseClick}>Rephrase</Button>
          </HStack>
          <FormControl>
            <FormLabel>Title</FormLabel>
            <Textarea placeholder='Title' mb={4} value={title} onChange={e => setTitle(e.target.value)} />
          </FormControl>
          <FormControl>
            <FormLabel>Message</FormLabel>
            <Textarea placeholder='Rephrased content' minH={60} mb={4} value={summary} onChange={e => setSummary(e.target.value)} />
          </FormControl>
          <Button onClick={onClickSchedule} colorScheme='blue' rightIcon={<ArrowForwardIcon />}>Add to scheduled queue</Button>
        </Flex>
        <Flex flexGrow={1} flexBasis={1} direction='column'  >
          <Flex justify='flex-end' mb={6}>
            <Select placeholder='Frequency' maxW={40} value={frequency} mr={4} onChange={(e) => setFrequency(e.target.value)}>
              <option value='3'>3 Hours apart</option>
              <option value='6'>6 Hours apart</option>
              <option value='9'>9 Hours apart</option>
            </Select>
            <Select placeholder='Select user' maxW={40} onChange={onUserSelect} value={activeUserToken}>
              {users.map((user, index) => <option key={index} value={user.token}>{user.name}</option>)}
              <option value='addUser'>Add user</option>
            </Select>
          </Flex>
          <VStack outline='2px solid #efefef' gap={2} p={2} maxH='75vh' overflowY='auto' >
            {loadingThreads ?
              <Spinner size='xl' />
              : scheduledThreads.map((thread, index) =>
                <ScheduledCard key={index} title={thread.title} content={thread.message} time={thread.scheduledAt} />
              )}
          </VStack>
        </Flex>
      </Flex>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add user</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>User name</FormLabel>
              <Input placeholder='enter user name' mb={4} value={newUserName} onChange={e => setNewUserName(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>User token</FormLabel>
              <Textarea placeholder='enter user token' minH={60} mb={4} value={newUserToken} onChange={e => setNewUserToken(e.target.value)} />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} isDisabled={!newUserName || !newUserToken} onClick={onAddUserClick}>
              Add user
            </Button>
            <Button variant='ghost' onClick={() => setIsModalOpen(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}

function ScheduledCard({ title, content, time }) {
  const d = new Date(time);
  return (
    <Box
      w={'full'}
      bg='white'
      boxShadow={'2xl'}
      rounded={'md'}
      p={6}>
      <Stack>
        <Flex justify='space-between'>
          <Text
            color={'green.500'}
            textTransform={'uppercase'}
            fontWeight={800}
            fontSize={'sm'}
            letterSpacing={1.1}>
            {d.toLocaleString()}
          </Text>
        </Flex>
        <Heading
          color='gray.700'
          fontSize={'2xl'}
          fontFamily={'body'}>
          {title}
        </Heading>
        <Text color={'gray.500'}>
          {content}
        </Text>
      </Stack>
    </Box>
  )
}