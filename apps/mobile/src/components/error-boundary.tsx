import { Component, type ErrorInfo, type ReactNode } from "react";
import { Stack, Text, YStack } from "tamagui";
import { Button } from "./button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          backgroundColor="$bg"
          padding={32}
        >
          <Stack
            height={64}
            width={64}
            borderRadius={9999}
            backgroundColor="$dangerMuted"
            alignItems="center"
            justifyContent="center"
            marginBottom={16}
          >
            <Text fontSize={28}>⚠️</Text>
          </Stack>

          <Text
            fontSize={18}
            fontWeight="600"
            color="$textPrimary"
            textAlign="center"
          >
            Algo deu errado
          </Text>
          <Text
            marginTop={8}
            fontSize={14}
            color="$textMuted"
            textAlign="center"
            lineHeight={20}
          >
            Ocorreu um erro inesperado. Tente novamente.
          </Text>

          <Stack marginTop={20}>
            <Button variant="primary" size="md" onPress={this.handleReset}>
              Tentar novamente
            </Button>
          </Stack>
        </YStack>
      );
    }

    return this.props.children;
  }
}
