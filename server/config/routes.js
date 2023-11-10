const express = require('express')
const router = express.Router()
const checkUser = require('../controllers/checkUser')

router.get('/', (req, res, next)=>{
    res.status(200).json('Bubble socket server working well!')
})
router.get('/updateUserEmail/:id/:accessToken', require('../controllers/updateUser').updateEmail)

module.exports = router