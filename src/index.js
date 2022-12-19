const apiUrl = "https://api.passwordless.id"
//const apiUrl = "http://localhost:8787"



export async function auth(options) {
    const args = new URLSearchParams({
        scope: options.scope ?? 'openid',
        response_type: options.response_type ?? 'id_token',
        client_id: window.location.origin,
        redirect_uri: options.response_type ?? window.location.href,
        nonce: options.nonce,
        state: options.state
    })
    window.location.assign(`${apiUrl}/openid/authorize?${args}`)
}


const utf8decoder = new TextDecoder()

export async function request(options) {
    const args = new URLSearchParams({
        scope: options.scope ?? 'openid',
        nonce: options.nonce
    })
    // The API call to fetch the user
    const res = await fetch(`${apiUrl}/openid/id_token?${args}`, {
        mode: 'cors',
        credentials: 'include'
    })

    const user = {}

    if (res.ok) {
        const json = await res.json()
        // Please note that the JWT signature is not verified in this example
        // The profile is simply extracted
        const payload = json.id_token.split('.')[1]
        const base64 = payload.replaceAll('-', '+').replaceAll('_', '/')
        const buffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
        const utf8 = utf8decoder.decode(buffer)
        const profile = JSON.parse(utf8)
        
        delete profile['iss']
        delete profile['aud']
        delete profile['iat']
        delete profile['exp']
        
        console.debug(profile)

        return {
            signedIn: true,
            scopeGranted: true,
            id_token: json.id_token,
            profile,
        }
    } else if (res.status === 401) {
        // User must first sign in (or create account)
        return {
            signedIn: false,
            scopeGranted: false
        }
    } else if (res.status === 403) {
        // User did not grant enough permissions (scope) 
        return {
            signedIn: true,
            scopeGranted: false
        }
    }
    else {
        throw Error(`Unexpected error: ${res.status} ${await res.text()}`)
    }
}


export default {
    auth,
    request
}