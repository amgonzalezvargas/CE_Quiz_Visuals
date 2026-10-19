# Case Study: Progressive Degradation in Repeated Compaction

### Scenario Description

An autonomous research agent is tasked with finding an obscure animated film using four specific childhood clues provided by the user. The harness employs a periodic compaction hook that summarizes history whenever the context window exceeds 3,500 tokens. Rather than summarizing raw interaction logs, the harness continually summarizes its previous summary alongside new turns, demonstrating how repeated compaction cycles erode essential identifiers over time.

* **Context window limit:** 16,000 tokens
* **Compaction trigger threshold:** 3,500 tokens (21.9% utilization)

---

#### Step 1 — HARNESS INITIALIZATION

* **Tag:** SYSTEM MESSAGE
* **Label:** System Setup: Research Assistant
* **Tokens:** +500
* **Running total:** 500 / 16,000 (3.1%)

```text
You are an autonomous cinema research agent.

Harness Policy:
- Compaction hook triggers automatically when context exceeds 3,500 tokens.
- The compaction model compresses existing conversation history into a structured progress summary.

```

*Description:* Harness initializes research assistant with compaction hook.

---

#### Step 2 — USER INPUT

* **Tag:** USER PROMPT
* **Label:** User Query: 4 Clues
* **Tokens:** +150
* **Running total:** 650 / 16,000 (4.1%)

```text
User: "Please find this animated movie from my childhood:
1. Grumpy talking brass pocket watch
2. Steam train across suspended sky-bridges
3. Won European animation jury prize before 1998
4. Score by former jazz trumpeter"

```

*Description:* User provides all four required childhood movie clues.

---

#### Step 3 — HARNESS SETUP

* **Tag:** TOOL DEFINITION
* **Label:** Tool Definition: hybrid_search
* **Tokens:** +350
* **Running total:** 1,000 / 16,000 (6.3%)

```text
hybrid_search(query: string, limit: int = 5)
  "Searches CineCompPlus database combining BM25 keyword and dense semantic retrieval."

```

*Description:* Harness loads the database search tool schema.

---

#### Step 4 — TURN 1 · QUERY DISPATCH

* **Tag:** ASSISTANT MESSAGE (TOOL CALL)
* **Label:** Tool Call: Search Clues 1 & 2
* **Tokens:** +120
* **Running total:** 1,120 / 16,000 (7.0%)

```json
{
  "name": "hybrid_search",
  "arguments": {
    "query": "animated film steam train suspended sky-bridge brass pocket watch"
  }
}

```

*Description:* Assistant requests initial search for clues one and two.

---

#### Step 5 — TURN 1 · SEARCH RESULTS

* **Tag:** TOOL OUTPUT
* **Label:** Tool Output: Candidate Matches
* **Tokens:** +2,500
* **Running total:** 3,620 / 16,000 (22.6%)

```text
[hybrid_search Results]
- doc_14: "The Chrono Train (Le Train du Temps, 1995). French-Belgian stop-motion feature. Plot follows a locomotive traversing suspended canyon viaducts, guided by 'Horace', an ill-tempered living brass pocket watch."
- doc_31: "Clockwork Sky (2004). Features clockwork characters; no train motif."

```

*Description:* Database returns candidate films with matching characters.

---

#### Step 6 — TURN 1 · INTERMEDIATE DEDUCTION

* **Tag:** REASONING TRACE
* **Label:** Assistant Reasoning: Clues 1 & 2 Verified
* **Tokens:** +200
* **Running total:** 3,820 / 16,000 (23.9%)

```text
Evaluation:
- 'The Chrono Train' (1995) matches Clue 1 (brass pocket watch Horace) and Clue 2 (suspended sky-bridge train).
- 'Clockwork Sky' rejected (released 2004, exceeds pre-1998 boundary).
Lead Candidate: 'The Chrono Train' (1995).
Next step: Verify Clue 3 (pre-1998 European festival prize) for 'The Chrono Train'.

```

*Description:* Assistant logs confirmed clues and plans next search.

---

#### Step 7 — CONTEXT COMPACTION CYCLE 1

* **Tag:** CONTEXT MANAGEMENT
* **Label:** Harness Hook: First Compaction
* **Tokens:** -2,600
* **Running total:** 1,220 / 16,000 (7.6%)

```text
[HARNESS COMPACTION HOOK EXECUTED: Threshold > 3,500 tokens exceeded]
Replaced Steps 4, 5, and 6 with first-generation summary:

## Research Progress (Generation 1 Summary):
- Goal: Identify animated film matching 4 childhood clues.
- Leading Candidate: 'The Chrono Train' (1995).
- Confirmed: Matches brass pocket watch and sky-bridge steam train clues.
- Rejected: 'Clockwork Sky' (2004 release).
- Next Action: Check European festival prize records for 'The Chrono Train'.

```

*Description:* First condensation shortens history while keeping key titles.

---

#### Step 8 — TURN 2 · QUERY DISPATCH

* **Tag:** ASSISTANT MESSAGE (TOOL CALL)
* **Label:** Tool Call: Search Festival Prize
* **Tokens:** +130
* **Running total:** 1,350 / 16,000 (8.4%)

```json
{
  "name": "hybrid_search",
  "arguments": {
    "query": "The Chrono Train 1995 European animation festival jury prize"
  }
}

```

*Description:* Assistant requests search for film festival prize records.

---

#### Step 9 — TURN 2 · SEARCH RESULTS

* **Tag:** TOOL OUTPUT
* **Label:** Tool Output: Prize and Composer Details
* **Tokens:** +2,400
* **Running total:** 3,750 / 16,000 (23.4%)

```text
[hybrid_search Results]
- doc_82: "Annecy International Animation Festival Archive (1995): Special Jury Prize awarded to 'The Chrono Train'. Directed by Sylvie Moreau, orchestral score composed by Marc-Ange Fagnon."

```

*Description:* Database confirms award and identifies the musical composer.

---

#### Step 10 — CONTEXT COMPACTION CYCLE 2

* **Tag:** CONTEXT MANAGEMENT
* **Label:** Harness Hook: Second Compaction (Summary of Summary)
* **Tokens:** -2,570
* **Running total:** 1,180 / 16,000 (7.4%)

```text
[HARNESS COMPACTION HOOK EXECUTED: Threshold > 3,500 tokens exceeded]
Compressed Generation 1 Summary and Turn 2 into a second-generation summary:

## Research Progress (Generation 2 Summary):
- User is seeking a pre-1998 European animated train movie with a pocket watch character.
- Candidate film confirmed to have won an Annecy animation festival jury prize in the mid-1990s.
- Early clues satisfied.
- Remaining Task: Confirm whether the film's composer had a background as a jazz trumpeter.

```

*Description:* Repeated condensing erases critical names and specific titles.

---

#### Step 11 — TURN 3 · RECOVERY FAILURE

* **Tag:** REASONING TRACE
* **Label:** Assistant Reasoning: Lost Context
* **Tokens:** +180
* **Running total:** 1,360 / 16,000 (8.5%)

```text
Current State Check:
- Active summary indicates a mid-1990s European animated train movie won the Annecy jury prize.
- Crucial missing information: The summary does not state the title of the movie or the composer's name.
- I need to verify the composer's jazz background, but lacking the composer's name or film title, I must issue a broad, unanchored query.

```

*Description:* Assistant reads vague memory and lacks required names.

---

#### Step 12 — TURN 3 · DEGRADED SEARCH

* **Tag:** ASSISTANT MESSAGE (TOOL CALL)
* **Label:** Tool Call: Broad Search
* **Tokens:** +120
* **Running total:** 1,480 / 16,000 (9.3%)

```json
{
  "name": "hybrid_search",
  "arguments": {
    "query": "Annecy jury prize 1990s animated movie train jazz trumpeter composer"
  }
}

```

*Description:* Assistant issues a vague search without the movie title.

---

#### Step 13 — TURN 3 · NOISY RETRIEVAL

* **Tag:** TOOL OUTPUT
* **Label:** Tool Output: Generic Results
* **Tokens:** +1,500
* **Running total:** 2,980 / 16,000 (18.6%)

```text
[hybrid_search Results]
- doc_105: "Jazz in European Cinema: Survey of brass and trumpet soundtracks across 1980-2000 festival circuits."
- doc_112: "Annecy Festival 1998 Feature Highlights."
(Zero mentions of 'The Chrono Train' or composer Marc-Ange Fagnon due to lack of specific entity anchors in query).

```

*Description:* Broad search returns unrelated films instead of needed answers.

---

#### Step 14 — SCENARIO RESOLUTION

* **Tag:** ASSISTANT RESPONSE
* **Label:** Customer Response: Incomplete Resolution
* **Tokens:** +220
* **Running total:** 3,200 / 16,000 (20.0%)

```text
Assistant: "I identified an animated European film from 1995 featuring a steam train, a brass pocket watch, and an Annecy Festival Jury Prize. However, during context consolidation, the specific title and composer record were omitted from my active notes, and subsequent searches could not re-verify the composer's jazz credentials. Could you provide any additional detail about the release region to help narrow down the title?"

```

*Description:* Assistant fails to answer because key details vanished.