// Home screen 🏠

import React, { useEffect, useRef, useState, useMemo } from "react"
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    View,
    Text,
    Image,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Animated as Anim,
    Dimensions
} from "react-native"
import { useCurrentUser } from "../providers/authProvider"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { useRealm, useQuery } from "../models/realmContext"
import { useForm } from "react-hook-form"
import { supabase } from "../supabase"
import { useToast } from "../providers/toastProvider"
import { Swipeable } from "react-native-gesture-handler"
import Animated, {FadeIn, Layout, SlideInLeft, SlideInRight, SlideOutLeft, SlideOutRight} from "react-native-reanimated"
import Assets from "../assets"
import Button from "../components/button"
import Input from "../components/input"


//Main component
const Home =()=>{
    const [chat, setChat] = useState([])
    const [searchResults, setSearchResults] = useState([])
    const [openSearchBar, setOpenSearchBar] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const {control} = useForm()
    const {user, isConnected} = useCurrentUser()
    const {showToast} = useToast()
    const isFocused = useIsFocused()
    const realm = useRealm()
    const Chat = useQuery('Chat')
    const Message = useQuery('Message')

    // get all conversations and regroup them
    useEffect(()=>{
        if (Chat.length > 0) {
            !isMounted && setLoading(true)
            groupChat()
            setIsMounted(true)
            let timeout = setTimeout(()=>{
                setLoading(false)
            }, 2000)

            return()=> clearTimeout(timeout)
        }
    }, [Message])

    // handle chat deletion
    const deleteChat =(item)=>{
        realm.write(()=>{
            const matchingChat = realm.objects('Chat').filtered('id = $0', item.id)
            const matchingMessages = realm.objects('Message').filtered('chat_id = $0', item.id)
            if(matchingChat.length > 0){
                matchingChat.forEach((prev)=>{
                    realm.delete(prev)
                })

                matchingMessages.forEach((prev)=>{
                    realm.delete(prev)
                })
            }
        })
    }

    // regroup chat by recipient and check the last message status
    const groupChat =()=> {
        let arr = []
        if (Chat.length > 0) {
            arr = Chat.map((conv) => {
                const chats = Message.filtered(`chat_id = '${conv.id}'`)
                const lastMessageIndex = chats.length - 1

                if (lastMessageIndex >= 0) {
                    const lastMessage = chats[lastMessageIndex];
                    if (lastMessage.status === "deleted") {
                        for (let i = lastMessageIndex - 1; i >= 0; i--) {
                            if (chats[i].status !== "deleted") {
                                return {
                                    id: conv.id,
                                    last_message: chats[lastMessageIndex]?.content,
                                    last_message_date: chats[lastMessageIndex]?.created_at,
                                    last_message_has_media: chats[lastMessageIndex].attachments.length > 0 ? true : false,
                                    sender_id: chats[lastMessageIndex]?.sender_id,
                                    recipient_username: conv.recipient_username,
                                    recipient_id: conv.recipient_id,
                                    recipient_email: conv.recipient_email,
                                    recipient_profile_pic: conv.recipient_profile_pic,
                                };
                            }
                        }
                    }
                }

                return {
                    id: conv.id,
                    last_message: chats[lastMessageIndex]?.content,
                    last_message_has_media: chats[lastMessageIndex].attachments.length > 0 ? true : false,
                    last_message_date: chats[lastMessageIndex]?.created_at,
                    sender_id: chats[lastMessageIndex]?.sender_id,
                    recipient_username: conv.recipient_username,
                    recipient_id: conv.recipient_id,
                    recipient_email: conv.recipient_email,
                    recipient_profile_pic: conv.recipient_profile_pic,
                };
            });
        }
        setChat(arr)
    }

    // handle conversation search
    const handleSearch = ({value})=>{
        if(value && chat.length > 0){
            setLoading(true)
            const arr = [...chat]
            const results = arr.filter(prev => prev.recipient_username.toLowerCase().includes(value.trim().toLowerCase()))
            if(results){
                setSearchResults(results)
            }
            setLoading(false)
        }else{
            setSearchResults([])
            setLoading(false)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor='transparent' barStyle='light-content' translucent />
            <View style={styles.header}>
                {
                    !openSearchBar &&
                    <Animated.View entering={FadeIn} exiting={SlideOutLeft}>
                    <Text style={{color: 'white', fontSize: 20, fontFamily: 'Inter-SemiBold'}}>Hello</Text>                        
                    <Text style={{color: 'white', fontSize: 14, fontFamily: 'Inter-Medium', paddingTop: 3, opacity: 0.7}}>Chat with your friends! 🔥</Text>
                    </Animated.View>
                }
                {
                    openSearchBar &&
                    <Animated.View entering={SlideInRight} exiting={SlideOutRight} style={{width: 250}}>
                        <Input
                            control={control}
                            icon='SearchNormal'
                            iconVariant='Linear'
                            iconSize={20}
                            iconColor='gray'
                            name='search'
                            width='100%'
                            height={50}
                            placeholder='Search..'
                            backgroundColor='#f5f5f5'
                            handleChange={({name, value})=> handleSearch({name, value})}
                        />        
                    </Animated.View>
                }
                <Button
                    icon={!openSearchBar ? 'SearchNormal' : 'CloseCircle'}
                    iconSize={25}
                    iconVariant='Linear'
                    color='white'
                    height={40}
                    width={40}
                    onPress={()=> {
                        setSearchResults([])
                        setOpenSearchBar(!openSearchBar)
                    }}
                    backgroundColor='rgba(255, 255, 255, 0.2)'
                />
            </View>
            <View style={{flex: 1}}>
                {
                    Chat.length > 0 ?
                        loading ?
                        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                            <Image source={Assets.images.loader} style={{height: 80, width: 80}} />
                            <Text style={{fontFamily: 'Inter-Medium', fontSize: 13, opacity: 0.7, paddingTop: 5}}>Loading your chat...</Text>
                        </View> :
                        <FlatList
                            data={searchResults.length === 0 ? chat : searchResults}
                            renderItem={({item})=> <Row item={item} deleteChat={deleteChat} />}
                            bounces={false}
                            showsVerticalScrollIndicator={false}
                            ListHeaderComponent={<View style={{height: 30, width: '100%'}} />}
                        />
                    :
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10}}>
                        <Image source={Assets.images.hands_w_phone_2} style={{height: 200, width: 200, borderRadius: 100}} />
                        <View>
                            <Text style={{color: Assets.colors.black, fontSize: 16, fontFamily: 'Inter-SemiBold', paddingTop: 3, opacity: 0.7, textAlign: 'center'}}>No conversation</Text>
                            <View style={{flexDirection: 'row', alignContent: 'center', gap: 5}}>
                                <Text style={{color: Assets.colors.black, fontSize: 13, fontFamily: 'Inter-Regular', opacity: 0.5, textAlign: 'center'}}>start a new conversation from the button</Text>
                                <Assets.icons.AddCircle variant="Linear" size={20} color={Assets.colors.background} />
                            </View>
                        </View>
                    </View>
                }
                <ActionButton />
            </View>
        </SafeAreaView>
    )
}

// Component that displays each conversation
const Row =({item, deleteChat})=>{
    const [recipient, setRecipient] = useState(null)
    const [isMounted, setIsMounted] = useState(false)
    const [optionsOpen, setOptionsOpen] = useState(false)
    const realm = useRealm()
    const navigation = useNavigation()
    const {user, isConnected} = useCurrentUser()

    //get recipient data and recovers messages not previously recovered
    useEffect(()=>{
        const getRecipientData =async()=>{
            setRecipient({
                id: item.recipient_id,
                email: item.recipient_email,
                username: item.recipient_username,
                profile_pic: item.recipient_profile_pic
            })

            const {data, error} = await supabase.from('profiles').select('*').eq('id', item.recipient_id).single()
            if(error){
                console.log(error)
            }else if(data){
                console.log('first new recipient data')
                setRecipient({
                    id: data.id,
                    email: data.email,
                    username: data.username,
                    profile_pic: data.profile_pic,
                    status: data.status,
                })
                    const chat = realm.objects('Chat').filtered('id = $0', item.id)[0]
                    if(chat){
                        realm.write(() => {
                            console.log('ok')
                            if(data.profile_pic && data.profile_pic !== item.recipient_id){
                                chat.recipient_profile_pic = data.profile_pic
                            }
                            chat.recipient_username = data.username
                            chat.recipient_email = data.email
                        })
                    }
                
                setIsMounted(true)
            }                
        }

        const fetchMessages =async()=>{
            if(isConnected){
                const {data, error} = await supabase.from('messages').select('*').eq('recipient_id', user.id).eq('status', 'send')
                if(error){
                    console.log(error)
                }else{
                    if(data.length > 0){
                        data.forEach(async message => {
                            const existingChat = realm.objects('Chat').filtered('id = $0', message.chat_id)
                            const existingMessage = realm.objects('Message').filtered('id = $0', message.message_id)

                            if(existingChat.length === 0){
                                const chat_infos = await supabase.from('chats').select('*').eq('chat_id', message.chat_id).single()
                                if(chat_infos.error){
                                    console.log('select chat error: '+chat_infos.error)
                                }else{
                                    if(chat_infos.data){
                                        let recipient_id = message.sender_id === user.id ? message.recipient_id : message.sender_id
                                        const recipient_infos = await supabase.from('profiles').select('*').eq('id', recipient_id).single()
                                        if(recipient_infos.error){
                                            console.log('select recipient error: '+recipient_infos.error)
                                        }else{
                                            if(recipient_infos.data){
                                                let newChat = {
                                                    id: chat_infos.data.chat_id,
                                                    created_at: chat_infos.data.created_at,
                                                    recipient_id,
                                                    recipient_username: recipient_infos.data.username,
                                                    recipient_email: recipient_infos.data.email,        
                                                    recipient_profile_pic: recipient_infos.data.profile_pic,
                                                }     
            
                                                realm.write(()=>{
                                                    realm.create('Chat', newChat)
                                                })                           
                                            }
                                        }               
                                    }
                                }                            
                            }
            
                            if(existingMessage.length === 0){                              
                                message.status = 'received'
            
                                let data = {
                                    id: message.message_id,
                                    chat_id: message.chat_id,
                                    created_at: message.created_at,
                                    sender_id: message.sender_id,
                                    recipient_id: message.recipient_id,
                                    content: message.content,
                                    attachments: message.attachments,
                                    reply_to: message.reply_to,
                                    status: message.status,
                                    duplicate: message.duplicate
                                }
            
                                realm.write(()=>{
                                    realm.create('Message', data)
                                })        
                                
                                const updateMessage = await supabase.from('messages').update({
                                    status: 'received'
                                }).eq('message_id', message.message_id)
                                if(updateMessage.error){
                                    console.log(updateMessage.error)
                                }                        
                            }   
                        })
                    }
                }
            }
        }

        if(!isMounted){
            realm.write(() => {
                getRecipientData()
                fetchMessages()
            })
        }   
    }, [isConnected])

    //listen to recipient information updates from supabase
    useEffect(()=>{
        if(recipient){
            const listener = supabase.channel('profilesChannel3').on('postgres_changes', { event: '*', schema: '*', table: 'profiles' }, payload =>{
                if(payload.new.id === recipient.id){
                    setRecipient(payload.new)
                    realm.write(()=>{
                        const data = realm.objects('Chat').filtered('recipient_id = $0', recipient.id)
                        if(data.length > 0){
                            data[0].recipient_username = payload.new.username
                            data[0].recipient_email = payload.new.email
                            data[0].recipient_profile_pic = payload.new.profile_pic
                        }
                    })
                }
                if(payload.errors){
                    console.log(payload.errors)
                }
            })
            .subscribe()

            return()=>{
                listener.unsubscribe()
            }            
        }

    }, [recipient])

    const swipeAction =(progress, dragX)=>{
        const scale = dragX.interpolate({
            inputRange: [-100, -40, 0],
            outputRange: [0.8, 0.7, 0.4],
            extrapolate: 'clamp'
        })

        const translateX = dragX.interpolate({
            inputRange: [-50, 100],
            outputRange: [0, 80]
        })

        return (
            <Anim.View style={[
                {height: '100%', width: 60, paddingLeft: 3, justifyContent: 'flex-start', },
                {transform: [{scale}, {translateX}]}
            ]}>
                <Button
                    icon='Trash'
                    iconSize={27}
                    iconVariant='Bold'
                    color='white'
                    height={55}
                    width={55}
                    backgroundColor={Assets.colors.background}
                    borderRadius={14}
                    onPress={()=> deleteChat(item)}
                />
            </Anim.View>
        )
    }
    
    return (
        recipient && item &&
            <Swipeable onSwipeableOpen={()=> setOptionsOpen(true)} onSwipeableClose={()=> setOptionsOpen(false)} renderRightActions={swipeAction} friction={2}>
                <TouchableOpacity disabled={optionsOpen} onPress={()=> navigation.navigate('chat', {user: recipient, id: item.id})}>
                    <Animated.View entering={FadeIn} exiting={SlideOutLeft} style={styles.row}>
                        <View style={{flexDirection: 'row', gap: 20, alignItems: 'center'}}>
                            <View style={styles.profilePic}>
                                {
                                    recipient.profile_pic !== null ?
                                        <TouchableOpacity onPress={()=> navigation.navigate('recipientInfos', {user: recipient, id: item.id})}>
                                            <Image source={{uri: recipient.profile_pic}} style={{height: '100%', width: '100%', borderRadius: 100}} />
                                        </TouchableOpacity>
                                        :
                                        <Image source={Assets.images.user_blank} style={{height: '100%', width: '100%'}} />
                                }
                                {recipient.status && recipient.status !== "Offline" && isConnected && <Animated.View entering={FadeIn} style={styles.recipientStatusIndicator} />}
                            </View>
                            <View style={{gap: 3, maxWidth: '70%'}}>
                                <Text style={{fontFamily: 'Inter-Medium', color: Assets.colors.black, fontSize: 15}}>{recipient.username}</Text>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    {user && item.sender_id === user.id && 
                                        <Text style={{fontFamily: 'Inter-Regular', color: Assets.colors.black, fontSize: 13, opacity: 0.7, paddingRight: 7, fontStyle: item.last_message ? 'normal' : 'italic'}}>
                                            me:
                                        </Text>
                                    }
                                    {item.last_message_has_media && <Assets.icons.Gallery size={17} color={Assets.colors.black} variant="Bulk" style={{paddingRight: 8}} /> }
                                    <Text style={{fontFamily: 'Inter-Regular', color: Assets.colors.black, fontSize: 13, opacity: 0.7, fontStyle: item.last_message ? 'normal' : 'italic'}}>
                                        {!item.last_message && !item.last_message_has_media ? 'Empty conversation' : item.last_message}
                                    </Text>                                    
                                </View>
                            </View>
                        </View>
                        <View style={{height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                            <Text style={{fontFamily: 'Inter-Medium', color: Assets.colors.black, fontSize: 12, opacity: 0.7}}>
                                {
                                    new Date(item.last_message_date).getDate() === new Date().getDate() ?
                                        new Date(item.last_message_date).toTimeString().split(':').slice(0, 2).join(':')
                                        :
                                        new Date(item.last_message_date).toLocaleDateString()
                                }
                            </Text>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
            </Swipeable>
    )
}

// Button for start a new conversation
const ActionButton =()=>{
    const navigation = useNavigation()
    return (
        <View style={styles.actionButton}>
            <Button
                icon='Add'
                iconVariant='Linear'
                iconSize={35}
                color='white'
                height={55}
                width={55}
                backgroundColor={Assets.colors.background}
                borderRadius={100}
                elevation={3}
                onPress={()=> navigation.navigate('searchUser')}
            />
        </View>
    )
}


const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: 'white'
    },
    header:{
        height: 120,
        width: '100%',
        paddingLeft: 20,
        paddingRight: 15,
        paddingTop: 30,
        backgroundColor: Assets.colors.background,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    actionButton:{
        position: 'absolute',
        bottom: 30,
        right: 15,
        zIndex: 3
    },
    row:{
        width: Dimensions.get('screen').width,
        height: 55,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        marginBottom: 20
    },
    profilePic:{
        height: 45,
        width: 45,
        borderRadius: 100,
        backgroundColor: '#f1f1f1',
    },
    recipientStatusIndicator:{
        position: 'absolute',
        height: 12,
        width: 12,
        backgroundColor: '#00A693',
        bottom: 0,
        right: 0,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: 'white'
    },
    bottomSheet:{
        flex: 1,
        backgroundColor: 'white'
    }
})

export default Home