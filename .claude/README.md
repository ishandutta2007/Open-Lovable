# Claude Code Configuration

This directory contains Claude Code configuration for the Open-Lovable project.

## Commands

Slash commands are invoked with `/openlovable:<command>`. Available commands:

| Command                        | Description                                                    | Uses                                |
| ------------------------------ | -------------------------------------------------------------- | ----------------------------------- |
| `/openlovable:plan-to-issue`          | Convert a plan to a GitHub issue                               | -                                   |
| `/openlovable:fix-issue`              | Fix a GitHub issue                                             | `pr-push`                           |
| `/openlovable:pr-fix`                 | Fix PR issues from CI failures or review comments              | `pr-fix:comments`, `pr-fix:actions` |
| `/openlovable:pr-fix:comments`        | Address unresolved PR review comments                          | `lint`, `pr-push`                   |
| `/openlovable:pr-fix:actions`         | Fix failing CI checks and GitHub Actions                       | `e2e-rebase`, `pr-push`             |
| `/openlovable:pr-rebase`              | Rebase the current branch                                      | `pr-push`                           |
| `/openlovable:pr-push`                | Push changes and create/update a PR                            | `remember-learnings`                |
| `/openlovable:lint`                   | Run all pre-commit checks (formatting, linting, type-checking) | -                                   |
| `/openlovable:e2e-rebase`             | Rebase E2E test snapshots                                      | -                                   |
| `/openlovable:deflake-e2e`            | Deflake flaky E2E tests                                        | -                                   |
| `/openlovable:deflake-e2e-recent-prs` | Gather flaky tests from recent PRs and deflake them            | `deflake-e2e`, `pr-push`            |
| `/openlovable:session-debug`          | Debug session issues                                           | -                                   |
