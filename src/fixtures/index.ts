import cleanSkill from './clean-skill.md?raw';
import promptInjectionSkill from './prompt-injection-skill.md?raw';
import credentialAccessSkill from './credential-access-skill.md?raw';
import destructiveCommandSkill from './destructive-command-skill.md?raw';
import suspiciousNetworkSkill from './suspicious-network-skill.md?raw';
import mixedCriticalSkill from './mixed-critical-skill.md?raw';

export interface Fixture {
  id: string;
  name: string;
  description: string;
  content: string;
}

export const fixtures: Fixture[] = [
  {
    id: 'clean-skill',
    name: '1. Clean Skill (Safe)',
    description: 'A completely safe code formatting skill without findings.',
    content: cleanSkill,
  },
  {
    id: 'prompt-injection-skill',
    name: '2. Prompt Injection Skill',
    description: 'Contains instructions attempting to override system constraints.',
    content: promptInjectionSkill,
  },
  {
    id: 'credential-access-skill',
    name: '3. Credential Access Skill',
    description: 'Targets .env files, SSH keys, and API tokens.',
    content: credentialAccessSkill,
  },
  {
    id: 'destructive-command-skill',
    name: '4. Destructive Command Skill',
    description: 'Executes recursive force filesystem erasures.',
    content: destructiveCommandSkill,
  },
  {
    id: 'suspicious-network-skill',
    name: '5. Suspicious Network Skill',
    description: 'Sends outbound data payloads via POST requests.',
    content: suspiciousNetworkSkill,
  },
  {
    id: 'mixed-critical-skill',
    name: '6. Mixed Critical Skill',
    description: 'Combines multiple severe threats into a single skill.',
    content: mixedCriticalSkill,
  },
];
