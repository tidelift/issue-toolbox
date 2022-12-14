# Tidelift Issue Scanner

Does helpful things when issues are opened

<p align="center">
  <a href="https://github.com/macowie/issue_scanner_test/actions"><img alt="build status" src="https://github.com/macowie/issue_scanner_test/workflows/build-test/badge.svg"></a>
</p>

Generated from [actions/typescript-action](https://github.com/actions/typescript-action)

## Usage

Retrieve your Tidelift API token and add it as `TIDELIFT_TOKEN` to your project secrets.

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
          tidelift-token: ${{ secrets.TIDELIFT_TOKEN }}
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
