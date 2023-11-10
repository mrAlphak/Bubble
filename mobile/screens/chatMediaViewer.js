// Chat Media Viewer 🖼️

import { useState, useEffect } from "react"
import { SafeAreaView, ScrollView, View, StatusBar, StyleSheet, Dimensions, ActivityIndicator, Image } from "react-native"
import { Video, ResizeMode } from 'expo-av'
import { useNavigation } from "@react-navigation/native"
import Button from "../components/button"

//Main component
const ChatMediaViewer =({route})=>{
    const { selectedMedia } = route.params
    const [currentIndex, setCurrentIndex] = useState(0)
    const [attachments, setAttachments] = useState([])
    const [isMounted, setIsMounted] = useState(false)
    const navigation = useNavigation()

    // remove a selected media
    const removeAttachment=()=>{
        if(currentIndex !== null){
            let arr = [...attachments]
            let newArr = arr.filter((prev, index) => index !== currentIndex)
            setAttachments(newArr)
            if(newArr.length === 0){
                navigation.navigate('chat', {attachments: newArr})
            }
        }
    }

    const onScroll =(e)=>{
        const x = e.nativeEvent.contentOffset.x
        const visibleItem = Math.floor(x / Dimensions.get('screen').width)
        setCurrentIndex(visibleItem)
    }

    useEffect(()=>{
        if(selectedMedia && !isMounted){
            setAttachments(selectedMedia)
        }
    }, [route, isMounted])

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Button
                    icon='ArrowLeft'
                    iconSize={25}
                    iconVariant='Linear'
                    color='white'
                    height={40}
                    width={30}
                    onPress={()=> navigation.goBack()}
                />
                <Button
                    icon='Trash'
                    iconSize={25}
                    iconVariant='Linear'
                    color='white'
                    height={40}
                    width={30}
                    onPress={()=> removeAttachment()}
                />
            </View>
            {
                attachments.length === 0 ?
                <View style={styles.main}>
                    <ActivityIndicator color='white' size='small' />
                </View>
                :
                <View style={styles.main}>
                    <ScrollView
                        horizontal
                        snapToInterval={Dimensions.get('screen').width}
                        bounces={false}
                        decelerationRate="fast"
                        overScrollMode="never"
                        onScroll={onScroll}
                    >
                    {
                        attachments.map((item) =>
                        <View key={item.id} style={{height: '50%', width: Dimensions.get('screen').width, alignSelf: 'center', backgroundColor: '#f1f1f1'}}>
                            {
                                item.type.slice(0, 5) === 'image' ?
                                    <Image source={{uri: item.uri}} style={{height: '100%', width: '100%', resizeMode: 'contain'}} />
                                    :
                                    <Video
                                        source={{uri: item.uri}}
                                        useNativeControls
                                        resizeMode={ResizeMode.CONTAIN}
                                        style={{height: '100%', width: '100%'}}
                                    />
                            }
                        </View>
                        )
                    }
                    </ScrollView>
                    <View style={styles.bottomContainer}>
                        <Button
                            text='Annuler'
                            color='white'
                            width='50%'
                            height={50}
                            onPress={()=> navigation.navigate('chat', {attachments: []})}
                        />
                        <Button
                            text='Continuer'
                            color='white'
                            width='50%'
                            height={50}
                            onPress={()=> navigation.navigate('chat', {attachments})}
                        />
                    </View>
                </View>
            }
        </SafeAreaView>

    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: 'black'
    },
    main:{
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    header:{
        height: 100,
        width: '100%',
        paddingTop: 30,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    bottomContainer:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
})

export default ChatMediaViewer