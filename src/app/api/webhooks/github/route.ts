import { Webhooks } from "@octokit/webhooks";
import { NextResponse } from "next/server";
import { convex } from "@/lib/convex";
import { api } from "../../../../../convex/_generated/api";

const webhooks = new Webhooks({
  secret: process.env.GITHUB_WEBHOOK_SECRET || "",
});

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("x-hub-signature-256") || "";

  try {
    const isValid = await webhooks.verify(payload, signature);
    if (!isValid) return new NextResponse("Invalid signature", { status: 401 });
  } catch (err) {
    return new NextResponse("Signature verification failed", { status: 401 });
  }

  const event = JSON.parse(payload);
  const eventName = req.headers.get("x-github-event") || "";

  if (eventName === "push") {
    const repoId = await convex.mutation(api.webhooks.handlePush, {
      repoId: event.repository.id,
      branchName: event.ref.replace("refs/heads/", ""),
      authorLogin: event.pusher.name,
      authorAvatar: event.sender.avatar_url,
      filesChanged: event.commits
        .filter((c: any) => c.distinct)
        .flatMap((c: any) => [
          ...c.added,
          ...c.modified,
        ]),
      commitCount: event.commits.length,
      commits: event.commits.map((c: any) => ({
        id: c.id,
        message: c.message,
        url: c.url,
        timestamp: c.timestamp,
      })),
    });

    if (repoId) {
      await convex.action(api.conflicts.detectConflicts, {
        repoId,
        pushedBranch: event.ref.replace("refs/heads/", ""),
      });
    }
  }

  if (eventName === "installation" && event.action === "created") {
    await convex.mutation(api.webhooks.handleInstallation, {
      installId: event.installation.id,
      accountLogin: event.installation.account.login,
      accountType: event.installation.account.type,
      avatarUrl: event.installation.account.avatar_url,
    });
    
    for (const repo of event.repositories) {
        await convex.mutation(api.webhooks.handleRepoAdded, {
            installId: event.installation.id,
            repoId: repo.id,
            name: repo.name,
            fullName: repo.full_name,
        });
    }
  }

  if (eventName === "installation_repositories" && event.action === "added") {
    for (const repo of event.repositories_added) {
      await convex.mutation(api.webhooks.handleRepoAdded, {
        installId: event.installation.id,
        repoId: repo.id,
        name: repo.name,
        fullName: repo.full_name,
      });
    }
  }

  if (eventName === "pull_request") {
    const repo = await convex.query(api.activity.getRepoByGithubId, {
      githubRepoId: event.repository.id,
    });

    if (repo) {
      const reviewers = event.pull_request.requested_reviewers?.map((r: any) => r.login) || [];
      const mergeableState = event.pull_request.mergeable_state || "unknown";

      if (event.action === "opened") {
        await convex.mutation(api.webhooks.handlePROpened, {
          repoId: repo._id,
          prNumber: event.pull_request.number,
          title: event.pull_request.title,
          author: event.pull_request.user.login,
          requestedReviewers: reviewers,
          mergeableState: mergeableState,
          url: event.pull_request.html_url,
        });

        // Trigger PR Auto-Labeler
        await convex.action(api.github.autoLabelPR, {
          installId: event.installation.id,
          repoFullName: event.repository.full_name,
          prNumber: event.pull_request.number,
        });

        // Check if PR links to an issue (e.g. #123 or fixes #123)
        const prText = `${event.pull_request.title} ${event.pull_request.body || ""}`;
        const issueMatch = prText.match(/#(\d+)/);
        if (issueMatch) {
          const issueNum = parseInt(issueMatch[1], 10);
          await convex.mutation(api.webhooks.linkPRToIssue, {
            repoId: repo._id,
            prNumber: event.pull_request.number,
            issueNumber: issueNum,
          });
        }
      } else if (["synchronize", "review_requested", "review_request_removed", "closed", "reopened", "edited"].includes(event.action)) {
        await convex.mutation(api.webhooks.handlePRUpdate, {
          repoId: repo._id,
          prNumber: event.pull_request.number,
          state: event.pull_request.state,
          requestedReviewers: reviewers,
          mergeableState: mergeableState,
          url: event.pull_request.html_url,
        });
      }
    }
  }

  if (eventName === "pull_request_review") {
    const repo = await convex.query(api.activity.getRepoByGithubId, {
      githubRepoId: event.repository.id,
    });
    
    if (repo && event.review) {
      let state = event.review.state.toUpperCase();
      if (event.action === "dismissed") state = "DISMISSED";
      
      await convex.mutation(api.webhooks.handlePRReview, {
        repoId: repo._id,
        prNumber: event.pull_request.number,
        reviewer: event.review.user.login,
        state: state,
      });
    }
  }

  if (eventName === "issues" && ["opened", "edited", "closed", "reopened", "assigned"].includes(event.action)) {
    const repo = await convex.query(api.activity.getRepoByGithubId, {
      githubRepoId: event.repository.id,
    });
    
    if (repo) {
      await convex.mutation(api.webhooks.handleIssue, {
        repoId: repo._id,
        issueNumber: event.issue.number,
        title: event.issue.title,
        state: event.issue.state,
        assignee: event.issue.assignee?.login,
        url: event.issue.html_url,
      });
    }
  }

  if (eventName === "issue_comment" && ["created", "edited"].includes(event.action)) {
    const repo = await convex.query(api.activity.getRepoByGithubId, {
      githubRepoId: event.repository.id,
    });

    if (repo) {
      await convex.mutation(api.webhooks.handleIssueComment, {
        repoId: repo._id,
        issueNumber: event.issue.number,
        commenter: event.comment.user.login,
        body: event.comment.body || "",
      });
    }
  }

  return new NextResponse("Webhook processed successfully", { status: 200 });
}
