// A modal which displays a loading state

import {View, Text, ActivityIndicator, Dimensions, StyleSheet} from 'react-native'
import Modal from 'react-native-modal'
import Assets from '../assets'

const LoadingModal =()=>{

    return (
        <Modal isVisible={true} backdropOpacity={0.4} deviceHeight={Dimensions.get('screen').height} statusBarTranslucent>
            <View style={styles.modal}>
                <ActivityIndicator color={Assets.colors.background} size='small' />
                <Text style={{fontSize: 13, fontFamily: 'Inter-Medium', color: Assets.colors.black}}>Please wait..</Text>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
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
})

export default LoadingModal