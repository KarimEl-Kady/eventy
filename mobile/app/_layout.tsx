import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#FFFFFF',
            },
            headerTintColor: '#1A1A1A',
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 17,
            },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: '#F9F6F2' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="invitations/new"
            options={{
              title: 'Create Invitation',
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="invitations/[id]"
            options={{
              title: 'Your Invitation',
            }}
          />
          <Stack.Screen
            name="public/[slug]"
            options={{ headerShown: false }}
          />
        </Stack>
      </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6F2',
  },
});
