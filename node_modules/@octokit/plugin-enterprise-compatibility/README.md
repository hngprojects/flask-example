# plugin-enterprise-compatibility.js

> Octokit plugin for improving GHE compatibility

[![@latest](https://img.shields.io/npm/v/@octokit/plugin-enterprise-compatibility.svg)](https://www.npmjs.com/package/@octokit/plugin-enterprise-compatibility)
[![Build Status](https://github.com/octokit/plugin-enterprise-compatibility.js/workflows/Test/badge.svg)](https://github.com/octokit/plugin-enterprise-compatibility.js/actions?workflow=Test)

The GitHub API teams is continuously improving existing APIs to make the overall platform more consistent. For example, the [Add labels to an issue](https://developer.github.com/v3/issues/labels/#add-labels-to-an-issue) expected the label names array to be sent directly in the request body root, as you can still see in the documentation for [GHE 2.15](https://developer.github.com/enterprise/2.15/v3/issues/labels/#input).

While consistency is great, changing like the above makes the current `octokit.issues.addLabels()` incompatible with GHE v2.15 and older. If you require compatibility with GHE versions, you can use the [Enterprise rest plugin](https://github.com/octokit/plugin-enterprise-rest.js), but that will remove new endpoint methods that are not available on Enterprise yet.

As a compromise, this plugin is reverting changes such as the one above to remain compatible with currently supported GitHub enterprise versions.

## Usage

<table>
<tbody valign=top align=left>
<tr><th>
Browsers
</th><td width=100%>

Load `@octokit/plugin-enterprise-compatibility` and [`@octokit/core`](https://github.com/octokit/core.js) (or core-compatible module) directly from [esm.sh](https://esm.sh)

```html
<script type="module">
  import { Octokit } from "https://esm.sh/@octokit/core";
  import { enterpriseCompatibility } from "https://esm.sh/@octokit/plugin-enterprise-compatibility";
</script>
```

</td></tr>
<tr><th>
Node
</th><td>

Install with `npm install @octokit/core @octokit/plugin-enterprise-compatibility`. Optionally replace `@octokit/core` with a core-compatible module

```js
const { Octokit } = require("@octokit/core");
const {
  enterpriseCompatibility,
} = require("@octokit/plugin-enterprise-compatibility");
```

</td></tr>
</tbody>
</table>

```js
const MyOctokit = Octokit.plugin(enterpriseCompatibility);
const octokit = new MyOctokit({
  auth: "token123",
});

octokit.request("POST /repos/{owner}/{repo}/issues/{issue_number}/labels", {
  owner,
  repo,
  number,
  labels: ["foo", "bar"],
});
// sends ["foo", "bar"] instead of {"labels":["foo", "bar"]} as request body
```

## LICENSE

[MIT](LICENSE)
