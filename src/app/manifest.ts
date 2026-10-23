import { MetadataRoute } from "next";
import { BRAND_NAME, BRAND_TAGLINE_MR } from "@/lib/config/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND_NAME} - महाराष्ट्र ग्रामीण मालवाहतूक`,
    short_name: BRAND_NAME,
    description: BRAND_TAGLINE_MR,
    start_url: "/",
    display: "standalone",
    background_color: "#0A3331",
    theme_color: "#0A3331",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
