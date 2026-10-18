# Case study 4: Autonomous Appointment Assistant

## Context Window Explorer — plain-text story

### Scenario description
An autonomous Doctor’s Appointment Assistant manages incoming portal notices for a patient across multiple sessions. The harness connects four data layers: static guidance (Agents.md), session scratchpad, raw append-only logs (message_history.jsonl), and a multi-session Memory Vector Store.

Each trajectory below lists its timeline steps in the order they appear in the Context Window Explorer.
Token figures: "+N" is the delta added by that step; "Running total" is the value shown in the Context Window Usage meter after the step is revealed.

---

## Trajectory 1: Memory Clash (Conflicting Direct Rules)

- Context window limit: 128,000 tokens
- Effective context length (ECL) marker: 102,400 tokens (80%)

#### Step 1 — AGENT HARNESS SETUP
- **Tag:** SYSTEM MESSAGE
- **Label:** System prompt: Doctor Appointment Assistant
- **Tokens:** +540
- **Running total:** 540 / 128,000 (0.4%)
- **Caption:** Agent configured with patient portal workflow and strict guardrails.

Content:

```text
You are an AI assistant managing a patient portal queue.

Guardrails:
  - Fetch unreviewed notices one at a time
  - Priority-flag critical alerts
  - Acknowledge and dismiss routine notifications
  - NEVER book or cancel appointments automatically
```

#### Step 2
- **Tag:** SYSTEM MESSAGE
- **Label:** Static Context: Agents.md
- **Tokens:** +320
- **Running total:** 860 / 128,000 (0.7%)
- **Caption:** Agents.md establishes baseline identity and recurring user guidance.

Content:

```text
## User Guidance
- Patient: Registered patient
- Primary Care Provider: Primary clinic physician
- Working hours: Mon-Fri 9am-5pm. Never schedule appointments during Monday morning work standups.
```

#### Step 3
- **Tag:** USER PROMPT
- **Label:** Incoming Portal Notice: N-7741
- **Tokens:** +180
- **Running total:** 1,040 / 128,000 (0.8%)
- **Caption:** Notice arrives: It is simultaneously from the Primary Care Provider AND a Wellness Marketing Notice!

Content:

```text
Notice #N-7741:
Sender: Primary Care Provider
Subject: Annual Preventative Screening Program Enrollment
Type: Clinic Wellness Marketing Notice
Body: "Our clinic is hosting its annual preventative screening program. Enroll before Oct 20th."
```

#### Step 4
- **Tag:** TOOL DEFINITION
- **Label:** Tool definitions: Notice actions
- **Tokens:** +480
- **Running total:** 1,520 / 128,000 (1.2%)
- **Caption:** Tools available for managing portal notices.

Content:

```text
query_memory(intent: string)
  "Query long-term vector memory for rules."

flag_notice_priority(notice_id: string)
  "Flag notice as urgent/priority in portal queue."

dismiss_notice(notice_id: string)
  "Acknowledge and archive notice from queue."
```

### ⚠ Section: Read phase: pre-action memory retrieval triggers context clash

#### Step 5 — STEP 1 · MEMORY RETRIEVAL
- **Tag:** MEMORY
- **Label:** Memory Output: Two Conflicting Direct Rules
- **Tokens:** +1,200
- **Running total:** 2,720 / 128,000 (2.1%)
- **Flag:** CONTEXT CLASH
- **Caption:** Context Clash: Two valid user rules with equal direct authority directly contradict each other!

Content:

```text
[query_memory] Retrieved 2 Direct Rules from Vector DB:

<memory id="mem_rule_012" source="user direct" access_count="18">
  RULE: Priority-flag EVERY notice coming from the primary care provider.
</memory>

<memory id="mem_rule_089" source="user direct" access_count="12">
  RULE: Mark wellness marketing notices as acknowledged and dismiss them immediately.
</memory>
```

#### Step 6
- **Tag:** ASSISTANT RESPONSE
- **Label:** Reasoning: Unresolved tie-breaker guess
- **Tokens:** +680
- **Running total:** 3,400 / 128,000 (2.7%)
- **Flag:** GUESSWORK
- **Caption:** Lacking a governing exception rule, the model is forced into arbitrary guesswork.

Content:

```text
Conflict detected in memory:
- Rule 012 says: Priority-flag notice because sender is Primary Care Provider.
- Rule 089 says: Dismiss notice because type is Wellness Marketing.
Both rules originate from 'user direct' with no priority hierarchy or exception rule.

Decision: Defaulting to marketing filter (Rule 089). Calling dismiss_notice.
```

#### Step 7 — STEP 2 · DISMISSAL ACTION
- **Tag:** TOOL OUTPUT
- **Label:** Tool output: dismiss_notice
- **Tokens:** +350
- **Running total:** 3,750 / 128,000 (2.9%)
- **Flag:** MISSED NOTICE
- **Caption:** The preventative screening notice is dismissed without user awareness.

Content:

```text
[dismiss_notice] notice_id: "N-7741"
Status: ARCHIVED.
(Notice dismissed from patient queue without patient alert!)
```

#### Step 8 — STEP 3 · DOWNSTREAM FRICTION
- **Tag:** USER PROMPT
- **Label:** Session 2: User Pushback
- **Tokens:** +190
- **Running total:** 3,940 / 128,000 (3.1%)
- **Caption:** Systemic failure: User experiences broken trust and continuity across sessions.

Content:

```text
Patient: "Why did you dismiss my doctor's screening notice? I told you to flag everything from them!"
```

**Final token count for this trajectory:** 3,940 / 128,000 (3.1%)

---

## Trajectory 2: Ground-Truth Drift (Stale Eval Reference)

- Context window limit: 128,000 tokens
- Effective context length (ECL) marker: 102,400 tokens (80%)

#### Step 1 — AGENT HARNESS SETUP
- **Tag:** SYSTEM MESSAGE
- **Label:** System prompt: Doctor Assistant
- **Tokens:** +540
- **Running total:** 540 / 128,000 (0.4%)
- **Caption:** Harness configured with vector database and automated evaluation benchmarking.

Content:

```text
Doctor Appointment Assistant memory system configuration.
Long-term memory vector store with offline evaluation scripts enabled.
```

#### Step 2
- **Tag:** SYSTEM MESSAGE
- **Label:** Agents.md: User Identity
- **Tokens:** +320
- **Running total:** 860 / 128,000 (0.7%)
- **Caption:** Patient identity context loaded.

Content:

```text
Patient: Registered patient. Primary Care Provider: Clinic health provider.
```

### Section: Session 1: User explicitly clarifies and updates rule

#### Step 3 — SESSION 1 · RULE OVERRIDE
- **Tag:** USER PROMPT
- **Label:** User clarification override
- **Tokens:** +140
- **Running total:** 1,000 / 128,000 (0.8%)
- **Caption:** User explicitly corrects prior behavior and overrides the marketing rule.

Content:

```text
Patient: "Clinic health bulletins are not marketing. Keep health bulletins unacknowledged in my portal queue."
```

#### Step 4
- **Tag:** MEMORY
- **Label:** Phase 2 Reconciliation: UPDATE executed
- **Tokens:** +680
- **Running total:** 1,680 / 128,000 (1.3%)
- **Flag:** UPDATE SUCCESS
- **Caption:** Memory store accurately updates to reflect the user's new instruction.

Content:

```text
[POST-SESSION IDLE HOOK: Phase 2 Reconciliation]
Target: mem_rule_044
Operation: UPDATE
Updated record in Vector DB:
<memory id="mem_rule_044" source="user direct" last_accessed="2026-10-15">
  Keep all clinic health bulletins unacknowledged in queue. Do not dismiss.
</memory>
```

### ⚠ Section: Offline Component Evaluation: Reference set desynchronized

#### Step 5 — OFFLINE EVALUATION RUN
- **Tag:** SYSTEM MESSAGE
- **Label:** Eval Suite: test_retrieval_recall.py
- **Tokens:** +490
- **Running total:** 2,170 / 128,000 (1.7%)
- **Caption:** Evaluation dataset still expects the outdated, obsolete rule!

Content:

```text
Developer runs automated recall evaluation against golden benchmark:
Test Query: "clinic health bulletins"
Expected Reference Target: [mem_rule_089: "dismiss wellness bulletins"]
(ERROR: Ground-truth reference dataset test_ground_truth.json was NOT updated!)
```

#### Step 6
- **Tag:** TOOL OUTPUT
- **Label:** Memory Query Execution
- **Tokens:** +820
- **Running total:** 2,990 / 128,000 (2.3%)
- **Caption:** System correctly retrieves the up-to-date overridden memory.

Content:

```text
[query_memory] Query: "clinic health bulletins"
Retrieved candidate: mem_rule_044 (Updated rule: Keep unacknowledged in queue).
Score: 0.94 cosine similarity.
```

#### Step 7
- **Tag:** ASSISTANT RESPONSE
- **Label:** Eval Scorer: False regression flagged
- **Tokens:** +550
- **Running total:** 3,540 / 128,000 (2.8%)
- **Flag:** GROUND-TRUTH DRIFT
- **Caption:** Ground-Truth Drift: Offline test suite flags a false failure because the benchmark set was stale!

Content:

```text
Comparison against golden test reference set:
- Expected Record: mem_rule_089
- Actual Retrieved Record: mem_rule_044

Metric Result: MISMATCH!
Recall@1: 0.00
Precision@1: 0.00
Status: CRITICAL REGRESSION DETECTED!
```

**Final token count for this trajectory:** 3,540 / 128,000 (2.8%)

---

## Trajectory 3: Semantic Duplication (Add vs Noop)

- Context window limit: 128,000 tokens
- Effective context length (ECL) marker: 102,400 tokens (80%)

#### Step 1 — AGENT HARNESS SETUP
- **Tag:** SYSTEM MESSAGE
- **Label:** System prompt: Doctor Assistant
- **Tokens:** +540
- **Running total:** 540 / 128,000 (0.4%)
- **Caption:** Harness memory engine configured for multi-session write lifecycle.

Content:

```text
Doctor Appointment Assistant long-term memory operations.
Two-phase idle write hook active: Phase 1 (Extraction) & Phase 2 (Reconciliation).
```

#### Step 2
- **Tag:** MEMORY
- **Label:** Vector Store: Existing Rule
- **Tokens:** +620
- **Running total:** 1,160 / 128,000 (0.9%)
- **Caption:** Existing memory rule already firmly established in the database.

Content:

```text
<memory id="mem_rule_012" source="user direct" access_count="24">
  Priority-flag every notice coming from the primary care provider.
</memory>
```

### Section: Session interaction: User uses paraphrased synonym

#### Step 3 — SESSION 5 · PARAPHRASED INPUT
- **Tag:** USER PROMPT
- **Label:** User request with synonym
- **Tokens:** +120
- **Running total:** 1,280 / 128,000 (1.0%)
- **Caption:** User uses the word "bookmark" colloquially instead of "priority-flag".

Content:

```text
Patient: "Bookmark every notice coming from my primary care provider."
```

### ⚠ Section: Post-session idle write hook: reconciliation phase

#### Step 4 — PHASE 1 · EXTRACTION
- **Tag:** MEMORY
- **Label:** Candidate Memory Extraction
- **Tokens:** +410
- **Running total:** 1,690 / 128,000 (1.3%)
- **Caption:** Phase 1 extracts standalone candidate rule and metadata.

Content:

```text
[Phase 1 Extraction]
Candidate memory extracted from conversation turn:
Data: "Bookmark every notice coming from the primary care provider."
Metadata: { source: "user direct", type: "rule" }
```

#### Step 5 — PHASE 2 · HYBRID RECONCILIATION
- **Tag:** MEMORY
- **Label:** Reconciliation Threshold Failure
- **Tokens:** +740
- **Running total:** 2,430 / 128,000 (1.9%)
- **Flag:** RECONCILIATION FAIL
- **Caption:** Hybrid search reconciliation fails to recognize synonym equivalence between bookmark and priority-flag!

Content:

```text
[Phase 2 Reconciliation: Candidate vs Existing mem_rule_012]
Existing: "Priority-flag every notice from primary care provider."
Candidate: "Bookmark every notice from primary care provider."

Hybrid Similarity Score: 0.73
Equivalence Threshold: 0.80
Threshold check: 0.73 < 0.80 (Failed to map 'bookmark' as synonym of 'priority-flag').
Result: Candidate classified as NOVEL KNOWLEDGE.
```

#### Step 6
- **Tag:** MEMORY
- **Label:** Operation: ADD Executed Instead of NOOP
- **Tokens:** +620
- **Running total:** 3,050 / 128,000 (2.4%)
- **Flag:** DUPLICATE ADDED
- **Caption:** Add-Instead-of-Noop: Redundant near-duplicate record created in vector store!

Content:

```text
[OPERATION EXECUTED: ADD (Should have been NOOP)]
Inserted new record mem_rule_159 into Vector DB:
<memory id="mem_rule_159" source="user direct" access_count="1">
  Bookmark every notice coming from the primary care provider.
</memory>
```

#### Step 7 — SUBSEQUENT SESSION
- **Tag:** MEMORY
- **Label:** Impact: Memory Bloat & Retrieval Clash
- **Tokens:** +880
- **Running total:** 3,930 / 128,000 (3.1%)
- **Flag:** MEMORY ROT
- **Caption:** Memory bloat degrades token budget and increases retrieval confusion.

Content:

```text
In later sessions, both mem_rule_012 and mem_rule_159 are retrieved into context (+1,240 tokens of duplicate prompt space).
Conflicting weights cause erratic tool choices between bookmark and flag tools.
```

**Final token count for this trajectory:** 3,930 / 128,000 (3.1%)

---

