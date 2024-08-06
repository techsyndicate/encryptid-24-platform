const validCommands = ['echo', 'cat', 'whoami', 'pwd', 'cd', 'ls', 'dir', 'mkdir', 'touch', 'ssh', 'rm', 'mv', 'rmdir', 'cp', 'file', 'grep', 'head', 'tail', 'diff', 'ping', 'curl', 'man', 'ln', 'clear']
    // User = require('../schemas/userSchema')

const checkCmd = async (cmd, req) => {
    const command = cmd.trim().split(' ')
    if (validCommands.includes(command[0])) {
        if (command[0] == 'whoami') {
            const currentUser = getUser(req)
            return currentUser
        } else if (command[0] == 'pwd') {
            const currentDirectory = await getDirectory()
            return currentDirectory
        } else if (command[0] == 'echo') {
            const echoCommand = command.join(' ').slice(5)
            return echoCommand
        }
    } else {
        return `Bash: command "${command[0]}" not found.`
    }
}

function getUser(req) {
    return req.username
}

async function getDirectory() {

}

module.exports = {checkCmd}