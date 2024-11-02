
const checkCmd = async (cmd, req) => {
    const command = cmd.trim().split(' ')
    if (command[0] == 'whoami') {
        const currentUser = getUser(req)
        return currentUser
    } else if (command[0] == 'pwd') {
        const currentDirectory = await getDirectory()
        return currentDirectory
    } else if (command[0] == 'echo') {
        const echoCommand = command.join(' ').slice(5)
        return echoCommand
    } else if (command[0] == 'pronovarexnishugal') {
        return 'SHISTECH WINNER LESGOOO'
    } else if (command[0] == 'cookies') {
        return 'TSTST TTSTT STTST STTST TTSSS TTSTT TTSSS STTSS TSSTT STTST TTTTS TTSTT TTSST TSTTT TSSTT.'
    } else if (command[0] == 'yourmileagemayvary') {
        return 'Their combination....<br>Epw pil kzmibml bpm pwzam eqbp vw mvl?<br>What was up in 1963?'
    }
    else {
        return `Bash: command "${command[0]}" not found.`
    }
}

function getUser(req) {
    return req.name
}

async function getDirectory() {

}

module.exports = {checkCmd}