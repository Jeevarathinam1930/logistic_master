import os
import re
from datetime import datetime
from openai import OpenAI

# ─── Paths ─────────────────────────────────────────────────────────
_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.dirname(_BACKEND_DIR)
KB_PATH = os.environ.get("KB_PATH", os.path.join(_PROJECT_ROOT, "knowledge_base_v1.txt"))

# ─── Domain Keywords ───────────────────────────────────────────────
LOGISTICS_KEYWORDS = [
    'truck', 'trucking', 'freight', 'shipment', 'shipping', 'carrier', 'shipper',
    'logistics', 'supply chain', 'warehouse', 'warehousing', 'inventory',
    'delivery', 'last.mile', 'fleet', 'route', 'routing', 'driver', 'dispatch',
    'transportation', 'transport', '3pl', 'brokerage', 'fulfillment', 'cargo',
    'container', 'port', 'ocean', 'rail', 'cold chain', 'pallet', 'distribution',
    'reverse logistics', 'dock', 'parcel', 'courier', 'express',
    'modal', 'intermodal', 'detention', 'demurrage',
    'wms', 'tms', 'yms', 'erp', 'saas', 'api',
    'digital freight', 'load board', 'load matching', 'capacity',
    'spot rate', 'contract rate', 'ltl', 'ftl', 'drayage',
    'tracking', 'visibility', 'execution', 'data quality',
    'forecast', 'forecasting', 'demand planning', 'safety stock',
    'bullwhip', 'distortion', 'turnover', 'retention',
    'automation', 'robotics', 'asrs', 'conveyor', 'sorter',
    'picking', 'packing', 'putaway', 'slotting', 'goods-to-person',
    'dark warehouse', 'eld', 'telematics', 'gps', 'dashcam',
    'fuel', 'maintenance', 'convoy', 'flexport', 'shipbob', 'motive',
    'marketplace', 'platform', 'two-sided', 'network effect',
    'unit economics', 'margin', 'operating ratio', 'cac', 'ltv',
    'forwarding', 'freight forwarding', 'compliance', 'regulatory',
    'e.commerce', 'ecommerce', 'b2b',
    'consolidation', 'hub-and-spoke', 'asset.light', 'asset.heavy',
    'map', 'google maps', 'navigation', 'traffic', 'optimization',
    'dispatch', 'allocation', 'scheduling', 'time slot',
    'cross.dock', 'linehaul', 'backhaul', 'deadhead',
    'last mile', 'first mile', 'middle mile',
    'dot', 'fmcsa', 'faa', 'customs', 'border',
    'tariff', 'geopolitical', 'trade',
    'temperature', 'cold chain', 'pharma', 'food',
    'consolidation', 'groupage', 'roll.up',
    'owner.operator', 'subsidy', 'burn rate',
    'chicken.and.egg', 'liquidity', 'density',
]

STOP_WORDS = set("""
a an the is are was were be been being have has had do does did will would
could should may might shall can need dare ought used to of in for on with at
by from as into through during before after above below between out off over
under again further then once here there when where why how all each every
both few more most other some such no nor not only own same so than too very
just because but and or if while that this these those it its they them their
what which who whom about up down your you we he she i me my our us his her
itself himself herself myself yourself ourselves themselves also well even
still already yet however although though whether rather than build building
makes make made doing done take takes took taken get gets got gotten set sets
setting put puts putting use uses using used need needs needed see sees saw
seen know knows knew known think thinks thought want wants wanted say says
said way ways new many much one two first like just also back after work works
worked working call calls called calling try tries tried trying ask asks asked
asking feel feels felt feeling leave leaves left leaving start starts started
starting help helps helped helping keep keeps kept keeping find finds found
finding give gives gave given tell tells told telling show shows showed shown
mean means meant meaning become became becomes becoming
""".split())

# ─── KnowledgeBase ─────────────────────────────────────────────────

class KnowledgeBase:
    def __init__(self, path):
        self.entries = []
        self._load(path)

    def _load(self, path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        content = content.replace('\r\n', '\n')
        raw_blocks = re.split(r'\n---\n', content)
        for block in raw_blocks:
            entry = self._parse_block(block.strip())
            if entry and entry.get('PATTERN_NAME'):
                name = entry.get('PATTERN_NAME', '')
                if not name.startswith('FOUNDER_PROFILE'):
                    self.entries.append(entry)
        print(f"  KB loaded: {len(self.entries)} entries")

    def _parse_block(self, block):
        if not block or len(block) < 20:
            return None
        entry = {}
        field_names = [
            'CATEGORY', 'SOURCE', 'PATTERN_NAME', 'CONTEXT', 'INSIGHT',
            'WARNING_SIGN', 'RESOLUTION', 'LOGISTICS_SEGMENT',
            'APPLIES_TO_FOUNDER_TYPE', 'FRAMEWORK_TYPE', 'STEPS',
            'DECISION_POINT', 'FAILS_WHEN'
        ]
        escaped = [re.escape(f) for f in field_names]
        pattern = r'^(?:\*\*)?(' + '|'.join(escaped) + r')(?:\*\*)?\s*:\s*'
        matches = list(re.finditer(pattern, block, re.MULTILINE))
        if not matches:
            return None
        for i, m in enumerate(matches):
            fname = m.group(1)
            start = m.end()
            end = matches[i+1].start() if i + 1 < len(matches) else len(block)
            value = block[start:end].strip()
            entry[fname] = value
        name = entry.get('PATTERN_NAME', '')
        if not name or name.startswith('FOUNDER_PROFILE'):
            return None
        return entry

    def _extract_keywords(self, text):
        words = re.findall(r'[a-zA-Z][a-zA-Z0-9\-.]{1,}', text.lower())
        return {w for w in words if w not in STOP_WORDS and len(w) > 1}

    def _count_domain_keywords(self, entry):
        text = (
            entry.get('CONTEXT', '') + ' ' +
            entry.get('INSIGHT', '') + ' ' +
            entry.get('PATTERN_NAME', '')
        ).lower()
        count = 0
        for kw in LOGISTICS_KEYWORDS:
            pat = kw.replace('.', r'[\s.]')
            if re.search(pat, text):
                count += 1
        return count

    def score_entry(self, entry, founder_input):
        score = 0
        name = entry.get('PATTERN_NAME', '')
        name_lower = name.lower()
        context = entry.get('CONTEXT', '')
        insight = entry.get('INSIGHT', '')
        applies_to = entry.get('APPLIES_TO_FOUNDER_TYPE', '')
        fw_type = entry.get('FRAMEWORK_TYPE', '')
        desc = founder_input.get('idea_description', '')
        founder_type = founder_input.get('founder_type', '')
        budget = founder_input.get('budget', '')

        if '[LOGISTICS_RELEVANT]' in name:
            score += 2
        if '[FOUNDER_ERROR]' in name:
            score += 1

        type_map = {'student': 'student', 'professional': 'professional', 'developer': 'techie'}
        mapped_type = type_map.get(founder_type, '')
        if applies_to and (applies_to == 'all' or applies_to == mapped_type):
            score += 2

        desc_keywords = self._extract_keywords(desc)
        search_text = (context + ' ' + insight).lower()
        kw_matches = {kw for kw in desc_keywords if re.search(r'\b' + re.escape(kw) + r'\b', search_text)}
        kw_score = min(len(kw_matches), 5)
        score += kw_score

        raw_words = re.findall(r'[a-zA-Z][a-zA-Z0-9\-.]{1,}', desc.lower())
        raw_words = [w for w in raw_words if w not in STOP_WORDS and len(w) > 1]
        bigrams = [f'{raw_words[i]} {raw_words[i+1]}' for i in range(len(raw_words)-1)]
        bigram_score = 0
        for bg in bigrams:
            if re.search(r'\b' + re.escape(bg) + r'\b', search_text):
                bigram_score += 3
                if bigram_score >= 6:
                    break
        score += bigram_score

        name_match_count = sum(1 for kw in desc_keywords if re.search(r'\b' + re.escape(kw) + r'\b', name_lower))
        if name_match_count >= 2:
            score += 4
        elif name_match_count >= 1:
            score += 2

        domain_matches = min(self._count_domain_keywords(entry), 3)
        score += domain_matches

        if fw_type == 'Validation':
            score += 1

        is_low_budget = False
        try:
            if 'USD' in budget and float(budget.replace('USD', '').strip()) < 20000:
                is_low_budget = True
            elif 'INR' in budget:
                is_low_budget = True
        except:
            pass
        if is_low_budget:
            boot_keywords = ['outside money', 'plan z', 'you need less', 'launch now',
                             'bootstrap', 'lean', 'mvp', 'cheap', 'minimum', 'zero-budget']
            for bk in boot_keywords:
                pat = r'\b' + re.escape(bk) + r'\b'
                if re.search(pat, name_lower) or re.search(pat, context.lower()[:200]):
                    score += 1
                    break

        return score

    def retrieve(self, founder_input, top_n=3):
        scored = [(self.score_entry(e, founder_input), e) for e in self.entries]
        scored = [s for s in scored if s[0] > 0]
        scored.sort(key=lambda x: x[0], reverse=True)
        results = scored[:top_n]
        output = []
        for score, entry in results:
            insight = entry.get('INSIGHT', '')
            sentences = re.split(r'(?<=[.!?])\s+', insight)
            first_two = ' '.join(sentences[:2]) if len(sentences) >= 2 else insight
            output.append({
                'name': entry.get('PATTERN_NAME', ''),
                'source': entry.get('SOURCE', 'Unknown'),
                'insight': first_two,
                'score': score
            })
        return output

    def get_all_entries(self):
        result = []
        for i, entry in enumerate(self.entries):
            name = entry.get('PATTERN_NAME', '')
            tags = re.findall(r'\[([^\]]+)\]', name)
            clean_name = re.sub(r'\s*\[[^\]]+\]', '', name).strip()
            category = entry.get('CATEGORY', '')
            if 'FAILURE' in category.upper():
                ptype = 'failure'
            elif 'SUCCESS' in category.upper():
                ptype = 'success'
            else:
                ptype = 'general'
            insight = entry.get('INSIGHT', '')
            summary = '. '.join(insight.split('. ')[:2]) + '.' if insight else ''
            if len(summary) > 200:
                summary = summary[:200] + '...'
            result.append({
                'id': i,
                'name': clean_name,
                'category': category,
                'type': ptype,
                'summary': summary,
                'source': entry.get('SOURCE', 'Unknown'),
                'tags': tags,
                'logistics_segment': entry.get('LOGISTICS_SEGMENT', ''),
                'framework_type': entry.get('FRAMEWORK_TYPE', ''),
                'applies_to': entry.get('APPLIES_TO_FOUNDER_TYPE', ''),
            })
        return result

    def get_entry(self, entry_id):
        if entry_id < 0 or entry_id >= len(self.entries):
            return None
        entry = self.entries[entry_id]
        name = entry.get('PATTERN_NAME', '')
        tags = re.findall(r'\[([^\]]+)\]', name)
        clean_name = re.sub(r'\s*\[[^\]]+\]', '', name).strip()
        category = entry.get('CATEGORY', '')
        if 'FAILURE' in category.upper():
            ptype = 'failure'
        elif 'SUCCESS' in category.upper():
            ptype = 'success'
        else:
            ptype = 'general'
        return {
            'id': entry_id,
            'name': clean_name,
            'category': category,
            'type': ptype,
            'source': entry.get('SOURCE', 'Unknown'),
            'context': entry.get('CONTEXT', ''),
            'insight': entry.get('INSIGHT', ''),
            'warning_sign': entry.get('WARNING_SIGN', ''),
            'resolution': entry.get('RESOLUTION', ''),
            'tags': tags,
            'logistics_segment': entry.get('LOGISTICS_SEGMENT', ''),
            'applies_to': entry.get('APPLIES_TO_FOUNDER_TYPE', ''),
            'framework_type': entry.get('FRAMEWORK_TYPE', ''),
            'steps': entry.get('STEPS', ''),
            'decision_point': entry.get('DECISION_POINT', ''),
            'fails_when': entry.get('FAILS_WHEN', ''),
        }


# ─── Load KB at import time ───────────────────────────────────────
_kb = None

def get_kb():
    global _kb
    if _kb is None:
        _kb = KnowledgeBase(KB_PATH)
    return _kb

# ─── AI Call ───────────────────────────────────────────────────────

def call_ai(system_prompt, user_prompt):
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


# ─── Parse AI Response ─────────────────────────────────────────────

def parse_sections(response):
    sections = {}
    pattern_defs = [
        (r'1\.\s*CLARIFIED IDEA\s*(.*?)(?=2\.\s*THREE HIDDEN ASSUMPTIONS)', 'idea'),
        (r'2\.\s*THREE HIDDEN ASSUMPTIONS\s*(.*?)(?=3\.\s*MATCHED FAILURE RISK)', 'assumptions'),
        (r'3\.\s*MATCHED FAILURE RISK\s*(.*?)(?=4\.\s*REALISTIC MILESTONE PLAN)', 'risk'),
        (r'4\.\s*REALISTIC MILESTONE PLAN\s*(.*?)(?=5\.\s*48)', 'milestones'),
        (r'5\.\s*48[ -]?HOUR FIRST STEP\s*(.*?)$', 'action'),
    ]
    for pat, key in pattern_defs:
        m = re.search(pat, response, re.DOTALL)
        if m:
            sections[key] = m.group(1).strip()
    return sections


# ─── Run Analysis ──────────────────────────────────────────────────

def run_analysis(data):
    kb = get_kb()
    query = f"{data.idea} {data.challenge}"
    
    type_map = {
        'student': 'student',
        'working professional': 'professional',
        'developer': 'developer',
        'other': 'student'
    }
    
    founder_input = {
        'idea_description': query,
        'founder_type': type_map.get(data.background, 'student'),
        'budget': data.budget,
        'timeline': data.timeline,
        'domain': 'logistics'
    }

    patterns = kb.retrieve(founder_input, top_n=3)
    score = patterns[0]['score'] if patterns else 0

    system_prompt = """You are Founder Second Brain, an AI advisor for early-stage logistics startup founders.

You reason like a combination of a seasoned logistics operator, a startup mentor, and a venture capitalist who has seen hundreds of logistics startups fail and succeed.

You have been given 3 relevant patterns from a knowledge base of 280 startup and logistics insights. Use these patterns as your primary reasoning context.

RULES:
- Never give generic advice like "talk to customers". Always make it specific to this founder's situation.
- Always reference the pattern name when you use it.
- If their timeline is unrealistic, say so directly and give a realistic alternative.
- You do NOT make the final go/no-go decision. The founder decides after seeing your analysis.
- Show uncertainty honestly — do not pretend to know things you cannot know."""

    p = patterns
    p1_txt = f"Pattern 1: {p[0]['name']}\nSource: {p[0]['source']}\nInsight: {p[0]['insight']}" if len(p) > 0 else ""
    p2_txt = f"Pattern 2: {p[1]['name']}\nSource: {p[1]['source']}\nInsight: {p[1]['insight']}" if len(p) > 1 else ""
    p3_txt = f"Pattern 3: {p[2]['name']}\nSource: {p[2]['source']}\nInsight: {p[2]['insight']}" if len(p) > 2 else ""

    user_prompt = f"""FOUNDER PROFILE:
Idea: {data.idea}
Background: {data.background}
Target Customer: {data.customer}
Budget: {data.budget}
Timeline: {data.timeline}
Biggest Challenge: {data.challenge}

RETRIEVED PATTERNS FROM KNOWLEDGE BASE:
{p1_txt}

{p2_txt}

{p3_txt}

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

    ai_response = call_ai(system_prompt, user_prompt)
    sections = parse_sections(ai_response)

    return {
        "score": score,
        "patterns": [
            {"name": p[0]['name'], "source": p[0]['source'], "insight": p[0]['insight'], "score": p[0]['score']}
        ] + ([
            {"name": p[1]['name'], "source": p[1]['source'], "insight": p[1]['insight'], "score": p[1]['score']}
        ] if len(p) > 1 else []) + ([
            {"name": p[2]['name'], "source": p[2]['source'], "insight": p[2]['insight'], "score": p[2]['score']}
        ] if len(p) > 2 else []),
        "idea": sections.get('idea', ''),
        "assumptions": sections.get('assumptions', ''),
        "risk": sections.get('risk', ''),
        "milestones": sections.get('milestones', ''),
        "action": sections.get('action', ''),
        "raw": ai_response
    }
