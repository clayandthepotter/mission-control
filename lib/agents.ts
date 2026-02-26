import { fetchFile } from "./github";

export interface Agent {
  id: string;
  name: string;
  role: string;
  department: string;
  emoji: string;
  workspace: string;
  model: string;
  reportsTo: string;
  skillCount: number;
  keySkills: string[];
  tools: string[];
  telegramBotName: string | null;
}

export const AGENTS: Agent[] = [
  {
    id: "orchestrator", name: "Alfred", role: "COO / Orchestrator", department: "Executive",
    emoji: "🎯", workspace: "", model: "auto → deepseek-v3.2 → hermes-405b:free", reportsTo: "Clayton",
    skillCount: 15, keySkills: ["agent-team-orchestration", "tool-skill-request", "infrastructure-ops", "gog"],
    tools: ["read", "write", "edit", "exec", "browser"], telegramBotName: "@RiffRafferty_Bot",
  },
  {
    id: "delivery_ops", name: "Devin", role: "Delivery Ops Lead", department: "Delivery",
    emoji: "🔧", workspace: "../workspace-delivery_ops", model: "auto → deepseek-v3.2 → qwen3-coder:free", reportsTo: "Alfred",
    skillCount: 12, keySkills: ["infrastructure-ops", "solo-setup", "api-designer", "e2e-testing-patterns"],
    tools: ["read", "write", "edit", "exec", "browser"], telegramBotName: "@DevinLeadsPantherBot",
  },
  {
    id: "revenue", name: "Rick", role: "Revenue / Sales Lead", department: "Revenue",
    emoji: "💰", workspace: "../workspace-revenue", model: "auto → deepseek-v3.2 → trinity-large:free", reportsTo: "Alfred",
    skillCount: 18, keySkills: ["crustdata-enrichment", "closing-deals", "linkedin-writer", "sales-pipeline-tracker"],
    tools: ["read", "write", "edit", "exec", "browser"], telegramBotName: "Rick bot",
  },
  {
    id: "rnd", name: "Rene", role: "R&D Lead", department: "Research",
    emoji: "🔬", workspace: "../workspace-rnd", model: "auto → deepseek-r1-0528 → step-3.5-flash:free", reportsTo: "Alfred",
    skillCount: 5, keySkills: ["research-cog", "google-web-search", "crustdata-enrichment"],
    tools: ["read", "write", "edit", "exec", "browser"], telegramBotName: "Rene bot",
  },
  {
    id: "design", name: "Daniel", role: "Design Lead", department: "Design",
    emoji: "🎨", workspace: "../workspace-design", model: "auto → gemini-3-flash → nemotron-vl:free", reportsTo: "Alfred",
    skillCount: 3, keySkills: ["ui-ux-design", "page-designer", "ad-designer"],
    tools: ["read", "write", "edit", "browser"], telegramBotName: "Daniel bot",
  },
  {
    id: "finance", name: "Friedrich", role: "Finance Lead", department: "Finance",
    emoji: "📊", workspace: "../workspace-finance", model: "auto → deepseek-v3.2 → qwen3-80b:free", reportsTo: "Alfred",
    skillCount: 6, keySkills: ["financial-reporting", "finance-skill", "financial-planning"],
    tools: ["read", "write", "edit", "exec", "browser"], telegramBotName: "Friedrich bot",
  },
  {
    id: "legal", name: "Laura", role: "Legal Lead", department: "Legal",
    emoji: "⚖️", workspace: "../workspace-legal", model: "auto → deepseek-r1-0528 → hermes-405b:free", reportsTo: "Alfred",
    skillCount: 3, keySkills: ["compliance-officer", "ciso"],
    tools: ["read", "write", "edit"], telegramBotName: "Laura bot",
  },
  {
    id: "people", name: "Persephany", role: "People Lead", department: "People",
    emoji: "👥", workspace: "../workspace-people", model: "auto → deepseek-v3.2 → glm-4.5-air:free", reportsTo: "Alfred",
    skillCount: 2, keySkills: ["agent-evaluation"],
    tools: ["read", "write", "edit"], telegramBotName: "Persephany bot",
  },
];

/** Paths in the GitHub repo for each agent's key files */
function agentFilePath(agent: Agent, file: string): string {
  // Alfred's workspace IS the repo root (workspace/)
  // Other agents are sibling directories but only workspace/ is in the repo.
  // So we only have Alfred's files in the repo. For other agents, we read from
  // department AGENTS.md or TOOLS.md that Alfred references.
  if (agent.id === "orchestrator") {
    return file;
  }
  // Other agent workspace files aren't in the same repo.
  // We'll return a sentinel so the UI can show "no data" gracefully.
  return `__external__/${agent.id}/${file}`;
}

export interface AgentStatus {
  agent: Agent;
  sessionState: string | null;
  todoSummary: { pending: number; completed: number } | null;
}

/** Fetch status for a single agent */
export async function getAgentStatus(agent: Agent): Promise<AgentStatus> {
  const sessionState = await fetchFile(agentFilePath(agent, "SESSION-STATE.md"));

  let todoSummary: { pending: number; completed: number } | null = null;
  if (agent.id === "orchestrator") {
    const todo = await fetchFile("TODO.md");
    if (todo) {
      const pendingMatch = todo.match(/### .+/g);
      const completedSection = todo.indexOf("## Completed");
      const pendingSection = todo.indexOf("## Pending");
      if (pendingMatch && completedSection > -1 && pendingSection > -1) {
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
  return Promise.all(AGENTS.map(getAgentStatus));
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
