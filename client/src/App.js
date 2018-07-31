import React, { Component } from 'react';
import {
  Container,
  Flex,
  Box,
  Heading,
  Text,
  Link,
  Button,
  Tooltip,
} from 'rebass';

class App extends Component {
  state = {
    response: '',
  };

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: res.express }))
      .catch(err => console.log(err));
  }

  callApi = async () => {
    const response = await fetch('/api/health-check');
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  render() {
    return (
      <Container maxWidth="800px">
        <Flex
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <Box mx={2} h={[1, 1 / 2]} pt="23vh">
            <Heading children="HEARTBREAKER" color="#002e00" />
            <Text
              children="Dead simple twitter 'likes' removal 💔"
              color="#fff"
              textAlign="center"
              fontSize="10px"
            />
          </Box>
          <Flex alignItems="center">
            <Box pt={4}>
              <Button
                children="Sign in with Twitter"
                bg="pink"
                onClick={() => console.log(this.state.response)}
              />
            </Box>
          </Flex>
          <Flex>
            <Footer />
          </Flex>
        </Flex>
      </Container>
    );
  }
}

function Footer() {
  return (
    <Box width={1} pt={5}>
      <Tooltip text="'Cause privacy, duh.">
        <Link href="#!" children="Y tho?" mr={4} color="#002e00" />
      </Tooltip>
      <Link
        href="https://www.twitter.com/jonlprd"
        children="@jonlprd"
        mr={4}
        color="#002e00"
      />
      <Link href="#!" children="Tweet" color="#002e00" />
    </Box>
  );
}

export default App;
