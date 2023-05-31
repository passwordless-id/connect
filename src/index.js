const apiUrl = "https://api.passwordless.id"
//const apiUrl = "http://localhost:8787"

const DEFAULT_SCOPE = 'openid avatar'

export function id(options) {
    if(options?.cache) {
        const json = sessionStorage.getItem('passwordless.id/user')
        if(json) {
            const user = JSON.parse(raw)
            if(!isExpired(user.id_token)) // JWT is still valid, not expired
                return user
        }
    }
    if(window.location.hash) {
        // check if hash contains ID token
        const params = new URLSearchParams(window.location.hash.substring(1))
        const id_token = params.get('id_token')
        if(id_token) {
            const profile = parseIdToken(id_token)
            const user = {
                signedIn: true,
                scopeGranted: true,
                id_token: id_token,
                profile,
            }
            if(options?.cache)
                sessionStorage.setItem('passwordless.id/user', JSON.stringify(user))
            
            // remove it from url
            params.delete('id_token')
            const hash = params.toString()
            location.hash = hash ? '#' + hash : ''

            return user
        }
    }
    return request(options)
}

export function isExpired(id_token) {
    const payload = parseJwtPayload(id_token)
    return Date.now() > payload['exp'] * 1000 // milliseconds vs seconds
}


export async function auth(options) {
    const args = new URLSearchParams({
        scope: options?.scope ?? DEFAULT_SCOPE,
        response_type: options?.response_type ?? 'id_token',
        client_id: window.location.origin,
        redirect_uri: options?.response_type ?? window.location.href,
    })
    if(options?.nonce)
        args.set('nonce', options.nonce)
    if(options?.state)
        args.set('state', options.state)
    if(options?.prompt)
        args.set('prompt', options.prompt)
        
    window.location.assign(`${apiUrl}/openid/authorize?${args}`)
}

export async function logout(options) {
    const args = new URLSearchParams({
        redirect_uri: options?.response_type ?? window.location.href,
        state: options?.state
    })
    window.location.assign(`${apiUrl}/openid/logout?${args}`)
}

const utf8decoder = new TextDecoder()

export async function request(options) {
    const args = new URLSearchParams({
        scope: options?.scope ?? DEFAULT_SCOPE,
    })
    if(options?.nonce)
        args.set('nonce', options.nonce)

    // The API call to fetch the user
    const res = await fetch(`${apiUrl}/openid/id_token?${args}`, {
        mode: 'cors',
        credentials: 'include'
    })

    if (res.ok) {
        const json = await res.json()
        const profile = parseIdToken(json.id_token)
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


/**
 * Please note that this only parses the JWT, the signature is not verified on the client side.
 * The signatue should be verified server side.
 */
function parseJwtPayload(jwt) {
    const payload = jwt.split('.')[1]
    const base64 = payload.replaceAll('-', '+').replaceAll('_', '/')
    const buffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
    const utf8 = utf8decoder.decode(buffer)
    const parsed = JSON.parse(utf8)
    return parsed
}

function extractProfile(payload) {
    delete payload['iss']
    delete payload['aud']
    delete payload['iat']
    delete payload['exp']

    return payload
}


function parseIdToken(id_token) {
    const payload = parseJwtPayload(id_token)
    const profile = extractProfile(payload)
    return profile
}

export default {
    id,
    auth,
    request,
    logout
}
