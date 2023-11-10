//Edit User's informations

import { useEffect, useState } from "react"
import { SafeAreaView, StatusBar, StyleSheet, View, Text } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useCurrentUser } from "../providers/authProvider"
import { useForm } from "react-hook-form"
import { supabase } from "../supabase"
import { base_url } from "../hooks/axios"
import LoadingModal from "../components/loadingModal"
import Animated, {FadeInLeft} from "react-native-reanimated"
import validator from "validator"
import Button from "../components/button"
import Assets from "../assets"
import Input from "../components/input"

//Main component
const EditProfile =({route})=>{
    const navigation = useNavigation()
    const [loading, setLoading] = useState(false)
    const {field} = route.params
    const {user} = useCurrentUser()
    const {control, formState, setError, getValues, clearErrors} = useForm()
    const [messages, setMessages] = useState({
        email: null
    })
    const {errors} = formState

    const onChange =({name, value})=>{
        clearErrors(name)
    }

    const onSubmit =async()=>{
        let hasErrors = false
        let hasValue = false
        let timeout = null

        if(field === 'username'){
            const username = getValues('username')
            if(username){
                hasValue = true
                if(username.trim() === user.username){
                    setError('username', {message: "The new value is similar to the old one"})
                    hasErrors = true
                }else if(!validator.isAlphanumeric(username.trim())){
                    setError('username', {message: 'Invalid field'})
                    hasErrors = true
                }else{
                    clearErrors('username')
                }
            }else{
                setError('username', {message: 'Required'})
                hasErrors = true
            }
        }

        if(field === 'email'){
            const email = getValues('email')
            if(email){
                hasValue = true
                if(email.trim() === user.email){
                    setError('email', {message: "The new value is similar to the old one"})
                    hasErrors = true
                }else if(!validator.isEmail(email.trim())){
                    setError('email', {message: 'Invalid field'})
                    hasErrors = true
                }else{
                    clearErrors('email')
                }
            }else{
                setError('email', {message: 'Required'})
                hasErrors = true
            }
        }

        if(field === 'password'){
            let old_password = getValues('old_password')
            let new_password = getValues('new_password')

            if(!old_password){
                setError('old_password', {message: 'Required'})
                hasErrors = true
            }

            if(!new_password){
                setError('new_password', {message: 'Required'})
                hasErrors = true
            }

            if(old_password && new_password){
                hasValue = true
                if(!validator.isStrongPassword(new_password.trim())){
                    setError('new_password', {message: 'Your password must contain at least 08 characters, one uppercase, one number and one special character'})
                    hasErrors = true
                }else{
                    clearErrors('new_password')
                }
            }
        }

        if(!hasErrors && hasValue){
            setLoading(true)
            try {
                if(field === 'email' || field === 'username'){
                    if(field === 'email'){
                        const accessToken = (await supabase.auth.getSession()).data.session.access_token
                        const updateEmail = await supabase.auth.updateUser({
                            email: getValues('email').trim(),
                        }, {
                            emailRedirectTo: `http://localhost:8080/updateUserEmail/${user.id}/${accessToken}`
                        })
                        if(updateEmail.data &&updateEmail.data.user && updateEmail.data.user.email_change_sent_at){
                            setMessages(prev => ({...prev, email: 'A confirmation link has been sent'}))
                            timeout = setTimeout(()=>{
                                navigation.goBack()
                            }, 1000)
                        }else if(updateEmail.error){
                            console.log(updateEmail.error)
                            setError('email', {message: 'An error has occured. Please try again later'})
                        }
                    }    
                    
                    const updateUser = await supabase.from('profiles').update({[field]: getValues(field).trim()}).eq('id', user.id)
                    if(updateUser.error){
                        console.log(updateUser.error)
                        setError(field, {message: 'An error has occured. Please try again later'})
                    }else{
                        navigation.goBack()
                    }
                    
                }else{
                    const checkCredentials = await supabase.auth.signInWithPassword({email: user.email.trim(), password: getValues('old_password').trim()})
                    if(checkCredentials.data && checkCredentials.data.user){
                        if(getValues('old_password').trim() === getValues('new_password').trim()){
                            setError('new_password', {message: 'The new value is similar to the old one'})
                        }else{
                            const {data, error} = await supabase.auth.updateUser({
                                password: getValues('new_password').trim()
                            })
                            if(error){
                                console.log(error)
                                setError('new_password', {message: 'An error has occured. Please try again later'})
                            }else{
                                navigation.goBack()
                            }                            
                        }
                    }else{
                        setError('old_password', {message: 'Invalid password'})
                    }  
                }
                setLoading(false)
            } catch (err) {
                console.log(err)   
                setLoading(false)
            }
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle='dark-content' translucent backgroundColor='transparent' />
            <View style={styles.header}>
                <Button
                    icon='ArrowLeft'
                    iconVariant='Linear'
                    iconSize={24}
                    color={Assets.colors.black}
                    width={25}
                    onPress={()=> navigation.goBack()}
                />
                <Button
                    text='Update'
                    color={Assets.colors.background}
                    onPress={()=> onSubmit()}
                />
            </View>
            <View style={styles.main}>
                {loading && <LoadingModal />}
                {
                    field === 'username' && <EditUsername control={control} errors={errors} onChange={onChange} />
                }
                {
                    field === 'email' && <EditEmail control={control} errors={errors} messages={messages} onChange={onChange} />
                }
                {
                    field === 'password' && <EditPassword control={control} errors={errors} onChange={onChange} />
                }
            </View>
        </SafeAreaView>
    )
}

const EditUsername =({control, errors, onChange})=>{
    const {user} = useCurrentUser()

    return (
        <Animated.View entering={FadeInLeft.duration(800)}>
            <Input
                control={control}
                icon='Profile'
                error={errors.username}
                iconVariant='Linear'
                iconSize={20}
                iconColor='gray'
                name='username'
                width='100%'
                defaultValue={user.username}
                height={50}
                placeholder='Username'
                backgroundColor='#f1f1f1'
                handleChange={({name, value})=> onChange({name, value})}
            />        
            {errors.username && <Text style={{fontSize: 14, fontFamily: 'Inter-Regular', color: 'orangered', paddingTop: 5}}>{errors.username.message}</Text>}
        </Animated.View>
    )
}

const EditEmail =({control, errors, messages, onChange})=>{
    const {user} = useCurrentUser()

    return (
        <Animated.View entering={FadeInLeft.duration(800)}>
            <Input
                control={control}
                icon='Sms'
                error={errors.email}
                iconVariant='Linear'
                iconSize={20}
                iconColor='gray'
                name='email'
                width='100%'
                defaultValue={user.email}
                keyboardType='email-address'
                height={50}
                placeholder='Email'
                backgroundColor='#f1f1f1'
                handleChange={({name, value})=> onChange({name, value})}
            />        
            {errors.email && <Text style={{fontSize: 14, fontFamily: 'Inter-Regular', color: 'orangered', paddingTop: 5}}>{errors.email.message}</Text>}
            {messages.email && <Text style={{fontSize: 14, fontFamily: 'Inter-Regular', color: 'green', paddingTop: 5}}>{messages.email}</Text>}
        </Animated.View>
    )
}

const EditPassword =({control, errors, onChange})=>{
    const {user} = useCurrentUser()
    const [showOldPass, setShowOldPass] = useState(false)
    const [showNewPass, setShowNewPass] = useState(false)


    return (
        <View style={{gap: 10}}>
            <Animated.View entering={FadeInLeft.duration(800)}>
                <Input
                    control={control}
                    icon='Key'
                    error={errors.old_password}
                    iconVariant='Linear'
                    iconSize={20}
                    iconColor='gray'
                    name='old_password'
                    width='100%'
                    secureTextEntry={!showOldPass}
                    height={50}
                    placeholder='Old password'
                    backgroundColor='#f1f1f1'
                    handleChange={({name, value})=> onChange({name, value})}
                />        
                {errors.old_password && <Text style={{fontSize: 14, fontFamily: 'Inter-Regular', color: 'orangered', paddingTop: 5}}>{errors.old_password.message}</Text>}
                <View style={{height: 50, width: 50, position: 'absolute', right: 0}}>
                    <Button
                        icon={showOldPass ? 'EyeSlash' : 'Eye'}
                        iconVariant='Linear'
                        iconSize={22}
                        color='gray'
                        onPress={()=> setShowOldPass(!showOldPass)}
                        height='100%'
                        width='100%'
                    />
                </View>
            </Animated.View>
            <Animated.View entering={FadeInLeft.duration(800)}>
                <Input
                    control={control}
                    icon='Key'
                    error={errors.new_password}
                    iconVariant='Linear'
                    iconSize={20}
                    iconColor='gray'
                    name='new_password'
                    width='100%'
                    secureTextEntry={!showNewPass}
                    height={50}
                    placeholder='New password'
                    backgroundColor='#f1f1f1'
                    handleChange={({name, value})=> onChange({name, value})}
                />        
                {errors.new_password && <Text style={{fontSize: 14, fontFamily: 'Inter-Regular', color: 'orangered', paddingTop: 5}}>{errors.new_password.message}</Text>}
                <View style={{height: 50, width: 50, position: 'absolute', right: 0}}>
                    <Button
                        icon={showNewPass ? 'EyeSlash' : 'Eye'}
                        iconVariant='Linear'
                        iconSize={22}
                        color='gray'
                        onPress={()=> setShowNewPass(!showNewPass)}
                        height='100%'
                        width='100%'
                    />
                </View>
            </Animated.View>
        </View>

    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: 'white'
    },
    header:{
        height: 70,
        paddingTop: 40,
        width: '100%',
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    main:{
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 20
    }
})


export default EditProfile