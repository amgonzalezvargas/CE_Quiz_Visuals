# Case study 1: Customer Service Agent

## Context Window Explorer — plain-text story

### Scenario description
An online footwear retailer uses an AI customer service agent to handle post-purchase requests. A customer purchased trail running shoes in Size 8 for $120 (Order #4412, delivered Oct 1st) that are too tight. They reach out to the assistant asking to exchange them for a Size 8.5.

Each trajectory below lists its timeline steps in the order they appear in the Context Window Explorer.
Token figures: "+N" is the delta added by that step; "Running total" is the value shown in the Context Window Usage meter after the step is revealed.

---

## Trajectory 1: Information Quality (Poisoning & Clash)

- Context window limit: 128,000 tokens
- Effective context length (ECL) marker: 102,400 tokens (80%)

#### Step 1 — SHARED FOUNDATION
- **Tag:** SYSTEM MESSAGE
- **Label:** System prompt: Role & Rules
- **Tokens:** +550
- **Running total:** 550 / 128,000 (0.4%)
- **Caption:** System prompt establishes agent persona and operational rules.

Content:

```text
You are an AI customer service agent for an online footwear retailer.

Rules:
  - Verify order details before taking actions
  - Consult policy documentation for exchange eligibility
  - Assist customers with size swaps and returns
```

#### Step 2
- **Tag:** USER PROMPT
- **Label:** User prompt: Exchange request
- **Tokens:** +140
- **Running total:** 690 / 128,000 (0.5%)
- **Caption:** Customer contacts customer support asking to exchange Size 8 for Size 8.5.

Content:

```text
Customer: "Hi! I ordered trail running shoes in Size 8 (Order #4412, delivered Oct 1st), but they are too tight. Can I swap them for a Size 8.5?"
```

#### Step 3
- **Tag:** TOOL DEFINITION
- **Label:** Tool definitions: JSON schemas
- **Tokens:** +480
- **Running total:** 1,170 / 128,000 (0.9%)
- **Caption:** Tools provided to the agent harness in the context window.

Content:

```text
LookupOrder(order_id: string)
  "Retrieve order details and delivery date."

SearchPolicies(file_name: string)
  "Query company policy documentation repository."

ExchangeItemSize(order_id: string, target_size: string)
  "Swap an item for another size."
```

#### Step 4 — SHARED STARTING WORKFLOW
- **Tag:** TOOL OUTPUT
- **Label:** Tool output: LookupOrder
- **Tokens:** +1,200
- **Running total:** 2,370 / 128,000 (1.9%)
- **Caption:** Harness executes LookupOrder: Confirms delivery on Oct 1st.

Content:

```text
[LookupOrder] order_id: "4412"
{
  "delivery_date": "2025-10-01",
  "item": "Trail Runner Pro",
  "size": "8.0",
  "status": "DELIVERED"
}
```

### ⚠ Section: Failure 1: Context Poisoning (Outdated Document Ingested)

#### Step 5 — STEP 1 · CONTEXT POISONING
- **Tag:** TOOL OUTPUT
- **Label:** Tool output: Stale 14-Day Policy
- **Tokens:** +95,000
- **Running total:** 97,370 / 128,000 (76.1%)
- **Flag:** POISONED
- **Caption:** Context Poisoning: Search tool returns outdated 14-day policy file with no timestamp!

Content:

```text
[SearchPolicies] file_name: "exchanges.txt"
=== Legacy Policy Manual (v1.2) ===
[... 95,000 tokens of warehouse procedures ...]
Section 4.1: "All exchanges must be requested within 14 calendar days of delivery. Ineligible after day 14."
(No timestamp or deprecation warning in file!)
```

#### Step 6
- **Tag:** ASSISTANT RESPONSE
- **Label:** Reasoning: False rejection from poisoned context
- **Tokens:** +1,400
- **Running total:** 98,770 / 128,000 (77.2%)
- **Flag:** POISONED
- **Caption:** Model reasons over stale context and incorrectly concludes customer is ineligible.

Content:

```text
Context: 97,370 tokens.
Delivery date: October 1st (>14 days ago).
Per Section 4.1 in exchanges.txt, exchange window has expired.

Decision: Reject customer's exchange request.
```

#### Step 7
- **Tag:** ASSISTANT RESPONSE
- **Label:** Assistant Response: Erroneous Denial
- **Tokens:** +180
- **Running total:** 98,950 / 128,000 (77.3%)
- **Caption:** Customer receives a false rejection due to uncurated data store.

Content:

```text
Assistant: "I looked up your order #4412. Because it was delivered on October 1st, it is past our 14-day exchange window and no longer eligible for a swap."
```

### ⚠ Section: Failure 2: Context Clash (Contradictory Policies in Context)

#### Step 8 — STEP 2 · CONTEXT CLASH
- **Tag:** USER PROMPT
- **Label:** User prompt: Customer pushes back
- **Tokens:** +120
- **Running total:** 99,070 / 128,000 (77.4%)
- **Caption:** Customer pushes back with the printed 60-day guarantee from the product packaging.

Content:

```text
Customer: "Wait! The card inside my shoebox says '60-Day Fit Guarantee — Free Swaps'. Why are you telling me 14 days?"
```

#### Step 9
- **Tag:** TOOL OUTPUT
- **Label:** Tool output: New 60-Day Policy
- **Tokens:** +4,200
- **Running total:** 103,270 / 128,000 (80.7%)
- **Flag:** CLASH
- **Caption:** Context Clash: 14-day policy and 60-day policy now both sit in context with no date hierarchy!

Content:

```text
[SearchPolicies] file_name: "policies_v2.txt"
Section 1.0: "60-Day Fit Guarantee allows free size swaps up to 60 days post-delivery at zero charge."
```

#### Step 10
- **Tag:** ASSISTANT RESPONSE
- **Label:** Reasoning: Model confusion over conflicting records
- **Tokens:** +1,100
- **Running total:** 104,370 / 128,000 (81.5%)
- **Flag:** CLASH
- **Caption:** Context Clash: Inconsistent facts collide; model is forced into guesswork.

Content:

```text
Two conflicting policies exist in context:
- exchanges.txt: "14 calendar days"
- policies_v2.txt: "60-Day Fit Guarantee"
Neither file indicates which document is authoritative or when it was enacted.
Model must guess or infer which rule overrides the other.
```

**Final token count for this trajectory:** 104,370 / 128,000 (81.5%)

---

## Trajectory 2: Action Selection (Context Confusion)

- Context window limit: 128,000 tokens
- Effective context length (ECL) marker: 102,400 tokens (80%)

#### Step 1 — SHARED FOUNDATION
- **Tag:** SYSTEM MESSAGE
- **Label:** System prompt: Role & Rules
- **Tokens:** +550
- **Running total:** 550 / 128,000 (0.4%)
- **Caption:** System prompt initialized.

Content:

```text
You are an AI customer service agent for an online footwear retailer.

Rules:
  - Handle order exchanges and returns accurately
  - Protect customer purchase value and promotional discounts
```

#### Step 2
- **Tag:** USER PROMPT
- **Label:** User prompt: Exchange request
- **Tokens:** +140
- **Running total:** 690 / 128,000 (0.5%)
- **Caption:** Customer initiates exchange request.

Content:

```text
Customer: "Hi! I ordered trail running shoes in Size 8 (Order #4412, delivered Oct 1st), but they are too tight. Can I swap them for a Size 8.5?"
```

#### Step 3
- **Tag:** TOOL DEFINITION
- **Label:** Tool definitions: Overlapping descriptions
- **Tokens:** +520
- **Running total:** 1,210 / 128,000 (0.9%)
- **Caption:** Context Confusion Root Cause: Overlapping, ambiguous tool docstrings.

Content:

```text
LookupOrder(order_id: string)
  "Look up order information and delivery date."

ExchangeItemSize(order_id: string, target_size: string)
  "Swap an item for another size."

ReturnForStoreCredit(order_id: string)
  "Process return or cancellation and issue store credit for order."
```

#### Step 4
- **Tag:** MEMORY
- **Label:** Memory: Price history
- **Tokens:** +420
- **Running total:** 1,630 / 128,000 (1.3%)
- **Caption:** Shoes increased by $40: Store credit will leave the customer short of re-ordering!

Content:

```text
Customer: Account #89201
Order #4412 promo price: $120.00
Current Trail Runner Pro retail price: $160.00 (+$40 price gap!)
```

#### Step 5 — STEP 1 · POLICY LOOKUP SUCCEEDS
- **Tag:** TOOL OUTPUT
- **Label:** Tool output: Verified 60-Day Policy
- **Tokens:** +1,800
- **Running total:** 3,430 / 128,000 (2.7%)
- **Flag:** ELIGIBLE
- **Caption:** Policy check succeeds! Customer is confirmed eligible for a free swap to Size 8.5.

Content:

```text
[SearchPolicies] active_policy: "policies_current.txt"
"Section 1.0: 60-Day Fit Guarantee permits free size swaps up to 60 days post-delivery."
Status: ELIGIBLE.
```

### ⚠ Section: Imprecise phrasing meets ambiguous tool definitions

#### Step 6 — STEP 2 · IMPRECISE PHRASING
- **Tag:** USER PROMPT
- **Label:** User prompt: Colloquial phrasing
- **Tokens:** +90
- **Running total:** 3,520 / 128,000 (2.8%)
- **Caption:** Customer uses colloquial words "cancel or return" alongside "swap".

Content:

```text
Customer: "Great, I'm impatient for my run! Please just cancel or return the Size 8 order so I can swap for the Size 8.5 quickly!"
```

#### Step 7
- **Tag:** ASSISTANT RESPONSE
- **Label:** Reasoning: Context Confusion
- **Tokens:** +1,250
- **Running total:** 4,770 / 128,000 (3.7%)
- **Flag:** CONFUSION
- **Caption:** Context Confusion: Ambiguous tool descriptions trick the model into picking the cancellation tool!

Content:

```text
Customer said: "cancel or return the Size 8 order".
Comparing tool definitions:
- ExchangeItemSize: "Swap an item for another size"
- ReturnForStoreCredit: "Process return or cancellation and issue store credit for order"
The word 'cancel/return' strongly aligns with ReturnForStoreCredit.
Selecting ReturnForStoreCredit tool.
```

#### Step 8 — STEP 3 · CATASTROPHIC ACTION
- **Tag:** TOOL OUTPUT
- **Label:** Tool output: ReturnForStoreCredit
- **Tokens:** +750
- **Running total:** 5,520 / 128,000 (4.3%)
- **Flag:** WRONG ACTION
- **Caption:** Catastrophic outcome: Customer loses shoes and is $40 short due to action selection failure.

Content:

```text
[ReturnForStoreCredit] order_id: "4412"
Result: Order cancelled. $120.00 store credit issued to customer.

CATASTROPHE:
- Shoes now cost $160.00.
- Customer loses shoes and is $40.00 short of re-ordering the Size 8.5!
- Intended exchange completely failed.
```

**Final token count for this trajectory:** 5,520 / 128,000 (4.3%)

---

## Trajectory 3: Volume & Noise (Distraction & Rot)

- Context window limit: 128,000 tokens
- Effective context length (ECL) marker: 102,400 tokens (80%)

#### Step 1 — SHARED FOUNDATION
- **Tag:** SYSTEM MESSAGE
- **Label:** System prompt: Customer Service Agent
- **Tokens:** +550
- **Running total:** 550 / 128,000 (0.4%)
- **Caption:** Harness configured with general search and order tools.

Content:

```text
You are an AI customer service agent for an online footwear retailer.

Tools:
  - LookupOrder
  - ExchangeItemSize
  - WebSearch (for athletic events and race inquiries)
```

#### Step 2
- **Tag:** USER PROMPT
- **Label:** User prompt: Exchange request
- **Tokens:** +140
- **Running total:** 690 / 128,000 (0.5%)
- **Caption:** Customer initiates exchange request with Order #4412.

Content:

```text
Customer: "Hi! I ordered trail running shoes in Size 8 (Order #4412, delivered Oct 1st), but they are too tight. Can I swap them for a Size 8.5?"
```

#### Step 3
- **Tag:** TOOL OUTPUT
- **Label:** Tool output: LookupOrder
- **Tokens:** +1,200
- **Running total:** 1,890 / 128,000 (1.5%)
- **Caption:** Order details verified.

Content:

```text
[LookupOrder] order_id: "4412", delivery_date: "2025-10-01", item: "Trail Runner Pro"
```

### ⚠ Section: Failure 1: Context Distraction (Raw Web Dump)

#### Step 4 — STEP 1 · OFF-TOPIC QUESTION
- **Tag:** USER PROMPT
- **Label:** User prompt: Side question
- **Tokens:** +110
- **Running total:** 2,000 / 128,000 (1.6%)
- **Caption:** Customer asks an off-topic side question during the exchange.

Content:

```text
Customer: "Also, while you're checking, what are the Boston Marathon qualifying standards and event cancellation policies for age 35?"
```

#### Step 5
- **Tag:** TOOL OUTPUT
- **Label:** Tool output: Raw WebSearch HTML
- **Tokens:** +14,000
- **Running total:** 16,000 / 128,000 (12.5%)
- **Flag:** DISTRACTION
- **Caption:** Context Distraction: Raw uncleaned HTML injects 14,000 tokens of irrelevant noise!

Content:

```text
[WebSearch] query: "Boston Marathon qualifying standards age 35"
<!DOCTYPE html><html><head><style>/* ads */</style>[... 14,000 tokens of raw HTML, tracking pixels, ads, navigation bars, and marathon refund policies ...]</head><body><div>Qualifying standard: 3:35:00</div></body></html>
```

### ⚠ Section: Failure 2: Context Rot Past Effective Context Length

#### Step 6 — STEP 2 · PROMPT SATURATION
- **Tag:** USER PROMPT
- **Label:** Multi-turn chat accumulation
- **Tokens:** +94,000
- **Running total:** 110,000 / 128,000 (85.9%)
- **Flag:** CONTEXT ROT
- **Caption:** Context fills to 110,000 tokens, crossing the Effective Context Length!

Content:

```text
[Over multiple subsequent conversational turns discussing training schedules, socks, and shipping options, context expands to 110,000 tokens]
[Total Context Usage: 110,000 / 128,000 tokens (85.9%)]
[Crossed Effective Context Length (ECL) threshold of 80% (102.4K)]
```

#### Step 7 — STEP 3 · FINALIZING THE SWAP
- **Tag:** USER PROMPT
- **Label:** User prompt: Finalize swap
- **Tokens:** +80
- **Running total:** 110,080 / 128,000 (86.0%)
- **Caption:** Customer asks the agent to finish the original swap.

Content:

```text
Customer: "Awesome. Now let's finalize the Size 8.5 shoe swap!"
```

#### Step 8
- **Tag:** ASSISTANT RESPONSE
- **Label:** Reasoning: Memory loss past ECL
- **Tokens:** +1,500
- **Running total:** 111,580 / 128,000 (87.2%)
- **Flag:** MEMORY ROT
- **Caption:** Context Rot: Attention degradation causes the agent to forget Order #4412 completely!

Content:

```text
Context: 111,580 tokens (past Effective Context Length).
Attention mechanism degraded across massive web HTML and long turns.
Searching context for order number... Unable to locate early order details buried in the middle.

Decision: Ask customer for the order number again.
```

#### Step 9
- **Tag:** ASSISTANT RESPONSE
- **Label:** Assistant Response: Forgotten Order
- **Tokens:** +220
- **Running total:** 111,800 / 128,000 (87.3%)
- **Caption:** Severe friction: Customer must re-provide details already stated at the start of the chat.

Content:

```text
Assistant: "I'd be glad to process your Size 8.5 swap! Could you please remind me of your order number and purchase date so I can get started?"
```

**Final token count for this trajectory:** 111,800 / 128,000 (87.3%)

---

