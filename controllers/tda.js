const got = require('got')
const fs = require('fs-extra')

exports.get_auth = async (req, res) => {
    const redirect_uri = 'https://127.0.0.1:3000/api/stock/v1/auth/td'
    const client_id = 'QXXTDHWYAJLHXLEL8CRA5WNO2Y466OEI@AMER.OAUTHAP'
    if (!req.query.code) {
        return res.redirect(`https://auth.tdameritrade.com/auth?response_type=code&redirect_uri=${encodeURIComponent(redirect_uri)}&client_id=${encodeURIComponent(client_id)}`)
    }
    const options = {
        method: 'POST',
        url: `https://api.tdameritrade.com/v1/oauth2/token`,
        form: {
            grant_type: 'authorization_code',
            access_type: 'offline',
            code: req.query.code,
            client_id: client_id,
            redirect_uri: redirect_uri
        },
        resolveBodyOnly: true,
        responseType: 'json'
    }
    const result = await got(options)
    await fs.outputJSON('./config/tdaclientauth.json', { refresh_token: result.refresh_token, client_id: client_id })
    console.log(result)
    res.send(result)
}
