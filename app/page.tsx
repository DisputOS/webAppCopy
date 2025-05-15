'use client';

import { useEffect } from 'react';
import * as THREE from 'three';

export default function LandingComingSoon() {
  useEffect(() => {
    const canvas = document.getElementById('scene') as HTMLCanvasElement;
    if (!canvas) return;

    const gl = (
  canvas.getContext('webgl2') ||
  canvas.getContext('webgl') ||
  canvas.getContext('experimental-webgl')
) as WebGLRenderingContext | WebGL2RenderingContext | null;

if (!gl) {
  alert('❌ WebGL не поддерживается вашим браузером или видеокартой.');
  return;
}


    const renderer = new THREE.WebGLRenderer({ canvas, context: gl, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 32);
    const material = new THREE.MeshNormalMaterial();
    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      torus.rotation.x += 0.01;
      torus.rotation.y += 0.01;

      camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 2 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-950 px-6 py-12 font-mono text-white text-center">
      <canvas id="scene" className="fixed top-0 left-0 -z-20 w-screen h-screen" />

      <div className="absolute inset-0 -z-10 bg-[conic-gradient(at_bottom_right,theme(colors.blue.900),theme(colors.indigo.900),theme(colors.black))] bg-[length:400%_400%] animate-slowSpin opacity-25 blur-3xl" />

      <div className="mb-10 animate-fadeInUp">
        <h1 className="text-5xl font-extrabold tracking-wider">
          Disput<span className="text-blue-400">.Brain</span>
        </h1>
        <p className="mt-2 uppercase text-sm tracking-[0.3em] text-gray-400">
          Legal Operating System
        </p>
      </div>

      <h2 className="mb-6 animate-fadeInUp text-4xl font-bold">We’re cooking something big.</h2>

      <p className="mx-auto max-w-lg animate-fadeInUp text-base leading-relaxed text-gray-300">
        Disput.ai is building an AI‑powered autopilot for digital consumers. Soon you’ll be able
        to file e‑commerce disputes, auto‑generate legally sound evidence bundles, and reclaim your
        rights in minutes — not weeks. Our team is working hard on the private alpha; public beta
        will open later this year.
      </p>

      <p className="animate-fadeInSlow absolute bottom-4 text-xs text-gray-500">
        © 2025 DisputBrain — All rights reserved.
      </p>

      <style jsx>{`
        @keyframes slowSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-slowSpin { animation: slowSpin 40s linear infinite; }

        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }

        @keyframes fadeInSlow {
          0% { opacity: 0; }
          100% { opacity: 0.4; }
        }
        .animate-fadeInSlow { animation: fadeInSlow 2s ease forwards 1.2s; }
      `}</style>
    </main>
  );
}
