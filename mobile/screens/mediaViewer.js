// Media Viewer 🖼️

import {useCallback, useEffect, useRef, useState} from "react";
import {SafeAreaView, View, FlatList, Dimensions, Image, StyleSheet} from "react-native"
import {useNavigation} from "@react-navigation/native"
import { Video, ResizeMode } from 'expo-av'
import ImageView from "react-native-image-viewing"
import Button from "../components/button"
import Animated from "react-native-reanimated"

//Main component
const MediaViewer =({route})=>{
    const navigation = useNavigation()
    const [currentIndex, setCurrentIndex] = useState(0)
    const {medias} = route.params
    const parts = medias.split('.')
    const extension = parts[parts.length - 1]

    return (
        <SafeAreaView style={styles.container}>
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
                <View style={{height: '50%', width: '100%', backgroundColor: '#f1f1f1'}}> 
                    {
                        medias && 
                        extension === 'jpg' || extension === 'png' || extension === 'jpeg' ?
                            <Image 
                                source={{uri: medias}}
                                style={{height: '100%', width: '100%', resizeMode: 'contain'}}
                            /> :
                            <Video 
                                source={{uri: medias}} 
                                resizeMode={ResizeMode.CONTAIN} 
                                useNativeControls
                                style={{height: '100%', width: '100%'}}
                            />
                    }                 
                </View>        
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: 'black'
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
    main:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
})

export default MediaViewer