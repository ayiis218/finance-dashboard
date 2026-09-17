import { ImageResponse } from "next/og";
import { BrandIconMark } from "@/lib/brand-icon";

export const dynamic = "force-static";

export async function GET() {
  return new ImageResponse(<BrandIconMark size={192} />, {
    width: 192,
    height: 192,
  });
}
