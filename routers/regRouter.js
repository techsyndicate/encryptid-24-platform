const router = require('express').Router()
const User = require('../schemas/userSchema')
const bcrypt = require('bcrypt')

router.get('/', (req, res) => {
    res.render('register', {error: false})
})

router.post('/', async (req, res) => {
     const {username, password, name, cnfpassword} = req.body
     const foundUser = await User.findOne({username})
     if (!username || !password || !name || !cnfpassword) {
        return res.render('register', {error: "Please enter all the credentials."})
     }
     if (password != cnfpassword) {
        return res.render('register', {error: "The passwords do not match!"})
     }
     if (foundUser) {
        return res.render('register', {error: "A user with this username already exists. Please enter a unique username."})
     }
     const newUser = new User({
        username: username,
        name: name,
        password: await bcrypt.hash(password, 10)
     })
     await newUser.save()
     res.redirect('/login')
})

module.exports = router