//This provider handle all messages from supabase and store them into the local database

import { createContext, useContext, useEffect, useState } from "react"
import { useCurrentUser } from "./authProvider"
import { supabase } from '../supabase'
import { useRealm, useQuery } from "../models/realmContext"


const ChatContext = createContext(null)
const ChatProvider =({children})=> {
    const [state, setState] = useState(null)
    const {user, isConnected} = useCurrentUser()
    const realm = useRealm()

    useEffect(()=>{
        const newMessageListener = supabase.channel('messagesChannel').on('postgres_changes', { event: 'INSERT', schema: '*', table: 'messages' }, async payload =>{
            if(payload.new.recipient_id === user.id || payload.new.sender_id === user.id){
                const message = payload.new
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
                    
                    if(message.recipient_id === user.id){
                        const updateMessage = await supabase.from('messages').update({
                            status: 'received'
                        }).eq('message_id', message.message_id)
                        if(updateMessage.error){
                            console.log(updateMessage.error)
                        }                        
                    }
                }        
            }
  
            if(payload.errors){
                console.log('payload error:' +payload.errors)
            }
        })
        .subscribe()

        const messageUpdateListener = supabase.channel('messagesChannel2').on('postgres_changes', { event: 'UPDATE', schema: '*', table: 'messages' }, payload =>{
            if(payload.new.recipient_id === user.id || payload.new.sender_id === user.id){
                const message = payload.new
                const existingMessage = realm.objects('Message').filtered('id = $0', message.message_id)
                console.log('updated')

                if(existingMessage){
                    realm.write(()=>{
                        existingMessage[0].id = message.message_id,
                        existingMessage[0].chat_id = message.chat_id,
                        existingMessage[0].created_at = message.created_at,
                        existingMessage[0].sender_id = message.sender_id,
                        existingMessage[0].recipient_id = message.recipient_id,
                        existingMessage[0].content = message.content,
                        existingMessage[0].attachments = message.attachments,
                        existingMessage[0].reply_to = message.reply_to,
                        existingMessage[0].status = message.status,
                        existingMessage[0].duplicate = message.duplicate
                    })
                }

                if(payload.errors){
                    console.log('payload error:' +payload.errors)
                }            
            }
        })
        .subscribe()       
        
        return ()=>{
            console.log('chat listener unsubscribed')
            newMessageListener.unsubscribe()
            messageUpdateListener.unsubscribe()
        }
    }, [user, isConnected])

    return (
        <ChatContext.Provider value={{state}}>
            {children}
        </ChatContext.Provider>
    )
}

export const useChat =()=>{
    return useContext(ChatContext)
}

export default ChatProvider