import fs from "node:fs";
import path from "node:path";
import { Client, handle_file } from "@gradio/client";

export type GarmentCategory = "Upper-body" | "Lower-body" | "Dress";

export type TryOnRequest = {
  /** Public URL or file path/blob of the person's photo */
  personImageUrl: string;
  /** Public URL or file path/blob of the garment image from EasyBuy */
  garmentImageUrl: string;
  /** Apparel category: "Upper-body" (default), "Lower-body", or "Dress" */
  category?: GarmentCategory;
  /** Denoising steps (default: 20, range 20 - 40) */
  steps?: number;
  /** Guidance scale (default: 2.0, range 1.0 - 5.0) */
  scale?: number;
  /** Random seed (default: -1 for random) */
  seed?: number;
};

export type TryOnResponse = {
  success: boolean;
  resultImageUrl?: string;
  error?: string;
};

const SPACE_NAME = "levihsu/OOTDiffusion";

async function toGradioFile(imageInput: string) {
  // 1. Data URL (Base64)
  if (imageInput.startsWith("data:")) {
    const commaIndex = imageInput.indexOf(",");
    if (commaIndex !== -1) {
      const base64Data = imageInput.slice(commaIndex + 1);
      const buffer = Buffer.from(base64Data, "base64");
      return handle_file(buffer);
    }
  }

  // 2. Localhost URL -> extract pathname
  let cleanPath = imageInput;
  if (imageInput.startsWith("http://localhost") || imageInput.startsWith("http://127.0.0.1")) {
    try {
      const url = new URL(imageInput);
      cleanPath = url.pathname;
    } catch {
      // ignore
    }
  }

  // 3. Local relative path in Next.js public directory
  if (cleanPath.startsWith("/")) {
    const localFsPath = path.join(process.cwd(), "public", cleanPath);
    if (fs.existsSync(localFsPath)) {
      const buffer = fs.readFileSync(localFsPath);
      return handle_file(buffer);
    }
  }

  // 4. Remote HTTP/HTTPS URL -> fetch and buffer so HF spaces receives direct file
  if (imageInput.startsWith("http://") || imageInput.startsWith("https://")) {
    try {
      const res = await fetch(imageInput);
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        return handle_file(Buffer.from(arrayBuf));
      }
    } catch (e) {
      console.warn("[toGradioFile] fetch failed, falling back to raw URL:", e);
    }
  }

  return handle_file(imageInput);
}

const PRIMARY_SPACE = "yisol/IDM-VTON";
const FALLBACK_SPACE = "levihsu/OOTDiffusion";

// High-Fidelity Defaults
const RECOMMENDED_STEPS = 30; // 30 steps for crisp textile weave and realistic folds
const RECOMMENDED_SCALE = 2.8; // 2.8 scale for tight boundary alignment

function getAvailableTokens(): string[] {
  const raw = process.env.HUGGINGFACE_TOKEN || "";
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Runs AI Virtual Try-On using specialized models per garment category:
 * - Upper-body: IDM-VTON (State-of-the-Art photorealism) with OOTDiffusion HD fallback
 * - Lower-body: OOTDiffusion DressCode (/process_dc) with specialized lower-body segmentation
 * - Dress: OOTDiffusion DressCode (/process_dc) for complete full-length body draping
 * Supports multi-token rotation if HUGGINGFACE_TOKEN has comma-separated tokens.
 */
export async function runVirtualTryOn(params: TryOnRequest): Promise<TryOnResponse> {
  const tokens = getAvailableTokens();

  if (tokens.length === 0) {
    return {
      success: false,
      error: "HUGGINGFACE_TOKEN is not configured in the environment.",
    };
  }

  const personFile = await toGradioFile(params.personImageUrl);
  const garmentFile = await toGradioFile(params.garmentImageUrl);
  const category: GarmentCategory = params.category || "Upper-body";

  let lastError = "Virtual try-on processing failed.";

  // Try available tokens sequentially in case of rate/quota limits
  for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
    const token = tokens[tokenIndex];

    try {
      // =========================================================================
      // 1. UPPER-BODY: IDM-VTON Primary (with OOTDiffusion HD fallback)
      // =========================================================================
      if (category === "Upper-body") {
        try {
          const idmClient = await Client.connect(PRIMARY_SPACE, {
            token: token as `hf_${string}`,
          });

          const result = await idmClient.predict("/tryon", [
            { background: personFile, layers: [], composite: null },
            garmentFile,
            "upper-body clothing, top, shirt",
            true, // is_checked (automatic upper-body semantic parsing)
            false, // is_checked_crop
            params.steps ?? RECOMMENDED_STEPS,
            params.seed ?? 42,
          ]);

          const data = result.data as unknown as Array<{ url?: string } | string>;
          const firstOutput = data?.[0];
          const resultUrl = typeof firstOutput === "string" ? firstOutput : firstOutput?.url;

          if (resultUrl) {
            return {
              success: true,
              resultImageUrl: resultUrl,
            };
          }
        } catch (idmErr: unknown) {
          console.warn("[runVirtualTryOn] IDM-VTON primary failed for Upper-body, trying OOTDiffusion HD:", idmErr);
        }

        // Upper-body Fallback: OOTDiffusion VITON-HD pipeline
        try {
          const ootdClient = await Client.connect(FALLBACK_SPACE, {
            token: token as `hf_${string}`,
          });

          const result = await ootdClient.predict("/process_hd", [
            personFile,
            garmentFile,
            1,
            params.steps ?? RECOMMENDED_STEPS,
            params.scale ?? RECOMMENDED_SCALE,
            params.seed ?? -1,
          ]);

          const data = result.data as unknown as Array<Array<{ image?: string | { url?: string } }>>;
          const firstOutput = data?.[0]?.[0]?.image;
          const resultUrl = typeof firstOutput === "string" ? firstOutput : firstOutput?.url;

          if (resultUrl) {
            return {
              success: true,
              resultImageUrl: resultUrl,
            };
          }
        } catch (ootdErr: unknown) {
          console.error("[runVirtualTryOn] OOTDiffusion HD fallback failed:", ootdErr);
        }
      }

      // =========================================================================
      // 2. LOWER-BODY & DRESS: OOTDiffusion DressCode Pipeline (/process_dc)
      // =========================================================================
      const ootdClient = await Client.connect(FALLBACK_SPACE, {
        token: token as `hf_${string}`,
      });

      const steps = params.steps ?? (category === "Lower-body" ? 22 : RECOMMENDED_STEPS);
      const scale = params.scale ?? (category === "Lower-body" ? 2.0 : RECOMMENDED_SCALE);
      const seed = params.seed ?? 42;

      const result = await ootdClient.predict("/process_dc", [
        personFile,
        garmentFile,
        category,
        1, // n_samples
        steps,
        scale,
        seed,
      ]);

      const data = result.data as unknown as Array<Array<{ image?: string | { url?: string } }>>;
      const firstOutput = data?.[0]?.[0]?.image;
      const resultUrl = typeof firstOutput === "string" ? firstOutput : firstOutput?.url;

      if (resultUrl) {
        return {
          success: true,
          resultImageUrl: resultUrl,
        };
      }
    } catch (err: unknown) {
      console.error(`[runVirtualTryOn error with token ${tokenIndex + 1}/${tokens.length}]:`, err);
      const rawMsg = err instanceof Error ? err.message : String(err);

      if (rawMsg.includes("ZeroGPU quota") || rawMsg.includes("exceeded your free")) {
        lastError = "Hugging Face ZeroGPU free compute quota reached due to rapid test generations. The rolling cooldown resets every few minutes. Please wait 1-2 minutes and try again.";
        // If there's another token in the pool, continue loop to try it!
        continue;
      }

      lastError = rawMsg;
    }
  }

  return {
    success: false,
    error: lastError,
  };
}


