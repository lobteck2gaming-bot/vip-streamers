import { useEffect, useRef } from 'react';
import type { Member } from '@/lib/community-schema';

export function Globe({ streamers }: { streamers: Member[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    let disposed = false;
    let cleanup = () => {};
    Promise.all([import('three'), import('three/addons/controls/TrackballControls.js')]).then(([THREE, { TrackballControls }]) => {
      if (disposed) return;
      const token = (name: string) => {
        const probe = document.createElement('span');
        probe.style.color = `var(${name})`;
        container.appendChild(probe);
        const color = getComputedStyle(probe).color;
        probe.remove();
        // Canvas converts modern CSS colors into an RGB value for WebGL.
        const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (!ctx) return new THREE.Color();
        ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1);
        const [pr, pg, pb] = ctx.getImageData(0, 0, 1, 1).data;
        return new THREE.Color().setRGB((pr ?? 0) / 255, (pg ?? 0) / 255, (pb ?? 0) / 255, THREE.SRGBColorSpace);
      };
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.set(0, 0.3, 4.3);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.domElement.setAttribute('aria-label', 'Globe of streamers');
      container.appendChild(renderer.domElement);
      const controls = new TrackballControls(camera, renderer.domElement);
      controls.noZoom = true; controls.noPan = true; controls.rotateSpeed = 2.5;
      const globe = new THREE.Group(); scene.add(globe);
      globe.add(new THREE.Mesh(new THREE.SphereGeometry(0.995, 48, 48), new THREE.MeshBasicMaterial({ color: token('--background') })));
      const positions: number[] = [];
      for (let i = 0; i < 1800; i++) {
        const y = 1 - 2 * (i + 0.5) / 1800, r = Math.sqrt(1 - y * y), a = i * 2.399963;
        positions.push(r * Math.cos(a), y, r * Math.sin(a));
      }
      const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      globe.add(new THREE.Points(geometry, new THREE.PointsMaterial({ color: token('--gold'), size: 0.013, transparent: true, opacity: 0.75 })));
      globe.add(new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.SphereGeometry(1, 24, 12)), new THREE.LineBasicMaterial({ color: token('--gold'), transparent: true, opacity: 0.12 })));
      const markers = streamers.map((member, i) => {
        const y = 1 - 2 * (i + 0.5) / streamers.length, r = Math.sqrt(1 - y * y), a = i * 2.399963;
        const position = new THREE.Vector3(r * Math.cos(a), y, r * Math.sin(a));
        const color = token(member.platform === 'kick' ? '--kick' : '--youtube');
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 12), new THREE.MeshBasicMaterial({ color }));
        dot.position.copy(position.clone().multiplyScalar(1.025)); globe.add(dot);
        const line = new THREE.BufferGeometry().setFromPoints([position, position.clone().multiplyScalar(1.15)]);
        globe.add(new THREE.Line(line, new THREE.LineBasicMaterial({ color })));
        const label = document.createElement('a'); label.className = `globe-marker ${member.platform === 'kick' ? 'text-kick' : 'text-youtube'}`;
        label.href = member.url; label.target = '_blank'; label.rel = 'noreferrer'; label.title = member.name;
        const avatar = document.createElement('span'); avatar.className = 'globe-avatar';
        if (member.avatar_url) { const img = document.createElement('img'); img.src = member.avatar_url; img.alt = ''; avatar.appendChild(img); }
        else avatar.textContent = member.name.slice(0, 2).toUpperCase();
        const name = document.createElement('span'); name.textContent = member.name;
        label.append(avatar, name); container.appendChild(label);
        return { label, position: position.multiplyScalar(1.18) };
      });
      const resize = () => {
        const w = container.clientWidth, h = container.clientHeight;
        renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); controls.handleResize();
      };
      const observer = new ResizeObserver(resize); observer.observe(container); resize();
      // The globe always spins on its own; it only pauses while the user drags it.
      let paused = false, frame = 0, previous = performance.now();
      const down = () => { paused = true; };
      const up = () => { paused = false; };
      renderer.domElement.addEventListener('pointerdown', down); window.addEventListener('pointerup', up);
      const animate = (time: number) => {
        const dt = Math.min((time - previous) / 1000, 0.05); previous = time;
        if (!paused) globe.rotation.y += dt * 0.35;
        controls.update(); globe.updateMatrixWorld();
        const forward = camera.position.clone().normalize();
        markers.forEach(({ label, position }) => {
          const world = position.clone().applyMatrix4(globe.matrixWorld);
          const visible = world.clone().normalize().dot(forward) > 0.1;
          label.hidden = !visible;
          if (visible) { const p = world.project(camera); label.style.transform = `translate(-50%, -50%) translate(${(p.x + 1) * container.clientWidth / 2}px, ${(1 - p.y) * container.clientHeight / 2}px)`; }
        });
        renderer.render(scene, camera); frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
      cleanup = () => {
        cancelAnimationFrame(frame); observer.disconnect(); controls.dispose();
        window.removeEventListener('pointerup', up); renderer.domElement.removeEventListener('pointerdown', down);
        scene.traverse(object => { if ('geometry' in object) (object.geometry as import('three').BufferGeometry).dispose(); if ('material' in object) { const material = object.material as import('three').Material; material.dispose(); } });
        renderer.dispose(); container.replaceChildren();
      };
    });
    return () => { disposed = true; cleanup(); };
  }, [streamers]);
  return <div ref={ref} className="relative h-full w-full cursor-grab touch-none active:cursor-grabbing" />;
}
