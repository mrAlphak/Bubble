const supabase = require('../supabase')

const updateEmail =async(req, res, next)=> {
    const {id, accessToken} = req.params

    if(id && accessToken){
        const isAuth = await supabase.auth.getUser(accessToken)
        if(isAuth.data){
            const email = isAuth.data.user.email
            if(email){
                await supabase.from('profiles').update({email: email}).eq('id', id)
                res.status(200).json('email updated')
            }else{
                res.status(500).json('an error has occured')
            }
        }else if(isAuth.error){
            res.status(401).json('unauthorized')
        }
    }else{
        res.status(400).json('missing data')
    }
}


module.exports = {
    updateEmail
}