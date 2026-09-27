import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: {
    name?: unknown;
    email?: unknown;
    company?: unknown;
    topic?: unknown;
    message?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid work email address." },
      { status: 400 }
    );
  }

  if (!company) {
    return NextResponse.json(
      { error: "Company / organisation is required." },
      { status: 400 }
    );
  }

  if (!topic) {
    return NextResponse.json({ error: "Please select a topic." }, { status: 400 });
  }

  if (!message || message.length < 10) {
    return NextResponse.json(
      { error: "Message must be at least 10 characters long." },
      { status: 400 }
    );
  }

  console.info("Contact request received", { name, email, company, topic });

  return NextResponse.json({ ok: true });
}
