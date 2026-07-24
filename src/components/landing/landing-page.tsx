import { fallbackLandingContent } from "@/lib/landing-fallback";
import type { LandingContentResponse } from "@/lib/types";

import { LandingContent } from "./landing-content";

type LandingEnvelope = {
  data?: LandingContentResponse;
};

function extractLandingContent(payload: LandingContentResponse | LandingEnvelope): LandingContentResponse {
  if ("data" in payload && payload.data) {
    return payload.data;
  }

  return payload as LandingContentResponse;
}

async function getServerLandingContent(): Promise<{ content: LandingContentResponse; sourceLabel: string }> {
  const baseUrl = process.env.INTERNAL_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://api.carmain.local";

  try {
    const response = await fetch(`${baseUrl}/v1/public/landing`, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Landing API responded with ${response.status}`);
    }

    const payload = await response.json() as LandingContentResponse | LandingEnvelope;
    const content = extractLandingContent(payload);
    return { content, sourceLabel: "Контент головної сторінки завантажено успішно." };
  } catch {
    return {
      content: fallbackLandingContent,
      sourceLabel: "Показано резервний контент, поки сторінка оновлюється."
    };
  }
}

export async function LandingPage() {
  const { content, sourceLabel } = await getServerLandingContent();
  return <LandingContent content={content} sourceLabel={sourceLabel} />;
}