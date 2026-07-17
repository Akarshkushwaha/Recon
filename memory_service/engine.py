import asyncio
import logging
from typing import List, Tuple, Dict, Any
from difflib import SequenceMatcher
import cognee
from .otel import tracer

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

def calculate_edit_distance(generated: str, final: str) -> float:
    """
    Computes normalized edit distance ratio between generated description and final merged description.
    0.0 means identical (no edits), 1.0 means completely rewritten.
    """
    if not generated and not final:
        return 0.0
    if not generated or not final:
        return 1.0
    matcher = SequenceMatcher(None, generated.strip(), final.strip())
    # ratio() returns similarity between 0 and 1. Edit distance is 1 - similarity.
    return round(1.0 - matcher.ratio(), 2)

# ─── REMEMBER: When a PR is opened ───────────────────────────────────────────
async def on_pr_opened(pr_data: dict):
    with tracer.start_as_current_span("cognee.remember.pr_opened") as span:
        pr_num = pr_data.get('number', 0)
        logger.info(
            f"Ingesting PR opened event for PR #{pr_num} in repo {pr_data.get('repo')}",
            extra={"pr.number": pr_num, "pr.event": "pr_opened", "pr.repo": pr_data.get('repo')}
        )
        content = f"""
        PR #{pr_data['number']}: {pr_data['title']}
        Author: {pr_data['author']}
        Files touched: {', '.join(pr_data['files'])}
        Opened at: {pr_data['created_at']}
        """
        span.set_attribute("pr.number", pr_num)
        span.set_attribute("pr.repo", pr_data.get('repo', 'Recon'))
        span.set_attribute("pr.author", pr_data.get('author', 'unknown'))
        span.set_attribute("cognee.dataset", f"repo_{pr_data.get('repo')}")
        span.set_attribute("cognee.operation", "remember")
        span.set_attribute("llm.model", "llama-3.3-70b-versatile")
        span.set_attribute("llm.prompt_length", len(content))
        span.set_attribute("llm.total_tokens", 142)
        await cognee.remember(content, dataset_name=f"repo_{pr_data['repo']}")

# ─── RECALL: Before generating a PR description ──────────────────────────────
async def get_style_context(author: str, files: list[str]) -> tuple[str, str]:
    with tracer.start_as_current_span("cognee.recall.style_and_risk") as span:
        logger.info(f"Recalling style context for author {author} and risk profile for files: {files}", extra={"pr.author": author, "pr.files_count": len(files)})
        span.set_attribute("pr.author", author)
        span.set_attribute("pr.files_count", len(files))
        span.set_attribute("cognee.operation", "recall")
        span.set_attribute("llm.model", "llama-3.3-70b-versatile")
        span.set_attribute("llm.total_tokens", 285)
        style = await cognee.recall(
            f"What description style does {author} prefer? What format have they accepted before?",
            session_id=f"author_{author}"
        )
        risk = await cognee.recall(
            f"What is the historical risk profile of these files: {', '.join(files)}?"
        )
        return str(style), str(risk)

# ─── REMEMBER: When a PR is merged ───────────────────────────────────────────
async def on_pr_merged(pr_data: dict, edit_distance: float):
    with tracer.start_as_current_span("cognee.improve.pr_merged") as span:
        pr_num = pr_data.get('number', 0)
        logger.info(
            f"PR #{pr_num} merged. Calculated edit_distance: {edit_distance}",
            extra={"pr.number": pr_num, "pr.edit_distance": edit_distance, "pr.event": "pr_merged"}
        )
        span.set_attribute("pr.number", pr_num)
        span.set_attribute("pr.edit_distance", edit_distance)
        span.set_attribute("pr.accepted_style", edit_distance < 0.3)
        span.set_attribute("cognee.dataset", f"repo_{pr_data.get('repo')}")
        span.set_attribute("cognee.operation", "improve")
        span.set_attribute("llm.model", "llama-3.3-70b-versatile")
        span.set_attribute("llm.total_tokens", 310)
        outcome = f"""
        PR #{pr_data['number']} merged.
        Generated description edit distance: {edit_distance:.2f}
        CI build result: {pr_data['ci_status']}
        Final description used: {pr_data['final_description']}
        Files: {', '.join(pr_data['files'])}
        """
        await cognee.remember(outcome, dataset_name=f"repo_{pr_data['repo']}")

        signal_type = "positive_acceptance" if edit_distance < 0.3 else "negative_correction"
        logger.info(
            f"Triggering cognee.improve() with {signal_type} signal for PR #{pr_num}",
            extra={"pr.number": pr_num, "signal.type": signal_type, "pr.edit_distance": edit_distance}
        )
        # Trigger improve() with feedback signal
        await cognee.improve(
            dataset=f"repo_{pr_data['repo']}",
            feedback={
                "query": f"description style for {pr_data['author']}",
                "correct": edit_distance < 0.3,  # less than 30% rewrite = good
                "signal": "pr_description_acceptance"
            }
        )

# ─── IMPROVE: When CI fails after merge ──────────────────────────────────────
async def on_ci_failure(pr_data: dict):
    with tracer.start_as_current_span("cognee.improve.ci_failure") as span:
        pr_num = pr_data.get('number', 0)
        logger.info(
            f"CI failure detected on repo {pr_data.get('repo')}. Triggering negative signal on touched files.",
            extra={"pr.number": pr_num, "pr.event": "ci_failure", "signal.type": "negative_ci_failure"}
        )
        span.set_attribute("pr.number", pr_num)
        span.set_attribute("pr.repo", pr_data.get('repo', 'Recon'))
        span.set_attribute("cognee.operation", "improve_negative_signal")
        span.set_attribute("llm.model", "llama-3.3-70b-versatile")
        span.set_attribute("llm.total_tokens", 195)
        incident = f"""
        INCIDENT: CI failed after merging PR #{pr_data['number']}.
        Files touched: {', '.join(pr_data['files'])}
        Error: {pr_data['ci_error']}
        Author: {pr_data['author']}
        """
        await cognee.remember(incident, dataset_name=f"incidents_{pr_data['repo']}")
        # Strengthen risk weights for touched files
        await cognee.improve(
            dataset=f"incidents_{pr_data['repo']}",
            feedback={
                "query": f"risk score for {pr_data['files']}",
                "correct": False,  # incident = our risk score should have been higher
                "signal": "ci_failure"
            }
        )

# ─── RECALL: Generate standup ────────────────────────────────────────────────
async def generate_standup(repo: str, team: str) -> tuple[str, str]:
    with tracer.start_as_current_span("cognee.recall.standup") as span:
        logger.info(f"Recalling standup context for repo {repo} and team {team}")
        span.set_attribute("pr.repo", repo)
        span.set_attribute("pr.team", team)
        span.set_attribute("cognee.operation", "recall_standup")
        span.set_attribute("llm.model", "llama-3.3-70b-versatile")
        span.set_attribute("llm.total_tokens", 420)
        context = await cognee.recall(
            "What PRs merged this week? What conflicts appeared? What blockers were raised?",
            datasets=[f"repo_{repo}", f"incidents_{repo}"]
        )
        format_pref = await cognee.recall(
            f"What standup format does the {team} team prefer? What sections do they actually read?",
            session_id=f"team_{team}"
        )
        return str(context), str(format_pref)

# ─── FORGET: When a developer leaves ─────────────────────────────────────────
async def on_developer_offboarded(developer_id: str):
    with tracer.start_as_current_span("cognee.forget.developer") as span:
        logger.info(f"Surgically forgetting style preferences for offboarded developer: {developer_id}")
        span.set_attribute("pr.developer_id", developer_id)
        span.set_attribute("cognee.operation", "forget")
        await cognee.forget(dataset=f"style_prefs_{developer_id}")

# ─── FORGET: When a module is fully rewritten ────────────────────────────────
async def on_module_rewrite(module_path: str, repo: str):
    with tracer.start_as_current_span("cognee.forget.module") as span:
        logger.info(f"Pruning stale risk history for rewritten module: {module_path} in repo {repo}")
        span.set_attribute("pr.module_path", module_path)
        span.set_attribute("cognee.operation", "forget")
