import type { LeasedJob, SidecarConfig } from "./types";

export class SidecarClient {
  constructor(private readonly config: SidecarConfig) {}

  async lease(limit: number): Promise<LeasedJob[]> {
    const response = await fetch(`${this.config.appUrl}/api/sidecar/lease`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ workerId: this.config.workerId, limit }),
    });

    if (!response.ok) {
      throw new Error(`Lease failed: ${response.status} ${await response.text()}`);
    }

    const data = (await response.json()) as { jobs?: LeasedJob[] };
    return data.jobs ?? [];
  }

  async complete(
    job: LeasedJob,
    body: Record<string, unknown>,
  ): Promise<void> {
    const response = await fetch(
      `${this.config.appUrl}/api/sidecar/jobs/${job.id}/complete`,
      {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      throw new Error(`Complete failed: ${response.status} ${await response.text()}`);
    }
  }

  async progress(job: LeasedJob, videos: unknown[]): Promise<void> {
    const response = await fetch(
      `${this.config.appUrl}/api/sidecar/jobs/${job.id}/progress`,
      {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({ leaseToken: job.leaseToken, videos }),
      },
    );

    if (!response.ok) {
      throw new Error(`Progress failed: ${response.status} ${await response.text()}`);
    }
  }

  async fail(job: LeasedJob, error: string): Promise<void> {
    const response = await fetch(
      `${this.config.appUrl}/api/sidecar/jobs/${job.id}/fail`,
      {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({ leaseToken: job.leaseToken, error }),
      },
    );

    if (!response.ok) {
      console.error(`Fail report failed: ${response.status} ${await response.text()}`);
    }
  }

  private headers(): HeadersInit {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.config.sidecarToken}`,
    };
  }
}
