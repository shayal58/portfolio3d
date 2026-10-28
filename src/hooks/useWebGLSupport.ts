"use client";

import { useEffect, useState } from "react";

/**
 * null  = still checking (first render, avoids a flash)
 * true  = WebGL works, render the 3D scene
 * false = no WebGL, the page shows its plain HTML version only
 */
export function useWebGLSupport(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      setSupported(Boolean(gl));
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}
