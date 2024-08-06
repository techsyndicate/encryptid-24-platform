const router = require('express').Router(),
    fetch = require('node-fetch'),
    crypto = require('crypto')

router.post('/', async (req, res) => {
    try {
        const {searchUrl} = req.body
        if (searchUrl.trim() == '127.0.0.1:54041') {
            if (!req.user.proxy || req.user.proxy == 'none') {
                return res.end(`Proxy has not been configured! Configure a valid proxy <a href='${process.env.SITE_URL}/enableAndConfigureProxy'>here</a>`)
            }
            const meraClientRandom = crypto.randomBytes(16)
            const clientHello = await fetch(req.user.proxy, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'Client Hello',
                    tlsVersion: 'v1.2',
                    supportedCiphers: ['RSA'],
                    clientRandom: '0x' + meraClientRandom.toString('hex'),
                    requiredFields: {
                        acceptedMethod: "The method chosen by the server for encryption.",
                        serverRandom: "The server random.",
                        certificate: {
                            serviceProvider: "The CA of the server's TLS certificate.",
                            publicKey: "RSA Public key of the server (e,n).",
                            signature: "Signature of the TLS certificate assigned by the service provider."
                        }
                    }
                })
            })
            const serverHello = await clientHello.json()
            if (!serverHello.certificate || !serverHello.acceptedMethod || !serverHello.serverRandom) {
                return res.json({type: 'Error', error: 'Invalid server hello!'})
            }
            if (Buffer.from(serverHello.serverRandom, 'hex').length != 16) {
                return res.json({type: 'Error', error: 'The server random must be a hex string of 16 bytes NOT starting with \'0x\'.'})
            }
            if (!serverHello.certificate.signature || !serverHello.certificate.publicKey || !serverHello.certificate.serviceProvider) {
                return res.json({type: 'Error', error: 'Invalid TLS Certificate!'})
            }
            if (serverHello.acceptedMethod != 'RSA') {
                return res.json({type: 'Error', error: 'The proxy rejected the proposed encryption methods.'})
            }
            if (serverHello.certificate.serviceProvider != "Let's Encrypt") {
                return res.json({type: 'Error', error: "Only Let's Encrypt certificates are accepted."})
            }
            const splittedPublicKey = serverHello.certificate.publicKey.split(',')
            if (splittedPublicKey.length != 2) {
                return res.json({type: 'Error', error: "Invalid Public Key! It must be in the format \"e,n\""})
            }
            var [e, n] = splittedPublicKey
            if (Number.isNaN(Number(e)) || Number.isNaN(Number(n))) {
                return res.json({type: 'Error', error: "Invalid public exponent or n."})
            }
            const preMasterBytes = crypto.randomBytes(16)
            const preMasterSecret = BigInt('0x' + preMasterBytes.toString('hex'))
            const encryptedPreMasterSecret = (preMasterSecret ** BigInt(e)) % BigInt(n)
            const keyExchange = await fetch(req.user.proxy, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'Client Key Exchange',
                    tlsVersion: 'v1.2',
                    cipher: 'RSA',
                    encryptedPreMasterSecret: encryptedPreMasterSecret.toString(16),
                    requiredFields: {
                        serverOk: "Just the string 'OK' to ensure that the server is ready for communication. Note that for the AES-256-CBC encryption, the IV will the pre master secret, while the key will be the simple string concatenation of client random + server random."
                    }
                })
            })
            const serverOk = await keyExchange.json()
            if (serverOk.serverOk != 'OK') {
                return res.json({type: 'Error', error: 'Server response not OK.'})
            }
            const hiddenMessage = `GET / HTTP/1.1
Host: https://robovm.onrender.com
User-Agent: 726F626F74726F6E6963737B723356306C553731306E317A335F6630525F6C3166335F34663339366338307D
Accept: text/html, */*
Accept-Language: en-us
Connection: keep-alive
`
            const iv = preMasterBytes
            const key = Buffer.from(meraClientRandom.toString('hex') + serverHello.serverRandom, 'hex')
            const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
            var encryptedMessage = cipher.update(hiddenMessage, 'utf8', 'hex')
            encryptedMessage += cipher.final('hex')
            const clientRequest = await fetch(req.user.proxy, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'HTTP Request',
                    message: encryptedMessage,
                    requiredFields: {
                        response: 'The server response.'
                    }
                })
            })
            const serverResponse = await clientRequest.json()
            if (!serverResponse.response) return res.end('The server did not send any response.')
            return res.send(serverResponse.response)
        } else {
            res.end('The IP address you provided is invalid.')
        }     
    } catch (error) {
        console.log(error)
        res.end('There was an error. Please try again.')
    }
})

module.exports = router