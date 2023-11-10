//Recipient informations
import { useEffect, useState } from "react"
import { SafeAreaView, StyleSheet, View, StatusBar, ImageBackground, Image, Dimensions, TouchableOpacity, Text } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useCurrentUser } from "../providers/authProvider"
import Animated, { FadeInDown, FadeIn, FadeInLeft } from "react-native-reanimated"
import Assets from "../assets"
import Button from "../components/button"

//Main component
const RecipientInfos =({route})=>{
    const [loading, setLoading] = useState(false)
    const [recipient, setRecipient] = useState(false)
    const {isConnected} = useCurrentUser()
    const [chatId, setChatId] = useState(false)
    const navigation = useNavigation()

    useEffect(()=>{
        setLoading(true)

        const {user, id} = route.params
        user && setRecipient(user)
        id && setChatId(id)

        setLoading(false)
    }, [route])


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor='transparent' barStyle='light-content' translucent />
            <View style={styles.header}>
                <Button
                    icon='ArrowLeft'
                    iconVariant='Linear'
                    iconSize={24}
                    color='white'
                    width={25}
                    onPress={()=> navigation.goBack()}
                />
            </View>
            <View style={styles.main}>
                <Animated.View entering={FadeInDown.duration(1000)} style={styles.card}>
                    <View style={styles.profilePic}>
                        {
                            recipient.profile_pic !== null ? 
                            <TouchableOpacity onPress={()=> navigation.navigate('mediaViewer', {medias: recipient.profile_pic, type: 'single'})}>
                                <Image source={{uri: recipient.profile_pic}} style={{height: '100%', width: '100%', borderRadius: 100}} />
                            </TouchableOpacity>
                            :
                            <Image source={Assets.images.user_blank} style={{height: '100%', width: '100%'}} />
                        }
                        {recipient.status && isConnected && <Animated.View entering={FadeIn} style={styles.recipientStatusIndicator} />}
                    </View>
                    <Animated.Text entering={FadeInLeft.duration(700)} style={{color: Assets.colors.black, fontSize: 16, fontFamily: 'Inter-SemiBold'}}>{recipient.username}</Animated.Text>
                    <Animated.Text entering={FadeInLeft.duration(900)} style={{color: Assets.colors.black, fontSize: 15, fontFamily: 'Inter-Regular', opacity: 0.7, paddingTop: 5}}>{recipient.email}</Animated.Text>
                    <View style={{marginTop: 20, width: '100%'}}>
                        <Button
                            icon="Message2"
                            iconVariant='Bold'
                            iconSize={20}
                            text="Chat now"
                            color='white'
                            backgroundColor={Assets.colors.background}
                            onPress={()=> navigation.navigate('chat', {user: recipient, id: chatId})}
                            height={55}
                            width='100%'
                            borderRadius={100}
                        />                        
                    </View>
                </Animated.View>
                <ImageBackground source={Assets.images.background_purple} style={styles.background}  />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: Assets.colors.background,
    },
    main:{
        flex: 0.90,
        alignItems: 'center',
        justifyContent: 'center'
    },
    card:{
        zIndex: 3,
        height: 300,
        width: 300,
        borderRadius: 20,
        elevation: 2,
        backgroundColor: 'white',
        paddingTop: 40,
        alignItems: 'center',
        paddingHorizontal: 25
    },
    header:{
        height: 70,
        paddingTop: 40,
        width: '100%',
        paddingHorizontal: 20,
        zIndex: 3
    },
    background:{
        position: 'absolute',
        opacity: 0.6,
        height: Dimensions.get('screen').height,
        width: '100%',
        resizeMode: 'cover'
    },
    profilePic:{
        height: 80,
        width: 80,
        borderRadius: 100,
        backgroundColor: '#f1f1f1',
        marginBottom: 15
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
})

export default RecipientInfos