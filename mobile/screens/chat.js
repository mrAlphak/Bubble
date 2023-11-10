//Chat Screen 💬

import React, {useEffect, useState, useRef, useCallback} from 'react'
import {
    Dimensions,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    View,
    Image,
    Text,
    ActivityIndicator,
    FlatList,
    TouchableOpacity,
    ImageBackground,
    Pressable,
    ScrollView
} from 'react-native'
import { useForm } from 'react-hook-form'
import { useNavigation, useIsFocused } from '@react-navigation/native'
import { useRealm, useQuery } from '../models/realmContext'
import { supabase } from '../supabase'
import { useCurrentUser } from '../providers/authProvider'
import { useToast } from '../providers/toastProvider'
import { useChat } from '../providers/chatProvider'
import { openPicker } from '@baronha/react-native-multiple-image-picker'
import { Video, ResizeMode } from 'expo-av'
import MasonryList from 'reanimated-masonry-list'
import Sound from 'react-native-sound'
import Animated, { FadeIn, FadeInDown, FadeInRight, FadeInUp, FadeOutDown, FadeOutRight, Layout } from 'react-native-reanimated'
import Assets from '../assets'
import Button from "../components/button"
import Input from "../components/input"
import Modal from "react-native-modal"


// Main component
const Chat =({route})=>{
    const [recipient, setRecipient] = useState(null)
    const [chatId, setChatId] = useState(null)
    const [isMounted, setIsMounted] = useState(false)
    const isFocused = useIsFocused()
    const [loading, setLoading] = useState(false)
    const [replyTo, setReplyTo] = useState(null)
    const [attachments, setAttachments] = useState([])
    const [selectedRow, setSelectedRow] = useState([])
    const [canAnimateBubble, setCanAnimateBubble] = useState(false)
    const [messages, setMessages] = useState([])
    const [openModal, setOpenModal] = useState({})
    const navigation = useNavigation()
    const {user, isConnected} = useCurrentUser()
    const {showToast} = useToast()
    const realm = useRealm()
    const MessageCollection = useQuery('Message')
    const send_message_sound = new Sound('send_message.mp3', Sound.MAIN_BUNDLE)
    const receive_message_sound = new Sound('receive_message.mp3', Sound.MAIN_BUNDLE)

    //get passed recipient and chat informations
    useEffect(()=>{
        if(!isMounted){
            if(route.params){
                const { user, id } = route.params
                user && !recipient && setRecipient(route.params.user)
                id && !chatId && setChatId(id)
                setIsMounted(true)
            }
        }
    }, [isMounted])

    //get corresponding messages from local database
    useEffect(()=>{
        realm.write(()=>{
            if(chatId){
                const filteredChat = realm.objects('Message').filtered('chat_id = $0', chatId)
                setMessages(filteredChat)
            }
        })
    }, [isMounted, MessageCollection])

    //block bubble animations when chat is newly opened
    useEffect(()=>{
        const filteredChat = realm.objects('Message').filtered('chat_id = $0', chatId)
        if(isMounted && messages.length === filteredChat.length){
            let timeout = setTimeout(()=>{
                setCanAnimateBubble(true)
            }, 300)

            return()=> clearTimeout(timeout)
        }
    }, [isMounted, messages])

    //play sounds for received and sent messages
    useEffect(()=>{
        if(chatId){
            const filteredChat = realm.objects('Message').filtered('chat_id = $0', chatId)
            filteredChat.addListener((collection, changes) => {
                if(changes.insertions.length > 0){
                    changes.insertions.forEach(index => {
                        let item = collection[index]
                        if(item.sender_id === user.id){
                            send_message_sound.play()
                        }else{
                            receive_message_sound.play()
                        }
                    })
                }
            })
        }
    }, [chatId])

    //get attachments after their modifications in chatMediaViewer
    useEffect(()=>{
        if(route.params && route.params.attachments){
            setAttachments(route.params.attachments)
        }
    }, [route])

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

    //select the message to reply to 
    const selectReplyTo =()=>{
        setReplyTo(selectedRow[0])
        setSelectedRow([])
    }

    // deselect selected messages
    const deleteSelectedMessages =async()=>{
        if(isConnected){
            realm.write(()=>{
                if(selectedRow.length > 0){
                    let arr = [...messages]
                    selectedRow.forEach(async row => {
                        const index = arr.findIndex(item => item.id === row.id)
                        if(arr[index].sender_id === user.id){
                            if (index !== null) {
                                if (arr[index].status !== 'deleted') {
                                    arr[index].content = 'This message has been deleted'
                                    arr[index].status = 'deleted'
                                    arr[index].attachments = []
                                    const {data, error} = await supabase.from('messages').update({
                                        status: 'deleted',
                                        content: 'This message has been deleted',
                                        attachments: []
                                    }).eq('message_id', row.id)

                                    if(error){
                                        console.log('error deleting message '+error)
                                    }
                                } else {
                                    const id = arr[index].id
                                    arr.splice(index, 1)
                                    const item = realm.objects('Message').filtered('id = $0', id)
                                    realm.delete(item[0])
                                }
                            }
                        }else{
                            const id = arr[index].id
                            arr.splice(index, 1)
                            const item = realm.objects('Message').filtered('id = $0', id)
                            realm.delete(item[0])
                        }

                    })
                    setMessages(arr)
                    setSelectedRow([])
                }
            })
        }else{
            showToast({
                message: "Unable to delete messages at this time",
                icon: 'EmojiSad',
                iconColor: 'orangered',
                duration: 2000
            })
        }

    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor='transparent' translucent barStyle='light-content' />
            <View style={styles.header}>
                {
                    selectedRow.length === 0 ?
                    <Animated.View style={{flexDirection: 'row', alignItems: 'center', gap: 15}}>
                        <Button
                            icon='ArrowLeft'
                            iconSize={25}
                            iconVariant='Linear'
                            color='white'
                            height={40}
                            width={30}
                            onPress={()=> navigation.goBack()}
                        />           
                        <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
                            <View style={styles.profilePic}>
                                {
                                    recipient && recipient.profile_pic !== null ? 
                                    <TouchableOpacity onPress={()=> navigation.navigate('recipientInfos', {user: recipient, id: chatId})}>
                                        <Animated.Image entering={FadeIn} source={{uri: recipient.profile_pic}} style={{height: '100%', width: '100%', borderRadius: 100}} />
                                    </TouchableOpacity>
                                    :
                                    route.params.user.profile_pic ?
                                    <TouchableOpacity onPress={()=> navigation.navigate('recipientInfos', {user: recipient, id: chatId})}>
                                        <Animated.Image entering={FadeIn} source={{uri: route.params.user.profile_pic}} style={{height: '100%', width: '100%', borderRadius: 100}} />
                                    </TouchableOpacity>
                                    :
                                    <Animated.Image entering={FadeIn} source={Assets.images.user_blank} style={{height: '100%', width: '100%'}} />
                                }
                                {recipient && recipient.status && recipient.status === 'Online' && isConnected && <Animated.View entering={FadeIn} style={styles.recipientStatusIndicator} />}
                            </View>
                            {
                                recipient &&
                                <View>
                                    <Animated.Text entering={FadeIn} style={{fontFamily: 'Inter-Medium', color: 'white', fontSize: 15}}>{recipient && recipient.username ? recipient.username : route.params.user.username}</Animated.Text>
                                    {recipient.status && isConnected && <Animated.Text entering={FadeInDown} style={{fontFamily: 'Inter-Regular', color: 'white', fontSize: 14, opacity: 0.9}}>{recipient.status}</Animated.Text>}
                                </View>
                            }
                        </View>         
                    </Animated.View> : 
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 15, justifyContent: 'space-between', width: '100%'}}>
                        <Animated.View entering={FadeInDown} style={{flexDirection: 'row', alignItems: 'center', gap: 7}}>
                            <Button
                                icon='CloseCircle'
                                iconSize={25}
                                iconVariant='Linear'
                                color='white'
                                height={40}
                                width={30}
                                onPress={()=> setSelectedRow([])}
                            />               
                            <Text style={{color: 'white', fontFamily: 'Inter-Medium', fontSize: 14}}>{selectedRow.length} selected</Text>         
                        </Animated.View>
                        <Animated.View entering={FadeInDown} style={{flexDirection: 'row', alignItems: 'center', gap: 22}}>
                            {
                                selectedRow.length === 1 &&
                                <Button
                                    icon='ArrowForward'
                                    iconSize={27}
                                    iconVariant='Linear'
                                    color='white'
                                    height={40}
                                    width={30}
                                    onPress={()=> selectReplyTo()}
                                />                                
                            }
                            <Button
                                icon='Trash'
                                iconSize={25}
                                iconVariant='Linear'
                                color='white'
                                height={40}
                                width={30}
                                onPress={()=> deleteSelectedMessages()}
                            />              
                        </Animated.View>
                    </View>                
                }

            </View>
            <View style={styles.main}>
                <View style={{flex: 1}}>
                    {
                        messages && !loading &&
                        <FlatList
                            data={messages}
                            renderItem={({item})=> 
                                <Row 
                                    item={item}
                                    selectedRow={selectedRow}
                                    setSelectedRow={setSelectedRow}
                                    messages={messages}
                                    recipient={recipient}
                                    canAnimateBubble={canAnimateBubble}
                                />}
                            bounces={false}
                            overScrollMode="never"
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{gap: 5}}
                            ListHeaderComponent={<View style={{height: 30, width: '100%'}} />}
                            ListFooterComponent={<View style={{height: 30, width: '100%'}} />}
                        />
                    }
                </View>
                <ActionBar
                    chatId={chatId}
                    setChatId={setChatId}
                    recipient={recipient}
                    attachments={attachments}
                    setAttachments={setAttachments}
                    replyTo={replyTo}
                    setReplyTo={setReplyTo}
                />
            </View>
            <ImageBackground source={Assets.images.background_light} style={styles.background} />
        </SafeAreaView>
    )
}

// Component that displays each message in the conversation
const Row =({item, selectedRow, setSelectedRow, messages, recipient, canAnimateBubble})=>{
    const ref = useRef(null)
    const {user} = useCurrentUser()
    const isUser = user.id === item.sender_id
    const isSelected = selectedRow.length > 0 && selectedRow.some(prev => prev.id === item.id)
    const [replyToItem, setReplyToItem] = useState(null)

    // handle row selection
    const selectRow =()=>{
        !isSelected && setSelectedRow(prev => [...prev, item])
    }

    const rowSelectionAction =()=>{
        if(selectedRow.length > 0){
            if(isSelected){
                let arr = selectedRow.filter(prev => prev.id !== item.id)
                setSelectedRow(arr)
            }else{
                selectRow()
            }            
        }

    }

    // recovers the original message to which the user replies 
    useEffect(()=>{
        if(item.reply_to){
            const arr = messages.filter(prev => prev.id === item.reply_to)
            if(arr.length > 0){
                const replyToRecipient = arr[0].sender_id !== user.id
                if(replyToRecipient){
                    arr[0].sender_username = recipient.username
                }else{
                    arr[0].sender_username = user.id
                }
                setReplyToItem(arr[0])
            }
        }
    }, [])

    return (
        <Pressable ref={ref} onPress={()=> rowSelectionAction()} onLongPress={()=> selectRow()} delayLongPress={300} style={styles.row}>
            {isSelected && <View style={styles.selectedRow} />}
            <Animated.View entering={canAnimateBubble && FadeInDown} layout={Layout.stiffness(5)} style={[styles.bubble, isUser ? {
                backgroundColor: Assets.colors.background,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 0,
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
                alignSelf: 'flex-end'
            } : {
                backgroundColor: 'white',
                borderTopLeftRadius: 0,
                borderTopRightRadius: 20,
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
                alignSelf: 'flex-start'
            }]}
            >
                {
                    replyToItem && item.status !== 'deleted' &&
                    <Animated.View entering={FadeIn} style={{backgroundColor: isUser ? '#7373EEBA' : '#f2f2f2', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10}}>
                        <View>
                            <Text style={{fontFamily: 'Inter-Medium', fontSize: 13, color: isUser ? 'white' : Assets.colors.black}}>{replyToItem.sender_username === user.id ? 'Me:' : replyToItem.sender_username}</Text>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                {
                                    replyToItem.attachments && replyToItem.attachments.length > 0 && <Assets.icons.Gallery size={17} color={Assets.colors.black} variant="Bulk" style={{paddingRight: 8}} />
                                }
                                <Text style={{fontFamily: 'Inter-Regular', fontSize: 12, color: isUser ? 'white' : Assets.colors.black}}>{replyToItem.content}</Text>
                            </View>
                        </View>
                    </Animated.View>
                }
                {
                    item.attachments.length > 0 && 
                    <Animated.View entering={FadeIn} style={{paddingVertical: 6}}>
                        <MediaRender attachments={item.attachments} isUser={isUser} />
                    </Animated.View>
                }
                <Text style={{fontFamily: 'Inter-Regular', fontSize: 14, color: isUser ? 'white' : Assets.colors.black, fontStyle: item.status === 'deleted' ? 'italic' : 'normal'}}>{item.content}</Text>
            </Animated.View>
        </Pressable>
    )
}

// Component that displays received or sent medias
const MediaRender =({attachments, isUser})=>{
    return (
        <View>
            { attachments.length === 1 && 
                <View style={{borderRadius: 15, overflow: 'hidden'}}>
                    <RowMedia item={attachments[0]} height={150} width={200} isUser={isUser} />
                </View>
            }
            { attachments.length === 2 && 
                <View style={{flexDirection: 'row', borderRadius: 15, overflow: 'hidden', gap: 2}}>
                    <RowMedia item={attachments[0]} height={180} width={130} isUser={isUser} />
                    <RowMedia item={attachments[1]} height={180} width={130} isUser={isUser} />
                </View>
            }
            { attachments.length === 3 && 
                <View style={{flexDirection: 'row', borderRadius: 15, overflow: 'hidden', gap: 2}}>
                    <RowMedia item={attachments[0]} height={180} width={130} isUser={isUser} />
                    <View style={{gap: 2}}>
                        <RowMedia item={attachments[1]} height={90} width={100} isUser={isUser} />
                        <RowMedia item={attachments[2]} height={90} width={100} isUser={isUser} />
                    </View>
                </View>
             }
            { attachments.length === 4 && 
                <View style={{flexDirection: 'row', borderRadius: 15, overflow: 'hidden', gap: 2}}>
                    <RowMedia item={attachments[0]} height={225} width={130} isUser={isUser} />
                    <View style={{gap: 2}}>
                        <RowMedia item={attachments[1]} height={75} width={100} isUser={isUser} />
                        <RowMedia item={attachments[2]} height={75} width={100} isUser={isUser} />
                        <RowMedia item={attachments[3]} height={75} width={100} isUser={isUser} />
                    </View>
                </View>
             }
        </View>
    )
}

const RowMedia =({item, height, width, isUser})=>{
    const [loading, setLoading] = useState(true)
    const parts = item.split('.')
    const extension = parts[parts.length - 1]
    const navigation = useNavigation()

    return (
        extension === 'jpg' || extension === 'png' || extension === 'jpeg' ?
        <TouchableOpacity onPress={()=> navigation.navigate('mediaViewer', {medias: item, type: 'single'})} style={{alignItems: 'center', justifyContent: 'center'}}>
            <Image onLoad={()=> setLoading(false)} source={{uri: item}} style={{height, width, resizeMode: 'cover'}} />
            {loading && <ActivityIndicator size='small' color={isUser ? 'white' : Assets.colors.background} style={{position: 'absolute'}}  />}
        </TouchableOpacity>
        : 
        <TouchableOpacity onPress={()=> navigation.navigate('mediaViewer', {medias: item, type: 'single'})} style={{alignItems: 'center', justifyContent: 'center'}}>
            <View style={{opacity: 0.7}}>
                <Video onLoad={()=> setLoading(false)} source={{uri: item}} resizeMode={ResizeMode.COVER} style={{height, width}} />
            </View>
            {loading && <ActivityIndicator size='small' color={isUser ? 'white' : Assets.colors.background} style={{position: 'absolute'}}  />}
            {!loading && <View style={{position: 'absolute'}}>
                <Assets.icons.VideoPlay variant='Bold' color='white' size={30} />
            </View>}
        </TouchableOpacity>
    )
}

// Custom action bar component with an input to send messages
const ActionBar =({chatId, setChatId, recipient, replyTo, setReplyTo, attachments, setAttachments})=>{
    const { control, getValues, setValue } = useForm()
    const [loading, setLoading] = useState(false)
    const {user, isConnected} = useCurrentUser()
    const {showToast} = useToast()
    const realm = useRealm()
    const navigation = useNavigation()

    const onChange =({name, value})=>{

    }

    const send =async()=>{
        const message = getValues('message')
        let newChatId = chatId ? chatId : null
        let mediaArr = []

        if(isConnected){
            let canSend = true
            if(!message && replyTo || attachments.length > 0){
                canSend = true
            }else if(!message && !replyTo && attachments.length === 0){
                canSend = false
            }

            if(canSend){
                try {
                    setLoading(true)
                    if(!chatId){
                        let currentDate = new Date()
                        newChatId = `bubble-chat-${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}_${currentDate.getHours()}-${currentDate.getMinutes()}-${currentDate.getSeconds()}_${user.id}-${recipient.id}`;
                        const createChat = await supabase.from('chats').insert({
                            chat_id: newChatId,
                            created_at: new Date()
                        })
                        if(createChat.error){
                            console.log(createChat.error)
                        }else{
                            setChatId(newChatId)
                        }
                    }

                    const currentDate = new Date()
                    const message_id = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}_${currentDate.getHours()}-${currentDate.getMinutes()}-${currentDate.getSeconds()}_${user.id}-${recipient.id}`;

                    if(attachments.length > 0){
                        let arr = [...attachments]
                        let uploadedMedia = await Promise.all(arr.map(async item => {
                            delete item.id
                            const saveMedia = await supabase.storage.from('chat').upload(`${newChatId}/${item.name}`, item, {
                                cacheControl: '3600',
                                upsert: false,
                                contentType: item.type,
                            })
                            
                            if(saveMedia.error){
                                console.log('failed save chat media ',item.id)
                                return null
                            }else{
                                if(saveMedia.data){
                                    const {data: {publicUrl}} = supabase.storage.from('chat').getPublicUrl(`${newChatId}/${item.name}`)
                                    if(publicUrl){
                                        return publicUrl
                                    }
                                    return null
                                }
                            }
                        }))
                        if(uploadedMedia){
                            mediaArr = uploadedMedia
                        } 
                    }

                    const newMessage = {
                        message_id,
                        chat_id: newChatId,
                        sender_id: user.id,
                        recipient_id: recipient.id,
                        status: 'send',
                        created_at: new Date(),
                        reply_to: replyTo ? replyTo.id : null,
                        attachments: mediaArr,
                        content: getValues('message'),
                        duplicate: false
                    }
                    
                    const createMessage = await supabase.from('messages').insert(newMessage)
                    if(createMessage.error){
                        console.log(createMessage.error)
                    }else{
                        setValue('message', '')
                        attachments.length > 0 && setAttachments([])
                        replyTo && setReplyTo(null)
                    }
                } catch (error) {
                    console.log(error)
                }
                setLoading(false)
            }
        }else{
            showToast({
                message: "Unable to send messages at this time",
                icon: 'EmojiSad',
                iconColor: 'orangered',
                duration: 2000
            })
        }
    }

    const openGallery =async()=>{
        try {
            const currentDate = new Date()
            const random_id = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}_${currentDate.getHours()}-${currentDate.getMinutes()}-${currentDate.getSeconds()}_${user.id}-${recipient.id}`;
            const response = await openPicker({usedCameraButton: false, maxSelectedAssets: 5})
            if(response && response.length > 0){
                let arr = [...attachments]
                let id = 0
                if(arr.length > 0){
                    id = arr.length + 1
                }
                response.forEach(item => {
                    let media = {
                        id,
                        uri: 'file://'+item.realPath,
                        name: 'bubble-'+random_id+item.fileName,
                        type: item.mime
                    }
                    arr.push(media)
                    id ++
                })
                navigation.navigate('chatMediaViewer', {selectedMedia: arr})
            }
        }catch (error) {
            console.log(error)
        }

    }

    return (
        <Animated.View style={styles.actionBar}>
            <Input
                control={control}
                name='message'
                width='67%'
                height={50}
                placeholder={!replyTo ? 'Type a message..' : 'Reply..'}
                multiline
                editable={!loading}
                backgroundColor='white'
                handleChange={({name, value})=> onChange({name, value})}
            />
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <Button
                    icon='Gallery'
                    iconVariant='Linear'
                    iconSize={25}
                    color='gray'
                    height={50}
                    width={50}
                    disabled={loading}
                    onPress={()=> openGallery()}
                />
                <Button
                    text={!loading ? <Assets.icons.Send variant='Bold' color='white' size={25} /> : <ActivityIndicator color='white' size='small' />}
                    backgroundColor={Assets.colors.background}
                    borderRadius={100}
                    color='white'
                    elevation={2}
                    height={50}
                    width={50}
                    disabled={loading}
                    onPress={()=> send()}
                />
            </View>
            {
                attachments.length > 0 &&
                <Animated.View entering={FadeInRight} exiting={FadeOutRight} style={styles.mediaIndicator}>
                    <Button
                        icon='Gallery'
                        iconVariant='Bulk'
                        height={55}
                        width={55}
                        borderRadius={24}
                        color={Assets.colors.background}
                        backgroundColor='white'
                        size={30}
                        onPress={()=> navigation.navigate('chatMediaViewer', {selectedMedia: attachments})}
                    />
                    <View style={{position: 'absolute', left: 0, top: -10}}>
                        <Button
                            icon='CloseCircle'
                            iconVariant='Bold'
                            iconSize={25}
                            color='orangered'
                            onPress={()=> setAttachments([])}
                        />
                    </View>
                </Animated.View>
            }
            {
                replyTo &&
                <Animated.View entering={FadeInDown} exiting={FadeOutDown} style={styles.replyContainer}>
                    <View style={styles.replyTextContainer}>
                        <View style={{position: 'absolute', left: 0, top: -10}}>
                            <Button
                                icon='CloseCircle'
                                iconVariant='Bold'
                                iconSize={25}
                                color='orangered'
                                onPress={()=> setReplyTo(null)}
                            />
                        </View>
                        <View style={{maxWidth: '50%'}}>
                            <Text style={{color: Assets.colors.black, fontSize: 14, fontFamily: 'Inter-SemiBold', opacity: 0.8}}>{replyTo.sender_id === user.id ? 'Me:' : recipient.username}</Text>
                            {
                                replyTo.attachments.length > 0 && <Assets.icons.Gallery size={17} color={Assets.colors.black} variant="Bulk" style={{paddingRight: 8}} />
                            }
                            <Text numberOfLines={1} style={{color: Assets.colors.black, fontSize: 14, fontFamily: 'Inter-Regular', opacity: 0.7}}>{replyTo.content}</Text>
                        </View>
                    </View>
                </Animated.View>
            }
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: '#f1f1f1'
    },
    header:{
        zIndex: 3,
        height: 100,
        width: '100%',
        paddingLeft: 20,
        paddingRight: 15,
        paddingTop: 30,
        backgroundColor: Assets.colors.background,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    main:{
        flex: 1,
        zIndex: 3
    },
    actionBar:{
        height: 70,
        width: '100%',
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
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
    row:{
        width: '100%',
        paddingHorizontal: 20,
    },
    bubble:{
        maxWidth: '85%',
        flexGrow: 0,
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    background:{
        position: 'absolute',
        height: Dimensions.get('screen').height,
        width: '100%',
        resizeMode: 'cover',
        opacity: 0.3
    },
    selectedRow:{
        position: 'absolute',
        zIndex: 8,
        height: '100%',
        width: Dimensions.get('screen').width,
        backgroundColor: Assets.colors.background,
        opacity: 0.3
    },
    replyContainer:{
        position: 'absolute',
        height: 80,
        width: '80%',
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 80,
        bottom: '100%',
        paddingTop: 10,
        paddingHorizontal: 10
    },
    replyTextContainer:{
        flex: 1,
        backgroundColor: "#f2f2f2",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 80,
        paddingVertical: 20,
        paddingHorizontal: 15,
    },
    mediaIndicator:{
        position: 'absolute',
        right: 15,
        bottom: '110%',
    }
})

export default Chat