import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { checkForUpdates } from './utils/UpdateChecker';

import HomeScreen from './screens/HomeScreen';
import PlayerSetupScreen from './screens/PlayerSetupScreen';
import ScoreSheetScreen from './screens/ScoreSheetScreen';
import DatabaseScreen from './screens/DatabaseScreen';
import DetailScreen from './screens/DetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    checkForUpdates();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Skor Panahan' }}
        />
        <Stack.Screen 
          name="PlayerSetup" 
          component={PlayerSetupScreen}
          options={{ title: 'Setup Pemain' }}
        />
        <Stack.Screen 
          name="ScoreSheet" 
          component={ScoreSheetScreen}
          options={{ title: 'Score Sheet' }}
        />
        <Stack.Screen 
          name="Database" 
          component={DatabaseScreen}
          options={{ title: 'Database Skor' }}
        />
        <Stack.Screen 
          name="Detail" 
          component={DetailScreen}
          options={{ title: 'Detail Skor' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
