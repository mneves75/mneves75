# Security Policy

## Supported versions

Only the current `main` branch is supported. This repository holds a GitHub profile README and the
static site published at [mvneves.dev](https://mvneves.dev); there is no database or user data, and the only
server-side code is a small Worker that picks the language at the root (`worker/`).

## Reporting a vulnerability

Report privately through
[GitHub Security Advisories](https://github.com/mneves75/mneves75/security/advisories/new).
Do not open a public issue for an unfixed vulnerability.

Expect an acknowledgement within 7 days. Fixes ship on `main` and are noted in
[`CHANGELOG.md`](./CHANGELOG.md).

## Scope

In scope: this repository's source, build configuration, and GitHub Actions workflows.

Out of scope: Cloudflare platform issues (report to Cloudflare), and the separate repositories
linked from the profile README — report those on their own trackers.
