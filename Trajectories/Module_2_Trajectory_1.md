### Case Study: FreshCart Coding Agent

#### Trajectory: Unrecovered Search Strategy Mismatches

* Context window limit: 32,768 tokens


* Effective context length (ECL) threshold: 26,214 tokens (80%)

---

#### Scenario Description

A backend engineer at FreshCart investigates checkout latency and locking issues. The engineer asks an autonomous coding agent to find where the specific configuration constant `LOCK_RETRY_MAX_ATTEMPTS` is defined in the codebase, and to verify whether store fulfillment documentation defines an allowed limit for checkout retries. The agent has access to indexed code and policy document collections through lexical search and semantic search tools.

---

#### Trajectory Steps & Context Window Evolution

**Step 1**

* Block Type: SYSTEM MESSAGE
* Label: System prompt: Role & Rules
* Tokens Added: +420
* Context Usage: 420 / 32,768 tokens (1.3%)
* Content:

```text
You are an autonomous software engineering assistant for the FreshCart platform.

Rules:
- Investigate codebase implementations and policy documentation using your search tools.
- Choose appropriate search strategies based on whether you are querying exact identifiers or conceptual topics.
- Ground all findings strictly in retrieved context; do not extrapolate or assume unstated logic.
- Provide clear file paths, line references, and policy citations in your final answer.

```

* Description: Agent initialized with operational guidelines and assistant persona.

**Step 2**

* Block Type: TOOL DEFINITION
* Label: Tool definitions: Search tools
* Tokens Added: +380
* Context Usage: 800 / 32,768 tokens (2.4%)
* Content:

```text
LexicalSearch(query: string, collection: string, top_k: integer)
  "Execute an exact-match and BM25 ranked keyword search. Collection must be 'codebase' or 'policies'. Best for literal identifiers, error codes, and exact variable names."

SemanticSearch(query: string, collection: string, top_k: integer)
  "Execute a dense vector similarity search using natural language meaning. Collection must be 'codebase' or 'policies'. Best for conceptual rules, topical questions, and descriptive prose."

```

* Description: Search tool interfaces registered for codebase and documentation.

**Step 3**

* Block Type: USER PROMPT
* Label: User prompt: Identifier lookup and policy check
* Tokens Added: +60
* Context Usage: 860 / 32,768 tokens (2.6%)
* Content:

```text
Where is LOCK_RETRY_MAX_ATTEMPTS configured in our codebase, and does our store policy set an upper limit on customer checkout retries?

```

* Description: User asks to verify a specific setting and policy.

**Step 4**

* Block Type: TOOL CALL
* Label: Tool call: SemanticSearch
* Tokens Added: +40
* Context Usage: 900 / 32,768 tokens (2.7%)
* Content:

```json
{
  "tool": "SemanticSearch",
  "arguments": {
    "query": "LOCK_RETRY_MAX_ATTEMPTS maximum checkout retry configuration",
    "collection": "codebase",
    "top_k": 1
  }
}

```

* Description: Agent searches codebase for the target setting.

**Step 5**

* Block Type: TOOL OUTPUT
* Label: Tool output: SemanticSearch
* Tokens Added: +260
* Context Usage: 1,160 / 32,768 tokens (3.5%)
* Content:

```json
[
  {
    "metadata": {"file_path": "freshcart/utils/retry.py", "start_line": 5, "end_line": 24},
    "chunk_content": "DEFAULT_RETRIES = 3\nBACKOFF_FACTOR = 0.5\n\ndef retry_operation(operation, max_retries=DEFAULT_RETRIES):\n    \"\"\"Helper to execute callables with exponential backoff.\"\"\"\n    for attempt in range(max_retries):\n        try:\n            return operation()\n        except Exception:\n            time.sleep(BACKOFF_FACTOR * (2 ** attempt))\n    raise MaxRetriesExceeded()"
  }
]

```

* Description: Search returned generic helper functions instead of the requested setting.

**Step 6**

* Block Type: REASONING TRACE
* Label: Reasoning: Rationalizing generic fallback as the target constant
* Tokens Added: +90
* Context Usage: 1,250 / 32,768 tokens (3.8%)
* Content:

```text
The search in freshcart/utils/retry.py shows system retries are governed by DEFAULT_RETRIES = 3.
The exact identifier LOCK_RETRY_MAX_ATTEMPTS was not matched, so the codebase appears to implement this configuration under DEFAULT_RETRIES instead.
To verify whether policy documents explicitly reference this limit, I will use LexicalSearch to check if either term (LOCK_RETRY_MAX_ATTEMPTS or DEFAULT_RETRIES) appears in our fulfillment guidelines.

```

* Description: Agent mistakenly assumes generic helper code is the real setting.

**Step 7**

* Block Type: TOOL CALL
* Label: Tool call: LexicalSearch
* Tokens Added: +35
* Context Usage: 1,285 / 32,768 tokens (3.9%)
* Content:

```json
{
  "tool": "LexicalSearch",
  "arguments": {
    "query": "LOCK_RETRY_MAX_ATTEMPTS DEFAULT_RETRIES",
    "collection": "policies",
    "top_k": 2
  }
}

```

* Description: Agent searches store policies using code variable names.

**Step 8**

* Block Type: TOOL OUTPUT
* Label: Tool output: LexicalSearch
* Tokens Added: +20
* Context Usage: 1,305 / 32,768 tokens (4.0%)
* Content:

```json
[]

```

* Description: Search returned zero results because the exact wording was absent.

**Step 9**

* Block Type: REASONING TRACE
* Label: Reasoning: Concluding absence based on zero keyword matches
* Tokens Added: +85
* Context Usage: 1,390 / 32,768 tokens (4.2%)
* Content:

```text
The lexical query returned zero results from the policies collection.
Since neither LOCK_RETRY_MAX_ATTEMPTS nor DEFAULT_RETRIES appears anywhere in the fulfillment text, our documentation does not establish a retry limit.
I have enough information to form the final response.

```

* Description: Agent mistakenly concludes no policy exists after finding no matches.

**Step 10**

* Block Type: ASSISTANT RESPONSE
* Label: Assistant response: Erroneous conclusion
* Tokens Added: +150
* Context Usage: 1,540 / 32,768 tokens (4.7%)
* Content:

```text
Based on my investigation:

1. **Configuration Location**: Retry limits are governed by `freshcart/utils/retry.py` (lines 5–24), where the default retry parameter is set to `DEFAULT_RETRIES = 3`. The exact constant `LOCK_RETRY_MAX_ATTEMPTS` is not defined as a separate setting.
2. **Policy Documentation**: Our store fulfillment documentation does not define any rules or limits regarding checkout retries.

```

* Description: Agent provides incorrect answers to the engineer without recovering.