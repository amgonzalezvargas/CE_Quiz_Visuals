### Case Study: FreshCart Coding Agent

#### Trajectory: Severed Structural Boundaries (Naive Character Chunking)

* Context window limit: 32,768 tokens


* Effective context length (ECL) threshold: 26,214 tokens (80%)

---

#### Scenario Description

A backend engineer at FreshCart investigates storage temperature rules for fresh produce. The engineer asks an autonomous coding agent to determine the allowed values and validation logic for the `temperature_zone` attribute in the `InventoryItem` model class. Unknown to the engineer, the codebase was ingested into the vector database using fixed character-count splitting without language-aware syntax parsing.

---

#### Trajectory Steps & Context Window Evolution

**Step 1**

* Block Type: SYSTEM MESSAGE
* Label: System prompt: Role & Rules
* Tokens Added: +410
* Context Usage: 410 / 32,768 tokens (1.3%)
* Content:

```text
You are an autonomous software engineering assistant for the FreshCart platform.

Rules:
- Inspect codebase implementations using your search tools.
- Ground all answers strictly in retrieved chunk contents; do not invent unstated fields or logic.
- Cite file paths, line numbers, and model declarations in your final response.

```

* Description: Agent initialized with system instructions and codebase role.

**Step 2**

* Block Type: TOOL DEFINITION
* Label: Tool definitions: Code search
* Tokens Added: +320
* Context Usage: 730 / 32,768 tokens (2.2%)
* Content:

```text
SearchCode(query: string, top_k: integer)
  "Execute a ranked search across indexed source code chunks. Returns matched code fragments along with file path and line number metadata."

```

* Description: Code retrieval tool registered for the active session.

**Step 3**

* Block Type: USER PROMPT
* Label: User prompt: Model field inspection
* Tokens Added: +50
* Context Usage: 780 / 32,768 tokens (2.4%)
* Content:

```text
What are the allowed values and validation rules for the temperature_zone field in the InventoryItem model?

```

* Description: Engineer asks for field validation details in a model.

**Step 4**

* Block Type: TOOL CALL
* Label: Tool call: SearchCode
* Tokens Added: +35
* Context Usage: 815 / 2.5%)
* Content:

```json
{
  "tool": "SearchCode",
  "arguments": {
    "query": "class InventoryItem BaseModel temperature_zone",
    "top_k": 1
  }
}

```

* Description: Agent initiates a code search for the target class.

**Step 5**

* Block Type: TOOL OUTPUT
* Label: Tool output: SearchCode
* Tokens Added: +240
* Context Usage: 1,055 / 32,768 tokens (3.2%)
* Content:

```json
[
  {
    "metadata": {
      "file_path": "freshcart/inventory/models.py",
      "chunk_id": "chunk_0412",
      "start_line": 15,
      "end_line": 31
    },
    "chunk_content": "class InventoryItem(BaseModel):\n    \"\"\"Represents stored grocery stock units within warehouse facilities.\"\"\"\n    sku: str = Field(..., description=\"Unique product SKU\")\n    name: str = Field(..., max_length=120)\n    unit_price: Decimal = Field(gt=0)\n    aisle_number: int = Field(ge=1, le=99)"
  }
]

```

* Description: Retrieved code snippet abruptly ends halfway through the class.

**Step 6**

* Block Type: REASONING TRACE
* Label: Reasoning: Field evaluation over retrieved class definition
* Tokens Added: +85
* Context Usage: 1,140 / 32,768 tokens (3.5%)
* Content:

```text
The retrieved chunk from freshcart/inventory/models.py contains the complete header and body for class InventoryItem:
- sku (str)
- name (str)
- unit_price (Decimal)
- aisle_number (int)

The requested attribute 'temperature_zone' is not defined inside the InventoryItem model.
I have sufficient context to conclude that this field does not exist on the model.

```

* Description: Agent incorrectly assumes the missing field does not exist.

**Step 7**

* Block Type: ASSISTANT RESPONSE
* Label: Assistant response: Erroneous field absence report
* Tokens Added: +110
* Context Usage: 1,250 / 32,768 tokens (3.8%)
* Content:

```text
According to `freshcart/inventory/models.py` (lines 15–31), the `InventoryItem` model defines the following fields:
- `sku` (str)
- `name` (str)
- `unit_price` (Decimal)
- `aisle_number` (int)

There is no `temperature_zone` field or validation rule declared in the `InventoryItem` model.

```

* Description: Agent provides an inaccurate answer based on incomplete text.