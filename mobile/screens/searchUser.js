//Search users screen 🔍

import { useEffect, useState } from "react"
import { SafeAreaView, StatusBar, StyleSheet, View, Text, Image, FlatList, ActivityIndicator, TouchableOpacity } from "react-native"
import { useCurrentUser } from "../providers/authProvider"
import { useNavigation } from "@react-navigation/native"
import { useForm } from "react-hook-form"
import { supabase } from "../supabase"
import { useRealm } from "../models/realmContext"
import Animated, {FadeIn, FadeInLeft} from "react-native-reanimated"
import Assets from "../assets"
import Button from "../components/button"
import Input from "../components/input"

//Main component
const SearchUser =()=>{
    const {control} = useForm()
    const {user} = useCurrentUser()
    const [loading, setLoading] = useState(false)
    const [searchResults, setSearchResults] = useState([])
    const navigation = useNavigation()

    const handleSearch = async({value})=>{
        if(value){
            try{
                setLoading(true)
                const results = await supabase
                .from('profiles')
                .select("*")
                .ilike('username', `%${value}%`)
                if(results){
                    if(results.data){
                        setSearchResults(results.data)
                    }else if(results.error){
                        console.log(results.error)
                        setSearchResults([])
                    }else{
                        setSearchResults([])
                    }
                }
                setLoading(false)
            }catch(err){
                console.log(err)
                setLoading(false)
            }
        }else{
            setSearchResults([])
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor='transparent' barStyle='dark-content' translucent />
            <View style={styles.header}>
                <Button
                    icon='ArrowLeft'
                    iconSize={25}
                    iconVariant='Linear'
                    color={Assets.colors.black}
                    height={40}
                    width={30}
                    onPress={()=> navigation.goBack()}
                />
                <Animated.View entering={FadeInLeft.duration(700)} style={{width: '100%'}}>
                    <Input
                        control={control}
                        icon='SearchNormal'
                        iconVariant='Linear'
                        iconSize={20}
                        iconColor='gray'
                        name='search'
                        width='100%'
                        height={50}
                        placeholder='Search a user..'
                        backgroundColor='#f1f1f1'
                        handleChange={({name, value})=> handleSearch({name, value})}
                    />        
                </Animated.View>
            </View>
            <View style={styles.main}>
                {
                    !loading && searchResults.length > 0 &&
                    <View style={{flex: 1, paddingTop: 30}}>
                        <Text style={{color: Assets.colors.black, fontSize: 15, fontFamily: 'Inter-Regular', opacity: 0.7}}>Results {searchResults.length}</Text>
                        <FlatList
                            data={searchResults}
                            keyExtractor={(item, index)=> index.toString()}
                            renderItem={({item})=> <Row item={item} />}
                            bounces={false}
                            style={{marginTop: 30}}
                            showsVerticalScrollIndicator={false}
                        />                    
                    </View>

                }
                {
                    loading && <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <ActivityIndicator size='small' color={Assets.colors.background} />
                    </View>
                }
            </View>
        </SafeAreaView>
    )
}

// Component that displays each user
const Row =({item})=>{
    const {user} = useCurrentUser()
    const [recipient, setRecipient] = useState(null)
    const [chatId, setChatId] = useState(null)
    const navigation = useNavigation()
    const realm = useRealm()

    //listen to recipient information updates from supabase
    useEffect(()=>{
        setRecipient(item)
        const listener = supabase.channel('profilesChannel2').on('postgres_changes', { event: '*', schema: '*', table: 'profiles' }, payload =>{
            if(payload.new.id === item.id){
                setRecipient(payload.new)
            }
            if(payload.errors){
                console.log(payload.errors)
            }
        })
        .subscribe()

        realm.write(()=>{
            const hasChat = realm.objects('Message').filtered('sender_id = $0 OR recipient_id = $1', item.id, item.id)         
            if(hasChat.length > 0){
                setChatId(hasChat[0].chat_id)
            }
        })

        return()=>{
            listener.unsubscribe()
        }
    }, [])

    return (
        recipient &&
        <Animated.View entering={FadeIn}>
            <TouchableOpacity onPress={()=> navigation.replace('chat', {user: recipient, id: chatId})} style={styles.row}>
                <View style={styles.profilePic}>
                    {
                        recipient.profile_pic !== null ? 
                        <Image source={{uri: recipient.profile_pic}} style={{height: '100%', width: '100%'}} />
                        :
                        <Image source={Assets.images.user_blank} style={{height: '100%', width: '100%'}} />
                    }
                </View>
                <View>
                    <Text style={{color: Assets.colors.black, fontSize: 15, fontFamily: 'Inter-Medium'}}>{recipient.username}</Text>
                    <Text style={{color: Assets.colors.black, fontSize: 13, fontFamily: 'Inter-Regular'}}>{recipient.status}</Text>
                </View>
            </TouchableOpacity>            
        </Animated.View>

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
        paddingHorizontal: 20,
        paddingTop: 30,
        justifyContent: 'space-between',
        gap: 7
    },
    row:{
        height: 55,
        width: '100%',
        flexDirection: 'row',
        gap: 15,
        alignItems: 'center'
    },
    main:{
        flex: 1,
        paddingHorizontal: 20
    },
    profilePic:{
        height: 45,
        width: 45,
        borderRadius: 100,
        backgroundColor: '#f1f1f1',
        overflow: 'hidden'
    }
})

export default SearchUser