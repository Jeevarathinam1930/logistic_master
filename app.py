import streamlit as st
import os
import re
from openai import OpenAI
from dotenv import load_dotenv
from rag_retrieval import KnowledgeBase

load_dotenv()

st.set_page_config(
    page_title="Founder Second Brain",
    page_icon="🧠",
    layout="wide"
)

KB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "knowledge_base_v1.txt")


@st.cache_resource
def load_kb():
    return KnowledgeBase(KB_PATH)


kb = load_kb()


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
    # client = OpenAI(
    #     api_key=os.environ.get("DEEPSEEK_API_KEY"),
    #     base_url="https://api.deepseek.com"
    # )
    # response = client.chat.completions.create(
    #     model="deepseek-v4-flash",
    #     messages=[
    #         {"role": "system", "content": system_prompt},
    #         {"role": "user", "content": user_prompt}
    #     ],
    #     max_tokens=2000,
    #     temperature=1.0,
    #     stream=False
    # )
    # return response.choices[0].message.content


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


TYPE_MAP = {
    'student': 'student',
    'working professional': 'professional',
    'developer': 'developer',
    'other': 'student'
}

TIMELINE_MAP = {
    '4 weeks': '4 weeks',
    '6 weeks': '6 weeks',
    '3 months': '3 months',
    '6 months': '6 months',
    '12 months': '12 months'
}


def show_input_screen():
    st.title("🧠 Founder Second Brain")
    st.subheader("Turn your logistics startup idea into a structured execution plan")
    st.markdown("---")

    with st.form("founder_form"):
        idea = st.text_area(
            "Describe your startup idea (2-3 sentences)",
            value=st.session_state.revised_idea if st.session_state.revised_idea else "",
            placeholder="e.g. I want to build an app that connects small businesses with local truck owners for same-day deliveries...",
            height=100
        )

        col1, col2 = st.columns(2)
        with col1:
            founder_type = st.selectbox(
                "Your background",
                options=['student', 'working professional', 'developer', 'other'],
                index=0
            )
            budget = st.text_input(
                "Available budget (e.g. ₹50,000 or $8,000)",
                placeholder="$5,000"
            )
        with col2:
            target_customer = st.text_input(
                "Target customer (be specific — not just 'businesses')",
                placeholder="e.g. Independent pharmacies in Bangalore with 50-200 daily deliveries"
            )
            timeline = st.selectbox(
                "Timeline",
                options=['4 weeks', '6 weeks', '3 months', '6 months', '12 months'],
                index=2
            )

        challenge = st.text_area(
            "What is your biggest challenge or uncertainty right now?",
            placeholder="e.g. I don't know if truck owners will join the platform without guaranteed orders...",
            height=80
        )

        submitted = st.form_submit_button("Analyze My Idea →", type="primary", use_container_width=True)

        if submitted:
            if not idea.strip():
                st.error("Please describe your startup idea.")
                return
            if not target_customer.strip():
                st.error("Please specify your target customer.")
                return
            if not budget.strip():
                st.error("Please enter your available budget.")
                return
            if not challenge.strip():
                st.error("Please describe your biggest challenge.")
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


def show_result_screen():
    st.title("🧠 Founder Second Brain")
    st.markdown("---")

    fd = st.session_state.form_data
    query_text = f"{fd['idea']} {fd['challenge']}"

    with st.spinner("Analyzing your idea against 280 startup patterns..."):
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

    with st.spinner("Running AI reasoning..."):
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
Pattern 1: {patterns[0]['name']}
Source: {patterns[0]['source']}
Insight: {patterns[0]['insight']}

Pattern 2: {patterns[1]['name']}
Source: {patterns[1]['source']}
Insight: {patterns[1]['insight']}

Pattern 3: {patterns[2]['name']}
Source: {patterns[2]['source']}
Insight: {patterns[2]['insight']}

Based on these patterns and this founder's specific situation, provide:

1. CLARIFIED IDEA
   Restate the idea in precise terms. Remove vague language. Name the specific market segment.

2. THREE HIDDEN ASSUMPTIONS
   What has this founder not questioned yet?
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
        except Exception as e:
            st.error(f"API call failed. Check your DEEPSEEK_API_KEY and internet connection.")
            st.caption(f"Details: {e}")
            if st.button("← Back to input"):
                st.session_state.screen = 'input'
                st.rerun()
            return

    st.markdown("### Patterns Retrieved")
    cols = st.columns(3)
    for i, p in enumerate(patterns):
        with cols[i]:
            st.markdown(f"**Pattern {i+1}:** {p['name']}")
            st.caption(f"Score: {p['score']}")
            st.markdown(f"*{p['insight'][:120]}...*")
    st.markdown("---")

    st.markdown("### AI Analysis")
    st.markdown(st.session_state.ai_raw)
    st.markdown("---")

    st.warning(
        f"⚠ This analysis is based on {st.session_state.top_score} pattern matches "
        f"from 280 startup cases. Moderate confidence — validate assumption #1 "
        f"before investing time or money."
    )

    st.markdown("### Your Decision — The AI stops here")
    st.markdown("This analysis is a decision **input**, not a decision. You must now choose:")

    col1, col2, col3 = st.columns(3)
    with col1:
        if st.button("✅ PROCEED", use_container_width=True):
            st.session_state.screen = 'decision'
            st.session_state.decision = 'proceed'
            st.rerun()
    with col2:
        if st.button("🔄 PIVOT", use_container_width=True):
            st.session_state.screen = 'decision'
            st.session_state.decision = 'pivot'
            st.rerun()
    with col3:
        if st.button("⏸ PAUSE", use_container_width=True):
            st.session_state.screen = 'decision'
            st.session_state.decision = 'pause'
            st.rerun()


def show_decision_screen():
    st.title("🧠 Founder Second Brain")
    st.markdown("---")

    decision = st.session_state.get('decision', 'pause')

    if decision == 'proceed':
        st.success("""
**Good. Before you proceed, confirm:**
- ☐ I will validate assumption #1 with a real person this week
- ☐ My budget covers the first 30-day milestone
- ☐ I understand the top risk identified above
        """)

        plan_text = f"""FOUNDER SECOND BRAIN — ANALYSIS OUTPUT
==================================
Idea: {st.session_state.form_data.get('idea', 'N/A')}
Background: {st.session_state.form_data.get('founder_type', 'N/A')}
Target Customer: {st.session_state.form_data.get('target_customer', 'N/A')}
Budget: {st.session_state.form_data.get('budget', 'N/A')}
Timeline: {st.session_state.form_data.get('timeline', 'N/A')}
Challenge: {st.session_state.form_data.get('challenge', 'N/A')}

Top Pattern Match Score: {st.session_state.top_score}

Patterns Used:
1. {st.session_state.patterns[0]['name'] if st.session_state.patterns else 'N/A'}
2. {st.session_state.patterns[1]['name'] if st.session_state.patterns and len(st.session_state.patterns) > 1 else 'N/A'}
3. {st.session_state.patterns[2]['name'] if st.session_state.patterns and len(st.session_state.patterns) > 2 else 'N/A'}

AI Analysis:
{st.session_state.ai_raw}
==================================
Generated by Founder Second Brain
        """

        st.download_button(
            label="📄 Download your plan as PDF",
            data=plan_text,
            file_name="founder_plan.txt",
            mime="text/plain",
            use_container_width=True
        )

        if st.button("← Back to start", use_container_width=True):
            st.session_state.screen = 'input'
            st.rerun()

    elif decision == 'pivot':
        st.warning("**Smart move. What will you change?**")

        revised = st.text_area(
            "Revised idea",
            value=st.session_state.form_data.get('idea', ''),
            height=150
        )

        if st.button("Reanalyze →", type="primary", use_container_width=True):
            st.session_state.revised_idea = revised
            st.session_state.screen = 'input'
            st.rerun()

    elif decision == 'pause':
        st.info("**Noted. The analysis is saved. Come back when you are ready to continue.**")

        if st.button("← Back to start", use_container_width=True):
            st.session_state.screen = 'input'
            st.rerun()


if st.session_state.screen == 'input':
    show_input_screen()
elif st.session_state.screen == 'result':
    show_result_screen()
elif st.session_state.screen == 'decision':
    show_decision_screen()
