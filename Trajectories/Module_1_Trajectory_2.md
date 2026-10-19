### Case Study 1: Customer Service Agent

#### Trajectory 2: Rapid Context Window Saturation

* Context window limit: 128,000 tokens
* Effective context length (ECL) threshold: 102,400 tokens (80%)

---

#### Scenario Description

An online footwear retailer uses an AI customer service agent to handle complex post-purchase fulfillment requests. A customer purchased trail running shoes in Size 8 for $120 (Order #4412) that fit too tightly. The customer contacts support seeking to exchange them for a Size 8.5 and requests immediate same-day re-routing from any regional distribution hub that has stock. To evaluate this request, the agent must orchestrate multi-step queries across order history, nationwide warehouse stock, and regional freight dispatch logs.

---

#### Trajectory Steps & Context Window Evolution

**Step 1**

* Block Type: SYSTEM MESSAGE
* Label: System prompt: Role & Rules
* Tokens Added: +550
* Context Usage: 550 / 128,000 tokens (0.4%)
* Content:

```text
You are an AI customer service agent for an online footwear retailer.

Rules:
- Verify customer order details and evaluate replacement stock availability.
- Coordinate with warehouse fulfillment systems to find routing solutions for size exchanges.
- Gather necessary operational data before completing or escalating fulfillment requests.

```

* Description: Agent initialized with operational instructions and persona.

**Step 2**

* Block Type: TOOL DEFINITION
* Label: Tool definitions: JSON schemas
* Tokens Added: +480
* Context Usage: 1,030 / 128,000 tokens (0.8%)
* Content:

```text
LookupOrder(order_id: string)
  "Retrieve customer order details, item records, and complete transaction history."

CheckRegionalStock(sku: string)
  "Search inventory availability across all national distribution centers."

GetFulfillmentRouting(origin_hubs: array, destination_zip: string)
  "Retrieve transit carrier waypoints, hub freight schedules, and dispatch telemetry."

ExchangeItemSize(order_id: string, target_size: string)
  "Submit a replacement size request for an eligible delivered item."

```

* Description: Tool definitions and parameters loaded into agent environment.

**Step 3**

* Block Type: USER PROMPT
* Label: User prompt: Complex exchange request
* Tokens Added: +140
* Context Usage: 1,170 / 128,000 tokens (0.9%)
* Content:

```text
Customer: "Hi! My Trail Runner Pro shoes in Size 8 (Order #4412) are too tight. Can I swap them for an 8.5? If possible, check which regional warehouses have them and can route them out today."

```

* Description: Customer requests size swap and warehouse availability check.

**Step 4**

* Block Type: TOOL CALL
* Label: Tool call: LookupOrder
* Tokens Added: +40
* Context Usage: 1,210 / 128,000 tokens (0.9%)
* Content:

```json
{
  "tool": "LookupOrder",
  "arguments": {
    "order_id": "4412"
  }
}

```

* Description: Agent invokes tool to retrieve complete order history.

**Step 5**

* Block Type: TOOL OUTPUT
* Label: Tool output: LookupOrder
* Tokens Added: +7,800
* Context Usage: 9,010 / 128,000 tokens (7.0%)
* Content:

```text
[LookupOrder] order_id: "4412"
{
  "order_id": "4412",
  "sku": "TRP-M-080",
  "replacement_sku_85": "TRP-M-085",
  "customer_id": "CUST-9921",
  "destination_zip": "98101",
  "order_status": "DELIVERED",
  "historical_account_records": [ ... 7,700 tokens of raw customer interactions, payment logs, and previous return manifests ... ]
}

```

* Description: Tool returns order data along with extensive historical logs.

**Step 6**

* Block Type: REASONING TRACE
* Label: Reasoning: Stock check planning
* Tokens Added: +90
* Context Usage: 9,100 / 128,000 tokens (7.1%)
* Content:

```text
The customer wants to swap SKU TRP-M-080 for Size 8.5 (SKU TRP-M-085) with same-day rerouting to zip code 98101.
I need to query inventory levels across all regional distribution centers for SKU TRP-M-085 to see where stock is available.

```

* Description: Model analyzes order and plans nationwide warehouse search.

**Step 7**

* Block Type: TOOL CALL
* Label: Tool call: CheckRegionalStock
* Tokens Added: +40
* Context Usage: 9,140 / 128,000 tokens (7.1%)
* Content:

```json
{
  "tool": "CheckRegionalStock",
  "arguments": {
    "sku": "TRP-M-085"
  }
}

```

* Description: Agent calls tool to check stock across regional hubs.

**Step 8**

* Block Type: TOOL OUTPUT
* Label: Tool output: CheckRegionalStock
* Tokens Added: +38,000
* Context Usage: 47,140 / 128,000 tokens (36.8%)
* Content:

```text
[CheckRegionalStock] sku: "TRP-M-085"
{
  "matching_facilities_count": 4,
  "inventory_payload": [
    ... 38,000 tokens of unpartitioned nationwide facility inventories, bin-level warehouse slotting logs, pallet receipts, and pending replenishment tables ...
  ]
}

```

* Description: Tool appends massive, unfiltered nationwide inventory manifests to memory.

**Step 9**

* Block Type: REASONING TRACE
* Label: Reasoning: Logistics routing planning
* Tokens Added: +110
* Context Usage: 47,250 / 128,000 tokens (36.9%)
* Content:

```text
Stock for Size 8.5 is confirmed at four regional hubs: Hub-East, Hub-Northwest, Hub-Central, and Hub-South.
To fulfill the customer's request for immediate routing to zip code 98101, I must pull transit schedules and carrier dispatch telemetry for these candidate facilities.

```

* Description: Model attempts routing calculation across regional distribution hubs.

**Step 10**

* Block Type: TOOL CALL
* Label: Tool call: GetFulfillmentRouting
* Tokens Added: +50
* Context Usage: 47,300 / 128,000 tokens (37.0%)
* Content:

```json
{
  "tool": "GetFulfillmentRouting",
  "arguments": {
    "origin_hubs": ["Hub-East", "Hub-Northwest", "Hub-Central", "Hub-South"],
    "destination_zip": "98101"
  }
}

```

* Description: Agent requests full logistics routing and carrier dispatch logs.

**Step 11**

* Block Type: TOOL OUTPUT
* Label: Tool output: GetFulfillmentRouting
* Tokens Added: +81,500
* Context Usage: 128,800 / 128,000 tokens (100.6%)
* Content:

```text
[GetFulfillmentRouting] destination_zip: "98101"
{
  "routing_status": "DATA_DUMP_COMPLETE",
  "telemetry_stream": [
    ... 81,500 tokens of multi-carrier dispatch timetables, interstate freight GPS tracking logs, terminal transit matrices, and weather delay advisories ...
  ]
}

```

* Description: Massive routing dump overflows the system's total storage limit.

**Step 12**

* Block Type: HARNESS ERROR
* Label: System error: Maximum token limit breached
* Tokens Added: +0
* Context Usage: 128,800 / 128,000 tokens (100.6%)
* Content:

```text
RuntimeError: Client error '400 Bad Request' from API endpoint.
Error code: context_length_exceeded.
Details: This model's maximum context length is 128000 tokens. However, your request accumulated 128800 tokens in the prompt context (input tokens exceeded limit by 800 tokens). Execution terminated.

```

* Description: Execution halts completely due to exceeding maximum allowed capacity.

---

### List of Changes and Reasons

* **1. Shifted Core Problem to Rapid Context Window Saturation**
* **Reason:** Rather than showing incorrect policy data (Context Poisoning) or off-topic web data (Context Distraction), this scenario demonstrates how multi-step agent actions and uncompressed intermediate tool returns compound so quickly that they fill and breach the entire context window in a few turns.


* **2. Compounding Intermediate Step Growth (Exponential Trajectory)**
* **Reason:** In M1V1, the script highlights how multi-step agent tasks grow intermediate context drastically with every tool execution. In this scenario, three successive operations inject +7,800 tokens, +38,000 tokens, and +81,500 tokens of raw payloads, mirroring the compounding growth taught in the course.


* **3. Kept Execution Lean and Complete (12 Steps)**
* **Reason:** The trace follows a strict, logical execution flow without skipping prerequisites: System Message -> Tool Definition -> User Request -> Tool Call 1 -> Tool Output 1 -> Reasoning Trace 1 -> Tool Call 2 -> Tool Output 2 -> Reasoning Trace 2 -> Tool Call 3 -> Tool Output 3 -> Harness Termination.


* **4. Realistic Hard Limit Breach (128,800 / 128,000 Tokens)**
* **Reason:** To isolate physical window saturation from attention degradation (Context Rot), the trajectory accumulates 128,800 tokens, directly crossing the 100% capacity mark (100.6%). Step 12 terminates with a runtime exception before the model can execute its next reasoning step.


* **5. Non-Technical Step Descriptions (Under 10 Words Each)**
* **Reason:** Every step includes an objective, plain-language description explaining what happened (and how the system failed at the end) without using technical terms like "saturation" or "context rot."