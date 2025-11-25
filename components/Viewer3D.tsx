import React, { useEffect, useState } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { STLLoader } from 'three-stdlib';
import { OrbitControls, Stage, Center } from '@react-three/drei';
import * as THREE from 'three';

interface ViewerProps {
  url: string;
  onGeometryLoaded: (volume: number, height: number) => void;
}

// Function to calculate volume of a geometry (signed volume of triangles)
const getVolume = (geometry: THREE.BufferGeometry) => {
  let position = geometry.attributes.position;
  let faces = position.count / 3;
  let sum = 0;
  let p1 = new THREE.Vector3(), p2 = new THREE.Vector3(), p3 = new THREE.Vector3();

  for (let i = 0; i < faces; i++) {
    p1.fromBufferAttribute(position, i * 3 + 0);
    p2.fromBufferAttribute(position, i * 3 + 1);
    p3.fromBufferAttribute(position, i * 3 + 2);
    sum += p1.dot(p2.cross(p3)) / 6.0;
  }
  return Math.abs(sum); // Return absolute volume
}

const Model: React.FC<ViewerProps> = ({ url, onGeometryLoaded }) => {
  const geometry = useLoader(STLLoader, url);
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (geometry && !processed) {
      // Center geometry to avoid offset issues
      geometry.center();
      geometry.computeBoundingBox();

      const volumeCm3 = getVolume(geometry) / 1000; // Convert mm3 to cm3
      
      let heightMm = 0;
      if (geometry.boundingBox) {
        heightMm = geometry.boundingBox.max.z - geometry.boundingBox.min.z;
      }
      
      onGeometryLoaded(volumeCm3, heightMm);
      setProcessed(true);
    }
  }, [geometry, onGeometryLoaded, processed]);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
      {/* Updated color to be more resin-like (Grey/Beige) */}
      <meshStandardMaterial 
        color="#D4A373" 
        roughness={0.4} 
        metalness={0.2} 
      />
    </mesh>
  );
};

const Viewer3D: React.FC<ViewerProps> = (props) => {
  return (
    <div className="w-full h-full relative bg-gradient-to-b from-[#2C241B] to-[#1a1512]">
      <Canvas shadows camera={{ position: [0, 50, 100], fov: 45 }}>
        <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} />
        <Stage environment="city" intensity={0.5} adjustCamera={1.2}>
           <Center>
             <Model {...props} />
           </Center>
        </Stage>
        {/* Grid removed as requested */}
      </Canvas>
      <div className="absolute top-4 right-4 text-xs font-mono text-coffee-400 bg-black/40 px-3 py-1 rounded backdrop-blur-sm pointer-events-none border border-coffee-800">
        VISUALIZAÇÃO 3D
      </div>
    </div>
  );
};

export default Viewer3D;