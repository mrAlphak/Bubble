//Custom link component

import { StyleSheet, View, Text, TouchableOpacity } from "react-native"


const Link=({style, onPress, children, disabled})=>{
    return(
        <TouchableOpacity style={[disabled && {opacity: 0.3}]} onPress={onPress} disabled={disabled}>
            <View style={[style]}>
                {children}
            </View>
        </TouchableOpacity>

    )
}


export default Link
