import { useEffect } from "react"
import { SafeAreaView } from "react-native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { RealmProvider } from "../models/realmContext"
import AuthProvider, { useCurrentUser } from "../providers/authProvider"
import ToastProvider, { useToast } from "../providers/toastProvider"
import ChatProvider from "../providers/chatProvider"
import Tabs from "../components/tabs"
import Screens from "."





const Stack = createNativeStackNavigator()
const UserStack =()=>{

    return (
        <SafeAreaView style={{flex: 1}}>
            <RealmProvider>
                <AuthProvider>
                    <ChatProvider>
                        <ToastProvider>
                            <Stack.Navigator>
                                <Stack.Screen name='main' component={Tabs} options={{headerShown: false, animation: 'slide_from_right'}} />
                                <Stack.Screen name='searchUser' component={Screens.SearchUser} options={{headerShown: false, animation: 'slide_from_right'}} />
                                <Stack.Screen name='mediaViewer' component={Screens.MediaViewer} options={{headerShown: false}} />
                                <Stack.Screen name='editProfile' component={Screens.EditProfile} options={{headerShown: false, animation: 'slide_from_right'}} />
                                <Stack.Screen name='chat' component={Screens.Chat} options={{headerShown: false, animation: 'slide_from_right'}} />
                                <Stack.Screen name='recipientInfos' component={Screens.RecipientInfos} options={{headerShown: false, animation: 'slide_from_right'}} />
                                <Stack.Screen name='chatMediaViewer' component={Screens.ChatMediaViewer} options={{headerShown: false, animation: 'slide_from_right'}} />
                            </Stack.Navigator>                             
                        </ToastProvider>
                    </ChatProvider>
                </AuthProvider>            
            </RealmProvider>                          
        </SafeAreaView>
    )
}


export default UserStack