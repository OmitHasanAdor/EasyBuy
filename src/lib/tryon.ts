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

function toGradioFile(imageInput: string) {
  if (imageInput.startsWith("data:")) {
    const commaIndex = imageInput.indexOf(",");
    if (commaIndex !== -1) {
      const base64Data = imageInput.slice(commaIndex + 1);
      const buffer = Buffer.from(base64Data, "base64");
      return handle_file(buffer);
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

    const personFile = toGradioFile(params.personImageUrl);
    const garmentFile = toGradioFile(params.garmentImageUrl);
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

    const data = result.data as any;
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
  } catch (err: any) {
    console.error("[runVirtualTryOn error]:", err);
    return {
      success: false,
      error: err?.message || "Failed to process virtual try-on request.",
    };
  }
}
