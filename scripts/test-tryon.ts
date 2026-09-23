import * as dotenv from "dotenv";
dotenv.config();

import { runVirtualTryOn } from "../src/lib/tryon";

async function main() {
  console.log("=== Testing EasyBuy Virtual Try-On Pipeline ===");

  const personImageUrl = "https://raw.githubusercontent.com/levihsu/OOTDiffusion/main/run/examples/model/model_1.png";
  const garmentImageUrl = "https://raw.githubusercontent.com/levihsu/OOTDiffusion/main/run/examples/garment/03244_00.jpg";

  console.log("Input Person :", personImageUrl);
  console.log("Input Garment:", garmentImageUrl);
  console.log("Category     : Upper-body\n");

  const start = Date.now();
  const res = await runVirtualTryOn({
    personImageUrl,
    garmentImageUrl,
    category: "Upper-body",
  });
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  if (res.success) {
    console.log(`✅ Success in ${elapsed}s!`);
    console.log("Generated Result URL:", res.resultImageUrl);
  } else {
    console.error(`❌ Failed in ${elapsed}s:`, res.error);
  }
}

main();
