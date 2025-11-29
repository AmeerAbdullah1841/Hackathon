import { NextResponse } from "next/server";

import { createTask, listTasks } from "@/lib/store";

export async function GET() {
  try {
    const tasks = await listTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Tasks GET error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch tasks" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const title = payload?.title?.trim();
  const category = payload?.category?.trim();
  const difficulty = payload?.difficulty ?? "beginner";
  const description = payload?.description?.trim();
  const points = Number(payload?.points ?? 100);
  const resources: string[] = Array.isArray(payload?.resources)
    ? payload.resources
    : [];

  if (!title || !category || !description) {
    return NextResponse.json(
      { error: "Title, category, and description are required" },
      { status: 400 },
    );
  }

  const task = await createTask({
    title,
    category,
    difficulty,
    description,
    points,
    resources,
    flag: payload?.flag ?? "flag{custom_task}",
  });

  return NextResponse.json(task, { status: 201 });
}
