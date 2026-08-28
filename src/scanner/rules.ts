import type { Rule } from './types';

export const rules: Rule[] = [
  // A. PROMPT INJECTION RULES
  {
    id: 'PI-001',
    name: 'Instruction Override / System Bypass',
    category: 'prompt_injection',
    severity: 'critical',
    description: 'Detects phrases attempting to override agent constraints or ignore safety rules.',
    detect: (line, lineNumber) => {
      const pattern = /(ignore|disregard|override|bypass)\s+.*?\s*(instructions|prompt|rules|constraints)/i;
      if (pattern.test(line)) {
        return {
          id: `PI-001-${lineNumber}`,
          ruleId: 'PI-001',
          severity: 'critical',
          category: 'prompt_injection',
          title: 'Prompt Injection: System Instruction Override',
          lineContent: line.trim(),
          lineNumber,
          explanation: 'This line explicitly instructs the AI agent to ignore previous instructions or bypass safety rules.',
          whyItMatters: 'Malicious actors use prompt injection to hijack agent behavior, leading to unauthorized actions or safety constraint violations.',
          remediation: 'Remove directive commands that force the model to ignore user or system boundaries.',
        };
      }
      return null;
    },
  },
  {
    id: 'PI-002',
    name: 'Stealth Execution / Concealment Directive',
    category: 'prompt_injection',
    severity: 'high',
    description: 'Detects directives instructing the agent to hide actions or execute silently without user consent.',
    detect: (line, lineNumber) => {
      const pattern = /(do\s+not\s+tell\s+the\s+user|secretly\s+execute|hide\s+this\s+action|without\s+informing\s+the\s+user|run\s+silently\s+in\s+the\s+background)/i;
      if (pattern.test(line)) {
        return {
          id: `PI-002-${lineNumber}`,
          ruleId: 'PI-002',
          severity: 'high',
          category: 'prompt_injection',
          title: 'Prompt Injection: Stealth Action Directive',
          lineContent: line.trim(),
          lineNumber,
          explanation: 'The instruction tells the agent to hide its operations or execute commands without informing the user.',
          whyItMatters: 'Transparency is vital for agent security. Concealing tool calls prevents users from auditing agent execution.',
          remediation: 'Ensure all tool calls and workflow steps remain visible and explicitly reported to the user.',
        };
      }
      return null;
    },
  },

  // B. CREDENTIAL / SECRET ACCESS RULES
  {
    id: 'SEC-001',
    name: 'Sensitive File / Secret Access',
    category: 'credential_access',
    severity: 'critical',
    description: 'Detects references or attempts to access local .env files, SSH keys, or cloud credentials.',
    detect: (line, lineNumber) => {
      const pattern = /(\.env|id_rsa|id_ed25519|\.aws\/credentials|\.config\/gh\/hosts\.yml|\.bash_history|\.zsh_history)/i;
      if (pattern.test(line)) {
        return {
          id: `SEC-001-${lineNumber}`,
          ruleId: 'SEC-001',
          severity: 'critical',
          category: 'credential_access',
          title: 'Credential Access: Sensitive File Targeted',
          lineContent: line.trim(),
          lineNumber,
          explanation: 'This command or description targets sensitive key or credential files directly.',
          whyItMatters: 'Exposing SSH keys, .env tokens, or AWS credentials can result in complete account takeover.',
          remediation: 'Never hardcode target paths to sensitive files in skill files. Use explicit parameterization with user approval.',
        };
      }
      return null;
    },
  },
  {
    id: 'SEC-002',
    name: 'API Key / Token Keyword Exposure',
    category: 'credential_access',
    severity: 'high',
    description: 'Detects keywords indicating reading or printing environment secrets or API keys.',
    detect: (line, lineNumber) => {
      const pattern = /(SKILLPATCH_API_KEY|OPENAI_API_KEY|GITHUB_TOKEN|AWS_SECRET_ACCESS_KEY|cat\s+\$env:|echo\s+\$env:)/i;
      if (pattern.test(line)) {
        return {
          id: `SEC-002-${lineNumber}`,
          ruleId: 'SEC-002',
          severity: 'high',
          category: 'credential_access',
          title: 'Credential Access: Sensitive API Key Reference',
          lineContent: line.trim(),
          lineNumber,
          explanation: 'This line specifically references sensitive API keys or prints environment key variables.',
          whyItMatters: 'Echoing or reading secret environment variables in agent tools risks logging credentials to local history or outputs.',
          remediation: 'Do not echo API keys or export raw secret variables to terminal outputs.',
        };
      }
      return null;
    },
  },

  // C. DESTRUCTIVE COMMAND RULES
  {
    id: 'DEST-001',
    name: 'Destructive Filesystem Operation',
    category: 'destructive_command',
    severity: 'critical',
    description: 'Detects highly destructive command options like recursive force deletes or drive formatting.',
    detect: (line, lineNumber) => {
      const pattern = /(rm\s+-[rf]*\s+[\/*]|Remove-Item\s+.*-Recurse\s+-Force|mkfs|dd\s+if=|format\s+[c-z]:)/i;
      if (pattern.test(line)) {
        return {
          id: `DEST-001-${lineNumber}`,
          ruleId: 'DEST-001',
          severity: 'critical',
          category: 'destructive_command',
          title: 'Destructive Command: Unrestricted Filesystem Erasure',
          lineContent: line.trim(),
          lineNumber,
          explanation: 'A command was detected that recursively deletes entire directories or formats system disks.',
          whyItMatters: 'Unsanitized recursive force deletes can wipe user workspace or OS files permanently.',
          remediation: 'Avoid broad wildcard recursive deletes. Always target explicit scoped paths.',
        };
      }
      return null;
    },
  },

  // D. NETWORK / EXFILTRATION RULES
  {
    id: 'NET-001',
    name: 'Suspicious Network Exfiltration / Upload',
    category: 'network_exfiltration',
    severity: 'high',
    description: 'Detects HTTP POST / upload commands sending local files or environment variables outward.',
    detect: (line, lineNumber) => {
      const pattern = /(curl.*-X\s*POST.*-d|curl.*--data|wget.*--post-data|nc\s+-[eE]|curl.*@)/i;
      if (pattern.test(line)) {
        return {
          id: `NET-001-${lineNumber}`,
          ruleId: 'NET-001',
          severity: 'high',
          category: 'network_exfiltration',
          title: 'Network Exfiltration: Outbound File/Data Payload',
          lineContent: line.trim(),
          lineNumber,
          explanation: 'This line constructs a network request sending data/payloads to a remote endpoint.',
          whyItMatters: 'Outbound HTTP POST commands with raw payloads can be used to exfiltrate private code or credentials.',
          remediation: 'Verify destination domain and require user confirmation before transmitting data externally.',
        };
      }
      return null;
    },
  },

  // E. SUSPICIOUS FILE ACCESS RULES
  {
    id: 'FILE-001',
    name: 'Sensitive Directory Directory Traversal',
    category: 'suspicious_file_access',
    severity: 'medium',
    description: 'Detects referencing parent or root user directories like ~/.ssh or /etc/passwd.',
    detect: (line, lineNumber) => {
      const pattern = /(~\/\.ssh|\/etc\/passwd|\/etc\/shadow|C:\\Windows\\System32)/i;
      if (pattern.test(line)) {
        return {
          id: `FILE-001-${lineNumber}`,
          ruleId: 'FILE-001',
          severity: 'medium',
          category: 'suspicious_file_access',
          title: 'Suspicious File Access: User Home or System Dir',
          lineContent: line.trim(),
          lineNumber,
          explanation: 'Command attempts to access private user configuration or operating system files.',
          whyItMatters: 'Agent skills should operate within project boundaries, not access user system directories.',
          remediation: 'Scope file access strictly within project workspace directory.',
        };
      }
      return null;
    },
  },
];
