import { useRef, useEffect } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";
import vertexShader from "./Shaders/vertex.glsl"; // Import the vertex shader
import fragmentShader from "./Shaders/fragment.glsl"; // Import the fragment shader
import { useThemeStore } from "../store/useThemeStore"; // Import useThemeStore


const CustomShaderMaterial = new THREE.ShaderMaterial({
	uniforms: {
		time: { value: 0.0 },
		colorA: { value: new THREE.Color("#a5b4fc") }, // Default for --bg-color (Indigo 300)
		colorB: { value: new THREE.Color("#6366f1") }, // Default for --primary-color (Indigo 500)
	},
	vertexShader, // Use the imported vertex shader
	fragmentShader, // Use the imported fragment shader
});

extend({ CustomShaderMaterial: THREE.ShaderMaterial });

const MeshComponent = () => {
	const materialRef = useRef();
	const { theme } = useThemeStore(); // Get the current theme from the store

	useEffect(() => {
		const rootStyle = getComputedStyle(document.documentElement);
		const primaryColor = rootStyle.getPropertyValue('--primary-color').trim();

		if (materialRef.current) {
			materialRef.current.uniforms.colorB.value.set("#FFFFFF"); // Fallback to default indigo 300
			materialRef.current.uniforms.colorA.value.set(primaryColor || '#6366f1'); // Fallback to default indigo 500
		}
	}, [theme]); // Re-run this effect whenever the theme changes

	useFrame((state) => {
		if (materialRef.current) {
			materialRef.current.uniforms.time.value = state.clock.getElapsedTime();
		}
	});

	return (
		<Sphere args={[1.5, 64, 64]}>
			<shaderMaterial ref={materialRef} attach='material' args={[CustomShaderMaterial]} />
		</Sphere>
	);
};

const ThreeScene = () => {
	return (
		<Canvas>
			<ambientLight intensity={0.5} />
			<MeshComponent />
		</Canvas>
	);
};

export default ThreeScene;