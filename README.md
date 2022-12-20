@passwordless-id/connect
========================

> A simple library to "Sign in with passwordless.id" and to fetch the user's profile and "id_token"

NPM: `npm install @passwordless-id/connect`

CDN: `https://unpkg.com/@passwordless-id/connect`


Demos
-----

- [vanilla JS](vanilla.html)
- [even shorter demo](demo.html)

Minimal example
---------------

```js
import passwordless from 'https://unpkg.com/@passwordless-id/connect'

const scope = 'openid avatar email'
const user = await passwordless.request({scope})

if(user.signedIn && user.scopeGranted) {
    console.log(user)
    window.alert(`Hello ${user.profile.nickname}`)
}
else {
    // the following line will perform a redirect and come back to the same page once done
    passwordless.auth({scope})
}
```



Sign in/up
----------

In order to let the user authenticate (sign in or create an account) and authorize your app to read the profile, you must call `auth` as follows.

```js
// the following line will perform a redirect and come back to the same page once done
passwordless.auth({
    scope: "openid avatar email"
})
```

This has no response. The user will be redirected to the [Passwordless.ID UI](https://ui.passwordless.id) in order to sign in/up and authorize your app to read the profile.

Once done, the user will be redirected back to the original url, to your web page/app.



The `id_token`
--------------

The `id_token` is a JWT (Json Web Token) that contains both the user's ID and a signature. This can be sent to your server as proof of the user's identity and it's authenticity can be verified by the server.

In order to validate the `id_token` server side, it is sufficient to use:

  GET https://api.passwordless.id/openapi/validate?token=...




Fetching `profile` and `id_token`
---------------------------------

Unlike OAuth2/OpenID which always require redirects, Passwordless.ID contains an extension to fetch the profile and `id_token` directly: the `request` method. Of course, this only works if the user is currently signed it *and* has granted the requested profile scope.

```js
const scope = 'openid avatar email'
await passwordless.request({scope})
```

Results in the following.

```json
{
  "signedIn": true,
  "scopeGranted": true,
  "profile": {
    "sub": "U1NdanBNalQ6JTI2...",
    "nickname": "Johny",
    ...
  },
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

If this fails, the flags `signedIn` and `scopeGranted` inform you why the user information could not be accessed. Either the user is not signed in or it has not yet authorized your application to read your profile scope.



Scope
-----

The `scope` determines the properties you want to read from the user profile. The lesser the scope you require, the more likely it will be granted by the user. It is good practice to request only what you need.

- `openid`: this is the default scope. It will provide the `sub` value, which is an anonymized user ID.
- `avatar`: Provides `nickname`, `picture` (as url) and `preferred_username`
- `email`: Provides `email` and `email_verified`
- `phone`:
- `profile`:
- `address`:



Options
-------

The `auth(...)` method can be customized further for OAuth2/OpenID flows with the following parameters.

```js
passwordless.auth({
    scope: "openid",
    response_type: "code id_token token",
    redirect_uri: "https://optional-url-when-login-successful", // optional, if omitted, it will return to the current URL
    nonce: "optional nonce to be present in the id_token",
    state: "optional hash value added to the redirect when using the `code` response_type flow"
})
```

The `response_type` is optional, and mainly used in other OAuth2/OpenID flows. It is there for the sake of completeness and only necessary to integrate with other OAuth2/OpenID libraries.

The `redirect_uri` is optional and used to navigate to another page upon successful authentication and authorization.

The `nonce` is optional and can be used for increased security, like verifying that your server triggered the sign in.



Dev testing locally
-------------------

```
npm install --global http-server
npx http-server
```

Open http://localhost:8080/demo.html