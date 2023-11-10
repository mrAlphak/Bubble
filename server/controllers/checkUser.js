const Supabase = require('../supabase')
const CheckUser = async(req, res, next)=>{
    const token = req.headers.authorization.split(' ')[1]

    if(token){
        const user = await Supabase.auth.getUser(token)
        if(user.data){
            req.user = user.data
            next()
        }else{
            res.status(400).json('Unauthorized')
        }
    }

}

module.exports = CheckUser