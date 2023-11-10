// Profile Screen 👤
import { useEffect, useState } from "react"
import { SafeAreaView, StatusBar, StyleSheet, View, Text, Image, Dimensions, ActivityIndicator, TouchableOpacity } from "react-native"
import { useCurrentUser } from "../providers/authProvider"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { supabase } from "../supabase"
import { useToast } from "../providers/toastProvider"
import * as ImagePicker from 'expo-image-picker'
import Modal from "react-native-modal"
import LoadingModal from "../components/loadingModal"
import Animated, { FadeInLeft, SlideInDown } from "react-native-reanimated"
import Assets from "../assets"
import Button from "../components/button"
import AsyncStorage from "@react-native-async-storage/async-storage"


//Main component
const Profile =()=>{
    const {user, setUser, isConnected, socket, logout} = useCurrentUser()
    const {showToast} = useToast()
    const [loading, setLoading]= useState(false)
    const navigation = useNavigation()
    const isFocused = useIsFocused()

    //change user profile pic
    const setProfilePic =async()=>{
        try{
            setLoading(true)
            let results = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 4],
                quality: 1,
            })
            if(results && results.assets && !results.canceled){
                const ext = results.assets[0].uri.substring(results.assets[0].uri.lastIndexOf(".") + 1)
                const date = new Date()
                const image = {
                    uri: results.assets[0].uri,
                    name: `profilepic-${user.id}-${date.getTime()}.${ext}`,
                    type: 'image/'+ext
                }

                const picUpload = await supabase.storage.from('avatars').upload(`${user.id}/${image.name}`, image, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: image.type,
                })
                if(picUpload.data){
                    const {data: {publicUrl}} = supabase.storage.from('avatars').getPublicUrl(`${user.id}/${image.name}`)
                    if(publicUrl){
                        await supabase.from('profiles').update({profile_pic: publicUrl}).eq('id', user.id)
                    }
                }else if(picUpload.error){
                    showToast({
                        message: picUpload.error.message,
                        icon: 'EmojiSad',
                        iconColor: 'orangered',
                        duration: 2000
                    })
                }
                setLoading(false)
            }
        }catch(err){
            console.log(err)
            showToast({
                message: 'An error has occured',
                icon: 'EmojiSad',
                iconColor: 'orangered',
                duration: 2000
            })
            setLoading(false)
        }
    }

    //disconnect the user
    const logoutUser =async()=>{
        setLoading(true)
        const results = await logout()
        if(results !== 'hasError'){
            navigation.replace('welcome')
        }
        setLoading(false)
    }

    return ( user &&
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor='transparent' barStyle='light-content' translucent />
            {loading && <LoadingModal />}
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <Animated.View style={styles.topContainer}>
                    <View style={styles.header}>
                        <Button
                            icon='Logout'
                            iconVariant='Linear'
                            iconSize={30}
                            width={45}
                            height={45}
                            backgroundColor='rgba(255, 255, 255, 0.2)'
                            color='white'
                            onPress={()=> logoutUser()}
                        />
                    </View>
                    <View style={styles.profilePicContainer}>
                        {
                            !user.profile_pic || user.profile_pic === null ?
                            <Image source={Assets.images.user_blank} style={styles.profilePic} />
                            : 
                            <TouchableOpacity style={{flex: 1}} onPress={()=> navigation.navigate('mediaViewer', {medias: user.profile_pic, tag: 'profilePic', type: 'single'})}>
                                <Animated.Image sharedTransitionTag='profilePic' onError={(err)=> console.log(err.nativeEvent.error)} source={{ uri: user.profile_pic }} style={styles.profilePic} />                                
                            </TouchableOpacity>
                        }
                        <View style={{position: 'absolute', right: -7, bottom: -5}}>
                            <Button
                                icon='Camera'
                                iconVariant='Linear'
                                color={Assets.colors.black}
                                backgroundColor='white'
                                height={40}
                                width={40}
                                elevation={2}
                                onPress={()=> setProfilePic()}
                            />
                        </View>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInLeft.duration(600)} style={styles.row}>
                    <View style={{gap: 2}}>
                        <Text style={{fontSize: 13, fontFamily: 'Inter-Medium', color: Assets.colors.black, opacity: 0.6}}>Username</Text>
                        <Text style={{fontSize: 15, fontFamily: 'Inter-Medium', color: Assets.colors.black}}>{user.username}</Text>
                    </View>
                    <Button
                        icon='ArrowRight2'
                        iconVariant='Linear'
                        color='gray'
                        iconSize={20}
                        onPress={()=> navigation.navigate('editProfile', {field: 'username'})}
                    />
                </Animated.View>
                <Animated.View entering={FadeInLeft.duration(700)} style={styles.row}>
                    <View style={{gap: 2}}>
                        <Text style={{fontSize: 13, fontFamily: 'Inter-Medium', color: Assets.colors.black, opacity: 0.6}}>Email</Text>
                        <Text style={{fontSize: 15, fontFamily: 'Inter-Medium', color: Assets.colors.black}}>{user.email}</Text>
                    </View>
                    <Button
                        icon='ArrowRight2'
                        iconVariant='Linear'
                        color='gray'
                        iconSize={20}
                        onPress={()=> navigation.navigate('editProfile', {field: 'email'})}
                    />
                </Animated.View>
                <Animated.View entering={FadeInLeft.duration(800)} style={styles.row}>
                    <View style={{gap: 2}}>
                        <Text style={{fontSize: 13, fontFamily: 'Inter-Medium', color: Assets.colors.black, opacity: 0.6}}>Password</Text>
                        <Text style={{fontSize: 15, fontFamily: 'Inter-Medium', color: Assets.colors.black}}>******</Text>
                    </View>
                    <Button
                        icon='ArrowRight2'
                        iconVariant='Linear'
                        color='gray'
                        iconSize={20}
                        onPress={()=> navigation.navigate('editProfile', {field: 'password'})}
                    />
                </Animated.View>
                <Animated.View entering={FadeInLeft.duration(900)} style={styles.row}>
                    <View style={{gap: 2}}>
                        <Text style={{fontSize: 13, fontFamily: 'Inter-Medium', color: Assets.colors.black, opacity: 0.6}}>Member since</Text>
                        <Text style={{fontSize: 14, fontFamily: 'Inter-Medium', color: Assets.colors.black}}>{new Date(user.created_at).toLocaleDateString()}</Text>
                    </View>
                </Animated.View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: 'white',
    },
    topContainer:{
        height: 250,
        width: '100%',
        paddingHorizontal: 20,
        paddingTop: 60,
        backgroundColor: Assets.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 45,
        borderBottomRightRadius: 45,
        marginBottom: 30
    },
    header:{
        height: 70,
        width: '100%',
        alignItems: 'flex-end',
        justifyContent: 'center'
    },
    profilePicContainer:{
        marginTop: 20,
        height: 100,
        width: 100,
        backgroundColor: '#f1f1f1',
        borderRadius: 100,
        marginBottom: 70
    },
    profilePic:{
        borderRadius: 100,
        height: '100%',
        width: '100%'
    },
    row:{
        height: 70,
        alignItems: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: 'lightgray',
        width: '85%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15
    },
    modal:{
        height: 100,
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 15,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 15
    },
    profilePicModal:{
        flex: 1,
        backgroundColor: 'black'
    }
})

export default Profile