import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import PlayerSetupScreen from './screens/PlayerSetupScreen';
import ScoreSheetScreen from './screens/ScoreSheetScreen';
import DatabaseScreen from './screens/DatabaseScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ 
            headerShown: false
          }}
        />
        <Stack.Screen 
          name="PlayerSetup" 
          component={PlayerSetupScreen}
          options={{ 
            title: 'Setup Pemain',
            headerStyle: {
              backgroundColor: '#2196F3',
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen 
          name="ScoreSheet" 
          component={ScoreSheetScreen}          options={{ 
            title: 'Lembar Skor',
            headerStyle: {
              backgroundColor: '#2196F3',
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen 
          name="Database" 
          component={DatabaseScreen}
          options={{ 
            headerStyle: {
              backgroundColor: '#2196F3',
            },
            headerTintColor: '#fff',
            headerTitle: '',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
