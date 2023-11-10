//Custom tab navigator

import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import Screens from "../screens"
import Assets from "../assets"


const Tab = createBottomTabNavigator()

const Tabs =()=>{
    return(
        <Tab.Navigator screenOptions={{tabBarStyle: styles.container, headerShown: false}}>
            <Tab.Screen 
                name="Home" 
                component={Screens.Home} 
                options={{
                    tabBarButton: ((props)=>
                        <TabButton
                            name='Home'
                            icon='Home2'
                            {...props}
                        />
                    )
                }}
            />
            <Tab.Screen 
                name="Profile" 
                component={Screens.Profile} 
                options={{
                    tabBarButton: ((props)=>
                        <TabButton
                            name='Profile'
                            icon='Profile'
                            {...props}
                        />
                    )
                }}
            />
        </Tab.Navigator>            
    )
}

const TabButton =(props)=>{
    const {onPress, accessibilityState} = props
    const isFocused = accessibilityState.selected
    const Icon = Assets.icons[props.icon]

    return (
        <TouchableOpacity onPress={()=> onPress()} style={styles.tabButton}>
            <Icon
                variant={isFocused ? 'Bold' : 'Linear'} 
                color={isFocused ? Assets.colors.background : 'gray'} 
                size={25}
            />
            <Text style={{color: isFocused ? Assets.colors.background : 'gray', fontFamily: 'Inter-Medium', fontSize: 12}}>{props.name}</Text>
        </TouchableOpacity>            
    )
}

const styles = StyleSheet.create({
    container:{
        height: 60,
        paddingHorizontal: 35,
        justifyContent: 'space-between', 
        alignItems: 'center',
    },
    tabButton:{
        width: '50%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    }
})

export default Tabs