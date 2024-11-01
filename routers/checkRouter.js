const router = require('express').Router(),
    Challenge = require('../schemas/challengeSchema'),
    User = require('../schemas/userSchema')

router.post('/:id', async (req, res) => {
    try {
        const {id} = req.params
        const {answer} = req.body
        const foundChallenge = await Challenge.findOne({challengeId: id})
        const userLogs = req.user.logs 
        if (!foundChallenge) return res.json({success: false, message: 'No such challenge!'})
        if (foundChallenge.solvers.includes(req.user.name)) {
            return res.json({success: false, message: 'Already answered!'})
        }
        const foundAnswer = foundChallenge.answer
        console.log(req.body)
        const newDate = new Date()
        if (answer !== foundAnswer) {
            userLogs.push({
                challenge: foundChallenge.title,
                attempt: answer,
                correct: false,
                time: newDate.toLocaleString('en-IN', {hour12: false, timeZone: 'Asia/Kolkata'}),
                unixTime: Number(newDate),
                user: req.user.name
            })
            await User.findByIdAndUpdate(req.user.id, {
                $set: {
                    logs: userLogs
                }
            })
            return res.json({success: false, message: 'Wrong answer!'})
        } else {
            const points = req.user.points + foundChallenge.points
            const solves = req.user.solves
            var challSolves = foundChallenge.solves,
                challSolvers = foundChallenge.solvers
            challSolves += 1
            challSolvers.push(req.user.name)
            solves.push(foundChallenge.title)
            userLogs.push({
                challenge: foundChallenge.title,
                attempt: answer,
                correct: true,
                time: newDate.toLocaleString('en-IN', {hour12: false, timeZone: 'Asia/Kolkata'}),
                unixTime: Number(newDate),
                user: req.user.name
            })
            await User.findByIdAndUpdate(req.user.id, {
                $set: {
                    logs: userLogs,
                    lastAnswered: Number(newDate),
                    points: points,
                    solves: solves
                }
            })
            await Challenge.findByIdAndUpdate(foundChallenge.id, {
                solves: challSolves,
                solvers: challSolvers
            })
            return res.json({success: true, message: 'Correct!'})
        }  
    } catch (error) {
        console.log(error)
        return res.json({success: false, message: 'Something went wrong.'})
    }
})

module.exports = router