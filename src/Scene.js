import {
  OrbitControls,
  useGLTF,
  useTexture,
  MeshPortalMaterial,
  RoundedBox,
  Text,
  CameraControls,
} from "@react-three/drei";
import * as THREE from "three";
import { useState, useRef, useEffect } from "react";
import { easing } from "maath";
import { useFrame } from "@react-three/fiber";

const Scene = () => {
  const [activeBox, setActiveBox] = useState(null); // Track active RoundedBox
  const [audioRefs, setAudioRefs] = useState({}); // Store audio elements for each box
  const meshPortalMaterialRef1 = useRef();
  const meshPortalMaterialRef2 = useRef();
  const meshPortalMaterialRef3 = useRef();
  const meshPortalMaterialRef4 = useRef();
  const [targetPosition, setTargetPosition] = useState(new THREE.Vector3()); // Store target position

  // Tạo Hoa Đào
  const petalsRef = useRef([]);
  const numPetals = 50; // Number of petals to render
  const petalPositions = useRef([]);

  const cameraControlsRef = useRef();

  useFrame((_, delta) => {
    if (meshPortalMaterialRef1.current) {
      easing.damp(
        meshPortalMaterialRef1.current,
        "blend",
        activeBox === "box1" ? 1 : 0,
        0.2,
        delta
      );
    }
    if (meshPortalMaterialRef2.current) {
      easing.damp(
        meshPortalMaterialRef2.current,
        "blend",
        activeBox === "box2" ? 1 : 0,
        0.2,
        delta
      );
    }
    if (meshPortalMaterialRef3.current) {
      easing.damp(
        meshPortalMaterialRef3.current,
        "blend",
        activeBox === "box3" ? 1 : 0,
        0.2,
        delta
      );
    }
    if (meshPortalMaterialRef4.current) {
      easing.damp(
        meshPortalMaterialRef4.current,
        "blend",
        activeBox === "box4" ? 1 : 0,
        0.2,
        delta
      );
    }
  });

  useEffect(() => {
    if (activeBox && targetPosition) {
      // Smooth camera transition to the target position
      cameraControlsRef.current.setLookAt(
        targetPosition.x,
        targetPosition.y,
        targetPosition.z + 5, // Adjust distance from target
        targetPosition.x,
        targetPosition.y,
        targetPosition.z,
        true
      );
    } else {
      cameraControlsRef.current.setLookAt(0, 0, 5, 0, 0, 0, true);
    }
  }, [activeBox, targetPosition]);

  // Initialize audio elements
  useEffect(() => {
    const audioElements = {
      box1: new Audio("./music/autumn.mp3"),
      box2: new Audio("./music/winter.mp3"),
      box3: new Audio("./music/spring.mp3"),
      box4: new Audio("./music/summer.mp3"),
    };

    // Set the audio elements
    setAudioRefs(audioElements);

    // Cleanup audio on unmount
    return () => {
      Object.values(audioElements).forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
    };
  }, []);

  const playAudio = (box) => {
    // Stop all other audios
    Object.entries(audioRefs).forEach(([key, audio]) => {
      if (key !== box) audio.pause();
    });

    // Play the selected audio
    if (audioRefs[box]) {
      audioRefs[box].currentTime = 0; // Reset to the start
      audioRefs[box].play();
    }
  };

  const model = useGLTF("./model/autumn_coffee.glb");
  const model1 = useGLTF("./model/snow_globe.glb");
  const modelSpring = useGLTF("./model/the_piano_and_the_forest_new.glb");
  const modelSummer = useGLTF("./model/summer.glb");

  const textureSummer = useTexture("./texture/summer.jpg");
  const textureAutumn = useTexture("./texture/autumn.jpg");
  const textureWinter = useTexture("./texture/epic.jpg");
  const textureSpring = useTexture("./texture/spring.jpg");

  const doubleClickHandler = (box, position) => {
    if (activeBox === box) {
      setActiveBox(null);
      playAudio(null); // Stop all audio
    } else {
      setActiveBox(box);
      setTargetPosition(position);
      playAudio(box); // Play audio for the selected box
    }
  };

  // Sakura Petal Effect
  const { scene: petalModel } = useGLTF("./model/cherry_blossom_petal.glb");
  // Initialize petal positions
  useEffect(() => {
    petalPositions.current = Array.from({ length: numPetals }, () => ({
      x: THREE.MathUtils.randFloatSpread(5),
      y: Math.random() * 5 + 2,
      z: THREE.MathUtils.randFloatSpread(5),
      speed: Math.random() * 0.02 + 0.01,
    }));
  }, []);

  // Falling animation for petals
  useFrame(() => {
    petalPositions.current.forEach((pos, index) => {
      pos.y -= pos.speed; // Move petal downward
      if (pos.y < -2) {
        // Reset position when below threshold
        pos.y = Math.random() * 5 + 2;
        pos.x = THREE.MathUtils.randFloatSpread(5);
        pos.z = THREE.MathUtils.randFloatSpread(5);
      }
      petalsRef.current[index].position.set(pos.x, pos.y, pos.z);
    });
  });

  // Autumn Leaf Effect
  const { scene: autumnLeafModel } = useGLTF("./model/dry_leaf_.rawscan.glb");

  // Initialize autumn leaf positions
  const autumnLeafPositions = useRef([]);
  const numAutumnLeaves = 25; // Number of autumn leaves to render
  const autumnLeavesRef = useRef([]);

  useEffect(() => {
    autumnLeafPositions.current = Array.from(
      { length: numAutumnLeaves },
      () => ({
        x: THREE.MathUtils.randFloatSpread(5),
        y: Math.random() * 5 + 2,
        z: THREE.MathUtils.randFloatSpread(5),
        speed: Math.random() * 0.02 + 0.01,
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        rotationSpeed: new THREE.Vector3(
          Math.random() * 0.005,
          Math.random() * 0.005,
          Math.random() * 0.005
        ),
      })
    );
  }, []);

  useFrame(() => {
    autumnLeafPositions.current.forEach((pos, index) => {
      pos.y -= pos.speed; // Move autumn leaf downward
      pos.rotation.x += pos.rotationSpeed.x;
      pos.rotation.y += pos.rotationSpeed.y;
      pos.rotation.z += pos.rotationSpeed.z;

      if (pos.y < -2) {
        // Reset position when below threshold
        pos.y = Math.random() * 5 + 2;
        pos.x = THREE.MathUtils.randFloatSpread(5);
        pos.z = THREE.MathUtils.randFloatSpread(5);
      }
      autumnLeavesRef.current[index].position.set(pos.x, pos.y, pos.z);
      autumnLeavesRef.current[index].rotation.set(
        pos.rotation.x,
        pos.rotation.y,
        pos.rotation.z
      );
    });
  });

  // Effect Winter
  const SnowParticles = ({ count = 500 }) => {
    const points = useRef();
    const tempObject = new THREE.Object3D();

    // Generate particles with randomness
    const particles = Array.from({ length: count }, () => ({
      position: new THREE.Vector3(
        THREE.MathUtils.randFloatSpread(10), // Random x position
        THREE.MathUtils.randFloat(5, 10), // Random y position (start higher)
        THREE.MathUtils.randFloatSpread(10) // Random z position
      ),
      speed: THREE.MathUtils.randFloat(0.01, 0.03), // Random falling speed
      size: THREE.MathUtils.randFloat(0.02, 0.06), // Smaller random size
      opacity: THREE.MathUtils.randFloat(0.5, 1), // Random opacity for realism
      rotation: new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ),
      rotationSpeed: new THREE.Vector3(
        Math.random() * 0.005,
        Math.random() * 0.005,
        Math.random() * 0.005
      ),
      drift: THREE.MathUtils.randFloatSpread(0.02), // Drift factor for wind effect
    }));

    useFrame(() => {
      particles.forEach((particle, i) => {
        // Update falling position
        particle.position.y -= particle.speed;

        // Apply wind drift
        particle.position.x += particle.drift;

        // Update rotation for spinning effect
        particle.rotation.x += particle.rotationSpeed.x;
        particle.rotation.y += particle.rotationSpeed.y;
        particle.rotation.z += particle.rotationSpeed.z;

        // Reset particle if it falls out of bounds
        if (particle.position.y < -5) {
          particle.position.y = 5;
          particle.position.x = THREE.MathUtils.randFloatSpread(10);
          particle.position.z = THREE.MathUtils.randFloatSpread(10);
        }

        // Update matrix for each particle
        tempObject.position.copy(particle.position);
        tempObject.rotation.copy(particle.rotation);
        tempObject.updateMatrix();
        points.current.setMatrixAt(i, tempObject.matrix);
      });
      points.current.instanceMatrix.needsUpdate = true;
    });

    return (
      <instancedMesh
        ref={points}
        args={[null, null, count]}
        position={[0, 0, 0]}
      >
        <sphereGeometry args={[0.02, 16, 16]} /> {/* Adjust size here */}
        <meshStandardMaterial color="white" transparent opacity={0.8} />
      </instancedMesh>
    );
  };

  return (
    <>
      <CameraControls ref={cameraControlsRef} />

      {/* First RoundedBox - Spring*/}
      <Text
        font="./font/FZTPGAME.TTF"
        position={[-5, 1.8, 0.1]}
        fontSize={0.6}
        color="pink"
      >
        Spring
      </Text>
      <RoundedBox
        args={[3, 4, 0.1]}
        radius={0.1}
        position={[-5, 0, 0]}
        onDoubleClick={
          () => doubleClickHandler("box3", new THREE.Vector3(-5, 0, 0)) // Adjust center position
        }
      >
        <MeshPortalMaterial ref={meshPortalMaterialRef3}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
          <primitive object={modelSpring.scene} scale={0.3} position-y={-0.9} />
          <mesh>
            <sphereGeometry args={[8, 64, 64]} />
            <meshBasicMaterial map={textureSpring} side={THREE.BackSide} />
          </mesh>
          {/* Cherry Blossom Petals */}
          {Array.from({ length: numPetals }).map((_, index) => (
            <primitive
              key={index}
              ref={(el) => (petalsRef.current[index] = el)}
              object={petalModel.clone()}
              scale={0.1}
            />
          ))}
        </MeshPortalMaterial>
      </RoundedBox>
      {/* Second RoundedBox - Autumn*/}
      <Text
        font="./font/FZTPGAME.TTF"
        position={[-1.5, 1.8, 0.1]}
        fontSize={0.6}
        color="#20a7db"
      >
        Summer
      </Text>
      <RoundedBox
        args={[3, 4, 0.1]}
        radius={0.1}
        position={[-1.5, 0, 0]}
        onDoubleClick={
          () => doubleClickHandler("box4", new THREE.Vector3(-1.5, 0, 0)) // Adjust center position
        }
      >
        <MeshPortalMaterial ref={meshPortalMaterialRef4}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
          <primitive object={modelSummer.scene} scale={0.1} position-y={-0.5} />
          <mesh>
            <sphereGeometry args={[8, 64, 64]} />
            <meshBasicMaterial map={textureSummer} side={THREE.BackSide} />
          </mesh>
        </MeshPortalMaterial>
      </RoundedBox>
      {/* Three RoundedBox - Autumn*/}
      <Text
        font="./font/FZTPGAME.TTF"
        position={[2, 1.8, 0.1]}
        fontSize={0.6}
        color="#f47b20"
      >
        Autumn
      </Text>
      <RoundedBox
        args={[3, 4, 0.1]}
        radius={0.1}
        position={[2, 0, 0]}
        onDoubleClick={
          () => doubleClickHandler("box1", new THREE.Vector3(2, 0, 0)) // Adjust center position
        }
      >
        <MeshPortalMaterial ref={meshPortalMaterialRef1}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={0.5} />
          <primitive object={model.scene} scale={1.56} position-y={-0.5} />
          <mesh>
            <sphereGeometry args={[8, 64, 64]} />
            <meshBasicMaterial map={textureAutumn} side={THREE.BackSide} />
          </mesh>
          {/* Autumn Leaves */}
          {Array.from({ length: numAutumnLeaves }).map((_, index) => (
            <primitive
              key={index}
              ref={(el) => (autumnLeavesRef.current[index] = el)}
              object={autumnLeafModel.clone()}
              scale={0.1}
            />
          ))}
        </MeshPortalMaterial>
      </RoundedBox>

      {/* Four RoundedBox - Winter*/}
      <Text
        font="./font/FZTPGAME.TTF"
        position={[5.5, 1.8, 0.1]}
        fontSize={0.6}
        color="white"
      >
        Winter
      </Text>
      <RoundedBox
        args={[3, 4, 0.1]}
        radius={0.1}
        position={[5.5, 0, 0]}
        onDoubleClick={
          () => doubleClickHandler("box2", new THREE.Vector3(5.5, 0, 0)) // Adjust center position
        }
      >
        <MeshPortalMaterial ref={meshPortalMaterialRef2}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
          <primitive object={model1.scene} scale={0.009} position-y={-0.5} />
          <mesh>
            <sphereGeometry args={[8, 64, 64]} />
            <meshBasicMaterial map={textureWinter} side={THREE.BackSide} />
          </mesh>
          <SnowParticles /> {/* Thêm hiệu ứng tuyết rơi */}
        </MeshPortalMaterial>
      </RoundedBox>
      {/* Bottom Notice */}
      <Text
        font="./font/GoldenHorn.otf"
        position={[0, -2.5, 0]} // Adjust position to be at the bottom
        fontSize={0.4} // Adjust size to make it readable but not overwhelming
        color="#ffffff" // Set a contrasting color
        anchorX="center" // Center text horizontally
        anchorY="middle" // Center text vertically
      >
        double click to enter portal
      </Text>
    </>
  );
};

export default Scene;
