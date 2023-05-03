import { Stack } from "office-ui-fabric-react";
import React from "react";

type TProps = {};
type TState = { hasError: boolean };

export default class ErrorBoundary extends React.Component<TProps, TState> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Stack horizontal horizontalAlign="space-evenly">
          <Stack.Item align="center">
            <h1>Oops, Something went wrong...</h1>
            <p>If the problem persists, contact the site administrator.</p>
          </Stack.Item>
        </Stack>
      );
    }

    return this.props.children;
  }
}
