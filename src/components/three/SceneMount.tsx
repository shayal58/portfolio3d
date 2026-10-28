"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import { useSceneStore } from "@/stores/useSceneStore";

// Three.js is loaded only in the browser and only after the HTML is on
// screen, so text content never waits for the 3D bundle.
const Experience = dynamic(() => import("./Experience"), { ssr: false });

export function SceneMount() {
  const webgl = useWebGLSupport();
  const markStage = useSceneStore((s) => s.markStage);
  const setNoWebGL = useSceneStore((s) => s.setNoWebGL);

  useEffect(() => {
    if (webgl === null) return;
    markStage("checked");
    if (!webgl) {
      // Nothing 3D to wait for.
      setNoWebGL(true);
      useSceneStore.getState().setAssets(1);
      markStage("module");
      markStage("frame");
    }
  }, [webgl, markStage, setNoWebGL]);

  if (webgl === null) return null;
  if (!webgl) {
    // No WebGL: a static warm glow instead of the scene. All content is
    // still in the HTML, so nothing is lost.
    return (
      <div
        aria-hidden
        className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(255,100,46,0.18),transparent_60%)]"
      />
    );
  }
  return <Experience />;
}
