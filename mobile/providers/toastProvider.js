//This provider display custom toast notification

import { createContext, useContext, useEffect, useState } from "react"
import { StyleSheet, View, Text } from "react-native"
import { useCurrentUser } from "./authProvider"
import NetInfo from '@react-native-community/netinfo'
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated"
import Assets from "../assets"


const ToastContext = createContext(null)
const ToastProvider =({children})=> {
    const {isConnected} = useCurrentUser()
    const [toastQueue, setToastQueue] = useState([])

    useEffect(()=>{
        if(!isConnected){
            showToast({
                message: "You're offline",
                icon: 'EmojiSad',
                iconColor: 'orangered',
                duration: 2000
            })
        }else{
            showToast({
                message: "You're back",
                icon: 'EmojiHappy',
                iconColor: '#00A693',
                duration: 2000
            })
        }
    }, [isConnected])

    const showToast = ({message, icon, iconColor, position, duration}) => {
        setToastQueue(oldQueue => [...oldQueue, {
            message,
            icon,
            iconColor,
            position,
        }])

        setTimeout(() => {
            setToastQueue(oldQueue => oldQueue.slice(1));
        }, duration)
    }

    return (
        <ToastContext.Provider value={{toast: toastQueue[0], showToast}}>
            {children}
            {toastQueue[0] && <Toast toast={toastQueue[0]} />}
        </ToastContext.Provider>
    )
} 

export const useToast =()=>{
    return useContext(ToastContext)
}

const Toast =({toast})=>{
    const Icon = Assets.icons[toast.icon]

    return ( 
        <Animated.View entering={FadeInDown} exiting={FadeOutDown} style={[styles.container, toast.position ? toast.position : {bottom: 80}]}>
            <Icon variant='Bulk' size={25} color={toast.iconColor} />
            <View>
                <Text style={{color: Assets.colors.black, fontFamily: 'Inter-Medium', fontSize: 13}}>{toast.message}</Text>
            </View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container:{
        position: 'absolute',
        alignSelf: 'center',
        zIndex: 12,
        paddingHorizontal: 12,
        paddingVertical: 7,
        backgroundColor: 'white',
        elevation: 1,
        flexDirection: 'row',
        borderColor: '#f1f1f1',
        borderWidth: 0.7,
        alignItems: 'center',
        gap: 7,
        borderRadius: 20
    },

})

export default ToastProvider


