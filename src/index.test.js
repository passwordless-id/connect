import connect from './index'

test('Test auth', async () => {
    await passwordless.auth({
        scope: "openid",
        response_type: "code id_token token",
        redirect_uri: "https://optional-url-when-login-successful", // optional, if omitted, it will return to the current URL
        nonce: "optional nonce to be present in the id_token",
        state: "optional hash value added to the redirect when using the `code` response_type flow"
    })
    //expect(window.location = 'https://api...')
})



test('Test request', async () => {
    const scope = 'openid avatar email'
    const res = await passwordless.request({scope})
    expect(res.signedIn).toBe(false)
    expect(res.scopeGranted).toBe(false)
    // checking success kind of impossible without user interaction to sign in first
})