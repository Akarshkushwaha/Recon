import logging
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .engine import (
    on_pr_opened,
    get_style_context,
    on_pr_merged,
    on_ci_failure,
    generate_standup,
    on_developer_offboarded,
    on_module_rewrite,
    calculate_edit_distance
)

logger = logging.getLogger("recon_memory.api")

app = FastAPI(
    title="Recon Memory Service",
    description="The PR intelligence layer that gets smarter with every merge — powered by Cognee Hybrid Graph-Vector Engine.",
    version="1.0.0"
)

# Allow CORS for Next.js frontend / Convex integrations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── PYDANTIC REQUEST MODELS ──────────────────────────────────────────────────

class PROpenedRequest(BaseModel):
    number: int
    title: str
    author: str
    repo: str
    files: List[str]
    created_at: str

class PRMergedRequest(BaseModel):
    number: int
    repo: str
    author: str
    files: List[str]
    ci_status: str = "success"
    generated_description: str
    final_description: str
    edit_distance: Optional[float] = None

class CIFailureRequest(BaseModel):
    number: int
    repo: str
    author: str
    files: List[str]
    ci_error: str

class StandupRequest(BaseModel):
    repo: str
    team: str

class ForgetDeveloperRequest(BaseModel):
    developer_id: str

class ForgetModuleRequest(BaseModel):
    module_path: str
    repo: str

# ─── API ENDPOINTS ────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "service": "Recon Memory Service",
        "tagline": "The PR intelligence layer that gets smarter with every merge",
        "status": "operational",
        "engine": "Cognee Hybrid Graph-Vector Memory"
    }

@app.post("/api/memory/pr-opened")
async def handle_pr_opened(req: PROpenedRequest, background_tasks: BackgroundTasks):
    """
    Ingest open PR event into permanent knowledge graph.
    Runs ECL (Extract, Cognify, Load) pipeline in background.
    """
    try:
        background_tasks.add_task(on_pr_opened, req.model_dump())
        return {"status": "processing", "message": f"PR #{req.number} queued for Cognee memory ingestion."}
    except Exception as e:
        logger.error(f"Error handling PR opened: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/memory/style-context")
async def handle_get_style_context(
    author: str = Query(..., description="GitHub username of author"),
    files: List[str] = Query(..., description="List of file paths touched")
):
    """
    Recall developer style preferences and file historical risk profiles before generating PR descriptions.
    Uses auto-routed graph completion and vector similarity.
    """
    try:
        style_pref, risk_profile = await get_style_context(author, files)
        return {
            "author": author,
            "style_preferences": style_pref,
            "risk_profile": risk_profile,
            "files_checked": files
        }
    except Exception as e:
        logger.error(f"Error recalling style context: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/memory/pr-merged")
async def handle_pr_merged(req: PRMergedRequest, background_tasks: BackgroundTasks):
    """
    Record merge outcome, compute edit distance, and trigger improve() to re-weight graph edges.
    """
    try:
        dist = req.edit_distance
        if dist is None:
            dist = calculate_edit_distance(req.generated_description, req.final_description)
        
        background_tasks.add_task(on_pr_merged, req.model_dump(), dist)
        return {
            "status": "processing",
            "edit_distance": dist,
            "signal": "positive" if dist < 0.3 else "correction",
            "message": f"PR #{req.number} merge outcome queued. Triggering Cognee improve() loop."
        }
    except Exception as e:
        logger.error(f"Error handling PR merged: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/memory/ci-failure")
async def handle_ci_failure(req: CIFailureRequest, background_tasks: BackgroundTasks):
    """
    Record CI failure post-merge and trigger improve() with negative signal to strengthen file risk weights.
    """
    try:
        background_tasks.add_task(on_ci_failure, req.model_dump())
        return {
            "status": "processing",
            "signal": "negative",
            "message": f"CI failure for PR #{req.number} queued. Strengthening historical risk scores for {req.files}."
        }
    except Exception as e:
        logger.error(f"Error handling CI failure: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/memory/standup-context")
async def handle_standup_context(req: StandupRequest):
    """
    Recall merged PRs, conflicts, blockers, and team format preferences for standup generation.
    """
    try:
        context, format_pref = await generate_standup(req.repo, req.team)
        return {
            "repo": req.repo,
            "team": req.team,
            "context": context,
            "format_preferences": format_pref
        }
    except Exception as e:
        logger.error(f"Error recalling standup context: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/memory/forget/developer")
async def handle_forget_developer(req: ForgetDeveloperRequest):
    """
    Surgically forget developer style preferences (GDPR / offboarding).
    """
    try:
        await on_developer_offboarded(req.developer_id)
        return {"status": "success", "message": f"Developer {req.developer_id} style preferences purged from graph."}
    except Exception as e:
        logger.error(f"Error forgetting developer: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/memory/forget/module")
async def handle_forget_module(req: ForgetModuleRequest):
    """
    Prune stale risk history when a module is rewritten.
    """
    try:
        await on_module_rewrite(req.module_path, req.repo)
        return {"status": "success", "message": f"Module {req.module_path} in repo {req.repo} risk history pruned."}
    except Exception as e:
        logger.error(f"Error forgetting module: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/memory/graph-summary")
async def get_graph_summary():
    """
    Returns a structured representation of the memory graph for UI visualization.
    Shows Developers, PRs, Files, Conflicts, and relationship weights.
    """
    # Simulated structure representing active graph topology and learned weights
    return {
        "nodes": [
            {"id": "dev_akarsh", "label": "Developer", "name": "akarsh", "style": "terse-imperative"},
            {"id": "file_auth", "label": "File", "path": "src/auth.py", "risk_score": 0.85},
            {"id": "file_db", "label": "File", "path": "src/db.py", "risk_score": 0.20},
            {"id": "pr_142", "label": "PR", "number": 142, "title": "Fix token expiration", "status": "merged"},
            {"id": "incident_99", "label": "Conflict/Incident", "error": "NullPointerException in auth.py"}
        ],
        "edges": [
            {"source": "pr_142", "target": "file_auth", "relation": "touches", "weight": 0.9},
            {"source": "pr_142", "target": "dev_akarsh", "relation": "authored_by", "weight": 1.0},
            {"source": "pr_142", "target": "incident_99", "relation": "led_to_incident", "weight": 0.85},
            {"source": "dev_akarsh", "target": "terse-imperative", "relation": "prefers", "weight": 0.78}
        ],
        "stats": {
            "total_nodes": 5,
            "total_edges": 4,
            "active_strategies": 14,
            "last_improved": "Just now"
        }
    }
