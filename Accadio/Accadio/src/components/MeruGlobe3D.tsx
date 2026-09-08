"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { TEXTURE_DATA_URL } from "./textureData";

interface MeruGlobe3DProps {
  size?: number;
  className?: string;
}

export default function MeruGlobe3D({ size = 220, className = "" }: MeruGlobe3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!mountRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 3.2);

    // Texture loading
    const loader = new THREE.TextureLoader();
    let sphereTexture: THREE.Texture | null = null;
    let sphere: THREE.Mesh | null = null;
    let pivot: THREE.Group | null = null;
    let isDisposed = false;

    // Function to stretch image to 2:1 for equirectangular mapping
    function toEquirect(srcTex: THREE.Texture) {
      const img = srcTex.image as HTMLImageElement | undefined;
      if (!img || !img.width) return srcTex;
      const W = Math.max(img.width, img.height) * 2;
      const H = W / 2;
      const cvs = document.createElement("canvas");
      cvs.width = W;
      cvs.height = H;
      const ctx = cvs.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, W, H);
        ctx.drawImage(img, 0, 0, W, H);
      }
      const t = new THREE.CanvasTexture(cvs);
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = THREE.ClampToEdgeWrapping;
      t.wrapT = THREE.ClampToEdgeWrapping;
      return t;
    }

    function makePlaceholderTexture() {
      const s = 1024;
      const cvs = document.createElement("canvas");
      cvs.width = s;
      cvs.height = s / 2;
      const ctx = cvs.getContext("2d");
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 0, s / 2);
        grad.addColorStop(0, "#0d1b3e");
        grad.addColorStop(0.4, "#112244");
        grad.addColorStop(1, "#0a1628");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, s, s / 2);

        const blobs = [
          { x: 0.18, y: 0.35, rx: 0.09, ry: 0.14 },
          { x: 0.32, y: 0.40, rx: 0.07, ry: 0.10 },
          { x: 0.52, y: 0.30, rx: 0.12, ry: 0.17 },
          { x: 0.68, y: 0.45, rx: 0.06, ry: 0.09 },
          { x: 0.80, y: 0.35, rx: 0.08, ry: 0.12 },
          { x: 0.14, y: 0.65, rx: 0.05, ry: 0.08 },
          { x: 0.60, y: 0.62, rx: 0.09, ry: 0.07 },
        ];

        for (const b of blobs) {
          const g2 = ctx.createRadialGradient(
            b.x * s,
            b.y * (s / 2),
            0,
            b.x * s,
            b.y * (s / 2),
            b.rx * s
          );
          g2.addColorStop(0, "rgba(72,110,180,0.85)");
          g2.addColorStop(0.6, "rgba(48,80,150,0.5)");
          g2.addColorStop(1, "rgba(20,40,100,0)");
          ctx.save();
          ctx.scale(1, (b.ry / b.rx) * 0.5);
          ctx.beginPath();
          ctx.arc(
            b.x * s,
            (b.y * (s / 2)) * (2 / (b.ry / b.rx)),
            b.rx * s,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = g2;
          ctx.fill();
          ctx.restore();
        }

        ctx.strokeStyle = "rgba(100,160,255,0.08)";
        ctx.lineWidth = 1;
        for (let i = 1; i < 8; i++) {
          ctx.beginPath();
          ctx.moveTo((i * s) / 8, 0);
          ctx.lineTo((i * s) / 8, s / 2);
          ctx.stroke();
        }
      }
      return new THREE.CanvasTexture(cvs);
    }

    // Build scene function
    function buildScene(rawTex: THREE.Texture) {
      if (isDisposed) return;
      const texture = rawTex.image ? toEquirect(rawTex) : rawTex;

      const geo = new THREE.SphereGeometry(1, 128, 128);
      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.85,
        metalness: 0.0,
      });
      sphere = new THREE.Mesh(geo, mat);

      const atmGeo = new THREE.SphereGeometry(1.055, 64, 64);
      const atmMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x88aaff),
        transparent: true,
        opacity: 0.06,
        side: THREE.FrontSide,
        depthWrite: false,
        roughness: 1,
        metalness: 0,
      });
      const atmosphere = new THREE.Mesh(atmGeo, atmMat);

      const rimGeo = new THREE.SphereGeometry(1.10, 64, 64);
      const rimMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x3366cc),
        transparent: true,
        opacity: 0.035,
        side: THREE.BackSide,
        depthWrite: false,
        roughness: 1,
        metalness: 0,
      });
      const rim = new THREE.Mesh(rimGeo, rimMat);

      pivot = new THREE.Group();
      pivot.rotation.z = THREE.MathUtils.degToRad(23.5);
      pivot.add(sphere, atmosphere, rim);
      scene.add(pivot);

      // Lights
      const ambient = new THREE.AmbientLight(0xffffff, 1.6);
      scene.add(ambient);

      const sun = new THREE.DirectionalLight(0xfff5e0, 1.0);
      sun.position.set(5, 3, 4);
      scene.add(sun);

      const fill = new THREE.DirectionalLight(0xaabbff, 0.3);
      fill.position.set(-4, -1, -3);
      scene.add(fill);
    }

    loader.load(
      TEXTURE_DATA_URL,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        sphereTexture = tex;
        buildScene(tex);
      },
      undefined,
      () => {
        const placeholder = makePlaceholderTexture();
        sphereTexture = placeholder;
        buildScene(placeholder);
      }
    );

    // Animation variables
    let animationFrameId: number;
    const BASE_SPEED = 0.0025;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      if (sphere && !isDragging) {
        sphere.rotation.y += BASE_SPEED;
      }
      renderer.render(scene, camera);
    }
    animate();

    // Drag-to-rotate logic
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !sphere || !pivot) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      sphere.rotation.y += dx * 0.005;
      pivot.rotation.x += dy * 0.003;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    // Touch support
    let prevTouch: Touch | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      prevTouch = e.touches[0];
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!prevTouch || !sphere || !pivot) return;
      const t = e.touches[0];
      const dx = t.clientX - prevTouch.clientX;
      const dy = t.clientY - prevTouch.clientY;
      sphere.rotation.y += dx * 0.005;
      pivot.rotation.x += dy * 0.003;
      prevTouch = t;
    };

    const handleTouchEnd = () => {
      prevTouch = null;
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });
    canvas.addEventListener("touchend", handleTouchEnd);

    // Cleanup function
    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);

      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);

      // Recursive disposal of scene objects
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      if (sphereTexture) sphereTexture.dispose();
      renderer.dispose();
    };
  }, [size]);

  return (
    <div
      ref={mountRef}
      className={`relative select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          cursor: "grab",
        }}
      />
    </div>
  );
}
