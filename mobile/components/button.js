//custom button component

import { StyleSheet, View, Text, TouchableOpacity, Pressable } from "react-native"
import Assets from "../assets"


const Button=({
    width,
    height,
    backgroundColor,
    color,
    icon,
    iconVariant,
    iconSize,
    iconRotation,
    text,
    shadow,
    elevation,
    onPress,
    disabled,
    borderRadius,
    fontFamily,
    fontSize
    })=>{
    const CustomIcon = icon ? Assets.icons[icon] : ''

    return (
        <Pressable
            disabled={disabled}
            onPress={()=>onPress()}
            style={({ pressed })=>[
                styles.container,
                {width, height, elevation, backgroundColor},
                pressed && {opacity: 0.6},
                disabled && {opacity: 0.6},
                {borderRadius: borderRadius ? borderRadius : 15},
                icon && text && {gap: 10}
            ]}
        >
            {icon && <CustomIcon color={color} variant={iconVariant} size={iconSize} style={iconRotation && { transform: [{ rotate: iconRotation } ] }} /> }
            {text && <Text style={{color, fontSize: fontSize ? fontSize : 14, fontFamily: fontFamily ? fontFamily : 'Inter-SemiBold'}}>{text}</Text>}
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container:{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'

    }
})

export default Button
