# Case study 3: Research Agent

## Context Window Explorer — plain-text story

### Scenario description
An autonomous research agent is tasked with tracking down an obscure animated film based on four fragmented childhood clues: a grumpy brass pocket watch, a sky-bridge steam train, a pre-1998 European festival prize, and a score by a former jazz trumpeter.

Each trajectory below lists its timeline steps in the order they appear in the Context Window Explorer.
Token figures: "+N" is the delta added by that step; "Running total" is the value shown in the Context Window Usage meter after the step is revealed.

---

## Trajectory 1: Truncation Re-Search Loop

- Context window limit: 128,000 tokens
- Effective context length (ECL) marker: 102,400 tokens (80%)

#### Step 1 — AGENT HARNESS SETUP
- **Tag:** SYSTEM MESSAGE
- **Label:** System prompt: CineComp Research Agent
- **Tokens:** +580
- **Running total:** 580 / 128,000 (0.5%)
- **Caption:** Agent system prompt initialized with hybrid search tool.

Content:

```text
You are an autonomous research assistant specialized in tracking down obscure cinema from fragmented clues.

Tools:
  - hybrid_search(query: string): Search CineCompPlus database
  - scratchpad_write(key, data): Save external notes
```

#### Step 2
- **Tag:** USER PROMPT
- **Label:** User prompt: 4 Childhood Clues
- **Tokens:** +160
- **Running total:** 740 / 128,000 (0.6%)
- **Caption:** User provides four fragmented memory clues.

Content:

```text
User: "Help me find this animated movie from my childhood:
1. Grumpy talking brass pocket watch
2. Steam train across suspended sky-bridges
3. Won European animation jury prize before 1998
4. Score by former jazz trumpeter"
```

#### Step 3
- **Tag:** TOOL DEFINITION
- **Label:** Tool definitions: hybrid_search
- **Tokens:** +420
- **Running total:** 1,160 / 128,000 (0.9%)
- **Caption:** Harness provides hybrid search across CineCompPlus entertainment corpus.

Content:

```text
hybrid_search(query: string, limit: int = 5)
  "Combines BM25 and Chroma vector search using Reciprocal Rank Fusion."
```

### Section: Turn 1: Festival Clue Retrieved

#### Step 4 — TURN 1 · FESTIVAL SEARCH
- **Tag:** TOOL OUTPUT
- **Label:** Tool output: doc_5 retrieved
- **Tokens:** +4,600
- **Running total:** 5,760 / 128,000 (4.5%)
- **Flag:** FOUND CLUE 3
- **Caption:** Early turn retrieves doc_5: confirms European jury prize won in 1995.

Content:

```text
[hybrid_search] query: "European film festival animation jury prize before 1998"
Result: doc_5 (Annecy Festival Retrospective 1990-1999)
"...In 1995, the prestigious Jury Prize was awarded to 'The Chrono Train' (Le Train du Temps) for its pioneering hand-painted background style..."
```

#### Step 5
- **Tag:** ASSISTANT RESPONSE
- **Label:** Reasoning: Clue 3 verified
- **Tokens:** +450
- **Running total:** 6,210 / 128,000 (4.9%)
- **Caption:** Agent records 1995 festival prize and transitions to soundtrack search.

Content:

```text
Confirmed European jury prize clue from doc_5: Annecy Festival Jury Prize 1995 ('The Chrono Train').
Now proceeding to search for Clue 4: former jazz trumpeter musical score.
```

### ⚠ Section: Context budget threshold: brute-force truncation hook fires

#### Step 6 — TURN 2-4 · COMPOSER SEARCHES
- **Tag:** TOOL OUTPUT
- **Label:** Tool outputs: 3 Broad Searches
- **Tokens:** +82,000
- **Running total:** 88,210 / 128,000 (68.9%)
- **Flag:** PROMPT BLOAT
- **Caption:** Successive multi-turn composer searches inflate context to 88,210 tokens.

Content:

```text
[3 successive hybrid_search calls for jazz trumpeter composer across international discographies...]
[Raw turn logs and full-text articles accumulate 82,000 tokens of context.]
```

#### Step 7
- **Tag:** MEMORY
- **Label:** Context Management: Brute-Force Turn Dropping
- **Tokens:** +-5,050
- **Running total:** 83,160 / 128,000 (65.0%)
- **Flag:** DOC_5 DROPPED
- **Caption:** Brute-Force Truncation: Turn 1 is purged without offloading facts to scratchpad!

Content:

```text
[HARNESS TRUNCATION HOOK]
Token budget limit reached. Sliding window active.
ACTION: Dropping oldest turn history (Turn 1: doc_5 and festival reasoning deleted from context window).
```

### ⚠ Section: Candidate verification: missing knowledge gap

#### Step 8 — TURN 5 · CANDIDATE VERIFICATION
- **Tag:** ASSISTANT RESPONSE
- **Label:** Reasoning: Memory void check
- **Tokens:** +620
- **Running total:** 83,780 / 128,000 (65.5%)
- **Flag:** RE-SEARCH LOOP
- **Caption:** Knowledge Void: Having lost Turn 1, the agent assumes it never searched for the festival prize!

Content:

```text
Final Candidate: 'The Chrono Train' (1995).
Checking context window to cross-reference the European festival prize requirement...
Context check: No record of European festival prize found in context window.
I must search for the European festival jury prize to confirm eligibility.
```

#### Step 9 — TURN 6 · REDUNDANT EXECUTION
- **Tag:** TOOL OUTPUT
- **Label:** Tool output: Redundant hybrid_search
- **Tokens:** +4,600
- **Running total:** 88,380 / 128,000 (69.0%)
- **Flag:** DUPLICATE WORK
- **Caption:** Indiscriminate truncation forced the agent into a wasteful, duplicate search loop!

Content:

```text
[hybrid_search] query: "Chrono Train European animation festival jury prize 1995"
Result: doc_5 re-retrieved!
(Tokens wasted, latency doubled, duplicate doc re-enters context).
```

**Final token count for this trajectory:** 88,380 / 128,000 (69.0%)

---

## Trajectory 2: Compaction Drift (Lost Dead-End)

- Context window limit: 128,000 tokens
- Effective context length (ECL) marker: 102,400 tokens (80%)

#### Step 1 — AGENT HARNESS SETUP
- **Tag:** SYSTEM MESSAGE
- **Label:** System prompt: Research Agent
- **Tokens:** +580
- **Running total:** 580 / 128,000 (0.5%)
- **Caption:** Agent configured with an automatic compaction hook.

Content:

```text
You are an autonomous research agent for CineComp.

Context Management:
  - Context compaction active at 70% threshold
  - Track clues and candidate titles
```

#### Step 2
- **Tag:** USER PROMPT
- **Label:** User prompt: Steam train clue
- **Tokens:** +150
- **Running total:** 730 / 128,000 (0.6%)
- **Caption:** Agent investigates the steam train clue.

Content:

```text
User: "Find the animated movie with a steam train travelling across suspended sky-bridges."
```

#### Step 3
- **Tag:** TOOL DEFINITION
- **Label:** Tool definitions: hybrid_search
- **Tokens:** +420
- **Running total:** 1,150 / 128,000 (0.9%)
- **Caption:** Search tool available.

Content:

```text
hybrid_search(query: string)
  "Query animated film database."
```

### Section: Dead-end exploration: 1990s Japanese Anime

#### Step 4 — TURN 1 · ANIME SEARCH
- **Tag:** TOOL OUTPUT
- **Label:** Tool output: Anime train films
- **Tokens:** +6,200
- **Running total:** 7,350 / 128,000 (5.7%)
- **Flag:** DISTRACTOR
- **Caption:** Agent explores 1990s Japanese anime candidates.

Content:

```text
[hybrid_search] query: "1990s animated movie steam train sky-bridge flying train"
Retrieved 5 titles: Galaxy Express 999, Night on the Galactic Railroad, etc.
```

#### Step 5
- **Tag:** ASSISTANT RESPONSE
- **Label:** Reasoning: Explicitly abandoned dead-end
- **Tokens:** +850
- **Running total:** 8,200 / 128,000 (6.4%)
- **Flag:** PATH ABANDONED
- **Caption:** Agent explicitly records the negative constraint: Japanese anime is a dead end.

Content:

```text
Evaluation:
- Galaxy Express 999: features steam train, but NO brass pocket watch; not a European festival prize.
- Night on Galactic Railroad: wrong composer, no brass watch.

Conclusion: The 1990s Japanese anime train path is an INVALID DEAD-END. Rule out all Japanese anime candidates.
```

### ⚠ Section: Threshold crossed: compaction hook fires with lossy prompt

#### Step 6 — TURN 2 · COMPACTION HOOK
- **Tag:** MEMORY
- **Label:** Context Compaction: Model Summary Handoff
- **Tokens:** +-5,800
- **Running total:** 2,400 / 128,000 (1.9%)
- **Flag:** DRIFT
- **Caption:** Compaction Drift: High-level summary drops the vital negative constraint!

Content:

```text
[HARNESS COMPACTION HOOK EXECUTED]
Compaction model prompt lacked negative constraint instructions.

Resulting Summary Handoff:
"## Session Progress:
- User is seeking an obscure animated film with a steam train motif.
- Searched several 1990s animated films and identified potential train motifs.
- Next step: evaluate candidate soundtracks."
(CRITICAL DETAIL LOST: Japanese anime dead-end completely omitted!)
```

### ⚠ Section: Roadblock encountered: repeating the abandoned path

#### Step 7 — TURN 3 · AMBIGUITY
- **Tag:** USER PROMPT
- **Label:** User prompt: Clarification roadblock
- **Tokens:** +110
- **Running total:** 2,510 / 128,000 (2.0%)
- **Caption:** User adds extra train description.

Content:

```text
User: "I think the train had distinctive brass wheels too."
```

#### Step 8
- **Tag:** ASSISTANT RESPONSE
- **Label:** Reasoning: Misled by compacted summary
- **Tokens:** +720
- **Running total:** 3,230 / 128,000 (2.5%)
- **Flag:** REPEAT ERROR
- **Caption:** Having lost the record that anime was ruled out, agent repeats the failed path!

Content:

```text
Reviewing compact session summary:
Summary notes: "identified potential train motifs in 1990s animated films."
Since train motifs exist in 1990s Japanese anime, let me query anime archives for brass wheels on trains.
```

#### Step 9 — TURN 4 · REPEATED SEARCH
- **Tag:** TOOL OUTPUT
- **Label:** Tool output: Re-querying anime database
- **Tokens:** +4,800
- **Running total:** 8,030 / 128,000 (6.3%)
- **Flag:** WASTED WORK
- **Caption:** Compaction Drift caused the agent to recycle already-refuted hypotheses.

Content:

```text
[hybrid_search] query: "Japanese anime 1990s train brass wheels"
(Agent re-spends time and tokens exploring the exact dead end it already ruled out!)
```

**Final token count for this trajectory:** 8,030 / 128,000 (6.3%)

---

## Trajectory 3: Aggressive Extraction (Local vs Global)

- Context window limit: 128,000 tokens
- Effective context length (ECL) marker: 102,400 tokens (80%)

#### Step 1 — AGENT HARNESS SETUP
- **Tag:** SYSTEM MESSAGE
- **Label:** System prompt: Movie Agent
- **Tokens:** +580
- **Running total:** 580 / 128,000 (0.5%)
- **Caption:** Extraction hook active: extracts only relevant sentences before context insertion.

Content:

```text
You are a film research assistant.

Harness Configuration:
  - LLM Judge sentence-level extraction hook active to reduce context bloat
```

#### Step 2
- **Tag:** USER PROMPT
- **Label:** User prompt: Composer Clue
- **Tokens:** +140
- **Running total:** 720 / 128,000 (0.6%)
- **Caption:** Clue: musical score by a former jazz trumpeter.

Content:

```text
User: "The musical score was composed by a former jazz trumpeter. What is the movie title?"
```

#### Step 3
- **Tag:** TOOL DEFINITION
- **Label:** Tool definitions: hybrid_search
- **Tokens:** +420
- **Running total:** 1,140 / 128,000 (0.9%)
- **Caption:** Tool accepts queries.

Content:

```text
hybrid_search(query: string)
  "Query entertainment database."
```

### Section: Search Execution & Raw Database Return

#### Step 4 — STEP 1 · DB HIT
- **Tag:** TOOL OUTPUT
- **Label:** Raw Tool Output: doc_88 (Full Article)
- **Tokens:** +3,800
- **Running total:** 4,940 / 128,000 (3.9%)
- **Caption:** Raw document contains the jazz trumpeter mention, but immediately disclaims it in Sentence 2!

Content:

```text
[hybrid_search] query: "animated movie score composed by a former jazz trumpeter"
Retrieved doc_88: "Retrospective: European Animated Film (1996)"

Full Raw Paragraph:
"Sentence 1: The animated movie features a musical score composed by a former jazz trumpeter.
Sentence 2: Though early production notes considered a jazz score, the final 1996 theatrical release ultimately switched to an electronic synthesizer score.
Sentence 3: The film won an animation jury prize at a European film festival before disappearing into obscurity."
```

### ⚠ Section: Harness Hook: sentence extraction judge (isolated query scope)

#### Step 5 — STEP 2 · ISOLATED EXTRACTION
- **Tag:** TOOL OUTPUT
- **Label:** Extraction Hook: Sentence Judge
- **Tokens:** +-3,550
- **Running total:** 1,390 / 128,000 (1.1%)
- **Flag:** CAVEAT STRIPPED
- **Caption:** Local Query Relevance vs Global Utility: Synthesizer disclaimer discarded!

Content:

```text
[EXTRACTION HOOK: EVALUATING CANDIDATE SENTENCES]
Target query: "animated movie score composed by a former jazz trumpeter"

- Sentence 1: "The animated movie features a musical score composed by a former jazz trumpeter." -> [MATCH: KEEP]
- Sentence 2: "Though early production notes considered... release switched to electronic synthesizer score..." -> [NO JAZZ KEYWORDS: DISCARD]
- Sentence 3: "The film won an animation jury prize..." -> [DISCARD]

Extracted snippet passed to context: 250 tokens (Sentence 1 ONLY).
```

#### Step 6
- **Tag:** ASSISTANT RESPONSE
- **Label:** Reasoning: False confidence hallucination
- **Tokens:** +590
- **Running total:** 1,980 / 128,000 (1.5%)
- **Flag:** FALSE CONFIDENCE
- **Caption:** Model reasons with 100% false confidence because the disclaimer was stripped!

Content:

```text
Extracted context from doc_88:
"The animated movie features a musical score composed by a former jazz trumpeter."

Conclusion:
The target movie had a musical score composed by a former jazz trumpeter. All four clues match doc_88 (1996)!
```

#### Step 7 — STEP 3 · ERRONEOUS ANSWER
- **Tag:** ASSISTANT RESPONSE
- **Label:** Assistant Response: False Positive
- **Tokens:** +290
- **Running total:** 2,270 / 128,000 (1.8%)
- **Caption:** Hallucination caused by lossy extraction: Full-text review would have correctly rejected this candidate.

Content:

```text
Assistant: "The movie you are looking for is the 1996 film referenced in doc_88. Its score was composed by a former jazz trumpeter."
```

**Final token count for this trajectory:** 2,270 / 128,000 (1.8%)

---

