"use client";

import { useMemo } from "react";
import * as THREE from "three";

// Textures drawn in code on a <canvas>: no image downloads, tiny cost.

function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  draw(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Warm brown laminate planks, like the floor in the photos. */
export function useWoodTexture() {
  return useMemo(() => {
    const tex = canvasTexture(512, 512, (ctx) => {
      const plankH = 64;
      for (let row = 0; row < 512 / plankH; row++) {
        const offset = (row % 2) * 160 + ((row * 97) % 120);
        for (let x = -offset; x < 512; x += 320) {
          const l = 30 + ((row * 13 + x) % 7);
          ctx.fillStyle = `hsl(24, 42%, ${l}%)`;
          ctx.fillRect(x, row * plankH, 320, plankH);
          // Grain lines.
          for (let g = 0; g < 9; g++) {
            ctx.strokeStyle = `rgba(40, 20, 8, ${0.08 + (g % 3) * 0.04})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            const y = row * plankH + 4 + g * 7;
            ctx.moveTo(x, y);
            ctx.bezierCurveTo(x + 100, y + 3, x + 220, y - 3, x + 320, y + 1);
            ctx.stroke();
          }
          // Seams.
          ctx.fillStyle = "rgba(20, 10, 4, 0.55)";
          ctx.fillRect(x, row * plankH, 2, plankH);
        }
        ctx.fillRect(0, row * plankH, 512, 1.5);
      }
    });
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3.5, 3);
    return tex;
  }, []);
}

/** Navy-and-cream medallion rug, a simplified take on the one in the photos. */
export function useRugTexture() {
  return useMemo(
    () =>
      canvasTexture(512, 704, (ctx) => {
        const W = 512;
        const H = 704;
        ctx.fillStyle = "#1d2433";
        ctx.fillRect(0, 0, W, H);
        // Borders.
        const bands = [
          { inset: 10, color: "#c8b48c", w: 6 },
          { inset: 30, color: "#7a2e24", w: 14 },
          { inset: 52, color: "#c8b48c", w: 4 },
        ];
        for (const b of bands) {
          ctx.strokeStyle = b.color;
          ctx.lineWidth = b.w;
          ctx.strokeRect(b.inset, b.inset, W - b.inset * 2, H - b.inset * 2);
        }
        // Small repeating motif in the field.
        ctx.fillStyle = "rgba(200, 180, 140, 0.35)";
        for (let y = 80; y < H - 70; y += 34) {
          for (let x = 80 + ((y / 34) % 2) * 17; x < W - 70; x += 34) {
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        // Central medallion.
        ctx.save();
        ctx.translate(W / 2, H / 2);
        for (let r = 150; r > 20; r -= 26) {
          ctx.fillStyle = (r / 26) % 2 < 1 ? "#c8b48c" : "#2d3a55";
          ctx.beginPath();
          for (let i = 0; i <= 16; i++) {
            const a = (i / 16) * Math.PI * 2;
            const rr = r * (i % 2 ? 0.82 : 1);
            ctx.lineTo(Math.cos(a) * rr * 0.8, Math.sin(a) * rr);
          }
          ctx.fill();
        }
        ctx.fillStyle = "#7a2e24";
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }),
    [],
  );
}

/** Whiteboard with a few faint marker scribbles. */
export function useWhiteboardTexture() {
  return useMemo(
    () =>
      canvasTexture(512, 384, (ctx) => {
        ctx.fillStyle = "#eef0f2";
        ctx.fillRect(0, 0, 512, 384);
        ctx.strokeStyle = "rgba(40, 60, 120, 0.55)";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        // Loose sketch of a flow diagram, like notes left on the board.
        ctx.strokeRect(60, 70, 110, 60);
        ctx.strokeRect(300, 70, 130, 60);
        ctx.strokeRect(180, 240, 140, 60);
        ctx.beginPath();
        ctx.moveTo(170, 100);
        ctx.lineTo(300, 100);
        ctx.moveTo(365, 130);
        ctx.lineTo(290, 240);
        ctx.moveTo(115, 130);
        ctx.lineTo(210, 240);
        ctx.stroke();
        ctx.font = "bold 26px sans-serif";
        ctx.fillStyle = "rgba(40, 60, 120, 0.6)";
        ctx.fillText("idea", 85, 110);
        ctx.fillText("build", 330, 110);
        ctx.fillText("ship", 220, 280);
      }),
    [],
  );
}

/**
 * Matte paint: faint, large-scale tonal variation plus fine grain, so a wall
 * reads as painted plaster rather than one flat colour.
 */
export function usePaintTexture() {
  return useMemo(() => {
    const tex = canvasTexture(256, 256, (ctx) => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 256, 256);
      // Soft blotches (roller marks).
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const r = 30 + Math.random() * 60;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        const a = 0.01 + Math.random() * 0.012;
        g.addColorStop(0, `rgba(0,0,0,${a})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      // Fine grain.
      const img = ctx.getImageData(0, 0, 256, 256);
      for (let i = 0; i < img.data.length; i += 4) {
        const n = (Math.random() - 0.5) * 10;
        img.data[i] += n;
        img.data[i + 1] += n;
        img.data[i + 2] += n;
      }
      ctx.putImageData(img, 0, 0);
    });
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 2);
    return tex;
  }, []);
}
