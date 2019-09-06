// Nice stuff here: https://reactjs.org/blog/2017/07/26/error-handling-in-react-16.html
// Code taken from Dan Abramov's pen https://codepen.io/gaearon/pen/wqvxGa

import React from "react";
import { Box, Card, Heading, Flex, Button } from "rimble-ui";
import styled from "styled-components";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { mapStackTrace } from "sourcemapped-stacktrace";

const Container = styled(Card)`
  margin: 0;
`;

const Details = styled(Box).attrs(() => ({
  mt: 0,
  mb: 4,
  fontSize: 2
}))``;

const Pre = styled.pre`
  font-family: monospace;
  font-size: 10px;
`;

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ broken: true });

    mapStackTrace(error.stack, stack => {
      const message = [
        error.toString(),
        ...stack,
        "---",
        error.toString(),
        errorInfo.componentStack
      ].join("\n");
      this.setState({ message });
    });
  }

  render() {
    const { broken, message, copied } = this.state;

    if (broken) {
      return (
        <Container>
          <h2>Something went wrong 😢</h2>
          <p>
            Please let us know about this error. If you did it already, reload
            the page, thanks!
          </p>

          {message ? (
            <>
              <Details>
                <details>
                  <Pre>{message}</Pre>
                </details>
              </Details>

              <CopyToClipboard
                text={message}
                onCopy={() => this.setState({ copied: true })}
              >
                <Button>Copy to clipboard</Button>
              </CopyToClipboard>
              {copied && <p>Copied!</p>}
            </>
          ) : (
            <p>Loading details, wait... ⌛</p>
          )}
        </Container>
      );
    }
    return this.props.children;
  }
}
