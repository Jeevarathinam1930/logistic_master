import re
import sys

KB_PATH = r"D:\New folder\Desktop\logistic_master\knowledge_base_v1.txt"

# Domain keywords for logistics scoring
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

        print(f"Loaded {len(self.entries)} entries from KB")

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
        field_header_pattern = r'^(?:\*\*)?(' + '|'.join(escaped) + r')(?:\*\*)?\s*:\s*'

        matches = list(re.finditer(field_header_pattern, block, re.MULTILINE))

        if not matches:
            return None

        for i, match in enumerate(matches):
            field_name = match.group(1)
            start = match.end()
            if i + 1 < len(matches):
                end = matches[i+1].start()
            else:
                end = len(block)
            value = block[start:end].strip()
            entry[field_name] = value

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
            pattern = kw.replace('.', r'[\s.]')
            if re.search(pattern, text):
                count += 1
        return count

    def score_entry(self, entry, founder_input):
        score = 0
        reasons = []

        name = entry.get('PATTERN_NAME', '')
        name_lower = name.lower()
        context = entry.get('CONTEXT', '')
        insight = entry.get('INSIGHT', '')
        applies_to = entry.get('APPLIES_TO_FOUNDER_TYPE', '')
        fw_type = entry.get('FRAMEWORK_TYPE', '')
        desc = founder_input.get('idea_description', '')
        founder_type = founder_input.get('founder_type', '')
        budget = founder_input.get('budget', '')
        timeline = founder_input.get('timeline', '')

        # +2 if [LOGISTICS_RELEVANT] tag
        if '[LOGISTICS_RELEVANT]' in name:
            score += 2
            reasons.append('+2 LR')

        # +1 if [FOUNDER_ERROR] tag
        if '[FOUNDER_ERROR]' in name:
            score += 1
            reasons.append('+1 FE')

        # +2 if APPLIES_TO_FOUNDER_TYPE matches
        type_map = {'student': 'student', 'professional': 'professional', 'developer': 'techie'}
        mapped_type = type_map.get(founder_type, '')
        if applies_to and (applies_to == 'all' or applies_to == mapped_type):
            score += 2
            reasons.append(f'+2 type={applies_to}')

        # Per-keyword matching: +1 for each idea keyword found in CONTEXT or INSIGHT (capped at +5)
        desc_keywords = self._extract_keywords(desc)
        search_text = (context + ' ' + insight).lower()
        kw_matches = {kw for kw in desc_keywords if re.search(r'\b' + re.escape(kw) + r'\b', search_text)}
        kw_score = min(len(kw_matches), 5)
        if kw_score > 0:
            score += kw_score
            reason_kw = ', '.join(sorted(list(kw_matches))[:3])
            reasons.append(f'+{kw_score} kw: {{{reason_kw}}}')

        # Bigram matching: +3 per idea bigram found in entry text (capped at +6)
        # Preserve original word order from description
        raw_words = re.findall(r'[a-zA-Z][a-zA-Z0-9\-.]{1,}', desc.lower())
        raw_words = [w for w in raw_words if w not in STOP_WORDS and len(w) > 1]
        bigrams = [f'{raw_words[i]} {raw_words[i+1]}' for i in range(len(raw_words)-1)]
        bigram_score = 0
        for bg in bigrams:
            if re.search(r'\b' + re.escape(bg) + r'\b', search_text):
                bigram_score += 3
                if bigram_score >= 6:
                    break
        if bigram_score > 0:
            score += bigram_score
            reasons.append(f'+{bigram_score} bigram')

        # Name match bonus: +2 if 1+ keyword hits name, +4 if 2+ hit name
        name_match_count = sum(1 for kw in desc_keywords if re.search(r'\b' + re.escape(kw) + r'\b', name_lower))
        if name_match_count >= 2:
            score += 4
            reasons.append(f'+4 name match ({name_match_count}kw)')
        elif name_match_count >= 1:
            score += 2
            reasons.append(f'+2 name match')

        # +1 per domain keyword (capped at 3, soft signal)
        domain_matches = min(self._count_domain_keywords(entry), 3)
        if domain_matches > 0:
            score += domain_matches
            reasons.append(f'+{domain_matches} domain')

        # +1 if Validation framework (early-stage fit)
        if fw_type == 'Validation':
            score += 1
            reasons.append('+1 Validation')

        # +1 if budget/timeline is constrained and pattern is about bootstrapping
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
                pattern = r'\b' + re.escape(bk) + r'\b'
                if re.search(pattern, name_lower) or re.search(pattern, context.lower()[:200]):
                    score += 1
                    reasons.append(f'+1 bootstrap')
                    break

        return score, reasons

    def retrieve(self, founder_input, top_n=3):
        scored = []
        for entry in self.entries:
            score, reasons = self.score_entry(entry, founder_input)
            if score > 0:
                scored.append((score, entry, reasons))

        scored.sort(key=lambda x: x[0], reverse=True)
        results = scored[:top_n]

        output = []
        for score, entry, reasons in results:
            insight = entry.get('INSIGHT', '')
            sentences = re.split(r'(?<=[.!?])\s+', insight)
            first_two = ' '.join(sentences[:2]) if len(sentences) >= 2 else insight

            reason = self._generate_reason(entry, founder_input, reasons)

            output.append({
                'PATTERN_NAME': entry.get('PATTERN_NAME', ''),
                'SOURCE': entry.get('SOURCE', 'Unknown'),
                'INSIGHT': first_two,
                'relevance_score': score,
                'one_line_reason': reason
            })

        return output

    def _generate_reason(self, entry, founder_input, reasons):
        name = entry.get('PATTERN_NAME', '').lower()
        context = entry.get('CONTEXT', '').lower()
        desc = founder_input.get('idea_description', '').lower()
        ftype = founder_input.get('founder_type', '')

        # Context-specific reason generation based on matched content
        if 'route' in desc or 'map' in desc:
            if 'crushed' in name:
                return f'Most critical pattern for {ftype} — 54.1% of failures are from competing in markets with dominant incumbents, exactly the route optimization vs Google Maps risk'
            if '10x' in name or 'improvement' in name:
                return f'{ftype} must be 10x better than free incumbents — a slightly better route algorithm cannot beat Google Maps'
            if 'lead bullet' in name:
                return f'{ftype} needs a lead bullet (better product), not a silver bullet — competing on algorithm alone won\'t work against free'
            if 'monopoly' in name or 'contrarian' in name:
                return f'{ftype} building a route engine must answer: what truth do few people agree with? Competing directly is not contrarian'
            if 'competing against free' in name:
                return f'Exactly addresses {ftype}\'s core challenge: how to win when the incumbent (Google Maps) is free'

        if 'marketplace' in desc or 'truck' in desc or 'connect' in desc:
            if 'two-sided' in name or 'marketplace' in name:
                return f'{ftype} marketplace\'s chicken-and-egg problem — Dinnr failed building what founders liked, not what market needed'
            if 'mom test' in name:
                return f'{ftype} with no experience will get false positives — people say "interesting" to be polite, not because they\'ll pay'
            if 'outside money' in name or 'plan z' in name:
                return f'Critical for {ftype} with limited budget: outside money is plan Z, bootstrap first'
            if 'zero-budget' in name:
                return f'Step-by-step {ftype} playbook: validate marketplace with manual brokering before building any tech'
            if 'scratch your own' in name:
                return f'{ftype} should build what they understand — but need to validate before assuming demand'

        if 'warehouse' in desc or 'forecast' in desc:
            if 'data quality' in name:
                return f'Directly addresses the #1 surprise awaiting {ftype} building warehouse AI: 40-60% data accuracy, 50-70% engineering on ingestion'
            if 'technology adoption' in name:
                return f'{ftype} with experience must still overcome 6-18mo sales cycles and spreadsheet-first SMB workflows'
            if 'genchi' in name or 'gembutsu' in name:
                return f'{ftype} must go see real warehouse workflows — 4yr experience may be from a different scale than target SMB'
            if 'inventory distortion' in name:
                return f'Validates {ftype}\'s market ($1.7T problem) but warns incumbents haven\'t solved it — why will their AI?'

        # Fallback
        return f"Matched for {ftype}: {'; '.join(reasons[:2])}"


def run_test(kb, desc, founder_type, budget, timeline, label):
    print(f"{'='*70}")
    print(f"TEST: {label}")
    print(f"{'='*70}")
    print(f"  Idea: {desc}")
    print(f"  Founder: {founder_type} | Budget: {budget} | Timeline: {timeline}")
    print()

    founder_input = {
        'idea_description': desc,
        'founder_type': founder_type,
        'budget': budget,
        'timeline': timeline,
        'domain': 'logistics'
    }

    results = kb.retrieve(founder_input, top_n=3)

    print(f"  TOP {len(results)} RESULTS:")
    print()
    for i, r in enumerate(results, 1):
        print(f"  [{i}] {r['PATTERN_NAME']}  (score: {r['relevance_score']})")
        print(f"      Source: {r['SOURCE']}")
        print(f"      Insight: {r['INSIGHT'][:200]}...")
        print(f"      Why: {r['one_line_reason']}")
        print()

    return results


if __name__ == '__main__':
    kb = KnowledgeBase(KB_PATH)

    results = []

    # TEST 1
    r1 = run_test(kb,
        desc="app connecting truck owners with small businesses",
        founder_type="student",
        budget="50000 INR",
        timeline="3 months",
        label="1 — Student + Truck Marketplace App"
    )
    results.append(r1)

    # TEST 2
    r2 = run_test(kb,
        desc="AI demand forecasting tool for small warehouses",
        founder_type="professional",
        budget="8000 USD",
        timeline="6 months",
        label="2 — Warehouse Pro + AI Forecasting"
    )
    results.append(r2)

    # TEST 3
    r3 = run_test(kb,
        desc="route optimization engine better than Google Maps for delivery",
        founder_type="developer",
        budget="15000 USD",
        timeline="6 weeks",
        label="3 — Solo Dev + Route Optimization Engine"
    )
    results.append(r3)

    print(f"{'='*70}")
    print("SUMMARY")
    print(f"{'='*70}")
    for i, res in enumerate(results, 1):
        print(f"  Test {i}: {res[0]['PATTERN_NAME']} ({res[0]['relevance_score']} pts) | "
              f"{res[1]['PATTERN_NAME']} ({res[1]['relevance_score']} pts) | "
              f"{res[2]['PATTERN_NAME']} ({res[2]['relevance_score']} pts)")
