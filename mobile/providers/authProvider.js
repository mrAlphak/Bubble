//This provider retrieve user infos from supabase and listen to update

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../supabase"
import { io } from 'socket.io-client'
import { base_url } from '../hooks/axios'
import NetInfo from '@react-native-community/netinfo'
import AsyncStorage from "@react-native-async-storage/async-storage"


const AuthContext = createContext(null)
const AuthProvider =({children})=>{
    const [user, setUser] = useState(null)
    const [isMounted, setIsMounted] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const [socket, setSocket] = useState(null)

    useEffect(()=>{
        const getLocalUser =async()=>{
            const storage = await AsyncStorage.getItem('user')
            if(storage){
                const localUser = JSON.parse(storage)
                setUser(localUser)
            }
        }

        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected)
        })

        getLocalUser()

        return()=>{
            unsubscribe()
        }
    }, [])

    useEffect(()=>{
        if(user){
            !isMounted && getUser()
            if(!socket){
                ioConnection()
            }
        }
    }, [user, socket, isMounted])

    useEffect(()=>{
        user && AsyncStorage.setItem('user', JSON.stringify(user))
    }, [user])

    useEffect(()=>{
        if(user && isConnected){
            const profileListener = supabase.channel('profileChannel').on('postgres_changes', { event: '*', schema: '*', table: 'profiles' }, payload =>{
                console.log('new user data')
                if(payload.new.id === user.id){
                    setUser(payload.new)
                }
                if(payload.errors){
                    console.log(payload.errors)
                }
            })
            .subscribe()

            /*
            supabase.auth.onAuthStateChange((event, session) => {
                if(event === 'USER_UPDATED' || event === 'SIGNED_IN'){
                    console.log('event')
                    const userEmail = session?.user?.email
                    setUser(prev => ({...prev, email: userEmail}))
                }
            })*/
        
            return()=>{
                profileListener.unsubscribe()
            }
        }
    }, [user, isConnected])

    const ioConnection =async()=>{
        try{
            const newSocket = io(base_url)
            if(newSocket){
                console.log('connected to server')
                setSocket(newSocket)
                newSocket.emit('connectToServer', {id: user.id})
            }
        }catch(err){
            console.log(err)
        }
    }

    const logout = async()=>{
        if(isConnected){
            try {
                const {error} = await supabase.auth.signOut()
                if(!error){
                    await AsyncStorage.removeItem('user')
                    setUser(null)
                    socket && socket.disconnect()
                    setSocket(null)
                    setIsMounted(false)
                    console.log('user logout')
                    return true
                }else{
                    console.log(error)
                    return 'hasError'
                }
            } catch (err) {
                console.log(err)
                return 'hasError'
            }            
        }
    }

    const getUser =async()=>{
        try{
            const {data, error} = await supabase.from('profiles').select('*').eq('id', user.id).single()
            if(data && data.id){
                setUser(data)
                setIsMounted(true)
            }else if(error){
                console.log(error)
            }
        }catch(error){
            console.log(error)
        }
    } 

    return (
        <AuthContext.Provider value={{user, setUser, isConnected, socket, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useCurrentUser =()=>{
    return useContext(AuthContext)
}

export default AuthProvider