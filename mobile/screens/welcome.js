//Welcome, Registration and login screen

import { useState } from "react"
import { StyleSheet, View, SafeAreaView, StatusBar, Image, Text, ActivityIndicator, ScrollView, Dimensions } from "react-native"
import { useForm } from "react-hook-form"
import { supabase } from "../supabase"
import { useCurrentUser } from "../providers/authProvider"
import { useNavigation } from "@react-navigation/native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Animated, { FadeIn, FadeInLeft, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import validator from "validator"
import Assets from "../assets"
import Button from '../components/button'
import Input from '../components/input'


const Welcome =()=>{
    const [currentScreen, setCurrentScreen] = useState(0)
    const height = useSharedValue('45%')

    const navigate =(screen)=>{
        if(screen === 1 || screen === 2 && currentScreen === 0){
            height.value = withTiming('85%', {duration: 600})  
        }else{
            height.value = withTiming('45%', {duration: 600})
        }
        
        setCurrentScreen(screen)
    }

    const bottomContainerAnimation = useAnimatedStyle(()=>{
        return {
            height: height.value
        }
    })

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle='light-content' backgroundColor='transparent' translucent />
            <View style={styles.topContainer}>
                <Image source={Assets.images.hands_w_phone} style={{height: 300, width: 300}} />
            </View>
            <Animated.View style={[styles.bottomContainer, bottomContainerAnimation]}>
                {
                    currentScreen === 0 && <WelcomeView navigate={navigate} />                
                }
                {
                    currentScreen === 1 && <RegisterView navigate={navigate} />                
                }
                {
                    currentScreen === 2 && <LoginView navigate={navigate} />                
                }               
            </Animated.View>
        </SafeAreaView>
    )
}

const WelcomeView =({navigate})=>{
    return (
        <Animated.View entering={FadeIn} style={{flex: 1}}>
            <Text style={{color: Assets.colors.black, fontSize: 40, fontFamily: 'Inter-SemiBold', width: '60%'}}>Connect, Chat, Repeat</Text>
            <View style={{paddingVertical: 15, alignItems: 'center', gap: 15}}>
                <Button
                    text='Create an account'
                    color='white'
                    backgroundColor={Assets.colors.background}
                    fontSize={15}
                    height={60}
                    width='70%'
                    borderRadius={100}
                    elevation={2}
                    onPress={()=> navigate(1)}
                />
                <View style={{flexDirection: 'row', gap: 7}}>
                    <Text style={{color: Assets.colors.black, fontSize: 14, fontFamily: 'Inter-Regular'}}>already have an account?</Text>
                    <Button
                        text='Login'
                        color={Assets.colors.background}
                        onPress={()=> navigate(2)}
                    />
                </View>
            </View>   
        </Animated.View> 
    )
}

const RegisterView =({navigate})=>{
    const {control, getValues, setError, clearErrors, formState} = useForm()
    const {errors} = formState
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigation = useNavigation()

    const onSubmit =async()=>{
        let hasErrors = false
        const values = {
            username: getValues('username'),
            email: getValues('email'),
            password: getValues('password')
        }

        if(!values.username){
            setError('username', {message: 'Required'})
            hasErrors = true
        }else{
            if(!validator.isAlphanumeric(values.username.trim())){
                setError('username', {message: 'Invalid field'})
                hasErrors = true
            }else{
                clearErrors('username')
            }
        }

        if(!values.email){
            setError('email', {message: 'Required'})
            hasErrors = true
        }else{
            if(!validator.isEmail(values.email.trim())){
                setError('email', {message: 'Invalid field'})
                hasErrors = true
            }else{
                clearErrors('email')
            }
        }

        if(!values.password){
            setError('password', {message: 'Required'})
            hasErrors = true
        }else{
            if(!validator.isStrongPassword(values.password.trim())){
                setError('password', {message: 'Your password must contain at least 08 characters, one uppercase, one number and one special character'})
                hasErrors = true
            }else{
                clearErrors('password')
            }
        }

        if(!hasErrors){
            try{
                setLoading(true)
                const results = await supabase.auth.signUp({
                    email: values.email.trim(),
                    password: values.password.trim(),
                })
                if(results && results.data){
                    if(results.data.user){
                        const newUser = {
                            username: values.username.trim(), 
                            email: results.data.user.email
                        }
                        await supabase.from('profiles').insert(newUser)
                        newUser.id = results.data.user.id
                        await AsyncStorage.setItem('user', JSON.stringify(newUser))
                        navigation.replace('userScreens')
                    }else if(results.error){
                       setError('email', {message: results.error.message})
                    }
                    setLoading(false)
                }
            }catch(err){
                setLoading(false)
                setError('email', {message: 'An error has occured'})
                console.log(err)
            }
        }
    }


    return (
        <View style={{flex: 1}}>
            <View style={styles.header}>
                <Button
                    height={30}
                    width={30}
                    icon='ArrowLeft'
                    iconVariant='Linear'
                    color={Assets.colors.black}
                    onPress={()=> navigate(0)}
                />                
            </View>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                <Animated.View entering={FadeInLeft.duration(400)} style={{marginTop: 25}}>
                    <Text style={{fontFamily: 'Inter-SemiBold', fontSize: 20, color: Assets.colors.black}}>Create an account</Text>
                    <Text style={{fontFamily: 'Inter-Regular', fontSize: 14, color: Assets.colors.black}}>Please enter info to create an account</Text>
                </Animated.View>
                <View style={{marginTop: 25, gap: 10}}>
                    <Animated.View entering={FadeInLeft.duration(500)}>
                        <Input
                            control={control}
                            icon='Profile'
                            error={errors.username}
                            iconVariant='Linear'
                            iconSize={20}
                            iconColor='gray'
                            name='username'
                            width='100%'
                            height={50}
                            placeholder='Username'
                            backgroundColor='#f1f1f1'
                        />        
                        {errors.username && <Text style={{fontSize: 14, fontFamily: 'Inter-Regular', color: 'orangered', paddingTop: 5}}>{errors.username.message}</Text>}
                    </Animated.View>
                    <Animated.View entering={FadeInLeft.duration(600)}>
                        <Input
                            control={control}
                            icon='Sms'
                            iconVariant='Linear'
                            iconSize={20}
                            iconColor='gray'
                            name='email'
                            width='100%'
                            error={errors.email}
                            keyboardType='email-address'
                            height={50}
                            placeholder='Email'
                            backgroundColor='#f1f1f1'
                        />              
                        {errors.email && <Text style={{fontSize: 14, fontFamily: 'Inter-Regular', color: 'orangered', paddingTop: 5}}>{errors.email.message}</Text>}      
                    </Animated.View>
                    <Animated.View entering={FadeInLeft.duration(700)}>
                        <Input
                            control={control}
                            icon='Key'
                            iconVariant='Linear'
                            iconSize={20}
                            iconColor='gray'
                            name='password'
                            width='100%'
                            height={50}
                            error={errors.password}
                            placeholder='Choose a password'
                            backgroundColor='#f1f1f1'
                            secureTextEntry={!showPass}
                        />    
                        <View style={{height: 50, width: 50, position: 'absolute', right: 0}}>
                            <Button
                                icon={showPass ? 'EyeSlash' : 'Eye'}
                                iconVariant='Linear'
                                iconSize={22}
                                color='gray'
                                onPress={()=> setShowPass(!showPass)}
                                height='100%'
                                width='100%'
                            />
                        </View>
                        {errors.password && <Text style={{fontSize: 14, fontFamily: 'Inter-Regular', color: 'orangered', paddingTop: 5}}>{errors.password.message}</Text>}                      
                    </Animated.View>
                    <Animated.View entering={FadeInLeft.duration(800)}>
                        <Button
                            height={55}
                            width='100%'
                            backgroundColor={Assets.colors.background}
                            text={!loading ? 'Next' : <ActivityIndicator size='small' color='white' />}
                            disabled={loading}
                            color='white'
                            borderRadius={100}
                            onPress={()=> onSubmit()}
                        />
                    </Animated.View>
                    <Animated.View entering={FadeInLeft.duration(900)} style={{flexDirection: 'row', gap: 7, justifyContent: 'center'}}>
                        <Text style={{color: Assets.colors.black, fontSize: 14, fontFamily: 'Inter-Regular'}}>already have an account?</Text>
                        <Button
                            text='Login'
                            color={Assets.colors.background}
                            onPress={()=> navigate(2)}
                        />
                    </Animated.View>
                </View>                
            </ScrollView>

        </View>
    )
}

const LoginView =({navigate})=>{
    const {control, getValues, setError, clearErrors, formState} = useForm()
    const {errors} = formState
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigation = useNavigation()

    const onSubmit =async()=>{
        let hasErrors = false
        const values = {
            email: getValues('email'),
            password: getValues('password')
        }

        if(!values.email){
            setError('email', {message: 'Required'})
            hasErrors = true
        }else{
            if(!validator.isEmail(values.email.trim())){
                setError('email', {message: 'Invalid field'})
                hasErrors = true
            }else{
                clearErrors('email')
            }
        }

        if(!values.password){
            setError('password', {message: 'Required'})
            hasErrors = true
        }else{
            clearErrors('password')
        }

        if(!hasErrors){
            try{
                setLoading(true)
                const results = await supabase.auth.signInWithPassword({
                    email: values.email.trim(),
                    password: values.password.trim(),
                })
                if(results && results.data){
                    if(results.data.user){
                        const user = await supabase.from('profiles').select("*").eq('id', results.data.user.id).single()
                        if(user.data){
                            await AsyncStorage.setItem('user', JSON.stringify(user.data))
                            navigation.replace('userScreens')                            
                        }else if(user.error){
                            console.log(user.error)
                        }
                    }else if(results.error){
                        console.log(results.error)
                        if(results.error.message === 'Invalid login credentials'){
                            setError('email', {message: 'Invalid email or password'})
                        }
                    }
                    setLoading(false)
                }
            }catch(err){
                setLoading(false)
                setError('email', {message: 'An error has occured'})
                console.log(err)
            }
        }
    }


    return (
        <View style={{flex: 1}}>
            <View style={styles.header}>
                <Button
                    height={30}
                    width={30}
                    icon='ArrowLeft'
                    iconVariant='Linear'
                    color={Assets.colors.black}
                    onPress={()=> navigate(0)}
                />                
            </View>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                <Animated.View entering={FadeInLeft.duration(400)} style={{marginTop: 25}}>
                    <Text style={{fontFamily: 'Inter-SemiBold', fontSize: 20, color: Assets.colors.black}}>Login</Text>
                    <Text style={{fontFamily: 'Inter-Regular', fontSize: 14, color: Assets.colors.black}}>Please enter info to login to your account</Text>
                </Animated.View>
                <View style={{marginTop: 25, gap: 10}}>
                    <Animated.View entering={FadeInLeft.duration(600)}>
                        <Input
                            control={control}
                            icon='Sms'
                            iconVariant='Linear'
                            iconSize={20}
                            iconColor='gray'
                            name='email'
                            width='100%'
                            error={errors.email}
                            keyboardType='email-address'
                            height={50}
                            placeholder='Email'
                            backgroundColor='#f1f1f1'
                        />              
                        {errors.email && <Text style={{fontSize: 14, fontFamily: 'Inter-Regular', color: 'orangered', paddingTop: 5}}>{errors.email.message}</Text>}      
                    </Animated.View>
                    <Animated.View entering={FadeInLeft.duration(700)}>
                        <Input
                            control={control}
                            icon='Key'
                            iconVariant='Linear'
                            iconSize={20}
                            iconColor='gray'
                            name='password'
                            width='100%'
                            height={50}
                            error={errors.password}
                            placeholder='Your password'
                            backgroundColor='#f1f1f1'
                            secureTextEntry={!showPass}
                        />    
                        <View style={{height: 50, width: 50, position: 'absolute', right: 0}}>
                            <Button
                                icon={showPass ? 'EyeSlash' : 'Eye'}
                                iconVariant='Linear'
                                iconSize={22}
                                color='gray'
                                onPress={()=> setShowPass(!showPass)}
                                height='100%'
                                width='100%'
                            />
                        </View>
                        {errors.password && <Text style={{fontSize: 14, fontFamily: 'Inter-Regular', color: 'orangered', paddingTop: 5}}>{errors.password.message}</Text>}                      
                    </Animated.View>
                    <Animated.View entering={FadeInLeft.duration(800)}>
                        <Button
                            height={55}
                            width='100%'
                            backgroundColor={Assets.colors.background}
                            text={!loading ? 'Next' : <ActivityIndicator size='small' color='white' />}
                            disabled={loading}
                            color='white'
                            borderRadius={100}
                            onPress={()=> onSubmit()}
                        />
                    </Animated.View>
                    <Animated.View entering={FadeInLeft.duration(900)} style={{flexDirection: 'row', gap: 7, justifyContent: 'center'}}>
                        <Text style={{color: Assets.colors.black, fontSize: 14, fontFamily: 'Inter-Regular'}}>No account?</Text>
                        <Button
                            text='Register'
                            color={Assets.colors.background}
                            onPress={()=> navigate(1)}
                        />
                    </Animated.View>
                </View>                
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        height: Dimensions.get('screen').height,
        width: '100%',
        backgroundColor: Assets.colors.background
    },
    topContainer:{
        height: '60%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    }, 
    bottomContainer:{
        position: 'absolute',
        bottom: 0,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        height: '45%',
        width: '100%',
        paddingHorizontal: 25,
        backgroundColor: 'white',
        paddingTop: 40,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.39,
        shadowRadius: 8.30,
        elevation: 13,
    },
    header:{
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }
})

export default Welcome