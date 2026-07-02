import asyncio
import logging
from typing import List, Tuple, Dict, Any
from difflib import SequenceMatcher
import cognee

logger = logging.getLogger("recon_memory")
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
    logger.info(f"Ingesting PR opened event for PR #{pr_data.get('number')} in repo {pr_data.get('repo')}")
    content = f"""
    PR #{pr_data['number']}: {pr_data['title']}
    Author: {pr_data['author']}
    Files touched: {', '.join(pr_data['files'])}
    Opened at: {pr_data['created_at']}
    """
    await cognee.remember(content, dataset_name=f"repo_{pr_data['repo']}")

# ─── RECALL: Before generating a PR description ──────────────────────────────
async def get_style_context(author: str, files: list[str]) -> tuple[str, str]:
    logger.info(f"Recalling style context for author {author} and risk profile for files: {files}")
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
    logger.info(f"Ingesting PR merged outcome for PR #{pr_data.get('number')} with edit distance {edit_distance}")
    outcome = f"""
    PR #{pr_data['number']} merged.
    Generated description edit distance: {edit_distance:.2f}
    CI build result: {pr_data['ci_status']}
    Final description used: {pr_data['final_description']}
    Files: {', '.join(pr_data['files'])}
    """
    await cognee.remember(outcome, dataset_name=f"repo_{pr_data['repo']}")

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
    logger.info(f"CI failure detected on repo {pr_data.get('repo')}. Triggering negative signal on touched files.")
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
    logger.info(f"Recalling standup context for repo {repo} and team {team}")
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
    logger.info(f"Surgically forgetting style preferences for offboarded developer: {developer_id}")
    await cognee.forget(dataset=f"style_prefs_{developer_id}")

# ─── FORGET: When a module is fully rewritten ────────────────────────────────
async def on_module_rewrite(module_path: str, repo: str):
    logger.info(f"Pruning stale risk history for rewritten module: {module_path} in repo {repo}")
    # Prune stale risk history for this module — fresh start
    await cognee.forget(dataset=f"risk_{repo}_{module_path.replace('/', '_')}")
