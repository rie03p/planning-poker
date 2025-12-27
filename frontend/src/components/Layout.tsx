import {Outlet} from 'react-router-dom';
import {Flex} from '@chakra-ui/react';
import {Footer} from './Footer';
import {Header} from './Header';

export function Layout() {
  return (
    <Flex direction='column' minH='100vh'>
      <Header />
      <Flex flex='1' direction='column'>
        <Outlet />
      </Flex>
      <Footer />
    </Flex>
  );
}
