import { NextRequest, NextResponse } from "next/server";
import { fetchFile, updateFileOnGitHub } from "@/lib/github";
import { type TaskStage } from "@/lib/crons";

const VALID_STAGES: TaskStage[] = ["backlog", "queued", "in-progress", "review", "done"];

/** PATCH /api/tasks — update a job's stage */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, stage } = body as { jobId: string; stage: string };

    if (!jobId || !stage) {
      return NextResponse.json({ error: "jobId and stage required" }, { status: 400 });
    }

    if (!VALID_STAGES.includes(stage as TaskStage)) {
      return NextResponse.json({ error: `Invalid stage: ${stage}` }, { status: 400 });
    }

    // Fetch current jobs.json
    const raw = await fetchFile("cron/jobs.json");
    if (!raw) {
      return NextResponse.json({ error: "Could not fetch jobs.json" }, { status: 500 });
    }

    const data = JSON.parse(raw) as { version: number; jobs: Record<string, unknown>[] };
    const job = data.jobs.find((j) => (j as { id: string }).id === jobId);

    if (!job) {
      return NextResponse.json({ error: `Job not found: ${jobId}` }, { status: 404 });
    }

    // Update stage
    job.stage = stage;

    // Commit to GitHub
    const content = JSON.stringify(data, null, 2);
    const ok = await updateFileOnGitHub(
      "cron/jobs.json",
      content,
      `chore: move task ${jobId} to ${stage}`,
    );

    if (!ok) {
      return NextResponse.json({ error: "Failed to commit to GitHub" }, { status: 500 });
    }

    return NextResponse.json({ success: true, jobId, stage });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

/** POST /api/tasks — create a new cron job */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, agentId, schedule, timezone, stage, payload, enabled } = body as {
      name: string;
      agentId: string;
      schedule: string;
      timezone?: string;
      stage?: string;
      payload: string;
      enabled?: boolean;
    };

    if (!name || !agentId || !schedule || !payload) {
      return NextResponse.json(
        { error: "name, agentId, schedule, and payload are required" },
        { status: 400 },
      );
    }

    // Fetch current jobs.json
    const raw = await fetchFile("cron/jobs.json");
    if (!raw) {
      return NextResponse.json({ error: "Could not fetch jobs.json" }, { status: 500 });
    }

    const data = JSON.parse(raw) as { version: number; jobs: Record<string, unknown>[] };

    // Generate a slug-style ID from the name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const id = `${agentId}-${slug}`;

    // Ensure unique ID
    if (data.jobs.some((j) => (j as { id: string }).id === id)) {
      return NextResponse.json({ error: `Job with id '${id}' already exists` }, { status: 409 });
    }

    const newJob = {
      id,
      name,
      agentId,
      enabled: enabled !== false,
      stage: VALID_STAGES.includes((stage ?? "backlog") as TaskStage) ? stage ?? "backlog" : "backlog",
      schedule: { expr: schedule, tz: timezone || "America/New_York" },
      payload: { text: payload },
    };

    data.jobs.push(newJob);

    const content = JSON.stringify(data, null, 2);
    const ok = await updateFileOnGitHub(
      "cron/jobs.json",
      content,
      `feat: add new task '${name}'`,
    );

    if (!ok) {
      return NextResponse.json({ error: "Failed to commit to GitHub" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
