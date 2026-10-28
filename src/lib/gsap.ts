"use client";

import gsap from "gsap";

// By default GSAP "lag smooths": after a long frame it advances only ~33 ms,
// so on a struggling device every animation slows to a crawl and the
// camera can sit half-way through a move for seconds. Turning it off makes
// animations follow real time: a dropped frame skips ahead instead.
gsap.ticker.lagSmoothing(0);

export { gsap };
export default gsap;
