"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * High-Performance WebGL Particle Shader Background
 * Features: DPR clamping, IntersectionObserver pausing, memory disposal, zero layout thrashing
 */
export default function ShaderBackground({
  particleCount = 1200,
  accentColor = "#e20b3a",
  baseColor = "#ffffff",
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    // Critical: Clamp DPR to 1.75 max to prevent mobile GPU throttling
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 24;

    // Procedural Particle Buffer Geometry
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const cAccent = new THREE.Color(accentColor);
    const cBase = new THREE.Color(baseColor);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      const mixFactor = Math.random();
      const c = mixFactor > 0.75 ? cAccent : cBase;
      colors[i * 3 + 0] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let isVisible = true;
    let frameId = 0;
    let clock = new THREE.Clock();

    function renderLoop() {
      frameId = 0;
      if (!isVisible || document.hidden) return;

      const elapsed = clock.getElapsedTime();
      particles.rotation.y = elapsed * 0.035;
      particles.rotation.x = Math.sin(elapsed * 0.02) * 0.05;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(renderLoop);
    }

    function wake() {
      if (!frameId && isVisible && !document.hidden) {
        frameId = requestAnimationFrame(renderLoop);
      }
    }

    function handleResize() {
      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const height = canvas.parentElement?.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
      wake();
    }

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas.parentElement || document.body);

    const intersection = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      wake();
    }, { threshold: 0 });
    intersection.observe(canvas);

    document.addEventListener("visibilitychange", wake);
    handleResize();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", wake);

      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [particleCount, accentColor, baseColor]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
