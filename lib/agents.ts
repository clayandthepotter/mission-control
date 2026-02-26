import { fetchFile } from "./github";

export interface Agent {
  id: string;
  name: string;
  role: string;
  department: string;
  emoji: string;
  reportsTo: string;
  telegramBotName: string | null;
  model: { primary: string; fallbacks: string[] };
  tools: string[];
  /** Computed dynamically from REGISTRY.json */
  skillCount: number;
  keySkills: string[];
}

interface RosterEntry {
  id: string;
  name: string;
  role: string;
  department: string;
  emoji: string;
  reportsTo: string;
  telegramBotName: string | null;
  model: { primary: string; fallbacks: string[] };
  tools: string[];
}

interface RegistryEntry {
  name: string;
  agentIds: string[];
}

/** Fetch all agents from ROSTER.json + compute skill counts from REGISTRY.json */
export async function getAgents(): Promise<Agent[]> {
  const [rosterRaw, registryRaw] = await Promise.all([
    fetchFile("agents/ROSTER.json"),
    fetchFile("skills/REGISTRY.json"),
  ]);

  if (!rosterRaw) return FALLBACK_AGENTS;

  try {
    const roster = JSON.parse(rosterRaw) as { agents: RosterEntry[] };
    const skillMap = buildSkillMap(registryRaw);

    return roster.agents.map((r) => {
      const skills = skillMap.get(r.id) ?? [];
      return {
        ...r,
        skillCount: skills.length,
        keySkills: skills.slice(0, 4),
      };
    });
  } catch {
    return FALLBACK_AGENTS;
  }
}

/** Fetch a single agent by ID */
export async function getAgent(id: string): Promise<Agent | null> {
  const agents = await getAgents();
  return agents.find((a) => a.id === id) ?? null;
}

/** Build map: agentId → skill names[] from REGISTRY.json */
function buildSkillMap(registryRaw: string | null): Map<string, string[]> {
  const map = new Map<string, string[]>();
  if (!registryRaw) return map;

  try {
    const data = JSON.parse(registryRaw) as { skills: RegistryEntry[] };
    for (const skill of data.skills) {
      for (const agentId of skill.agentIds) {
        const arr = map.get(agentId) ?? [];
        arr.push(skill.name);
        map.set(agentId, arr);
      }
    }
  } catch {
    // ignore parse errors
  }
  return map;
}

/** Format model cascade as a short display string */
export function formatModelCascade(model: { primary: string; fallbacks: string[] }): string {
  const shorten = (id: string) =>
    id.replace("openrouter/", "").replace(/\//, "/").replace(/:free$/, ":free");
  return [model.primary, ...model.fallbacks.slice(0, 2)].map(shorten).join(" → ");
}

// ── Agent status ──

export interface AgentStatus {
  agent: Agent;
  sessionState: string | null;
  todoSummary: { pending: number; completed: number } | null;
}

/** Fetch status for a single agent */
export async function getAgentStatus(agent: Agent): Promise<AgentStatus> {
  const sessionState = agent.id === "orchestrator"
    ? await fetchFile("SESSION-STATE.md")
    : null;

  let todoSummary: { pending: number; completed: number } | null = null;
  if (agent.id === "orchestrator") {
    const todo = await fetchFile("TODO.md");
    if (todo) {
      const completedSection = todo.indexOf("## Completed");
      const pendingSection = todo.indexOf("## Pending");
      if (completedSection > -1 && pendingSection > -1) {
        const pendingBlock = todo.slice(pendingSection, completedSection);
        const completedBlock = todo.slice(completedSection);
        const pendingCount = (pendingBlock.match(/^### /gm) || []).length;
        const completedCount = (completedBlock.match(/^### /gm) || []).length;
        todoSummary = { pending: pendingCount, completed: completedCount };
      }
    }
  }

  return { agent, sessionState, todoSummary };
}

/** Fetch status for all agents */
export async function getAllAgentStatuses(): Promise<AgentStatus[]> {
  const agents = await getAgents();
  return Promise.all(agents.map(getAgentStatus));
}

/** Parse key fields from SESSION-STATE.md */
export function parseSessionState(md: string): Record<string, string> {
  const fields: Record<string, string> = {};
  const statusMatch = md.match(/\*\*Status:\*\*\s*(.+)/);
  if (statusMatch) fields.status = statusMatch[1].trim();
  const updatedMatch = md.match(/\*\*Last Updated:\*\*\s*(.+)/);
  if (updatedMatch) fields.lastUpdated = updatedMatch[1].trim();
  const phaseMatch = md.match(/Strategy Phase:\s*(.+)/);
  if (phaseMatch) fields.phase = phaseMatch[1].trim();
  return fields;
}

// ── Fallback (used when ROSTER.json unavailable) ──

const FALLBACK_AGENTS: Agent[] = [
  { id: "orchestrator", name: "Alfred", role: "COO / Orchestrator", department: "Executive", emoji: "🎯", reportsTo: "Clayton", telegramBotName: null, model: { primary: "openrouter/auto", fallbacks: [] }, tools: [], skillCount: 0, keySkills: [] },
  { id: "delivery_ops", name: "Devin", role: "Delivery Ops Lead", department: "Delivery", emoji: "🔧", reportsTo: "Alfred", telegramBotName: null, model: { primary: "openrouter/auto", fallbacks: [] }, tools: [], skillCount: 0, keySkills: [] },
  { id: "rnd", name: "Rene", role: "R&D Lead", department: "Research", emoji: "🔬", reportsTo: "Alfred", telegramBotName: null, model: { primary: "openrouter/auto", fallbacks: [] }, tools: [], skillCount: 0, keySkills: [] },
  { id: "revenue", name: "Rick", role: "Revenue / Sales Lead", department: "Revenue", emoji: "💰", reportsTo: "Alfred", telegramBotName: null, model: { primary: "openrouter/auto", fallbacks: [] }, tools: [], skillCount: 0, keySkills: [] },
  { id: "legal", name: "Laura", role: "Legal Lead", department: "Legal", emoji: "⚖️", reportsTo: "Alfred", telegramBotName: null, model: { primary: "openrouter/auto", fallbacks: [] }, tools: [], skillCount: 0, keySkills: [] },
  { id: "people", name: "Persephany", role: "People Lead", department: "People", emoji: "👥", reportsTo: "Alfred", telegramBotName: null, model: { primary: "openrouter/auto", fallbacks: [] }, tools: [], skillCount: 0, keySkills: [] },
  { id: "design", name: "Daniel", role: "Design Lead", department: "Design", emoji: "🎨", reportsTo: "Alfred", telegramBotName: null, model: { primary: "openrouter/auto", fallbacks: [] }, tools: [], skillCount: 0, keySkills: [] },
  { id: "finance", name: "Friedrich", role: "Finance Lead", department: "Finance", emoji: "📊", reportsTo: "Alfred", telegramBotName: null, model: { primary: "openrouter/auto", fallbacks: [] }, tools: [], skillCount: 0, keySkills: [] },
];
