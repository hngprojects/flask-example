# octokit-auth-probot

> Octokit authentication strategy that supports token, app (JWT), and event-based installation authentication

[![@latest](https://img.shields.io/npm/v/octokit-auth-probot.svg)](https://www.npmjs.com/package/octokit-auth-probot)
[![Build Status](https://github.com/probot/octokit-auth-probot/workflows/Test/badge.svg)](https://github.com/probot/octokit-auth-probot/actions?query=workflow%3ATest)

`octokit-auth-probot` combines the authentication strategies:

1. [`@octokit/auth-app`](https://github.com/octokit/auth-app.js#readme)
2. [`@octokit/auth-token`](https://github.com/octokit/auth-token.js#readme)
3. [`@octokit/auth-unauthenticated`](https://github.com/octokit/auth-unauthenticated.js#readme)

It adds a new authentication type: `"event-octokit"`, which allows to retrieve an Octokit instance which is correctly authenticated based on the Octokit constructors authentication (`app` or `token`) as well as the event, which either results in an installation access token authentication or, in case the event implies that the installation's access has been revoked, in an unauthenticated Octokit instance.

`octokit-auth-probot` is not meant to be used by itself, but in conjuction with [`@octokit/core`](https://github.com/octokit/core.js#readme) or a compatible library.

## Usage

<table>
<tbody valign=top align=left>
<tr><th>
Browsers
</th><td width=100%>

Load `octokit-auth-probot` directly from [esm.sh](https://esm.sh)

```html
<script type="module">
  import { Octokit } from "https://esm.sh/@octokit/core";
  import { createProbotAuth } from "https://esm.sh/octokit-auth-probot";
</script>
```

</td></tr>
<tr><th>
Node
</th><td>

Install with <code>npm install octokit-auth-probot</code>

```js
const { Octokit } = require("@octokit/core");
const { createProbotAuth } = require("octokit-auth-probot");
// or:
// import { Octokit } from "@octokit/core";
// import { createProbotAuth } from "octokit-auth-probot";
```

</td></tr>
<tr><td colspan=2>

⚠️ For usage in browsers: The private keys provided by GitHub are in `PKCS#1` format, but the WebCrypto API only supports `PKCS#8`. You need to convert it first:

```shell
openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in private-key.pem -out private-key-pkcs8.key
```

No conversion is needed in Node, both `PKCS#1` and `PKCS#8` format will work.

</td></tr>
</tbody>
</table>

```js
const { Octokit } = require("@octokit/core");
const { createProbotAuth } = require("octokit-auth-probot");

const ProbotOctokit = Octokit.defaults({
  authStrategy: createProbotAuth,
});
```

### Token authentication

```js
const octokit = new ProbotOctokit({
  auth: {
    token: "secret 123",
  },
});
```

**Note**: when using `octokit.auth({ type: "installation", factory })`, `factory(options)` will be called with `options.octokit`, `options.octokitOptions`, plus any other properties that have been passed to `octokit.auth()` besides `type` and `factory`. In all other cases, `octokit.auth()` will resolve with an [`oauth` authentication object](https://github.com/octokit/auth-token.js#authentication-object), no matter the passed options.

### App authentication

```js
const octokit = new ProbotOctokit({
  auth: {
    appId: 123,
    privateKey: `----BEGIN RSA PRIVATE KEY----- ...`,
  },
});
```

### Unauthenticated

```js
const octokit = new ProbotOctokit();
```

This is useful if you need to send a request without access to authentication. Probot's use case here is [Create a GitHub App from a manifest](https://docs.github.com/en/free-pro-team@latest/rest/reference/apps#create-a-github-app-from-a-manifest) (`POST /app-manifests/{code}/conversions`), which is used to register a GitHub app and retrieve the credentials in return.

### Get authenticated octokit instance based on event

```js
const eventOctokit = await octokit.auth({
  type: "event-octokit",
  event: { name: "push", payload: { installation: { id: 123 } } }, // event payload
});
```

`eventOctokit` is now authenticated in one of three ways:

1. If `octokit` was authenticated using a token, `eventOctokit` is authenticated with the same token. In fact, `eventOctokit` _is_ `octokit`
2. If `event` name is `installation` and `payload.action` is either `suspend` or `deleted`, then `eventOctokit` is unauthenticated using [`@octokit/auth-unauthenticated`](https://github.com/octokit/auth-unauthenticated.js#readme)
3. Otherwise `eventOctokit` is authenticated as installation based on `payload.installation.id`

## LICENSE

[ISC](LICENSE)
