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

/**
 * Runs AI Virtual Try-On using OOTDiffusion on Hugging Face Spaces.
 * Supports Upper-body, Lower-body, and Dress categories.
 */
export async function runVirtualTryOn(params: TryOnRequest): Promise<TryOnResponse> {
  const token = process.env.HUGGINGFACE_TOKEN;

  if (!token) {
    return {
      success: false,
      error: "HUGGINGFACE_TOKEN is not configured in the environment.",
    };
  }

  try {
    const client = await Client.connect(SPACE_NAME, {
      token: token as `hf_${string}`,
    });

    const personFile = await toGradioFile(params.personImageUrl);
    const garmentFile = await toGradioFile(params.garmentImageUrl);
    const category: GarmentCategory = params.category || "Upper-body";

    // Call /process_dc (Dual-category and Dress try-on pipeline)
    const result = await client.predict("/process_dc", [
      personFile,
      garmentFile,
      category,
      1, // n_samples
      params.steps ?? 20, // n_steps
      params.scale ?? 2.0, // image_scale
      params.seed ?? -1, // seed
    ]);

    const data = result.data as unknown as Array<Array<{ image?: string | { url?: string } }>>;
    // OOTDiffusion returns a nested array of gallery items: [[ { image: { url: ... } } ]]
    const firstOutput = data?.[0]?.[0]?.image;
    const resultUrl = typeof firstOutput === "string" ? firstOutput : firstOutput?.url;

    if (!resultUrl) {
      return {
        success: false,
        error: "Virtual Try-On completed but no output image was received.",
      };
    }

    return {
      success: true,
      resultImageUrl: resultUrl,
    };
  } catch (err: unknown) {
    console.error("[runVirtualTryOn error]:", err);
    const message = err instanceof Error ? err.message : "Failed to process virtual try-on request.";
    return {
      success: false,
      error: message,
    };
  }
}
