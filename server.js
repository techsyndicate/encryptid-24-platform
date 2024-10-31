require('dotenv').config()

const express = require('express'),
    app = express(),
    path = require('path'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    flash = require('express-flash'),
    session = require('express-session'),
    PORT = process.env.PORT || 5001,
    loginRouter = require('./routers/loginRouter'),
    browserRouter = require('./routers/browserRouter'),
    proxyRouter = require('./routers/proxyRouter'),
    regRouter = require('./routers/regRouter'),
    adminRouter = require('./routers/adminRouter'),
    checkRouter = require('./routers/checkRouter'),
    {checkCmd} = require('./utils/bash'),
    {ensureAuthenticated, forwardAuthenticated, ensureAdmin} = require('./utils/authenticate'),
    User = require('./schemas/userSchema'),
    Challenge = require('./schemas/challengeSchema'),
    passportInit = require('./utils/passport-config'),
    bcrypt = require('bcrypt'),
    MongoStore = require('connect-mongo')

app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.set('view engine', 'ejs')
app.use(express.static('public'))
passportInit(passport)
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        mongooseConnection: mongoose.connection,
        ttl: 30 * 24 * 60 * 60 
    }),
    cookie: {
        secure: 'auto',
        maxAge: 30 * 24 * 60 * 60 * 1000
    }
}))
app.use(passport.initialize())
app.use(passport.session())

mongoose.connect(process.env.MONGO_URI, console.log('MONGODB CONNECTED'))

app.get('/', async(req, res) => {
    if (!req.user) return res.redirect('/login')
    const foundChallenges = await Challenge.find()
    res.render('index', {challenges: foundChallenges})
})
app.post('/check/cmd', async (req, res) => {
    if (!req.user) return res.end('no user found')
    const {cmd} = req.body
    const cmdResult = await checkCmd(cmd, req.user)
    return res.end(cmdResult)
})
app.post('/getuser', async (req, res) => {
    if (!req.user) return res.end('guest')
    return res.end(req.user.name)
})
app.use('/login', forwardAuthenticated, loginRouter)
app.use('/register', forwardAuthenticated, regRouter)
app.use('/browser', ensureAuthenticated, browserRouter)
app.use('/enableAndConfigureProxy', ensureAuthenticated, proxyRouter)
app.use('/admin', ensureAuthenticated, ensureAdmin, adminRouter)
app.use('/check', ensureAuthenticated, checkRouter)

app.listen(PORT, console.log(`RoboVM listening on port ${PORT}`))

// const User = require('./schemas/userSchema')
// async function testDo() {
//     const hashedPassword = await bcrypt.hash('test', 10)
//     const newUser = new User({
//         fname: 'Test',
//         lname: 'Test',
//         username: 'ctfuser',
//         password: hashedPassword
//     })
//     await newUser.save()
// }
// testDo()