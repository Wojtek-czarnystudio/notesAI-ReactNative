import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';
import {AuthProvider, useAuth} from './src/contexts/AuthContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import AppNavigator from './src/navigation/AppNavigator';
import LoadingSpinner from './src/components/LoadingSpinner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30000,
    },
  },
});

function AppContent() {
  const {user, loading} = useAuth();
  const [sharedData, setSharedData] = useState<any>(null);

  useEffect(() => {
    ReceiveSharingIntent.getReceivedFiles(
      files => {
        if (files.length > 0) {
          setSharedData({
            imageUri: files[0].filePath,
            source: 'share',
          });
        }
      },
      error => console.log('Share error:', error),
    );

    return () => {
      ReceiveSharingIntent.clearReceivedFiles();
    };
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <NavigationContainer>
      {user ? (
        <AppNavigator sharedData={sharedData} />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}
