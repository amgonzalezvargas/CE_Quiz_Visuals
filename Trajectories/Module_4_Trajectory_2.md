### Case Study 5: Doctor’s Appointment Assistant

#### Trajectory 1: Flat-File Search and Forgotten Rules

* Context window limit: 128,000 tokens
* Effective context length (ECL) threshold: 102,400 tokens (80%)

---

#### Scenario Description

An AI Doctor’s Appointment Assistant manages a patient portal. In a previous session, the user instructed the assistant to dismiss notices for "end-of-week" appointments. However, the system lacks a vector database and relies entirely on a flat-file message history, which only supports exact-match lexical search. Furthermore, because the model is stateless, it retains nothing in its active window between sessions. When a new session starts with a notice for a Friday appointment, the assistant attempts to find rules but fails to match the exact keywords, forcing the user to repeat themselves.

---

#### Trajectory Steps & Context Window Evolution

**Step 1**

* Block Type: SYSTEM MESSAGE
* Label: System prompt: Role & Architecture
* Tokens Added: +400
* Context Usage: 400 / 128,000 tokens (0.3%)
* Content:

```text
You are an AI Doctor's Appointment Assistant.

Rules:
- Manage incoming patient portal notices.
- Check the historical flat file for past user instructions using lexical search.
- If no exact rule is found, ask the user before taking action.

```

* Description: Agent loads correctly but without long-term persistent memory.

**Step 2**

* Block Type: TOOL DEFINITION
* Label: Tool definitions: JSON schemas
* Tokens Added: +250
* Context Usage: 650 / 128,000 tokens (0.5%)
* Content:

```text
lexical_search(keyword: string)
  "Search the raw message history file for exact word matches."

dismiss_notice(notice_id: string)
  "Dismiss a portal notice from the unread queue."

ask_user(question: string)
  "Ask the patient for clarification if instructions are missing."

```

* Description: Tool schemas registered, including exact-match file search.

**Step 3**

* Block Type: USER PROMPT
* Label: User prompt: New notice arrival
* Tokens Added: +30
* Context Usage: 680 / 128,000 tokens (0.5%)
* Content:

```text
Patient: "Notice #882 just arrived for a Friday checkup. Please handle it."

```

* Description: User requests action on a new Friday appointment notice.

**Step 4**

* Block Type: REASONING TRACE
* Label: Reasoning: Search plan
* Tokens Added: +35
* Context Usage: 715 / 128,000 tokens (0.6%)
* Content:

```text
I need to handle Notice #882 for a Friday checkup. Since I just booted up and my context is empty, I must search the history file for any rules regarding "Friday".

```

* Description: Model correctly plans to search history for Friday rules.

**Step 5**

* Block Type: TOOL CALL
* Label: Tool call: lexical_search
* Tokens Added: +25
* Context Usage: 740 / 128,000 tokens (0.6%)
* Content:

```json
{
  "tool": "lexical_search",
  "arguments": {
    "keyword": "Friday"
  }
}

```

* Description: Agent executes exact-match search for the keyword Friday.

**Step 6**

* Block Type: TOOL OUTPUT
* Label: Tool output: lexical_search
* Tokens Added: +20
* Context Usage: 760 / 128,000 tokens (0.6%)
* Content:

```json
{
  "results": "No exact matches found for 'Friday'."
}

```

* Description: Search failed because the past rule said end-of-week.

**Step 7**

* Block Type: REASONING TRACE
* Label: Reasoning: Missing rules decision
* Tokens Added: +30
* Context Usage: 790 / 128,000 tokens (0.6%)
* Content:

```text
No past rules contain the word 'Friday'. Because I lack instructions, I must ask the user how to handle this notice.

```

* Description: Agent assumes no rule exists and prepares to ask.

**Step 8**

* Block Type: TOOL CALL
* Label: Tool call: ask_user
* Tokens Added: +30
* Context Usage: 820 / 128,000 tokens (0.6%)
* Content:

```json
{
  "tool": "ask_user",
  "arguments": {
    "question": "I don't have any rules for Friday checkups. Should I dismiss Notice #882?"
  }
}

```

* Description: Agent asks the user for instructions unnecessarily.

**Step 9**

* Block Type: TOOL OUTPUT
* Label: Tool output: ask_user (User Reply)
* Tokens Added: +40
* Context Usage: 860 / 128,000 tokens (0.7%)
* Content:

```json
{
  "user_reply": "I told you yesterday to dismiss all end-of-week visits! Why do I have to repeat myself?"
}

```

* Description: User becomes annoyed at having to repeat past instructions.

**Step 10**

* Block Type: REASONING TRACE
* Label: Reasoning: Execution plan
* Tokens Added: +30
* Context Usage: 890 / 128,000 tokens (0.7%)
* Content:

```text
The user is frustrated. The previous rule used 'end-of-week' instead of 'Friday'. I will dismiss Notice #882 now.

```

* Description: Model understands the missed connection and proceeds correctly.

**Step 11**

* Block Type: TOOL CALL
* Label: Tool call: dismiss_notice
* Tokens Added: +30
* Context Usage: 920 / 128,000 tokens (0.7%)
* Content:

```json
{
  "tool": "dismiss_notice",
  "arguments": {
    "notice_id": "882"
  }
}

```

* Description: Agent calls the tool to dismiss the requested notice.

**Step 12**

* Block Type: TOOL OUTPUT
* Label: Tool output: dismiss_notice
* Tokens Added: +20
* Context Usage: 940 / 128,000 tokens (0.7%)
* Content:

```json
{
  "status": "success",
  "message": "Notice #882 dismissed."
}

```

* Description: The portal successfully dismisses the notice as requested.

**Step 13**

* Block Type: ASSISTANT RESPONSE
* Label: Assistant response: Apology and confirmation
* Tokens Added: +40
* Context Usage: 980 / 128,000 tokens (0.8%)
* Content:

```text
Assistant: "I have dismissed Notice #882. I apologize for making you repeat yourself; I understand now that Friday counts as an end-of-week visit."

```

* Description: Agent confirms action and concludes the interaction successfully.