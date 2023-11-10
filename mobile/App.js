/*
//  BUBBLE - A MODERN CHAT APP 
//  - A complete chat app built with react native, supabase and node.js. 
//  - You'll find all the features you need in a chat app.
//  Happy coding!
// https://github.com/mrAlphak
*/

import { LogBox } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import Screens from './screens'

LogBox.ignoreAllLogs()

const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name='splash' component={Screens.Splash} options={{headerShown: false}} />
                <Stack.Screen name='welcome' component={Screens.Welcome} options={{headerShown: false}} />
                <Stack.Screen name='userScreens' component={Screens.UserStack} options={{headerShown: false}} />
            </Stack.Navigator>        
        </NavigationContainer>      
    </GestureHandlerRootView>
       
  )
}
