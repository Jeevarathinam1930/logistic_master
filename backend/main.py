from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from analyzer import run_analysis, get_kb

app = FastAPI(title="Founder Second Brain API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["Content-Type"],
)


class FounderInput(BaseModel):
    idea: str
    challenge: str
    background: str
    customer: str
    budget: str
    timeline: str


@app.get("/")
def root():
    return {"status": "ok", "service": "Founder Second Brain API"}


@app.post("/analyze")
async def analyze(data: FounderInput):
    result = run_analysis(data)
    return {
        "confidence_score": result["score"],
        "patterns": result["patterns"],
        "clarified_idea": result["idea"],
        "assumptions": result["assumptions"],
        "failure_risk": result["risk"],
        "milestone_plan": result["milestones"],
        "first_step": result["action"]
    }


@app.get("/patterns")
def list_patterns(category: str = "", type: str = "", search: str = ""):
    kb = get_kb()
    entries = kb.get_all_entries()
    if category:
        entries = [e for e in entries if e["category"].lower() == category.lower()]
    if type:
        entries = [e for e in entries if e["type"].lower() == type.lower()]
    if search:
        q = search.lower()
        entries = [
            e for e in entries
            if q in e["name"].lower() or q in e["summary"].lower() or q in e["source"].lower()
        ]
    return {"total": len(entries), "patterns": entries}


@app.get("/patterns/{pattern_id}")
def get_pattern(pattern_id: int):
    kb = get_kb()
    entry = kb.get_entry(pattern_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Pattern not found")
    return entry


@app.get("/categories")
def list_categories():
    kb = get_kb()
    cats = {}
    for e in kb.entries:
        c = e.get("CATEGORY", "Unknown")
        cats[c] = cats.get(c, 0) + 1
    return {"categories": [{"name": k, "count": v} for k, v in sorted(cats.items())]}
