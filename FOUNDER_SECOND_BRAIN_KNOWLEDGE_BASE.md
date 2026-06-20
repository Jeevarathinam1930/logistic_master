# Founder Second Brain — Ground Truth Knowledge Base

## Meta
- **Project**: USAII Global AI Hackathon 2026
- **Purpose**: Ground truth context for AI reasoning system supporting early-stage logistics startup founders
- **User Persona**: Early-stage logistics startup founder with a vague idea who needs structured execution planning
- **Total Entries**: 20 FAILURE_PATTERNS + 10 FOUNDER_PROFILES + ~130 DECISION_FRAMEWORKS (11 books) + 58 LOGISTICS_DOMAIN_KNOWLEDGE entries = 218 total

## AI Risk Mitigation & Human-in-the-Loop Definition

This knowledge base constrains AI hallucinations by grounding every insight, warning sign, and resolution in extracted source data from four distinct categories, each cross-referenced to original files. The AI must cite specific pattern/framework/domain names when generating recommendations and trace all suggestions to entries in this KB. When no direct answer exists, the AI must state so rather than inventing content.

Human judgment is required in three areas: (1) evaluating whether a founder's specific context matches the conditions described in a pattern (e.g., does "The Hallucination" apply when genuine pre-orders exist?); (2) adapting generic frameworks to the founder's unique market geography, regulatory environment, and competitive landscape; (3) making final pivot-or-persevere decisions — only the human can assess personal risk tolerance, team morale, and stakeholder dynamics that no KB can capture.

## Category 1: FAILURE_PATTERNS (20 patterns)

### The Hallucination (SULF) — Interprets polite interviews as validation; 11.6% of failures ($14.2B). Warning: eternal pilots, nobody pays. Fix: Sean Ellis 40% rule.

### The Bonfire (SULF) — Burns $281.2B across 182 startups by confusing capital with PMF. Warning: knows burn rate but not revenue. Fix: be default alive.

### The Crushed (SULF) [LOGISTICS] — 54.1% of all failures (880 startups, $36.1B). Competition makes your advantages illusory. Warning: reactive roadmap, rising CAC. Fix: build structural defensibility — measure by how hard you are to replicate.

### The Math Problem (SULF) [LOGISTICS] — 233 startups, $99.7B. Every transaction loses money, scale never fixes it. Warning: multiple versions of unit economics. Fix: run the candle test — would you survive without funding?

### Premature Scaling (SULF/Startup Genome) [LOGISTICS] — Most common underperformance cause. Consistent startups raise 3x more. Warning: hiring for 10x current scale. Fix: complete Discovery → Validation → Efficiency → Scale in order.

### Two-Sided Marketplace Failure (Dinnr) [LOGISTICS] — Built what founders liked, not what market needed. £60K, 2 years. Warning: team builds from personal preference. Fix: validate that customers find current behavior painful enough to change.

### Technology-Before-Validation (Berg) — Little Printer IoT device, $1.3M over 9 years. Warning: enthusiasts who can't form a business. Fix: validate willingness to pay before manufacturing.

### Wrong Customer Assumption Failure (Aria Insights) [LOGISTICS] — Pivoted from drones to AI based on partner demand, not market. $39M, 11 years. Warning: pivot justified by few partners. Fix: distinguish partner needs from market demand.

### No Market Need / PMF Failure (CB Insights) — 43% of failures, $17.5B destroyed. Warning: Mosaic score declining, partnerships dropping 44%. Fix: milestone-based assessment with retention metrics.

### Unsustainable Unit Economics (CB Insights/Convoy) [LOGISTICS] — 19% of failures. Convoy: $1B raised, $4B valuation, zero profitability. Warning: top-line grows, runway shrinks faster. Fix: unit-level profitability before growth.

### The Lemon / Technology Failure (SULF) [LOGISTICS] — 3.4% of failures ($13B). Demo breaks at scale. Warning: engineers propose architecture rewrites. Fix: test hardest edge cases first, set kill criteria.

### The Civil War (SULF) — 1% of failures ($2.2B). Co-founders diverge as stakes rise. Warning: same argument quarterly, employees confused. Fix: clear decision-making and equity structures before money arrives.

### The Outlaw / Regulatory Failure (SULF) [LOGISTICS] — 69 startups, $55.2B, 7-year median lifespan. Warning: "regulatory arbitrage" in pitch deck. Fix: design for compliance from day one.

### The Hallucination Spiral Cascade (SULF) [LOGISTICS] — Hallucination → Math Problem → Bonfire. 189 + 233 + 182 = $395B total burn chain. Warning: CAC rising, layoffs, raising on promise not reality. Fix: cut all paid acquisition — if no organic demand exists, no spending will create it.

### Walking Dead Capital Trap (CB Insights) — 22-month median from last fundraise to death. 50K startups haven't raised since 2023. Warning: 18+ months since last raise. Fix: track default alive status from day one.

### Skipping Discovery Stage (Startup Genome) — Discovery takes 5-7 months; founders think it takes 1. Warning: product built but no validation. Fix: problem-solution fit through existing-behavior interviews.

### Trust and Adoption Barriers in Food Logistics (Dinnr) [LOGISTICS] — Competing with ingrained habits, not just stores. Warning: interest without behavior change. Fix: test willingness to pay with pre-orders before building infrastructure.

### Founder Departure Leading to Strategic Drift (Aria Insights) — Founder leaves, new leadership pivots without validation. $39M, 11 years. Warning: strategic shift within 12 months of departure. Fix: ensure founder overlap for knowledge transfer.

### The Siege Cascade (SULF) [LOGISTICS] — 880 deaths from competition-induced race to bottom. Warning: dropping prices, compressing margins. Fix: if incumbent bundled your feature at zero cost tomorrow, would you still exist?

### Market Timing Failure (CB Insights) [LOGISTICS] — Convoy: pandemic boom to 2023 shutdown. Warning: hype without adoption. Fix: distinguish genuine trends from funding trends.

### Top 3 Most Critical for Logistics Founders

**The Math Problem**: Logistics is thin-margin and capital-intensive. Per-transaction profitability must work at the unit level before scale. Convoy's collapse ($1B raised, zero profitability) is the cautionary tale.

**The Crushed**: Logistics is dominated by incumbents (FedEx, Amazon, DHL, XPO) with massive distribution advantages. Differentiation must be structural, not a feature gap incumbents can bundle at zero marginal cost.

**The Hallucination Spiral**: The cascade is deadliest for logistics because capital-intensive models burn cash faster than SaaS, and the time between building infrastructure and discovering no market need is measured in years and millions.

## Category 2: SUCCESS_PATTERNS + FOUNDER_PROFILES (10 profiles)

### Elon Musk
- **Domain**: Space (SpaceX), Automotive (Tesla), Payments (PayPal), AI (xAI)
- **Key Mistake**: Almost killed SpaceX by acting as chief engineer without aerospace experience — three consecutive Falcon 1 launch failures.
- **Recovery**: Fourth launch succeeded on final attempt; NASA contract and Tesla financing closed on Christmas Eve 2008.
- **Logistics Relevance**: MEDIUM
- **Most Reusable Lesson**: First principles reasoning — decompose problems to fundamental physics and rebuild from zero.

### Jeff Bezos
- **Domain**: E-Commerce (Amazon), Space (Blue Origin)
- **Key Mistake**: Believed Amazon could operate without physical inventory; forced to build millions of sq ft of distribution centers.
- **Recovery**: Lowered prices during dot-com crash while competitors raised them. Built 4M sq ft of distribution centers, recognizing logistics as a competitive moat.
- **Logistics Relevance**: HIGH
- **Most Reusable Lesson**: Customer obsession over competitor obsession — define mission around an unchanging customer need. Logistics is a moat, not a cost center.

### Brian Chesky
- **Domain**: Hospitality Marketplace (Airbnb)
- **Key Mistake**: COVID-19 halted global travel overnight, losing 80% of business.
- **Recovery**: Reinvented platform around local travel and long stays. Made empathetic layoffs. Culminated in historic IPO.
- **Logistics Relevance**: HIGH
- **Most Reusable Lesson**: Do things that don't scale — personally perform every role before automating. Hand-serve first users to build foundation for scale.

### Binny Bansal
- **Domain**: E-Commerce (Flipkart)
- **Key Mistake**: Underestimated logistical complexity of Indian delivery and consumer skepticism toward online transactions.
- **Recovery**: Introduced cash-on-delivery, built own delivery network, focused on reliability as core value proposition.
- **Logistics Relevance**: HIGH
- **Most Reusable Lesson**: In low-trust markets, the logistical moat IS the business moat. Hard operational work creates advantages later entrants cannot replicate.

### Reid Hoffman
- **Domain**: Professional Networking (LinkedIn), Venture Capital (Greylock)
- **Key Mistake**: Assumed people would automatically update profiles — wrong about bounded rationality.
- **Recovery**: LinkedIn persisted until the market caught up, creating a professional zone distinct from personal social networks.
- **Logistics Relevance**: MEDIUM
- **Most Reusable Lesson**: Give before you take — build relationships by sharing value before asking for anything.

### Mark Zuckerberg
- **Domain**: Social Media (Meta/Facebook), VR, AI
- **Key Mistake**: Social Dilemma narrative and Instagram whistleblower revelations about youth mental health impact.
- **Recovery**: Pivoted toward Metaverse and AI, invested billions in long-term infrastructure, open-source Llama strategy.
- **Logistics Relevance**: LOW
- **Most Reusable Lesson**: The long view — define 10-year vision and use it as a filter for every decision.

### Bill Gates
- **Domain**: Software (Microsoft), Global Health, Energy (TerraPower)
- **Key Mistake**: Underestimated the internet's transformative potential, allowing Netscape early dominance.
- **Recovery**: Internet Tidal Wave memo redirected Microsoft's entire strategy. Applied learning mentality to global health.
- **Logistics Relevance**: LOW
- **Most Reusable Lesson**: The Four Footnotes Risk Framework — explicitly list the few risks that could invalidate everything.

### Larry Page & Sergey Brin
- **Domain**: Internet Search, Advertising, AI, Autonomous Vehicles (Google/Alphabet)
- **Key Mistake**: Almost lost search war by prioritizing academic purity; initially resisted advertising.
- **Recovery**: Won by prioritizing win/win for users and information providers; built innovation culture across YouTube, Android, Waymo.
- **Logistics Relevance**: LOW
- **Most Reusable Lesson**: Moonshot thinking — the biggest companies solve problems others consider impossible.

### Mukesh Ambani
- **Domain**: Telecommunications (Jio), Energy (Reliance), Financial Services (JioBlackRock)
- **Key Mistake**: Risk that Jio's massive 4G capex would fail to achieve needed adoption.
- **Recovery**: Made data affordable as a basic utility; leveraged Jio's reach into financial services through JioBlackRock.
- **Logistics Relevance**: MEDIUM
- **Most Reusable Lesson**: Infrastructure as a platform — design for multiple revenue streams from day one.

### Gautam Adani
- **Domain**: Infrastructure, Energy, Ports, Logistics (Adani Group)
- **Key Mistake**: Hindenburg short-seller attack (2023) wiped out $150B in market value.
- **Recovery**: Stabilized through operational continuity, leveraging physical assets, rebuilding confidence through transparency.
- **Logistics Relevance**: HIGH
- **Most Reusable Lesson**: Physical assets and operational cash flows provide a foundation that pure financial traders cannot replicate.

### Top 5 Reusable Lessons for Logistics Founders

**Do Things That Don't Scale** (Chesky): Before automating logistics, personally be the driver, picker, and support agent. Understand pain points firsthand before building systems.

**Customer Obsession** (Bezos): Build logistics strategy around what customers value most (speed, reliability, price, selection). Customer needs are stable; competitors change constantly.

**Build Trust as Operational Infrastructure** (Bansal): In underdeveloped markets, your own delivery/payment/returns network creates advantages that later entrants cannot replicate.

**First Principles Reasoning** (Musk): Decompose logistics problems to fundamental physics and economics. Most inefficiency is hidden not by complexity but because nobody connected the data systems.

**Principle Decisions Over Business Decisions** (Chesky): When short-term interests conflict with long-term values, default to principle. Transparent communication builds trust that carries through crises.

## Category 3: DECISION_FRAMEWORKS (organized by FRAMEWORK_TYPE)

### Validation Frameworks
- **Build-Measure-Learn Loop** (The Lean Startup) — Minimize time from idea to learning; build MVP, measure with actionable metrics, decide pivot or persevere.
- **The Mom Test** (The Mom Test) — Ask about specific past behavior, not opinions; compliments are noise, commitments of time/money are real signals.
- **Leap-of-Faith Assumptions** (The Lean Startup) — Test value hypothesis (does product deliver value?) and growth hypothesis (how will it spread?) before anything else.
- **Genchi Gembutsu** (The Lean Startup) — Go and see for yourself; observe customers in their natural environment instead of managing by dashboards.
- **The Contrarian Question** (Zero to One) — "What important truth do very few people agree with you on?" identifies hidden opportunities.
- **Monopoly vs Competition** (Zero to One) — Don't compete in existing markets; create new markets where you can be the sole player.
- **The Hook Model** (Hooked) — Four-step cycle (Trigger → Action → Variable Reward → Investment) for building habit-forming products.
- **Scratch Your Own Itch** (Rework) — Solve a problem you personally have to eliminate the risk of building something nobody wants.
- **Vitamins vs Painkillers** (Hooked) — Painkillers solve acute urgent problems; vitamins provide long-term benefit without immediate urgency. Painkillers are easier to sell.
- **Product Risk vs Market Risk** (The Mom Test) — Market risk is almost always more dangerous than product risk for early-stage startups.

### MVP Frameworks
- **Minimum Viable Product** (The Lean Startup) — Maximum validated learning with least effort; can be landing pages, concierge services, or Wizard of Oz prototypes.
- **Concierge MVP / Wizard of Oz** (The Lean Startup) — Deliver service manually to test value hypothesis before building automation.
- **Build Half a Product, Not a Half-Assed Product** (Rework) — Identify the 20% of features delivering 80% of value and build those exceptionally well.
- **Launch Now** (Rework) — If you're not embarrassed by your first release, you launched too late.

### Milestone Frameworks
- **Innovation Accounting** (The Lean Startup) — Three learning milestones: establish baseline, tune the engine, pivot or persevere.
- **Three Engines of Growth** (The Lean Startup) — Sticky (retention), Viral (referral), Paid (LTV > CAC); identify and focus on the one that drives your business.
- **Technology Adoption Lifecycle & The Chasm** (Crossing the Chasm) — Five adopter categories; the gap between Early Adopters and Early Majority is the most dangerous transition.
- **Beachhead Strategy (D-Day Analogy)** (Crossing the Chasm) — Dominate a single narrow market segment before expanding; concentrate overwhelming force.
- **The Whole Product Concept** (Crossing the Chasm) — Mainstream customers need the complete solution including services, support, and integration.
- **Blitzscaling** (Blitzscaling) — Prioritize speed over efficiency in winner-take-most markets; first-scaler advantage compounds.
- **OKR (Objectives and Key Results)** (Measure What Matters) — Qualitative objectives paired with measurable key results; quarterly cycle creates alignment and stretch.
- **The Power Law** (Zero to One) — One bet, one market, one channel will be worth more than all others combined — concentrate resources accordingly.
- **Managerial Leverage** (High Output Management) — A manager's output = their organization's output; focus on training, objective-setting, and decision-making.
- **Task-Relevant Maturity (TRM)** (High Output Management) — Adapt management style: directive for low TRM, delegative for high TRM.
- **The Five Stages (Family/Tribe/Village/City/Nation)** (Blitzscaling) — Each organizational stage requires fundamentally different management approaches.
- **Committed vs Aspirational OKRs** (Measure What Matters) — Committed = must achieve 100%; Aspirational = stretch goal, 60-70% achievement expected.
- **Peacetime CEO / Wartime CEO** (The Hard Thing About Hard Things) — Different leadership modes required for stable vs crisis situations.

### Pivot Frameworks
- **Pivot or Persevere** (The Lean Startup) — Regular cadence for reviewing metrics and deciding whether to change direction.
- **Catalog of Pivot Types** (The Lean Startup) — 10 types: Zoom-in, Zoom-out, Customer Segment, Customer Need, Platform, Business Architecture, Value Capture, Engine of Growth, Channel, Technology.
- **Should You Sell Your Company?** (The Hard Thing About Hard Things) — Evaluate offers based on whether the company will be worth more in the future.
- **Exit Decision** (The Founder's Dilemmas) — Evaluate acquisition, IPO, or staying private against personal goals and company potential.
- **CleanTech Postmortem** (Zero to One) — Good technology is necessary but not sufficient; monopoly, timing, distribution, and durability matter equally.

### Source Books (11)
1. The Lean Startup — Eric Ries
2. The Mom Test — Rob Fitzpatrick
3. Crossing the Chasm — Geoffrey Moore
4. Zero to One — Peter Thiel
5. Blitzscaling — Reid Hoffman
6. Rework — Jason Fried & David Heinemeier Hansson
7. Hooked — Nir Eyal
8. High Output Management — Andy Grove
9. Measure What Matters — John Doerr
10. The Hard Thing About Hard Things — Ben Horowitz
11. The Founder's Dilemmas — Noam Wasserman

## Category 4: LOGISTICS_DOMAIN_KNOWLEDGE

### Last-Mile Delivery
**Key Insights**:
- Last-mile accounts for >50% of total shipping cost with 5-20% first-attempt failure rates. Focus on dense urban corridors where drop density is high.
- Use dynamic routing adapting to real-time conditions. Offer locker/PUDO alternatives and time-slot pricing. Start with a specific use case and geo-fenced territory.
- Lalamove achieved $10B by focusing on dense urban motorcycle/van flows. In emerging markets, optimize for cash-on-delivery complexity.

### Supply Chain Visibility & Tracking
**Key Insights**:
- The visibility-execution gap is the #1 unsolved logistics problem — companies see delays but lack automated responses. Only 19% integrate scenario planning into operations.
- Ocean schedule reliability is 62.4% (2026); late vessels average 5.34 days delay. Implement probabilistic ETAs with confidence intervals.
- Multi-tier supplier visibility: 95% have tier-one visibility but only 42% have tier-two-or-beyond. Prioritize acting on exceptions over simply seeing them.

### Route Optimization & Fleet Management
**Key Insights**:
- Route optimization faces N! complexity. Hybrid quantum-classical approaches (ML clustering + quantum sub-problem solving) are the practical path today.
- Build brand-agnostic telematics aggregation layers. Motive's model: start with regulatory compliance (ELD) as a hook, upsell safety/maintenance/spend modules.
- Truck detention averages 3.4 hours on 1 in 10 stops, reducing driver income and worsening the driver shortage. Implement dock scheduling with predictive dwell scoring.

### Warehouse Automation & Management
**Key Insights**:
- 74% of US logistics employers struggle to find skilled talent. Start with semi-automation (goods-to-person AMRs); use RaaS models to avoid large CapEx.
- Warehouse readiness prediction requires fusing inbound ETA, labor skills, dock status, and SKU workload data from separate systems.
- Dark warehouses (lights-out fulfillment) market projected at $400B by 2033. Requires digital twin simulation and hybrid operations for exceptions.

### Logistics Tech Stack (TMS/WMS/YMS)
**Key Insights**:
- Successful startups (ShipBob, Loadsmart, Motive, Flexport) started with one workflow pain point, then expanded horizontally.
- API-first freight procurement creates switching costs. Loadsmart connected 680k trucks through instant pricing APIs.
- Small/mid-market shippers are underserved by enterprise TMS/WMS. Lightweight AI layers on top of email/spreadsheets represent a massive opportunity.
- Master data quality is the core barrier to visibility — product, location, and carrier data are often stale across systems.

### Logistics Startup Business Models
**Key Insights**:
- Start asset-light to validate PMF, then introduce asset-right elements (selective ownership of bottleneck capacity) once unit economics are proven.
- The roll-up strategy (Bradley Jacobs' XPO) works in fragmented low-margin markets with strict 90-day integration playbooks.
- Contract logistics (moving from transport to value-added services like kitting, sequencing, light assembly) creates stickier relationships and higher margins.
- The groupage/consolidation model remains the core economics of LTL: small shipments must be consolidated at hubs for full-vehicle utilization.

### Logistics Unit Economics
**Key Insights**:
- Key metrics: operating ratio (asset-heavy: 85-95%; asset-light: 70-85%), contribution margin per shipment, CAC:LTV, capacity utilization.
- Aim for break-even on customer acquisition within 12 months. The Convoy model showed that subsidizing pricing is unsustainable in cyclical freight markets.
- Technology reduces variable cost per shipment as volume scales through automated rating, self-service booking, and exception handling.

### Logistics Regulation & Compliance
**Key Insights**:
- HS code misclassification is "recurring and costly" (Maersk). 72% of trade professionals cite tariff volatility as impactful. Use retrieval-grounded AI classification with audit trails.
- Drone delivery requires regulatory-first strategy. Flytrex secured Part 135 certification by engaging the FAA before scaling technology.
- 82% of companies affected by new tariffs (McKinsey). Build scenario agents that monitor trade policy changes and recompute landed cost in real-time.
- The Outlaw antipattern: designing for compliance from day one is cheaper than retrofitting after regulatory action.

### Logistics Network Design
**Key Insights**:
- Hub-and-spoke (FedEx) provides sortation efficiency and reliable transit times at the cost of longer distances. Point-to-point for low-volume/specialized freight.
- Distributed fulfillment (ShipBob: 60+ centers) enables national 2-day shipping while lowering last-mile cost. Start with 2-3 facilities based on customer geography.
- Empty container repositioning costs $20B+ annually, driven by structural trade imbalances. AI can forecast needs, but structural geography limits optimization.
- Port congestion results from vessel bunching, labor shortages, and customs holds. Use predictive analytics integrating AIS data, yard status, and weather.

### Inventory Management
**Key Insights**:
- Global inventory distortion is a $1.7T problem: $1.2T out-of-stocks, $554B overstocks. Root causes: forecast error, poor WMS accuracy, promotion noise, siloed incentives.
- The bullwhip effect amplifies small demand changes upstream. Implement multi-echelon inventory optimization coordinating across the entire network.
- Demurrage/detention fees: ~$15.4B collected (2020-2025). Build automated evidence agents tracking container free-time and drafting dispute packages.

### Theory of Constraints (The Goal)
**Key Insights**:
- The goal is making money, measured by: Throughput (sales revenue minus material cost), Inventory (money invested in things to sell), Operating Expense (money spent turning inventory into throughput).
- Local efficiencies (keeping everything busy) often reduce global throughput by creating excess inventory and hiding bottlenecks.
- Five Focusing Steps: 1) Identify the constraint, 2) Exploit it, 3) Subordinate everything else, 4) Elevate it, 5) Repeat.
- Dependent events and statistical fluctuations: variations at any step get amplified by dependencies. The bottleneck determines the entire system's speed.

### Lean Logistics (Toyota Way)
**Key Insights**:
- Ohno's kanban system pioneered just-in-time pull logistics — eliminating excess warehouse inventory and aligning flow with actual demand.
- Inventory is waste that hides flow blockages. Implement pull-based systems triggered by actual consumption, not forecasts.
- Reduce batch sizes, level workload (heijunka), and stop to fix problems (jidoka). The Andon Cord gives every employee authority to stop the line.
- Physical standardization must precede digital optimization. McLean's container reduced cargo-loading costs from $5.86/ton to $0.16/ton.

## How to Use This Knowledge Base

The AI should use these four categories as ground truth anchors:

**FAILURE_PATTERNS**: When a founder describes their situation, match symptoms (warning signs) to patterns to diagnose risk. The Hallucination Spiral and The Math Problem are the most common traps for logistics founders.

**SUCCESS_PATTERNS + FOUNDER_PROFILES**: When a founder needs a model for navigating a specific challenge (e.g., "how to build trust in a low-trust market" → Binny Bansal; "how to rethink costs from first principles" → Elon Musk).

**DECISION_FRAMEWORKS**: When a founder needs a structured process — validation stage → Lean Startup/Mom Test; scaling stage → Crossing the Chasm/Blitzscaling; team issues → Founder's Dilemmas/High Output Management.

**LOGISTICS_DOMAIN_KNOWLEDGE**: Whenever the founder mentions a specific logistics domain. Ground all recommendations in the real operational dynamics and unsolved problems of that domain.

The AI must never invent frameworks or patterns. All recommendations should cite the specific pattern name, framework, or domain entry. When the KB has no direct answer, state so and ask the founder what specific domain or problem they need to explore.

## Cross-Reference Index
- **failure_patterns_extracted.md** — Full entries with CONTEXT, INSIGHT, WARNING_SIGN, RESOLUTION for all 20 patterns
- **founder_insights_extracted.md** — Full FOUNDER_PROFILE cards with Key Mistake, Recovery, Logistics Relevance scoring
- **decision_frameworks_extracted.md** — Full frameworks with numbered STEPS, DECISION_POINT, WARNING_SIGN, FAILS_WHEN across 11 books
- **logistics_reports_and_books/LOGISTICS_DOMAIN_KNOWLEDGE.md** — Full 58 entries organized by logistics domain pattern
