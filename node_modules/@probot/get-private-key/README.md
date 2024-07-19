# @probot/get-private-key

> Get private key from a file path, environment variables, or a `*.pem` file in the current working directory

[![@latest](https://img.shields.io/npm/v/@probot/get-private-key.svg)](https://www.npmjs.com/package/@probot/get-private-key)
[![Build Status](https://github.com/probot/get-private-key/workflows/Test/badge.svg)](https://github.com/probot/get-private-key/actions?query=workflow%3ATest)

Finds a private key through various user-(un)specified methods. Order of precedence:

1. Explicit file path option
2. `PRIVATE_KEY` environment variable or explicit `env.PRIVATE_KEY` option. The private key can optionally be base64 encoded.
3. `PRIVATE_KEY_PATH` environment variable or explicit `env.PRIVATE_KEY_PATH` option
4. Any file w/ `.pem` extension in current working dir

## Usage

<table>
<tbody valign=top align=left>
<tr><th>
Browsers
</th><td width=100%>

`@probot/get-private-key` is not compatible with browser usage

</td></tr>
<tr><th>
Node
</th><td>

Install with <code>npm install @probot/get-private-key</code>

```js
const { Probot } = require("probot");
const { getPrivateKey } = require("@probot/get-private-key");
```

</td></tr>
</tbody>
</table>

```js
const probot = new Probot({
  appId: 123,
  privateKey: getPrivateKey(),
});
```

## Options

<table>
  <thead align=left>
    <tr>
      <th>
        name
      </th>
      <th>
        type
      </th>
      <th width=100%>
        description
      </th>
    </tr>
  </thead>
  <tbody align=left valign=top>
    <tr>
      <th>
        <code>options.filepath</code>
      </th>
      <td>
        <code>string<code>
      </td>
      <td>

Pass a path to a `*.pem` file. A relative path will be resolved to the current working directory (which you can set with the `cwd` option)

```js
const privateKey = getPrivateKey({
  filepath: "private-key.pem",
});
```

</td>
    </tr>
    <tr>
      <th>
        <code>options.cwd</code>
      </th>
      <td>
        <code>string<code>
      </td>
      <td>

Defaults to `process.cwd()`. Used to resolve the `filepath` option and used as folder to find `*.pem` files.

```js
const privateKey = getPrivateKey({
  cwd: "/app/current",
});
```

</td>
    </tr>
    <tr>
      <th>
        <code>options.env</code>
      </th>
      <td>
        <code>object<code>
      </td>
      <td>

Defaults to `process.env`. Pass `env.PRIVATE_KEY` or `env.PRIVATE_KEY_PATH` to workaround reading environment variables

```js
const privateKey = getPrivateKey({
  env: {
    PRIVATE_KEY: "-----BEGIN RSA PRIVATE KEY-----\n...",
  },
});
```

</td>
    </tr>
  </tbody>
</table>

## LICENSE

[ISC](LICENSE)
