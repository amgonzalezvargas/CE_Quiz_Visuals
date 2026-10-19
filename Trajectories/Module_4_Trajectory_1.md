### Case Study 4: Doctor’s Appointment Assistant

#### Trajectory 1: Memory Writing and Semantic Duplication

* Context window limit: 128,000 tokens
* Effective context length (ECL) threshold: 102,400 tokens (80%)

---

#### Scenario Description

An AI Doctor’s Appointment Assistant manages incoming patient portal notices. Previously, the user explicitly instructed the agent to priority-flag every notice from their primary care provider. This rule is currently stored in the agent's long-term vector database. During a new session, the user paraphrases this existing instruction. The system's background memory hook subsequently attempts to extract, deduplicate, and reconcile this candidate rule against the vector store to prevent duplicate database entries.

---

#### Trajectory Steps & Context Window Evolution

**Step 1**

* Block Type: SYSTEM MESSAGE
* Label: System prompt: Role & Hook Rules
* Tokens Added: +450
* Context Usage: 450 / 128,000 tokens (0.3%)
* Content:

```text
You are an AI Doctor's Appointment Assistant.

Rules:
- Fetch and manage incoming patient portal notices one at a time.
- Map user intents to valid tools to avoid unexecutable commands.
- Respond to user instructions so they can be saved to memory after the session ends.

```

* Description: Agent initialized with role, guidelines, and memory hook configurations.

**Step 2**

* Block Type: TOOL DEFINITION
* Label: Tool definitions: JSON schemas
* Tokens Added: +650
* Context Usage: 1,100 / 128,000 tokens (0.8%)
* Content:

```text
priority_flag(notice_id: string)
  "Mark a portal notice with high priority status."

dismiss(notice_id: string)
  "Dismiss a portal notice from the unread queue."

search_memory(query: string)
  "Search the long-term vector store for existing rules or facts."

ask_user(question: string)
  "Ask the patient for clarification on missing or conflicting rules."

```

* Description: Necessary tool schemas registered, including memory search and feedback.

**Step 3**

* Block Type: USER PROMPT
* Label: User prompt: Paraphrased rule instruction
* Tokens Added: +40
* Context Usage: 1,140 / 128,000 tokens (0.8%)
* Content:

```text
Patient: "I'm super busy today. From now on, just bookmark every notice coming from Dr. Smith, my primary care provider."

```

* Description: User gives an instruction using different words for same action.

**Step 4**

* Block Type: REASONING TRACE
* Label: Reasoning: Acknowledge instruction
* Tokens Added: +30
* Context Usage: 1,170 / 128,000 tokens (0.9%)
* Content:

```text
The user provided a direct instruction to bookmark notices from Dr. Smith. I do not need to take action on an email right now, but I must acknowledge this preference so the background hook writes it to memory.

```

* Description: Model successfully plans to acknowledge the new user instruction rule.

**Step 5**

* Block Type: ASSISTANT RESPONSE
* Label: Assistant response: Confirmation
* Tokens Added: +25
* Context Usage: 1,195 / 128,000 tokens (0.9%)
* Content:

```text
Assistant: "Understood! I will make sure to bookmark all future notices from Dr. Smith for you."

```

* Description: Agent confirms receipt of the instruction and session becomes idle.

**Step 6**

* Block Type: HARNESS EXECUTION
* Label: Background Hook: Phase 1 Extraction
* Tokens Added: +0 (Background offline operation)
* Context Usage: 1,195 / 128,000 tokens (0.9%)
* Content:

```json
{
  "hook_event": "session_idle_extraction",
  "extracted_candidate": {
    "source": "user direct",
    "raw_text": "Bookmark every notice coming from Dr. Smith.",
    "mapped_tool_intent": "priority_flag",
    "type": "rule"
  }
}

```

* Description: System properly translates the word bookmark to the actual tool.

**Step 7**

* Block Type: HARNESS EXECUTION
* Label: Background Hook: Phase 2 Reconciliation
* Tokens Added: +0 (Background offline operation)
* Context Usage: 1,195 / 128,000 tokens (0.9%)
* Content:

```json
{
  "hook_event": "phase_2_reconciliation",
  "hybrid_search_results": [],
  "decision": "ADD",
  "reasoning": "Semantic threshold missed equivalence between 'bookmark' and 'priority-flag'. Candidate treated as novel knowledge.",
  "status": "New duplicate record committed to vector database."
}

```

* Description: System wrongly stores redundant rule instead of preserving existing one.

---
