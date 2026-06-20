import streamlit as st
import os
import re
import time
from datetime import datetime
from openai import OpenAI
from dotenv import load_dotenv
from rag_retrieval import KnowledgeBase

load_dotenv()

st.set_page_config(
    page_title="Founder Second Brain",
    page_icon="🧠",
    layout="wide"
)

# ─── CUSTOM CSS ───────────────────────────────────────────────────────
CUSTOM_CSS = """
<style>
    /* ── Reset & Base ── */
    .stApp { background: #0B1020; }
    .main > .block-container { padding: 1.5rem 2rem; max-width: 1200px; }
    h1, h2, h3, h4, h5, h6, p, li, span, div { color: #F0F4FF; }
    a { color: #4F8CFF; }

    /* ── Sidebar ── */
    section[data-testid="stSidebar"] {
        background: #0D1327 !important;
        border-right: 1px solid #1E2A40;
        padding: 1.5rem 1rem;
        min-width: 240px;
    }
    section[data-testid="stSidebar"] .stMarkdown p {
        color: #F0F4FF;
        font-size: 14px;
        line-height: 1.6;
    }
    .sidebar-stat {
        background: #151B2D;
        border: 1px solid #1E2A40;
        border-radius: 10px;
        padding: 12px 16px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .sidebar-stat .stat-icon { font-size: 22px; }
    .sidebar-stat .stat-text { flex: 1; }
    .sidebar-stat .stat-number {
        font-size: 13px;
        color: #4F8CFF;
        font-weight: 700;
        font-family: 'Courier New', monospace;
    }
    .sidebar-stat .stat-label {
        font-size: 12px;
        color: #8892A4;
    }
    .sidebar-live-score {
        background: linear-gradient(135deg, #4F8CFF15, #2ECC7115);
        border: 1px solid #4F8CFF40;
        border-radius: 10px;
        padding: 14px 16px;
        margin-top: 12px;
    }
    .sidebar-live-score .score-value {
        font-size: 28px;
        font-weight: 800;
        color: #4F8CFF;
        font-family: 'Courier New', monospace;
    }
    .sidebar-live-score .score-label {
        font-size: 11px;
        color: #8892A4;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* ── Footer ── */
    .app-footer {
        text-align: center;
        padding: 20px 0 8px 0;
        font-size: 11px;
        color: #5A6478;
        border-top: 1px solid #1E2A40;
        margin-top: 40px;
        letter-spacing: 0.3px;
    }

    /* ── Cards ── */
    .card-base {
        background: #151B2D;
        border: 1px solid #1E2A40;
        border-radius: 12px;
        padding: 20px 24px;
        margin-bottom: 16px;
    }
    .card-blue {
        border-left: 4px solid #4F8CFF;
    }
    .card-amber {
        border-left: 4px solid #F39C12;
    }
    .card-red {
        border-left: 4px solid #E74C3C;
        background: rgba(231, 76, 60, 0.10) !important;
    }
    .card-green {
        border-left: 4px solid #2ECC71;
        background: rgba(46, 204, 113, 0.10) !important;
    }
    .card-icon { font-size: 20px; margin-right: 10px; }
    .card-title {
        font-size: 16px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
    }
    .card-body { font-size: 14px; line-height: 1.7; color: #D0D8E8; }

    /* ── Confidence Score ── */
    .confidence-card {
        background: linear-gradient(135deg, #151B2D, #1A2340);
        border: 1px solid #4F8CFF30;
        border-radius: 14px;
        padding: 24px 28px;
        text-align: center;
        margin-bottom: 20px;
    }
    .confidence-card .big-score {
        font-size: 52px;
        font-weight: 800;
        color: #4F8CFF;
        font-family: 'Courier New', monospace;
        line-height: 1;
    }
    .confidence-card .score-denom {
        font-size: 24px;
        color: #8892A4;
        font-weight: 400;
    }
    .confidence-card .score-sub {
        font-size: 13px;
        color: #8892A4;
        margin-top: 4px;
        letter-spacing: 0.3px;
    }

    /* ── Risk Badge ── */
    .risk-badge {
        display: inline-block;
        background: rgba(231, 76, 60, 0.20);
        color: #E74C3C;
        font-size: 11px;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: 20px;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        font-family: 'Courier New', monospace;
    }
    .risk-medium {
        background: rgba(243, 156, 18, 0.20);
        color: #F39C12;
    }
    .risk-low {
        background: rgba(46, 204, 113, 0.20);
        color: #2ECC71;
    }

    /* ── Pattern Badge ── */
    .pattern-badge {
        display: inline-block;
        background: #1E2A40;
        color: #4F8CFF;
        font-size: 11px;
        font-weight: 700;
        padding: 2px 10px;
        border-radius: 20px;
        font-family: 'Courier New', monospace;
    }

    /* ── Buttons ── */
    .stButton button {
        border-radius: 10px !important;
        font-weight: 600 !important;
        font-size: 15px !important;
        padding: 10px 24px !important;
        border: none !important;
        transition: all 0.2s !important;
    }
    .stButton button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    div[data-testid="column"] .stButton button {
        width: 100%;
        height: 70px;
        font-size: 18px !important;
    }
    .btn-primary button {
        background: #4F8CFF !important;
        color: white !important;
    }
    .btn-success button {
        background: #2ECC71 !important;
        color: #0B1020 !important;
    }
    .btn-warning button {
        background: #F39C12 !important;
        color: #0B1020 !important;
    }
    .btn-pause button {
        background: #2A3450 !important;
        color: #8892A4 !important;
    }

    /* ── Decision Buttons Row ── */
    .decision-btn-wrapper { text-align: center; }
    .decision-btn-label { font-size: 12px; color: #8892A4; margin-top: 4px; }

    /* ── Checkbox Styling ── */
    .stCheckbox label { font-size: 14px; color: #D0D8E8; }
    .stCheckbox input:checked + div { border-color: #2ECC71; }

    /* ── Dividers ── */
    hr { border-color: #1E2A40 !important; margin: 24px 0 !important; }

    /* ── Step Indicator ── */
    .step-indicator {
        font-size: 12px;
        color: #8892A4;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-weight: 600;
        text-align: right;
    }

    /* ── Social Proof ── */
    .social-proof {
        font-size: 13px;
        color: #5A6478;
        margin-top: -12px;
        margin-bottom: 20px;
    }

    /* ── Section divider ── */
    .section-label {
        font-size: 13px;
        font-weight: 700;
        color: #8892A4;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 16px;
    }

    /* ── Loading text ── */
    .loading-text {
        text-align: center;
        font-size: 16px;
        color: #8892A4;
        padding: 40px 0;
    }

    /* ── Decision subtext ── */
    .decision-subtext {
        font-size: 12px;
        color: #5A6478;
        text-align: center;
        margin-top: 2px;
    }

    /* ── Progress checklist ── */
    .checklist-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        background: rgba(46, 204, 113, 0.06);
        border: 1px solid #1E2A40;
        border-radius: 8px;
        margin-bottom: 8px;
    }
    .checklist-item.checked {
        background: rgba(46, 204, 113, 0.12);
        border-color: #2ECC7140;
    }
    .checklist-item .check-text {
        font-size: 14px;
        color: #D0D8E8;
    }
    .cleared-msg {
        text-align: center;
        font-size: 20px;
        font-weight: 700;
        color: #2ECC71;
        padding: 20px;
        margin-top: 12px;
    }
</style>
"""

# ── HELPER FUNCTIONS ───────────────────────────────────────────────

KB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "knowledge_base_v1.txt")


@st.cache_resource
def load_kb():
    return KnowledgeBase(KB_PATH)


kb = load_kb()


TYPE_MAP = {
    'student': 'student',
    'working professional': 'professional',
    'developer': 'developer',
    'other': 'student'
}

TIMELINE_OPTIONS = ['4 weeks', '6 weeks', '3 months', '6 months', '12 months']


def retrieve_patterns(query_text, founder_type, budget, timeline):
    founder_input = {
        'idea_description': query_text,
        'founder_type': founder_type,
        'budget': budget,
        'timeline': timeline,
        'domain': 'logistics'
    }
    results = kb.retrieve(founder_input, top_n=3)
    mapped = []
    for r in results:
        mapped.append({
            'name': r['PATTERN_NAME'],
            'source': r['SOURCE'],
            'insight': r['INSIGHT'],
            'score': r['relevance_score']
        })
    return mapped


def call_deepseek(system_prompt, user_prompt):
    client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.environ["HF_TOKEN"],
)

    completion = client.chat.completions.create(
    model="deepseek-ai/DeepSeek-V4-Flash:novita",
    messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        max_tokens=2000,
        temperature=1.0,
        stream=False
    )
    return completion.choices[0].message.content


def parse_ai_sections(response):
    sections = {}
    pattern_defs = [
        (r'1\.\s*CLARIFIED IDEA\s*(.*?)(?=2\.\s*THREE HIDDEN ASSUMPTIONS)', 'clarified'),
        (r'2\.\s*THREE HIDDEN ASSUMPTIONS\s*(.*?)(?=3\.\s*MATCHED FAILURE RISK)', 'assumptions'),
        (r'3\.\s*MATCHED FAILURE RISK\s*(.*?)(?=4\.\s*REALISTIC MILESTONE PLAN)', 'failure_risk'),
        (r'4\.\s*REALISTIC MILESTONE PLAN\s*(.*?)(?=5\.\s*48)', 'milestone'),
        (r'5\.\s*48[ -]?HOUR FIRST STEP\s*(.*?)$', 'first_step'),
    ]
    for pattern, key in pattern_defs:
        m = re.search(pattern, response, re.DOTALL)
        if m:
            sections[key] = m.group(1).strip()
    return sections


def render_card(icon, title, body, card_class="card-blue"):
    body_html = body.replace('\n', '<br>')
    return f"""
    <div class="card-base {card_class}">
        <div class="card-title"><span class="card-icon">{icon}</span> {title}</div>
        <div class="card-body">{body_html}</div>
    </div>
    """


def render_sidebar(score=None):
    with st.sidebar:
        st.markdown("## 🧠 **Founder Second Brain**")
        st.markdown("<br>", unsafe_allow_html=True)
        st.markdown('<div class="section-label">Knowledge Base</div>', unsafe_allow_html=True)

        stats = [
            ("🧠", "280", "Startup Patterns"),
            ("📄", "4,357", "Lines Analyzed"),
            ("🚚", "58", "Logistics Cases"),
        ]
        for icon, num, label in stats:
            st.markdown(
                f'<div class="sidebar-stat">'
                f'  <span class="stat-icon">{icon}</span>'
                f'  <div class="stat-text">'
                f'    <div class="stat-number">{num}</div>'
                f'    <div class="stat-label">{label}</div>'
                f'  </div>'
                f'</div>',
                unsafe_allow_html=True
            )

        if score is not None:
            st.markdown(
                f'<div class="sidebar-live-score">'
                f'  <div class="score-label">Live Pattern Match</div>'
                f'  <div class="score-value">{score}</div>'
                f'</div>',
                unsafe_allow_html=True
            )
        else:
            st.markdown(
                f'<div class="sidebar-live-score">'
                f'  <div class="score-label">Live Pattern Match</div>'
                f'  <div class="score-value" style="color:#2A3450;">—</div>'
                f'</div>',
                unsafe_allow_html=True
            )


def render_footer():
    st.markdown(
        '<div class="app-footer">Founder Second Brain — USAII Global AI Hackathon 2026 — Challenge 3B</div>',
        unsafe_allow_html=True
    )


# ── SESSION STATE ──────────────────────────────────────────────────

if 'screen' not in st.session_state:
    st.session_state.screen = 'input'
if 'ai_result' not in st.session_state:
    st.session_state.ai_result = None
if 'ai_raw' not in st.session_state:
    st.session_state.ai_raw = None
if 'patterns' not in st.session_state:
    st.session_state.patterns = None
if 'top_score' not in st.session_state:
    st.session_state.top_score = 0
if 'form_data' not in st.session_state:
    st.session_state.form_data = {}
if 'revised_idea' not in st.session_state:
    st.session_state.revised_idea = ""
if 'decision' not in st.session_state:
    st.session_state.decision = None
if 'proceed_checks' not in st.session_state:
    st.session_state.proceed_checks = [False, False, False]
if 'analysis_time' not in st.session_state:
    st.session_state.analysis_time = None


# ── INJECT CSS ─────────────────────────────────────────────────────
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)


# ── SCREEN 1: INPUT ────────────────────────────────────────────────

def show_input_screen():
    render_sidebar()
    render_footer()

    col1, col2 = st.columns([3, 1])
    with col1:
        st.markdown("# 🧠 **Founder Second Brain**")
        st.markdown(
            '<p class="social-proof">Used by founders across ₹50K to $15M budgets</p>',
            unsafe_allow_html=True
        )
    with col2:
        st.markdown('<div class="step-indicator">Step 1 of 3</div>', unsafe_allow_html=True)

    st.markdown("---")

    with st.form("founder_form"):
        st.markdown('<div class="section-label">— Your Idea</div>', unsafe_allow_html=True)

        idea = st.text_area(
            "What are you building?",
            value=st.session_state.revised_idea if st.session_state.revised_idea else "",
            placeholder="e.g. An app connecting small businesses with local truck owners for same-day delivery in tier-2 Indian cities",
            height=90
        )

        challenge = st.text_area(
            "What is your biggest challenge?",
            placeholder="e.g. I don't know if truck owners will join without guaranteed orders, or if small businesses will pay more than current options",
            height=80
        )

        st.markdown("<br>", unsafe_allow_html=True)
        st.markdown('<div class="section-label">— Your Context</div>', unsafe_allow_html=True)

        col1, col2 = st.columns(2)
        with col1:
            founder_type = st.selectbox(
                "Your background",
                options=['student', 'working professional', 'developer', 'other'],
                index=0
            )
            budget = st.text_input(
                "Available budget",
                placeholder="e.g. ₹50,000 or $8,000 or bootstrapped"
            )
        with col2:
            target_customer = st.text_input(
                "Target customer",
                placeholder="e.g. Small manufacturing units in Gurgaon with 20-100 daily deliveries"
            )
            timeline = st.selectbox(
                "Timeline",
                options=TIMELINE_OPTIONS,
                index=2
            )

        st.markdown("<br>", unsafe_allow_html=True)
        submitted = st.form_submit_button(
            "Analyze My Idea →",
            type="primary",
            use_container_width=True
        )

    if submitted:
        if not idea.strip():
            st.error("Please describe your startup idea.")
            return
        if not challenge.strip():
            st.error("Please describe your biggest challenge.")
            return
        if not target_customer.strip():
            st.error("Please specify your target customer.")
            return
        if not budget.strip():
            st.error("Please enter your available budget.")
            return

        st.session_state.form_data = {
            'idea': idea.strip(),
            'founder_type': founder_type,
            'founder_type_mapped': TYPE_MAP.get(founder_type, 'student'),
            'target_customer': target_customer.strip(),
            'budget': budget.strip(),
            'timeline': timeline,
            'challenge': challenge.strip()
        }
        st.session_state.screen = 'result'
        st.rerun()


# ── SCREEN 2: RESULTS ─────────────────────────────────────────────

def show_result_screen():
    render_sidebar(score=st.session_state.top_score)
    render_footer()

    col1, col2 = st.columns([3, 1])
    with col1:
        st.markdown("# 🧠 **Founder Second Brain**")
    with col2:
        st.markdown('<div class="step-indicator">Step 2 of 3</div>', unsafe_allow_html=True)

    fd = st.session_state.form_data
    query_text = f"{fd['idea']} {fd['challenge']}"

    if not st.session_state.patterns:
        with st.spinner("Cross-referencing against 280 startup failure patterns..."):
            try:
                patterns = retrieve_patterns(
                    query_text=query_text,
                    founder_type=fd['founder_type_mapped'],
                    budget=fd['budget'],
                    timeline=fd['timeline']
                )
            except Exception as e:
                st.error(f"RAG retrieval failed: {e}")
                if st.button("← Back to input"):
                    st.session_state.screen = 'input'
                    st.rerun()
                return

            if len(patterns) < 3:
                st.error("Could not retrieve enough patterns from the knowledge base. Try rephrasing your idea.")
                if st.button("← Back to input"):
                    st.session_state.screen = 'input'
                    st.rerun()
                return

            st.session_state.patterns = patterns
            st.session_state.top_score = patterns[0]['score']

        with st.spinner("Running AI reasoning against matched patterns..."):
            system_prompt = """You are Founder Second Brain, an AI advisor for early-stage logistics startup founders.

You reason like a combination of a seasoned logistics operator, a startup mentor, and a venture capitalist who has seen hundreds of logistics startups fail and succeed.

You have been given 3 relevant patterns from a knowledge base of 280 startup and logistics insights. Use these patterns as your primary reasoning context.

RULES:
- Never give generic advice like "talk to customers". Always make it specific to this founder's situation.
- Always reference the pattern name when you use it.
- If their timeline is unrealistic, say so directly and give a realistic alternative.
- You do NOT make the final go/no-go decision. The founder decides after seeing your analysis.
- Show uncertainty honestly — do not pretend to know things you cannot know."""

            user_prompt = f"""FOUNDER PROFILE:
Idea: {fd['idea']}
Background: {fd['founder_type']}
Target Customer: {fd['target_customer']}
Budget: {fd['budget']}
Timeline: {fd['timeline']}
Biggest Challenge: {fd['challenge']}

RETRIEVED PATTERNS FROM KNOWLEDGE BASE:
Pattern 1: {st.session_state.patterns[0]['name']}
Source: {st.session_state.patterns[0]['source']}
Insight: {st.session_state.patterns[0]['insight']}

Pattern 2: {st.session_state.patterns[1]['name']}
Source: {st.session_state.patterns[1]['source']}
Insight: {st.session_state.patterns[1]['insight']}

Pattern 3: {st.session_state.patterns[2]['name']}
Source: {st.session_state.patterns[2]['source']}
Insight: {st.session_state.patterns[2]['insight']}

Based on these patterns and this founder's specific situation, provide:

1. CLARIFIED IDEA
   Restate the idea in precise terms. Remove vague language. Name the specific market segment.

2. THREE HIDDEN ASSUMPTIONS
   What has this founder not questioned yet? Label each as [HIGH RISK], [MEDIUM RISK], or [LOW RISK].
   Each must be specific to their idea and constraints.

3. MATCHED FAILURE RISK
   Which of the 3 patterns is most dangerous for this founder? Why specifically?
   Name the pattern. Give a concrete warning sign they should watch for.

4. REALISTIC MILESTONE PLAN
   30 days / 60 days / 90 days
   Calibrated to their actual budget and timeline.
   If timeline is unrealistic, say so and adjust.

5. 48-HOUR FIRST STEP
   ONE specific action. Not "research the market."
   Something they can do tomorrow with no money."""

            try:
                result = call_deepseek(system_prompt, user_prompt)
                st.session_state.ai_raw = result
                st.session_state.ai_result = parse_ai_sections(result)
                st.session_state.analysis_time = datetime.now()
            except Exception as e:
                st.error(f"API call failed. Check your DEEPSEEK_API_KEY and internet connection.")
                st.caption(f"Details: {e}")
                if st.button("← Back to input"):
                    st.session_state.screen = 'input'
                    st.rerun()
                return

    # ── Confidence Score ──
    p = st.session_state.patterns
    total_score = st.session_state.top_score
    display_score = f"{total_score}/20"
    st.markdown(
        f'<div class="confidence-card">'
        f'  <div class="big-score">{display_score} <span class="score-denom"></span></div>'
        f'  <div class="score-sub">Matched against 280 historical startup cases</div>'
        f'</div>',
        unsafe_allow_html=True
    )

    # ── Collapsible Patterns ──
    with st.expander("▶ View 3 Matched Historical Cases"):
        cols = st.columns(3)
        for i, pat in enumerate(p):
            with cols[i]:
                score_color = "#E74C3C" if pat['score'] >= 12 else "#F39C12" if pat['score'] >= 7 else "#8892A4"
                st.markdown(
                    f'<div class="card-base" style="padding:14px 16px;">'
                    f'  <div style="font-size:14px;font-weight:700;margin-bottom:4px;">{pat["name"][:50]}</div>'
                    f'  <span class="pattern-badge" style="color:{score_color};border-color:{score_color}40;">score {pat["score"]}</span>'
                    f'  <div style="font-size:12px;color:#8892A4;margin-top:8px;">{pat["insight"][:100]}...</div>'
                    f'</div>',
                    unsafe_allow_html=True
                )

    st.markdown("---")

    # ── Analysis Cards ──
    sections = st.session_state.ai_result
    if not sections:
        st.info("AI response format is being processed. Displaying raw output.")
        st.markdown(st.session_state.ai_raw)
    else:
        # Card 1: Clarified Idea (blue)
        if 'clarified' in sections:
            st.markdown(render_card("📌", "Clarified Idea", sections['clarified'], "card-blue"), unsafe_allow_html=True)

        # Card 2: Hidden Assumptions (amber) — add risk labels
        if 'assumptions' in sections:
            body = sections['assumptions']
            body = body.replace('[HIGH RISK]', '<span class="risk-badge">HIGH RISK</span>')
            body = body.replace('[MEDIUM RISK]', '<span class="risk-badge risk-medium">MEDIUM RISK</span>')
            body = body.replace('[LOW RISK]', '<span class="risk-badge risk-low">LOW RISK</span>')
            st.markdown(render_card("⚠", "Hidden Assumptions", body, "card-amber"), unsafe_allow_html=True)

        # Card 3: Failure Risk (red) — most visually important
        if 'failure_risk' in sections:
            st.markdown(render_card("🚨", "Matched Failure Pattern", sections['failure_risk'], "card-red"), unsafe_allow_html=True)

        # Card 4: Milestone Plan (blue)
        if 'milestone' in sections:
            st.markdown(render_card("📅", "30 / 60 / 90 Day Plan", sections['milestone'], "card-blue"), unsafe_allow_html=True)

        # Card 5: 48-Hour Step (green) — most actionable
        if 'first_step' in sections:
            st.markdown(render_card("⚡", "Your Next 48 Hours", sections['first_step'], "card-green"), unsafe_allow_html=True)

    # ── Confidence Note ──
    st.markdown("---")
    st.warning(
        f"⚠ This analysis is based on {st.session_state.top_score} pattern matches "
        f"from 280 startup cases. Moderate confidence — validate assumption #1 "
        f"before investing time or money."
    )

    # ── Decision Section ──
    st.markdown("---")
    st.markdown("## What is your next move?")
    st.markdown(
        '<p style="color:#8892A4;font-size:14px;text-align:center;">'
        'You have reviewed the analysis. This decision is yours.</p>',
        unsafe_allow_html=True
    )
    st.markdown("<br>", unsafe_allow_html=True)

    dcol1, dcol2, dcol3 = st.columns(3)

    with dcol1:
        st.markdown('<div class="btn-success decision-btn-wrapper">', unsafe_allow_html=True)
        if st.button("✅ PROCEED", key="dec_proceed"):
            st.session_state.screen = 'decision'
            st.session_state.decision = 'proceed'
            st.session_state.proceed_checks = [False, False, False]
            st.rerun()
        st.markdown('<p class="decision-subtext">I\'ve validated enough to move forward</p>', unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)

    with dcol2:
        st.markdown('<div class="btn-warning decision-btn-wrapper">', unsafe_allow_html=True)
        if st.button("🔄 PIVOT", key="dec_pivot"):
            st.session_state.screen = 'decision'
            st.session_state.decision = 'pivot'
            st.rerun()
        st.markdown('<p class="decision-subtext">I need to change a key assumption or constraint</p>', unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)

    with dcol3:
        st.markdown('<div class="btn-pause decision-btn-wrapper">', unsafe_allow_html=True)
        if st.button("⏸ PAUSE", key="dec_pause"):
            st.session_state.screen = 'decision'
            st.session_state.decision = 'pause'
            st.rerun()
        st.markdown('<p class="decision-subtext">I need more information before deciding</p>', unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)


# ── SCREEN 3: DECISION ─────────────────────────────────────────────

def show_decision_screen():
    render_sidebar(score=st.session_state.top_score)
    render_footer()

    col1, col2 = st.columns([3, 1])
    with col1:
        st.markdown("# 🧠 **Founder Second Brain**")
    with col2:
        st.markdown('<div class="step-indicator">Step 3 of 3</div>', unsafe_allow_html=True)

    st.markdown("---")
    st.markdown("## What is your next move?")
    st.markdown(
        '<p style="color:#8892A4;font-size:14px;text-align:center;">'
        'You have reviewed the analysis. This decision is yours.</p>',
        unsafe_allow_html=True
    )
    st.markdown("<br>", unsafe_allow_html=True)

    dcol1, dcol2, dcol3 = st.columns(3)
    with dcol1:
        if st.button("✅ PROCEED", key="dec_proceed2", use_container_width=True):
            st.session_state.decision = 'proceed'
            st.rerun()
        st.markdown('<p class="decision-subtext">I\'ve validated enough to move forward</p>', unsafe_allow_html=True)

    with dcol2:
        if st.button("🔄 PIVOT", key="dec_pivot2", use_container_width=True):
            st.session_state.decision = 'pivot'
            st.rerun()
        st.markdown('<p class="decision-subtext">I need to change a key assumption or constraint</p>', unsafe_allow_html=True)

    with dcol3:
        if st.button("⏸ PAUSE", key="dec_pause2", use_container_width=True):
            st.session_state.decision = 'pause'
            st.rerun()
        st.markdown('<p class="decision-subtext">I need more information before deciding</p>', unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown("---")

    decision = st.session_state.get('decision', 'pause')

    if decision == 'proceed':
        c1, c2, c3 = st.columns([1, 2, 1])
        with c2:
            st.success(
                "**Before you proceed, confirm:**  \n"
                "▢ I have identified my first real customer to call  \n"
                "▢ I understand the primary failure risk in my context  \n"
                "▢ I have a clear action for the next 48 hours"
            )

            plan_text = f"""FOUNDER SECOND BRAIN — ANALYSIS OUTPUT
==================================
Idea: {st.session_state.form_data.get('idea', 'N/A')}
Background: {st.session_state.form_data.get('founder_type', 'N/A')}
Target Customer: {st.session_state.form_data.get('target_customer', 'N/A')}
Budget: {st.session_state.form_data.get('budget', 'N/A')}
Timeline: {st.session_state.form_data.get('timeline', 'N/A')}

Pattern Match Score: {st.session_state.top_score}/20

Patterns Used:
1. {st.session_state.patterns[0]['name'] if st.session_state.patterns else 'N/A'}
2. {st.session_state.patterns[1]['name'] if st.session_state.patterns and len(st.session_state.patterns) > 1 else 'N/A'}
3. {st.session_state.patterns[2]['name'] if st.session_state.patterns and len(st.session_state.patterns) > 2 else 'N/A'}

AI Analysis:
{st.session_state.ai_raw}
==================================
Generated by Founder Second Brain — USAII Global AI Hackathon 2026
"""

            st.download_button(
                label="📄 Download your plan",
                data=plan_text,
                file_name="founder_plan.txt",
                mime="text/plain",
                use_container_width=True
            )

            st.markdown('<div class="cleared-msg">✅ You are cleared to proceed</div>', unsafe_allow_html=True)
            st.balloons()

    elif decision == 'pivot':
        st.warning("**Smart move. What will you change?**")
        revised = st.text_area(
            "What specifically will you change?",
            value=st.session_state.form_data.get('idea', ''),
            placeholder="e.g. I will target a different customer segment, or reduce scope to one city",
            height=120
        )
        if st.button("Re-Analyze with New Constraint →", type="primary", use_container_width=True):
            st.session_state.revised_idea = revised
            st.session_state.patterns = None
            st.session_state.ai_raw = None
            st.session_state.ai_result = None
            st.session_state.screen = 'input'
            st.rerun()

    elif decision == 'pause':
        ts = st.session_state.analysis_time
        timestamp = ts.strftime("%B %d, %Y at %I:%M %p") if ts else "N/A"
        st.info(
            f"**Your analysis has been saved.**  \n\n"
            f"🕐 Analyzed on {timestamp}  \n\n"
            "The patterns don't change. Your thinking might. Return when you're ready."
        )

        if st.button("← Back to start", use_container_width=True):
            st.session_state.screen = 'input'
            st.rerun()


# ── ROUTER ─────────────────────────────────────────────────────────

if st.session_state.screen == 'input':
    show_input_screen()
elif st.session_state.screen == 'result':
    show_result_screen()
elif st.session_state.screen == 'decision':
    show_decision_screen()
