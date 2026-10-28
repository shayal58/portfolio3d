import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";

// The 1200×630 preview image shown when the site or a case study is shared
// on LinkedIn, WhatsApp, X and so on. Rendered once at build time.

export const SHARE_SIZE = { width: 1200, height: 630 };

export async function shareImage({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  const photo = await readFile(join(process.cwd(), "public", profile.photo));
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#080808",
          color: "#f5f5f5",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Warm glow, like the desk lamp */}
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -80,
            width: 760,
            height: 760,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(255,100,46,0.35), rgba(255,100,46,0) 65%)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 72px", width: 760 }}>
          <div style={{ fontSize: 24, letterSpacing: 6, color: "#ff642e", textTransform: "uppercase" }}>{eyebrow}</div>
          <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1, marginTop: 18, textTransform: "uppercase", letterSpacing: -2 }}>
            {title}
          </div>
          <div style={{ fontSize: 30, color: "#a1a1aa", marginTop: 26, lineHeight: 1.35 }}>{subtitle}</div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 44, fontSize: 22, color: "#f5f5f5" }}>
            <div style={{ width: 14, height: 14, borderRadius: 9999, background: "#ff642e", marginRight: 14 }} />
            {profile.location}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, paddingRight: 64 }}>
          <div
            style={{
              display: "flex",
              width: 330,
              height: 412,
              borderRadius: 28,
              padding: 8,
              border: "2px solid rgba(255,100,46,0.7)",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoSrc} alt="" width={310} height={392} style={{ borderRadius: 22, objectFit: "cover", width: 310, height: 392 }} />
          </div>
        </div>
      </div>
    ),
    SHARE_SIZE,
  );
}
