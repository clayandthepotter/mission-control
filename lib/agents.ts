import { fetchFile } from "./github";

export interface Agent {
  id: string;
  name: string;
  role: string;
  emoji: string;
  workspace: string; // path in the repo (relative to repo root)
}

export const AGENTS: Agent[] = [
  { id: "orchestrator", name: "Alfred", role: "Orchestrator", emoji: "🎯", workspace: "" },
  { id: "delivery_ops", name: "Devin", role: "Delivery Ops", emoji: "🔧", workspace: "../workspace-delivery_ops" },
  { id: "revenue", name: "Rick", role: "Revenue / Sales", emoji: "💰", workspace: "../workspace-revenue" },
  { id: "rnd", name: "Rene", role: "R&D", emoji: "🔬", workspace: "../workspace-rnd" },
  { id: "design", name: "Daniel", role: "Design", emoji: "🎨", workspace: "../workspace-design" },
  { id: "finance", name: "Friedrich", role: "Finance", emoji: "📊", workspace: "../workspace-finance" },
  { id: "legal", name: "Laura", role: "Legal", emoji: "⚖️", workspace: "../workspace-legal" },
  { id: "people", name: "Persephany", role: "People", emoji: "👥", workspace: "../workspace-people" },
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
