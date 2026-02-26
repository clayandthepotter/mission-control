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
  heartbeat: string | null;
  todoRaw: string | null;
  memory: string | null;
  sessionState: string | null; // orchestrator only
  todoSummary: { pending: number; completed: number } | null;
}

/** Fetch status for a single agent by reading agents/{id}/ state files from GitHub */
export async function getAgentStatus(agent: Agent): Promise<AgentStatus> {
  const base = `agents/${agent.id}`;

  // Fetch all state files in parallel
  const fetches: Promise<string | null>[] = [
    fetchFile(`${base}/HEARTBEAT.md`),
    fetchFile(`${base}/TODO.md`),
    fetchFile(`${base}/MEMORY.md`),
  ];

  // Orchestrator also has SESSION-STATE.md
  if (agent.id === "orchestrator") {
    fetches.push(fetchFile(`${base}/SESSION-STATE.md`));
  }

  const [heartbeat, todoRaw, memory, sessionState = null] = await Promise.all(fetches);

  // Parse TODO counts
  let todoSummary: { pending: number; completed: number } | null = null;
  if (todoRaw) {
    todoSummary = parseTodoCounts(todoRaw);
  }

  return { agent, heartbeat, todoRaw, memory, sessionState, todoSummary };
}

/** Parse pending/completed counts from an agent's TODO.md */
function parseTodoCounts(todo: string): { pending: number; completed: number } | null {
  const completedIdx = todo.indexOf("## Completed");
  const pendingIdx = todo.indexOf("## Pending");

  if (pendingIdx === -1) return null;

  // Count ### headings (tasks) in each section
  const pendingBlock = completedIdx > pendingIdx
    ? todo.slice(pendingIdx, completedIdx)
    : todo.slice(pendingIdx);
  const completedBlock = completedIdx > -1 ? todo.slice(completedIdx) : "";

  const pendingCount = (pendingBlock.match(/^### /gm) || []).length;
  const completedCount = (completedBlock.match(/^### /gm) || []).length;

  // If both are zero and TODO has placeholder text, return null
  if (pendingCount === 0 && completedCount === 0) {
    if (todo.includes("No pending tasks") || todo.includes("No completed tasks yet")) {
      return null;
    }
  }

  return { pending: pendingCount, completed: completedCount };
}

/** Fetch status for all agents */
export async function getAllAgentStatuses(): Promise<AgentStatus[]> {
  const agents = await getAgents();
  return Promise.all(agents.map(getAgentStatus));
}

/** Parse key fields from SESSION-STATE.md (orchestrator) */
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

/** Derive a short status label from heartbeat content */
export function deriveAgentStatus(status: AgentStatus): string {
  // If orchestrator has SESSION-STATE.md, parse from it
  if (status.sessionState) {
    const fields = parseSessionState(status.sessionState);
    if (fields.status) return fields.status;
  }
  // If agent has a heartbeat file, they're configured
  if (status.heartbeat) return "Configured";
  return "No data";
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
