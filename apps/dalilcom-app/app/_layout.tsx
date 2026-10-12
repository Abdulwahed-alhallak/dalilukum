import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from '../context/AppContext';
import { COLORS } from '../constants/theme';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('RootErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>تطبيق دليلكم</Text>
          <Text style={errorStyles.message}>حدث خطأ غير متوقع أثناء تشغيل الواجهة.</Text>
          <TouchableOpacity style={errorStyles.button} onPress={this.handleRetry}>
            <Text style={errorStyles.buttonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary, marginBottom: 12 },
  message: { fontSize: 14, color: COLORS.gray600, textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  buttonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 15 },
});

export default function RootLayout() {
  return (
    <RootErrorBoundary>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="light" backgroundColor={COLORS.primary} />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.offWhite } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="map" />
            <Stack.Screen name="real-estate/category/[id]" />
            <Stack.Screen name="cars/brand/[id]" />
            <Stack.Screen name="details/property/[id]" options={{ headerShown: true, headerTitle: 'تفاصيل العقار' }} />
            <Stack.Screen name="details/car/[id]" options={{ headerShown: true, headerTitle: 'تفاصيل السيارة' }} />
          </Stack>
        </AppProvider>
      </SafeAreaProvider>
    </RootErrorBoundary>
  );
}

