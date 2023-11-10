//Splash Screen

import { View, SafeAreaView, StyleSheet, StatusBar, Text } from "react-native"
import { useEffect, useState } from "react"
import { useNavigation } from "@react-navigation/native"
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Assets from "../assets"
import loadFont from "../components/fontsLoader"


const Splash =()=>{
    const navigation = useNavigation()

    useEffect(()=>{
        let timeout = null
        const fetchUser = async()=>{
            const fontsLoaded = await loadFont()
            if(fontsLoaded){
                AsyncStorage.getItem('user')
                .then(storage =>{
                    let userData = JSON.parse(storage)
                    if(userData){
                        timeout = setTimeout(()=>{
                            navigation.replace('userScreens')
                        }, 1000)                    
                    }else{
                        timeout = setTimeout(()=>{
                            navigation.replace('welcome')
                        }, 1500)
                    }
                })
                .catch((err)=>{
                    console.log(err)
                })                
            }
        }

        fetchUser()

        return()=>{
            timeout && clearTimeout(timeout)
        }
    }, [])

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle='light-content' backgroundColor='transparent' translucent />
            <Animated.View entering={FadeIn.duration(500)} style={{width: '100%', alignItems: 'center', justifyContent: 'center'}}>
                <Assets.icon height={100} width={100} />
                <Text style={{color: 'white', fontSize: 25, fontFamily: 'Inter-Bold', marginTop: 15, fontWeight: 'bold'}}>Bubble</Text>
                <Text style={{color: 'white', fontSize: 15, fontFamily: 'Inter-Regular', fontWeight: '300'}}>A modern messaging app</Text>
            </Animated.View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Assets.colors.background
    },
})

export default Splash