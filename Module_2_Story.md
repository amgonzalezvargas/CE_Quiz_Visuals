# Case study 2: Autonomous Coding Agent

## Context Window Explorer — plain-text story

### Scenario description
A backend software engineer at FreshCart investigates an urgent bug where customers checkout with out-of-stock items. The engineer deploys an autonomous coding agent with access to three data sources: a Vector Store (Chroma code & policies), Filesystem Event Logs (regex search), and a Relational Database (SQL query tool).

Each trajectory below lists its timeline steps in the order they appear in the Context Window Explorer.
Token figures: "+N" is the delta added by that step; "Running total" is the value shown in the Context Window Usage meter after the step is revealed.

---

## Trajectory 1: Tool Mismatch (Policy vs Code)

- Context window limit: 128,000 tokens
- Effective context length (ECL) marker: 102,400 tokens (80%)

#### Step 1 — AGENT HARNESS SETUP
- **Tag:** SYSTEM MESSAGE
- **Label:** System prompt: FreshCart Dev Agent
- **Tokens:** +620
- **Running total:** 620 / 128,000 (0.5%)
- **Caption:** Agent system prompt establishes platform role and access to codebase.

Content:

```text
You are an autonomous debugging and development agent on the FreshCart core platform engineering team.

Rules:
  - Answer engineering questions using your available search tools
  - Consult policy documentation for business rules and source code for implementations
  - Always cite source files and line numbers
```

#### Step 2
- **Tag:** USER PROMPT
- **Label:** User prompt: Policy inquiry
- **Tokens:** +130
- **Running total:** 750 / 128,000 (0.6%)
- **Caption:** The engineer explicitly requests the official business policy documentation.

Content:

```text
Engineer: "Where is the official business policy for handling out-of-stock dairy substitutions defined?"
```

#### Step 3
- **Tag:** TOOL DEFINITION
- **Label:** Tool definitions: Ambiguous search tools
- **Tokens:** +580
- **Running total:** 1,330 / 128,000 (1.0%)
- **Caption:** Ambiguous or ungrounded descriptions cause the agent to confuse keyword syntax with conceptual policy.

Content:

```text
code_lexical_search(query: string)
  "Search codebase files matching raw keyword strings."

policy_semantic_search(query: string)
  "Query fulfillment policies and business guidelines by semantic intent."

database_sql_query(sql: string)
  "Execute transactional queries against PostgreSQL."

log_regex_search(pattern: string)
  "Search plain text runtime checkout logs."
```

#### Step 4
- **Tag:** ASSISTANT RESPONSE
- **Label:** Reasoning: Misjudged tool choice
- **Tokens:** +380
- **Running total:** 1,710 / 128,000 (1.3%)
- **Caption:** Agent selects lexical keyword code search rather than semantic documentation search.

Content:

```text
User wants to find where dairy substitutions are handled.
I will search for the exact keyword "dairy substitutions" across the project files using code_lexical_search.
```

### Section: Tool Execution: Syntax over Semantics

#### Step 5 — STEP 1 · LEXICAL SEARCH
- **Tag:** TOOL OUTPUT
- **Label:** Tool output: code_lexical_search
- **Tokens:** +2,400
- **Running total:** 4,110 / 128,000 (3.2%)
- **Flag:** WRONG TOOL
- **Caption:** Wrong Tool Selected: Returned low-level Python sync code instead of official policy docs!

Content:

```text
[code_lexical_search] query: "dairy substitutions"
Matches found in inventory_sync.py:
----------------------------------------
# inventory_sync.py:142
if item.category == 'dairy' and item.stock <= 0:
    # Sync loop hardcode bypass
    skip_substitutions = True
    logger.warning("Bypassing sync loop for dairy SKU: %s", item.sku)
```

#### Step 6
- **Tag:** ASSISTANT RESPONSE
- **Label:** Reasoning: False conclusion from code
- **Tokens:** +750
- **Running total:** 4,860 / 128,000 (3.8%)
- **Flag:** MISINFORMED
- **Caption:** Agent misinterprets low-level backend bypass code as official store business rules.

Content:

```text
Found matching implementation in inventory_sync.py line 142.
The code explicitly sets 'skip_substitutions = True' for out-of-stock dairy.

Conclusion: FreshCart policy hardcodes a complete ban on dairy substitutions.
```

#### Step 7 — STEP 2 · ERRONEOUS REPORT
- **Tag:** ASSISTANT RESPONSE
- **Label:** Assistant Response: False Policy Report
- **Tokens:** +320
- **Running total:** 5,180 / 128,000 (4.0%)
- **Caption:** Catastrophic troubleshooting mistake: Engineer investigates code while missing the actual policy document.

Content:

```text
Assistant: "The policy for handling out-of-stock dairy substitutions is defined in 'inventory_sync.py' at line 142. FreshCart has hardcoded substitutions to skip all dairy items automatically."
```

**Final token count for this trajectory:** 5,180 / 128,000 (4.0%)

---

## Trajectory 2: Bad Chunking (Severed Class)

- Context window limit: 128,000 tokens
- Effective context length (ECL) marker: 102,400 tokens (80%)

#### Step 1 — AGENT HARNESS SETUP
- **Tag:** SYSTEM MESSAGE
- **Label:** System prompt: FreshCart Dev Agent
- **Tokens:** +620
- **Running total:** 620 / 128,000 (0.5%)
- **Caption:** Agent is tasked with inspecting schema fields in models.py.

Content:

```text
You are an autonomous debugging agent for FreshCart.

Task:
  - Inspect database models in models.py
  - Validate schema definitions and field types
```

#### Step 2
- **Tag:** USER PROMPT
- **Label:** User prompt: Model field validation
- **Tokens:** +140
- **Running total:** 760 / 128,000 (0.6%)
- **Caption:** Engineer asks for the exact validation regex of aisle_id in InventoryItem.

Content:

```text
Engineer: "Tell me the data format and validation rule for the aisle_id field in the InventoryItem database model."
```

#### Step 3
- **Tag:** TOOL DEFINITION
- **Label:** Tool definitions: Code search
- **Tokens:** +490
- **Running total:** 1,250 / 128,000 (1.0%)
- **Caption:** Vector store contains the codebase chunks prepared by the ingestion pipeline.

Content:

```text
code_vector_search(query: string, collection: string = "freshcart_code")
  "Search vectorized repository chunks using dense embeddings."
```

#### Step 4
- **Tag:** ASSISTANT RESPONSE
- **Label:** Reasoning: Querying vector store
- **Tokens:** +360
- **Running total:** 1,610 / 128,000 (1.3%)
- **Caption:** Agent formulates semantic search query for the model definition.

Content:

```text
I need to find the InventoryItem model definition in models.py and look up the aisle_id validation rules.
Executing code_vector_search for "InventoryItem aisle_id Field validation".
```

### ⚠ Section: Ingestion pipeline flaw: fixed-character chunking

#### Step 5 — STEP 1 · RETRIEVAL
- **Tag:** TOOL OUTPUT
- **Label:** Tool output: Severed Chunk 124
- **Tokens:** +1,800
- **Running total:** 3,410 / 128,000 (2.7%)
- **Flag:** SEVERED CHUNK
- **Caption:** Naive fixed-character chunking severed the class definition right before the aisle_id field!

Content:

```text
[code_vector_search] Retrieved chunk 124 (Similarity: 0.88):
File: models.py (Lines 1-22)
----------------------------------------
class InventoryItem(BaseModel):
    """Core inventory entity tracking store-level stock."""
    item_id: str = Field(..., description="Unique inventory UUID")
    sku: str = Field(..., max_length=12)
    store_id: int = Field(..., gt=0)
    stock_count: int = Field(ge=0)
    # [CHUNK CUT OFF AT CHARACTER 500 WITHOUT AST PARSER]
```

#### Step 6
- **Tag:** ASSISTANT RESPONSE
- **Label:** Reasoning: Hallucinated absence
- **Tokens:** +640
- **Running total:** 4,050 / 128,000 (3.2%)
- **Flag:** FALSE NEGATIVE
- **Caption:** Adjacent chunk 125 containing aisle_id scored 0.41 and was dropped from retrieval!

Content:

```text
Inspecting chunk 124 of models.py containing class InventoryItem.
The model contains item_id, sku, store_id, and stock_count.
There is NO aisle_id field declared in this class.

Conclusion: The InventoryItem model does not possess an aisle_id attribute.
```

#### Step 7 — STEP 2 · MISGUIDED RESPONSE
- **Tag:** ASSISTANT RESPONSE
- **Label:** Assistant Response: False Schema Absence
- **Tokens:** +310
- **Running total:** 4,360 / 128,000 (3.4%)
- **Caption:** Destructive outcome: Engineer wastes hours searching for nonexistent database migrations.

Content:

```text
Assistant: "I have examined the InventoryItem model in 'models.py'. The model does not have an 'aisle_id' field. It only declares item_id, sku, store_id, and stock_count."
```

**Final token count for this trajectory:** 4,360 / 128,000 (3.4%)

---

## Trajectory 3: Unfiltered SQL Query (Context Flood)

- Context window limit: 128,000 tokens
- Effective context length (ECL) marker: 102,400 tokens (80%)

#### Step 1 — AGENT HARNESS SETUP
- **Tag:** SYSTEM MESSAGE
- **Label:** System prompt: FreshCart Dev Agent
- **Tokens:** +620
- **Running total:** 620 / 128,000 (0.5%)
- **Caption:** Agent harness configured with live database query execution.

Content:

```text
You are an autonomous database troubleshooting agent for FreshCart.

Tools:
  - database_sql_query: Run SQL queries against the production replica
  - log_regex_search: Search plain-text server logs
```

#### Step 2
- **Tag:** USER PROMPT
- **Label:** User prompt: Bug investigation
- **Tokens:** +150
- **Running total:** 770 / 128,000 (0.6%)
- **Caption:** Targeted prompt: Engineer requests transactions for a specific date (Oct 14, 2026).

Content:

```text
Engineer: "Find all checkout records from October 14, 2026, where out-of-stock items bypassed validation."
```

#### Step 3
- **Tag:** TOOL DEFINITION
- **Label:** Tool definitions: SQL Execution
- **Tokens:** +960
- **Running total:** 1,730 / 128,000 (1.4%)
- **Caption:** Tool accepts raw SQL query strings and dumps returned rows directly into context.

Content:

```text
database_sql_query(sql_query: string)
  "Executes SQL queries against Postgres replica. Returns JSON array of rows."
```

#### Step 4
- **Tag:** ASSISTANT RESPONSE
- **Label:** Reasoning: Unconstrained SQL planning
- **Tokens:** +390
- **Running total:** 2,120 / 128,000 (1.7%)
- **Caption:** Agent fails to specify a date filter (WHERE created_at >= ...) or a LIMIT clause!

Content:

```text
I will query the checkout_records table for orders with bypassed validations.
Query:
SELECT * FROM checkout_records WHERE validation_status = 'BYPASSED_OUT_OF_STOCK';
```

### ⚠ Section: effective context length crossed

#### Step 5 — STEP 1 · UNCONSTRAINED QUERY
- **Tag:** TOOL OUTPUT
- **Label:** Tool output: 142,000 Rows Dump
- **Tokens:** +104,000
- **Running total:** 106,120 / 128,000 (82.9%)
- **Flag:** CONTEXT FLOOD
- **Caption:** Unfiltered SQL dump injects 104,000 tokens! Usage surges to 106,120 / 128,000 (82.9%).

Content:

```text
[database_sql_query] Executed: SELECT * FROM checkout_records WHERE validation_status = 'BYPASSED_OUT_OF_STOCK';

Result:
[... 142,000 rows returned from January 2024 to October 2026 ...]
[Total payload size: 104,000 tokens]
[Row 1: 2024-01-02 ...]
[Row 84,210: 2026-10-14 ...]
[Row 142,000: 2026-10-17 ...]
```

#### Step 6
- **Tag:** ASSISTANT RESPONSE
- **Label:** Reasoning: Attention degradation past ECL
- **Tokens:** +1,800
- **Running total:** 107,920 / 128,000 (84.3%)
- **Flag:** CONTEXT ROT
- **Caption:** Context Rot: Overwhelmed by historical rows, the agent hallucinates that no Oct 14 records exist!

Content:

```text
Context: 106,120 / 128,000 tokens (82.9%).
Effective Context Length (102.4K) exceeded.
Attention mechanism degrades over massive row deluge.
Scanning history from 2024... Unable to isolate target transactions amidst historical noise.

Conclusion: No checkout records bypassed validation on October 14, 2026.
```

#### Step 7 — STEP 2 · DEGRADED RESPONSE
- **Tag:** ASSISTANT RESPONSE
- **Label:** Assistant Response: False Negation
- **Tokens:** +280
- **Running total:** 108,200 / 128,000 (84.5%)
- **Caption:** Downstream catastrophe: Real bug bypassed operations because the context window was flooded.

Content:

```text
Assistant: "I executed the query across checkout_records. My analysis shows that no checkout transactions bypassed out-of-stock validation on October 14, 2026."
```

**Final token count for this trajectory:** 108,200 / 128,000 (84.5%)

---

