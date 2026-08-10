# Recon: Build Roadmap

**Purpose:** phased plan to take Recon from its current two shipped features to full scope. Written to hand to an autonomous coding agent, with enough detail that it can execute without guessing at intent.

## How to Use This Document

Work through the phases in order. Do not start a phase until the previous phase's acceptance criteria are met. Where a decision isn't specified here, pick the smallest reasonable default and log it under Open Questions rather than expanding scope to cover every possibility. This project was already cut down once from a larger feature set that didn't ship. Staying inside each phase's boundary matters more than covering everything at once.

## Project Context

Recon is a real-time coordination layer for software teams. It connects to GitHub through webhooks to track push, commit, and PR activity, and currently ships two features:

- **Real-Time Activity Feed**: a live stream of pushes, commits, and PRs across all branches.
- **Early Conflict Detection**: flags when two branches touch the same file path, before a merge is attempted.

Everything in this roadmap builds on that webhook and GitHub API foundation. No phase requires a new core data source until Phase 3, and Phase 3 is scoped specifically to avoid needing one.

## Operating Principles

- [ ] Complete phases in order. Don't start Phase N+1 before Phase N's acceptance criteria pass.
- [ ] Reuse the existing webhook listener and GitHub API client before adding a new integration, library, or service.
- [ ] No new third-party integrations (Jira, Linear, Slack, etc.). This roadmap deliberately excludes them; see Non-Goals.
- [ ] If a phase's task list grows past what's written here, stop and flag it instead of quietly expanding scope.
- [ ] Where this document doesn't specify an implementation detail, choose the smallest reasonable default and note the decision under Open Questions.

## Phase 0: Stabilize What Exists

**Goal:** confirm the two shipped features work end to end, and document the actual current state before building on top of it.

Tasks:
- [ ] Trace Real-Time Activity Feed end to end (webhook receipt, processing, stream/UI). Fix any breaks found.
- [ ] Trace Early Conflict Detection end to end (file-path diff logic, alert delivery). Fix any breaks found.
- [ ] Confirm whether PR description generation (Groq/Gemini) is still implemented and working. If yes, treat it as a third current feature and stabilize it the same way as the other two. If no, note it as deferred, not deleted.
- [x] Document the actual current stack in this section: language, framework, database, hosting, LLM provider if any.
- [ ] Add or update tests covering both current features, wherever coverage is missing.
- [x] List which GitHub webhook events are currently subscribed to (`push`, `pull_request`, others). Phase 1 depends on this list.

**Current Stack Documentation:**
- **Language:** TypeScript
- **Framework:** Next.js 15 (App Router)
- **Database / Backend:** Convex
- **Authentication:** Clerk
- **Hosting:** Vercel (standard for Next.js)
- **LLM Provider:** None currently active. PR description generation (Groq/Gemini) was previously removed and is now explicitly deferred.

**Current Webhook Subscriptions:**
- `push`
- `pull_request`
- `issues`
- `issue_comment`
- `installation` and `installation_repositories`

**Acceptance criteria:** both current features pass a defined test case against a real repository, and the stack and webhook subscriptions are documented above.

## Phase 1: PR & Review Insights

**Goal:** a dashboard showing every PR that needs the user's attention, without leaving Recon.

Covers: PRs due for review, PRs assigned to the user for review, the user's own PRs stuck waiting on someone else, and PRs currently blocked by a merge conflict.

Data requirements:
- `pull_request_review` and review-request webhook events (add to the Phase 0 subscription list if not already present)
- `requested_reviewers` and review state from the PR object
- `mergeable_state` from the PR object (GitHub computes this automatically: `clean`, `dirty`, `blocked`, `behind`, and others; `dirty` indicates an active conflict)

Tasks:
- [ ] Subscribe to `pull_request_review` webhook events if not already covered.
- [ ] Extend the PR data model with review status, requested reviewers, `mergeable_state`, and blocked reason.
- [ ] Build aggregation logic for four views: assigned to me for review, my PRs awaiting others, stuck PRs (no review activity past a set threshold, e.g. 48 hours), and conflict-blocked PRs.
- [ ] Expose these as API endpoints, for example `GET /prs/review-queue` and `GET /prs/blocked`.
- [ ] Add a dashboard view surfacing all four categories, updating live off the same webhook pipeline as the activity feed.

**Acceptance criteria:** a user can see, in one view, every PR that needs action from them or is currently blocked, without opening GitHub.

## Phase 2: Personal Contribution Summaries

**Goal:** a per-user view of total GitHub activity across the workspace, plus a workspace-wide stats view.

Data requirements:
- GitHub GraphQL `contributionsCollection` (commits, PRs, issues, and reviews per user)
- REST search API using the `mentions:` qualifier for `@mentions`
- Issue comments endpoint for comment activity

Tasks:
- [ ] Add a GraphQL client, or extend the existing GitHub client, to query `contributionsCollection` per user.
- [ ] Add a scheduled sync job for contribution stats. This data doesn't need to be webhook-real-time; a periodic pull (every few hours is plenty) avoids hammering the API.
- [ ] Add mentions tracking through the `mentions:` search qualifier, scoped to the workspace's repos.
- [ ] Build a per-user summary: commits, PRs opened/merged/reviewed, issues commented, mentions received.
- [ ] Build a workspace-wide stats view aggregating across all tracked users.
- [ ] Watch GitHub API rate limits specifically in this phase; it queries far more broadly than Phases 0 and 1. Cache aggressively and back off sync frequency if needed.

**Acceptance criteria:** a user can view their complete contribution history and see how it compares to workspace-wide activity, without leaving Recon.

## Phase 3: Team & Group Visibility

**Goal:** show what teammates are actively working on and its current state, without a status-update meeting.

**Scope boundary, read before starting:** GitHub Issues and Projects (v2) only. No Jira, Linear, or other third-party PM tool integrations in this phase. That's a separate roadmap if it ever becomes necessary.

Data requirements:
- GitHub Issues API (assignees, linked PRs)
- GitHub Projects v2 API (status field, board columns)

Tasks:
- [ ] Ingest Issues and Projects v2 data: assignees, linked PRs, and each item's status field.
- [ ] Map GitHub Projects status field values to a fixed internal set (WIP / Pending / Completed). Make the mapping configurable per workspace, since teams name their columns differently.
- [ ] Build a teammate activity view: recent commits, PRs, and issues per teammate, cross-referenced against their assigned Project items.
- [ ] Build a task-state dashboard grouping open issues and PRs by mapped status.
- [ ] For teams not using Projects consistently, fall back to a simple rule instead of an inference model: open issue with no linked PR is pending, linked open PR is in progress, linked merged PR is completed.

**Acceptance criteria:** for a given workspace, you can see each teammate's current assigned work and its state without asking them directly.
