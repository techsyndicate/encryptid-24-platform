const router = require('express').Router(),
    User = require('../schemas/userSchema'),
    Challenge = require('../schemas/challengeSchema')

router.get('/', async (req, res) => {
    try {
        const allUsers = await User.find()
        const crypticLevels = await Challenge.find({type: 'cryptic'})
        const ctfLevels = await Challenge.find({type: 'ctf'})
        res.render('admin', {users: allUsers, crypticLevels, ctfLevels})       
    } catch (error) {
        console.log(error)
        res.end('something went wrong. pliz check console.')
    }
})

router.get('/new', (req, res) => {
    res.render('newChallenge', {error: false})
})

router.post('/new', async (req, res) => {
    try {
        var {title, description, challengeId, type, points, attachmentLink, attachmentName, img, answer} = req.body
        if (!title || !description || !challengeId || !type || !points || !answer) {
            return res.render('newChallenge', {error: 'Please enter all the creds!'})
        }
        if (!attachmentLink) attachmentLink = 'none'
        if (!attachmentName) attachmentName = 'none'
        if (!img) img = 'none'
        const newChallenge = new Challenge({title, description, challengeId, type, points, attachmentLink, attachmentName, img, answer})
        await newChallenge.save()
        res.redirect('/admin')       
    } catch (error) {
        console.log(error)
        res.send('something went wrong. pliz check console.')
    }
})

router.get('/user/:id', async (req, res) => {
    const {id} = req.params
    try {
        const foundUser = await User.findById(id)
        if (!foundUser) {
            return res.redirect('/admin')
        }
        res.render('adminUser', {user: foundUser})
    } catch (error) {
        console.log(error)
        res.end('something went wrong. pliz check console.')
    }
})

router.get('/challenge/:id', async (req, res) => {
    try {
        const foundChallenge = await Challenge.findOne({challengeId: req.params.id})
        if (!foundChallenge) return res.redirect('/admin')
        res.render('adminChallenge', {challenge: foundChallenge})      
    } catch (error) {
        console.log(error)
        res.end('something went wrong. pliz check console.')
    }
})

router.post('/challenge/:id', async (req, res) => {
    try {
        const foundChallenge = await Challenge.findOne({challengeId: req.params.id})
        if (!foundChallenge) return res.redirect('/admin')
        const {title, description, challengeId, type, points, img, attachmentLink, attachmentName, answer} = req.body
        await Challenge.updateOne({challengeId: req.params.id}, {
            $set: {title, description, challengeId, type, points, img, attachmentLink, attachmentName, answer}
        })
        res.redirect(`/admin/challenge/${req.params.id}`)      
    } catch (error) {
        console.log(error)
        res.end('something went wrong. plij check console.')
    }
})

module.exports = router