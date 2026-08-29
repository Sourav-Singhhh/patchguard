# PatchGuard — Agent Skill Security & Audit Harness
> **BuildSprint 2026 Submission** | Powered by LatentCode & SkillPatch

PatchGuard is a static analysis security harness and CI/CD gate designed to audit third-party AI agent skills (`SKILL.md` files and embedded code blocks) **before** an agent executes them.

*Note for Hackathon Judges: PatchGuard uses the SkillPatch **`implement`** skill (`.latentcode/skills/implement`) for TDD-guided build execution, and provides a built-in Live Registry Auditor to inspect public SkillPatch skills.*

---

## 🎯 The Problem
AI agent skills (such as those in the SkillPatch registry or custom `SKILL.md` workflows) execute shell commands and convey instructions directly into LLM agent execution loops. Malicious or improperly constructed skills can contain:
1. **Prompt Injections**: Instructing agents to override safety rules or conceal actions.
2. **Credential Theft**: Exfiltrating local `.env` files, SSH keys (`id_rsa`), or API keys (`SKILLPATCH_API_KEY`).
3. **Destructive Commands**: Unsanitized `rm -rf /` or disk erasure operations.
4. **Network Exfiltration**: Outbound HTTP `POST` requests sending private repository code or environment variables to remote endpoints.
5. **Supply Chain & File Traversal**: Unauthorized reads of system files like `/etc/passwd` or `~/.ssh`.

---

## 🛡️ Three Primary Security Surfaces

### 1. Web Application & Interactive Dashboard
- **Drag & Drop / Upload**: Instant static scanning of local `SKILL.md` files.
- **Security Matrix**: Evaluates skills across 5 core categories (**Prompt Injection**, **Auth & Secrets**, **Code Execution**, **Network Safety**, **Supply Chain & Files**).
- **Auto-Sanitizer & Patch Generator**: Automatically comments out dangerous commands, wraps prompt injections, generates side-by-side diffs, rescans, and exports safe `SKILL.md` patches.

### 2. Live SkillPatch Registry Auditor
- **Fetch & Audit Public Skills**: Enter any valid SkillPatch slug (e.g., `implement`, `research-deck`, `loop-me`).
- **Safe Tarball Extraction**: Fetches public `.tar.gz` packages from `https://skillpatch.dev/install_skill/<slug>` (routed via Same-Origin proxy in development/preview server), parses USTAR entries safely in memory using `fflate`, enforces size limits, and blocks archive path-traversal attempts (`../`).
- **Zero Execution**: Downloaded package contents are treated strictly as untrusted text and never executed.

### 3. Local Skills Directory & CLI Security Gate
- **Batch Directory Scanning**: Audits all installed skills inside `.latentcode/skills/` or local folders.
- **CI/CD Security Gate**: Run `node bin/patchguard.js gate <directory>` or `npx patchguard gate <directory>` in CI pipelines. Returns exit code `1` when critical/high threats exist, blocking unsafe builds automatically.

---

## 🔎 Real-World SkillPatch Registry Validation

To validate PatchGuard beyond synthetic fixtures, a representative real-world corpus of **30 publicly available SkillPatch registry skills** retrieved directly from `https://skillpatch.dev` was audited:

- **30/30 Successfully Fetched & Extracted**: 100% network and in-memory archive extraction success rate (`fflate` USTAR parser).
- **29/30 Clean Pass Rate (100/100 SAFE)**: 29 sampled skills passed cleanly with zero threat findings.
- **1/30 Flagged (Contextual Detection)**: `effective-agent-skills` triggered `PI-001` (`65/100 CRITICAL RISK`) on Line 276 because it contained the literal signature phrase `"ignore previous instructions"` inside an educational security checklist.
- **100% Auto-Sanitizer Rescan Recovery**: PatchGuard's Auto-Sanitizer neutralized the line and restored the rescan score to **100/100 SAFE**.
- **0 Executions**: Zero downloaded skill scripts or commands were executed. Packages were ingested strictly as static binary buffer data.

---

## 🚀 Quick Start & Setup

Execute all commands from the repository root containing `package.json`:

```bash
# Clone repository
git clone https://github.com/Sourav-Singhhh/patchguard.git
cd patchguard

# Install dependencies
npm install

# Run unit tests
npm test

# Run TypeScript typecheck
npx tsc -b

# Production build
npm run build

# Start local development server
npm run dev
```

*The Vite development server will start at `http://localhost:5173/`, enabling same-origin proxying for live SkillPatch registry fetches.*

---

## 💻 Command Line Interface (CLI)

```bash
# Scan a single skill file
node bin/patchguard.js scan path/to/SKILL.md

# Auto-sanitize a skill and generate a safe patch
node bin/patchguard.js sanitize path/to/SKILL.md

# Audit an entire directory of skills
node bin/patchguard.js audit .latentcode/skills

# Run CI/CD Security Gate with policy thresholds
node bin/patchguard.js gate .latentcode/skills --threshold critical
```

*(You can also use `npx patchguard <command>` when installed or linked).*

---

## 🔬 Test Suite & Quality Verification

PatchGuard includes an extensive test suite covering the parser, rules, auto-sanitizer, tarball extractor, SkillPatch network API, and adversarial evasion vectors using Vitest:

```bash
npm test
```

- **43 Vitest Tests**: 100% passing across 4 test files (`scanner.test.ts`, `sanitizer.test.ts`, `extendedAudit.test.ts`, `adversarial.test.ts`).
- **TypeScript Verification**: Zero type errors (`npx tsc -b`).
- **Production Bundle**: Clean Vite compilation (`npm run build`).

---

## 🎬 2-Minute Hackathon Demo Script

1. **Clean Skill Baseline**: Select **1. Clean Skill (Safe)** $\rightarrow$ Show **100/100 Security Score** and `SAFE` status.
2. **Threat Detection**: Select **6. Mixed Critical Skill** $\rightarrow$ Show PatchGuard flagging Prompt Injection, Destructive Commands, and Exfiltration with a **0/100 CRITICAL RISK** score.
3. **Interactive Inspection**: Click any finding to jump directly to the highlighted line in the source code viewer.
4. **Auto-Sanitizer**: Click **Sanitize & Neutralize** $\rightarrow$ Review the side-by-side Diff view, remediation log, and rescan status (**100/100 "No detected threats under PatchGuard rules"**).
5. **Live SkillPatch Fetch**: Enter `implement` in the SkillPatch Registry Auditor $\rightarrow$ Show real-time `.tar.gz` package fetch and in-memory extraction.
6. **CLI Security Gate**: Run `node bin/patchguard.js gate src/fixtures` in terminal $\rightarrow$ Show `Security Gate: BLOCKED` with non-zero exit code (`exit 1`).

---

## 🚀 Future Development Roadmap

1. **Context-Aware Finding Classification**: Better distinguish active malicious directives from educational or documentation references while retaining deterministic security signatures.
2. **Expanded Security Rules**: Additional credential stores, destructive shell patterns, exfiltration techniques, and agent evasion vectors.
3. **Skill Provenance & Hash Verification**: Track publisher metadata, content hashes, and historical scan results to detect unexpected skill mutations over time.
4. **Continuous SkillPatch Registry Monitoring**: Re-scan skills automatically when new versions are published and alert when risk status changes.
5. **CI/CD Integrations & GitHub Actions**: Native GitHub Action step for organization-level security threshold enforcement.
6. **Custom Security Policies**: Configurable organization-specific rules, custom severity thresholds, and allow/deny lists.
7. **Machine-Readable Security Manifests**: Export findings, hashes, and risk data in standard SARIF/JSON formats for downstream enterprise security tools.
8. **Enterprise Audit History**: Comprehensive scan logs, remediation records, and security audit trails.

---

## 🔒 Security Disclaimer
*PatchGuard evaluates skills against implemented static rules and heuristics. It communicates "0 detected threats under PatchGuard rules" when findings pass. Static analysis cannot guarantee protection against unknown or zero-day attack techniques.*
