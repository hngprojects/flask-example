# `@probot/pino`

> formats [pino](https://github.com/pinojs/pino) logs and sends errors to [Sentry](https://sentry.io)

## About

`@probot/pino` is currently built into `probot`, you don't need to manually pipe probot's logs into it. It will be easy to move it out of `probot` in future though, and give people a simple way to recover the logging behavior if they wish, or to replace it with another [pino transport](https://getpino.io/#/docs/transports)

## CLI Usage

```
node my-script.js | pino-probot
```

You can test the environment variables by setting them inline

```
node my-script.js | LOG_FORMAT=json pino-probot
```

## Programmatic usage

`@probot/pino` exports a `getTransformStream()` method which can be passed as 2nd argument to `pino()`

```js
import pino from "pino";
import { getTransformStream } from "@probot/pino";

const log = pino(
  {
    name: "probot",
  },
  getTransformStream()
);
```

This won't log anything to stdout though. In order to pass the formatted logs back to stdout, do the following

```js
import pino from "pino";
import { getTransformStream } from "@probot/pino";

const transform = getTransformStream();
transform.pipe(pino.destination(1));
const log = pino(
  {
    name: "probot",
  },
  transform
);
```

With custom options:

```js
const transform = getTransformStream({
  logFormat: "json",
  logLevelInString: true,
  sentryDsn: "http://username@example.com/1234",
});
```

### Options

The `pino-probot` binary can be configured using environment variables, while the `getTransformStream()` accepts an object with according keys

| Environment Varibale  | Option             | Description                                                                                                                                                                                              |
| --------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LOG_FORMAT`          | `logFormat`        | Set to `pretty` or `json`. When set to `pretty`, logs are formatted for human readability. Setting to `json` logs using JSON objects. Defaults to `pretty`                                               |
| `LOG_LEVEL_IN_STRING` | `logLevelInString` | By default, when using the `json` format, the level printed in the log records is an int (`10`, `20`, ..). This option tells the logger to print level as a string: `{"level": "info"}`. Default `false` |
| `SENTRY_DSN`          | `sentryDsn`        | Set to a [Sentry](https://sentry.io/) DSN to report all errors thrown by your app. <p>_(Example: `https://1234abcd@sentry.io/12345`)_</p>                                                                |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

[ISC](LICENSE)
