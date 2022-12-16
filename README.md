# Tidelift Issue Toolbox

[![build status](https://github.com/tidelift/issue-toolbox/workflows/build-test/badge.svg)](https://github.com/tidelift/issue-toolbox/actions)

This github action has been created to help maintainers organize and address issues. This project is still under beta, and we welcome any feedback to improve issue management.

Maintainers have reported responding to multiple issues regarding the same disclosed security issue, and these actions aim to reduce this workload. Maintainers who have partnered with Tidelift are responding to Common Vulnerabilities and Exposures (CVE) with workarounds and when users are affected.

Adding this action will allow Tidelift to automatically respond to an issue referencing a particular CVE or NPM audit alert with this previously provided data. This action will also label the issue with the CVE identifier for users to find similar topics, and link users referencing the same vulnerability to one ticket, to highlight potential duplicates.

Generated from [actions/typescript-action](https://github.com/actions/typescript-action)

## Usage

Retrieve your Tidelift user API key and add it as `TIDELIFT_API_KEY` to your project secrets.

Add a workflow to your project.

```yaml
# .github/workflow/issue_scanner.yml

name: Tidelift Issue Scanner
on:
  issues:
    types: [opened, edited]

jobs:
  issue_scanner:
    runs-on: ubuntu-latest
    steps:
      - uses: macowie/issue_scanner_test@V1
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          tidelift-api-key: ${{ secrets.TIDELIFT_API_KEY }}
```

After testing you can [create a v1 tag](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) to reference the stable and latest V1 action

## Developing

Install the dependencies  

```bash
npm install
```

Run full lint, test, build

```bash
npm run all
```

Run the tests :heavy_check_mark:  

```bash
npm test
```

Run the linter :heavy_check_mark:  

```bash
npm run lint
```

`GITHUB_TOKEN` and `TIDELIFT_API_KEY` can be provided from the environment or `.env` file.

## Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder.

Then run [ncc](https://github.com/zeit/ncc) and push the results:

```bash
npm run package
git add dist
git commit -a -m "prod dependencies"
git push origin releases/v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! :rocket:

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
