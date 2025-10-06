import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

// Image data for the carousel
const images = [
  '/thumbnails/a1.jpg',
  '/thumbnails/a2.jpg',
  '/thumbnails/a3.jpg',
  '/thumbnails/a4.jpg',
  '/thumbnails/a5.jpg',
  '/thumbnails/a6.jpg',
  '/thumbnails/a7.png',
  '/thumbnails/a8.jpg',
  '/thumbnails/a9.jpg',
  '/thumbnails/a10.jpg',
  '/thumbnails/a11.jpg',
];

interface ImageCardProps {
  position: [number, number, number];
  rotation: [number, number, number];
  image: string;
  index: number;
}

function ImageCard({ position, rotation, image, index }: ImageCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.1;
      
      // Scale on hover
      const targetScale = hovered ? 1.1 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  const texture = new THREE.TextureLoader().load(image);

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <planeGeometry args={[2, 2.8]} />
      <meshStandardMaterial map={texture} />
      
      {/* Glowing border effect when hovered */}
      {hovered && (
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[2.2, 3]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.3} />
        </mesh>
      )}
    </mesh>
  );
}

function CarouselGroup() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Continuous rotation
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  const radius = 8;
  const angleStep = (Math.PI * 2) / images.length;

  return (
    <group ref={groupRef}>
      {images.map((image, index) => {
        const angle = index * angleStep;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(index * 0.5) * 2; // Varying heights for visual interest
        
        return (
          <ImageCard
            key={index}
            position={[x, y, z]}
            rotation={[0, -angle + Math.PI / 2, 0]}
            image={image}
            index={index}
          />
        );
      })}
    </group>
  );
}

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.02;
    }
  });

  // Create particle positions
  const particleCount = 200;
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.05} transparent opacity={0.6} />
    </points>
  );
}

export default function Carousel3D() {
  return (
    <div className="h-[600px] w-full relative">
      {/* Decorative text elements */}
      <div className="absolute top-10 left-10 text-white/60 text-sm transform -rotate-12 z-10">
        It's Free
      </div>
      <div className="absolute top-10 right-10 text-white/60 text-sm transform rotate-12 z-10">
        Remote friendly
      </div>
      
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#00ff88" />
        
        {/* Particle background */}
        <ParticleField />
        
        {/* Main carousel */}
        <CarouselGroup />
        
        {/* Controls */}
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          autoRotate={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}