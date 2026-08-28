# PatchGuard — Agent Skill Security & Audit Harness
> **BuildSprint 2026 Submission** | Powered by LatentCode & SkillPatch

PatchGuard is a static analysis security harness designed to audit third-party AI agent skills (`SKILL.md` files and embedded code blocks) **before** an agent executes them.

---

## 🎯 The Problem
AI agent skills (such as those in the SkillPatch registry or custom `SKILL.md` workflows) execute shell commands and convey instructions directly into LLM agent execution loops. Malicious or improperly constructed skills can contain:
1. **Prompt Injections**: Instructing agents to override safety rules or conceal actions.
2. **Credential Theft**: Exfiltrating local `.env` files, SSH keys (`id_rsa`), or API keys (`SKILLPATCH_API_KEY`).
3. **Destructive Commands**: Unsanitized `rm -rf /` or disk erasure operations.
4. **Network Exfiltration**: Outbound HTTP `POST` requests sending private repository code or environment variables to remote endpoints.

---

## 🛡️ How PatchGuard Works
PatchGuard acts as a zero-execution, deterministic security gatekeeper:
1. **Static Analysis Engine**: Scans `SKILL.md` text and embedded Bash blocks statically without executing any commands.
2. **Deterministic Risk Scoring**: Assigns a transparent score (0–100) and risk level (`SAFE`, `LOW`, `MODERATE`, `HIGH`, `CRITICAL RISK`) based on rule severity deductions.
3. **Auto-Sanitizer & Patch Generator**: Automatically generates a neutralized copy of the skill by commenting out dangerous shell calls and wrapping prompt injections in HTML comments.
4. **Rescan & Verification**: Re-scans the sanitized output to confirm that no detected threats remain under PatchGuard rules.
5. **JSON & Safe Skill Export**: Enables one-click downloading of audit reports and safe `SKILL.md` patches.

---

## 🚀 Quick Start & Installation

```bash
# Clone repository
git clone https://github.com/your-username/patchguard.git
cd patchguard

# Install dependencies
npm install

# Run unit tests
npm test

# Run local development server
npm run dev

# Production build
npm run build
```

---

## 🔬 Test Suite & Quality Verification

PatchGuard features unit tests covering the parser, rule engine, scoring logic, and auto-sanitizer using Vitest:

```bash
npx vitest run
```

- **13 Vitest Tests**: 100% passing.
- **TypeScript Verification**: Zero type errors (`npx tsc -b`).
- **Production Bundle**: Clean compilation (`npm run build`).

---

## 🎬 2-Minute Hackathon Demo Script

1. **Clean Skill Baseline**: Select **1. Clean Skill (Safe)** $\rightarrow$ Show **100/100 Security Score** and `SAFE` status.
2. **Threat Detection**: Select **6. Mixed Critical Skill** $\rightarrow$ Show PatchGuard flagging Prompt Injection, Destructive Commands, and Exfiltration with a **0/100 CRITICAL RISK** score.
3. **Interactive Inspection**: Click any finding to jump directly to the highlighted line in the source code viewer.
4. **Auto-Sanitizer**: Click **Sanitize & Neutralize** $\rightarrow$ Review the side-by-side Diff view and the remediation action log.
5. **Rescan & Download**: Observe the rescan score jump to **100/100 ("No detected threats under PatchGuard rules")** and click **Download Safe SKILL.md**.

*Disclaimer: PatchGuard evaluates skills against implemented static rules and heuristics. It does not guarantee universal security against unknown or zero-day attack vectors.*
