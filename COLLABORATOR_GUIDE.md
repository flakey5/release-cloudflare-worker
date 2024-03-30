# Collaborator Guide

- [Issues and Pull Requests](#issues-and-pull-requests)
- [Accepting Modifications](#accepting-modifications)
  - [Involving the Web Infrastructure Team](#involving-the-web-infrastructure-team)
- [Technologies Used in the Worker](#technologies-used-in-the-worker)
- [Code Editing](#code-editing)
  - [Structure of this Repository](#structure-of-this-repository)
- [Testing](#testing)
  - [Unit Testing](#unit-testing)
  - [End-to-End Testing](#end-to-end-testing)
- [Remarks on Technologies Used](#remarks-on-technologies-used)
- [Additional Clarification](#additional-clarification)

This document contains information for Collaborators of the Node.js release worker project regarding maintaining code, documentation, and issues.

Collaborators should be familiar with the guidelines for new contributors in [CONTRIBUTING.md](./CONTRIBUTING.md)

## Issues and Pull Requests

Courtesy should always be shown to individuals submitting issues and pull requests to the Node.js Release Worker project.

Collaborators should feel free to take full responsibility for managing issues and pull requests they feel qualified to handle, as long as this is done while being mindful of these guidelines, the opinions of other Collaborators and guidance of the Web Infrastructure Group.

Collaborators may close any issue or pull request they believe is not relevant to the future of the Node.js project. Where this is unclear, the issue should be left open for several days for additional discussion. Where this does not yield input from Node.js Collaborators or additional evidence that the issue has relevance, then the issue may be closed. Remember that issues can always be re-opened if necessary.

## Accepting Modifications

All code and documentation modifications should be performed via GitHub pull requests. Only the Web Infrastructure Team can merge their work and should do so carefully.

All pull requests must be reviewed and accepted by a Collaborator with sufficient expertise who can take full responsibility for the change. In the case of pull requests proposed by an existing Collaborator, an additional Collaborator is required for sign-off.

Pull Requests can only be merged after all CI Checks have passed.

In some cases, it may be necessary to summon a qualified Collaborator to a pull request for review by @-mention.

If you are unsure about the modification and are not prepared to take full responsibility for the change, defer to another Collaborator.

We recommend collaborators follow the guidelines on the [Contributing Guide](./CONTRIBUTING.md) for reviewing and merging Pull Requests.

### Involving the Web Infrastructure Team

Collaborators may opt to elevate pull requests or issues to the group for discussion by mentioning @nodejs/web-infra. This should be done where a pull request:

- Has a significant impact on the codebase
- Is inherently controlversial; or
- Has failed to reach a consensus amongst the Collaborators who are actively participating in the discussion.

The Web Infrastructure should be the final arbiter where needed.

## Technologies Used in the Worker

The Node.js Release Worker is built upon [Cloudflare Workers](https://developers.cloudflare.com/workers/) and [Cloudflare R2](https://developers.cloudflare.com/r2/).

The Worker also uses several other Open Source libraries (not limited to) listed below:

- [AWS S3 client](https://www.npmjs.com/package/@aws-sdk/client-s3) is used for interacting with R2's S3 entrypoint.
- [Handlebars.js](https://www.npmjs.com/package/handlebars) is used for rendering templated pages.
- [Sentry](https://sentry.io/about) is used for error reporting.
- [Zod](https://zod.dev/?id=introduction) is used for error reporting.

## Code Editing

### Structure of this Repository

- Worker code is in `src/`
- Multi-purpose scripts live in `scripts/`

## Testing

Each new feature or bug fix should be accompanied by a unit or E2E test (when valuable). We use Node's test runner and Miniflare for our E2E tests.

### Unit Testing

Unit Tests are fundamental to ensure that code changes do not disrupt the functionalities of the Worker:

- Unit Tests should be written as `.test.ts` files.
-

### End-to-End Testing

## Remarks on Technologies Used

## Additional Clarification
