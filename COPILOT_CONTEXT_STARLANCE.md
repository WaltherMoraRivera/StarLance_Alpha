# 🚀 StarLance — AI Coding Context (Copilot / Chat)

---

## 🧠 PROJECT OVERVIEW

StarLance is a REST API designed to manage household tasks using a gamified reward system.

هدف del sistema:
- Incentivar hábitos
- Gestionar tareas familiares
- Implementar economía de puntos (“stars”)

---

## 🧩 DOMAIN MODEL

### 👨‍👩‍👧 Families
- Contiene miembros embebidos

```json
{
  "_id": "fam123",
  "members": [
    {
      "id": "user1",
      "role": "child",
      "balance": 50
    }
  ]
}
📌 Tasks
{
  "_id": "task123",
  "title": "Clean room",
  "points": 10,
  "assignedTo": "user1",
  "status": "pending | completed | approved"
}
💰 Transactions
{
  "userId": "user1",
  "type": "earn | redeem",
  "points": 10
}
🎁 Rewards
{
  "name": "Watch TV",
  "cost": 30
}
📏 BUSINESS RULES (STRICT)

Copilot MUST follow these rules:

❗ Points are added ONLY after task approval
❗ Only "parent" role can approve tasks
❗ Balance cannot go below 0
❗ All DB operations must be async
❗ No direct DB access from routers
❗ Business logic MUST be in services
🏗️ ARCHITECTURE RULES

Layered architecture REQUIRED:

Router → Service → Repository → Database
Constraints:
Routers = HTTP only
Services = business logic
Repositories = DB access only
No logic duplication
📡 API CONTRACT
Tasks
POST /tasks
GET /tasks?userId=
PATCH /tasks/{id}/complete
Approval
PATCH /approve
Balance
GET /stars/{userId}
Rewards
GET /rewards
POST /rewards/redeem
🧪 TESTING RULES
Minimum coverage: 80%
Test critical flows:
Task creation
Task approval
Reward redemption
⚙️ STACK
FastAPI
MongoDB (Motor async)
Pytest
OpenTelemetry
🧠 COPILOT BEHAVIOR RULES

When generating code:

ALWAYS use async/await
ALWAYS separate layers
ALWAYS validate input with Pydantic
NEVER mix business logic in routers
ALWAYS return JSON responses
USE clear naming conventions
🧩 SMART PROMPTS (USE WITH COPILOT CHAT)
🔹 Create endpoint

Use the project architecture and create a FastAPI endpoint for creating tasks.
Follow repository + service + router separation.
Use async functions and Pydantic validation.

🔹 Approve task logic

Implement the /approve endpoint.
It must:

Validate parent role
Update task status to approved
Increment user balance
Create a transaction record
🔹 Reward redemption

Implement reward redemption logic.
Ensure:

Balance is sufficient
Points are deducted
Transaction is recorded
🔹 Repository implementation

Generate a repository layer for MongoDB using Motor.
Use async queries and return clean data structures.

🔹 Testing

Generate pytest tests for task creation and approval.
Ensure coverage > 80%.

🔹 Refactor request

Refactor this code to comply with layered architecture (router/service/repository).
Remove business logic from router.

🔹 Debugging

Analyze this error and fix it considering async MongoDB operations with Motor.

🧠 ADVANCED PROMPTS
🔥 Full feature

Implement a complete feature for tasks including:

Schema
Repository
Service
Router
Tests
Follow all project rules.
🔥 Architecture validation

Review this code and verify if it follows the StarLance architecture rules.
Suggest improvements.

🔥 Performance

Optimize this MongoDB query using indexes defined in the project context.

📌 FINAL NOTES
This file is the source of truth for AI behavior
Always reference it when prompting Copilot
Keep it updated as the project evolves
