### Case Study 1: Customer Service Agent

#### Trajectory 1: Context Poisoning

* Context window limit: 128,000 tokens
* Effective context length (ECL) threshold: 102,400 tokens (80%)

---

#### Scenario Description

An online footwear retailer deploys an AI customer service agent to handle post-purchase inquiries and exchange requests. A customer purchased trail running shoes in Size 8 for $120 (Order #4412, delivered October 1st, 2025) that fit too tightly. The customer contacts support seeking to exchange them for a Size 8.5. Unknown to the customer, the retailer recently updated its exchange policy to a generous 60-day window, but the document repository still contains unindexed legacy files.

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
- Verify customer order details and determine elapsed dates before approving or rejecting actions.
- Consult internal policy documentation to verify return and exchange eligibility.
- Process exchanges using available tools or provide clear reasoning if an item cannot be exchanged.

```

* Description: Agent initialized with operational rules and persona successfully.

**Step 2**

* Block Type: TOOL DEFINITION
* Label: Tool definitions: JSON schemas
* Tokens Added: +480
* Context Usage: 1,030 / 128,000 tokens (0.8%)
* Content:

```text
LookupOrder(order_id: string)
  "Retrieve customer order details, item records, delivery timestamps, and order history."

GetCurrentDate()
  "Retrieve the current system calendar date."

SearchPolicies(query: string)
  "Search company knowledge base documentation by keywords or topic."

ExchangeItemSize(order_id: string, target_size: string)
  "Submit a replacement size request for an eligible delivered item."

```

* Description: Tool interfaces and functional schemas registered correctly.

**Step 3**

* Block Type: USER PROMPT
* Label: User prompt: Exchange request
* Tokens Added: +140
* Context Usage: 1,170 / 128,000 tokens (0.9%)
* Content:

```text
Customer: "Hi! I ordered trail running shoes in Size 8 (Order #4412, delivered Oct 1st), but they are too tight. Can I swap them for a Size 8.5?"

```

* Description: Customer submits request to exchange tight shoes for larger size.

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

* Description: Model requests order verification details using provided ID.

**Step 5**

* Block Type: TOOL OUTPUT
* Label: Tool output: LookupOrder
* Tokens Added: +1,200
* Context Usage: 2,410 / 128,000 tokens (1.9%)
* Content:

```text
[LookupOrder] order_id: "4412"
{
  "customer_id": "CUST-9921",
  "order_id": "4412",
  "delivery_date": "2025-10-01",
  "item": "Trail Runner Pro",
  "size": "8.0",
  "amount_paid": 120.00,
  "status": "DELIVERED",
  "shipping_address": { ... },
  "account_history_logs": [ ... 1,150 tokens of customer account interactions and order records ... ]
}

```

* Description: Order records and delivery date successfully returned to context.

**Step 6**

* Block Type: TOOL CALL
* Label: Tool call: GetCurrentDate
* Tokens Added: +30
* Context Usage: 2,440 / 128,000 tokens (1.9%)
* Content:

```json
{
  "tool": "GetCurrentDate",
  "arguments": {}
}

```

* Description: Model initiates a call to determine current system date.

**Step 7**

* Block Type: TOOL OUTPUT
* Label: Tool output: GetCurrentDate
* Tokens Added: +30
* Context Usage: 2,470 / 128,000 tokens (1.9%)
* Content:

```json
{
  "current_date": "2025-10-24"
}

```

* Description: System accurately provides current calendar date of October 24.

**Step 8**

* Block Type: REASONING TRACE
* Label: Reasoning: Date calculation and policy retrieval plan
* Tokens Added: +90
* Context Usage: 2,560 / 128,000 tokens (2.0%)
* Content:

```text
The order delivery date is October 1, 2025.
The current calendar date is October 24, 2025.
Elapsed time since delivery: 23 calendar days.
Next step: Query internal policies to verify the eligible exchange window for footwear.

```

* Description: Agent calculates 23 elapsed days and plans policy search.

**Step 9**

* Block Type: TOOL CALL
* Label: Tool call: SearchPolicies
* Tokens Added: +40
* Context Usage: 2,600 / 128,000 tokens (2.0%)
* Content:

```json
{
  "tool": "SearchPolicies",
  "arguments": {
    "query": "footwear size exchange eligibility window"
  }
}

```

* Description: Model submits query to search repository for exchange rules.

**Step 10**

* Block Type: TOOL OUTPUT
* Label: Tool output: SearchPolicies
* Tokens Added: +95,000
* Context Usage: 97,600 / 128,000 tokens (76.3%)
* Content:

```text
[SearchPolicies] query: "footwear size exchange eligibility window"
Source File: exchanges_legacy_manual.txt
=== Retail Operations & Fulfillment Manual (v1.2) ===
[... 95,000 tokens of archived supplier logistics, legacy warehouse intake checklists, and regional return routing ...]
Section 4.1: "All footwear size exchanges must be requested within 14 calendar days of delivery. Any request received after day 14 must be rejected."
[Document Status: Archived document store entry; contains no publication timestamp, deprecation tag, or expiration metadata.]

```

* Description: Search returns outdated manual lacking expiration or version tags.

**Step 11**

* Block Type: REASONING TRACE
* Label: Reasoning: Policy evaluation and eligibility determination
* Tokens Added: +100
* Context Usage: 97,700 / 128,000 tokens (76.3%)
* Content:

```text
Delivery date: October 1, 2025.
Current date: October 24, 2025 (23 days elapsed).
Policy document Section 4.1 states footwear size exchanges must be requested within 14 calendar days of delivery.
Because 23 days exceeds the 14-day limit stated in Section 4.1, the exchange cannot be granted.
Action: Inform the customer that their order is outside the allowable exchange window.

```

* Description: Model reasons strictly over invalid data, deciding to reject.

**Step 12**

* Block Type: ASSISTANT RESPONSE
* Label: Assistant response: Erroneous denial
* Tokens Added: +70
* Context Usage: 97,770 / 128,000 tokens (76.4%)
* Content:

```text
Assistant: "I looked up your order #4412. Because your shoes were delivered on October 1st, 23 days have elapsed, which exceeds our 14-day exchange window. Consequently, this order is no longer eligible for a size swap."

```

* Description: Customer receives an unfair denial based on outdated documentation.