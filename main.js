import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene, Camera, and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// House Walls (larger box with an opening for a door)
const wallGeometry = new THREE.BoxGeometry(10, 5, 10);
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513, side: THREE.DoubleSide });
const walls = new THREE.Mesh(wallGeometry, wallMaterial);
walls.position.y = 1.5;
walls.castShadow = true;
scene.add(walls);

// Floor inside the house
const floorGeometry = new THREE.PlaneGeometry(9.8, 9.8);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xdeb887 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0.01; // Slightly above the ground to avoid z-fighting
floor.receiveShadow = true;
scene.add(floor);

// Create a doorway by cutting a hole in the walls
const doorGeometry = new THREE.BoxGeometry(2, 3, 0.1);
const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
const door = new THREE.Mesh(doorGeometry, doorMaterial);
door.position.set(0, 0.6, 5.05); // Place door at the front of the house
scene.add(door);

// Roof (larger pyramid)
const roofGeometry = new THREE.ConeGeometry(8, 4, 4);
const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8b0000 });
const roof = new THREE.Mesh(roofGeometry, roofMaterial);
roof.position.y = 6;
roof.rotation.y = Math.PI / 4;
roof.castShadow = true;
scene.add(roof);

// Grass field (plane geometry)
const grassGeometry = new THREE.PlaneGeometry(50, 50);
const grassMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
const grass = new THREE.Mesh(grassGeometry, grassMaterial);
grass.rotation.x = -Math.PI / 2; // Rotate to lay flat
grass.position.y = -1; // Position it at ground level
grass.receiveShadow = true;
scene.add(grass);

// Driveway (rectangle in front of the house)
const drivewayGeometry = new THREE.PlaneGeometry(3, 10);
const drivewayMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
const driveway = new THREE.Mesh(drivewayGeometry, drivewayMaterial);
driveway.rotation.x = -Math.PI / 2; // Rotate to lay flat
driveway.position.set(0, -0.9, 7); // Place it in front of the house
driveway.receiveShadow = true;
scene.add(driveway);

// Load painting texture and create paintings on left and right walls
const loader = new THREE.TextureLoader();
loader.load('61fbf30419785c12ae7a1d2cc8e65c75.jpg', (texture) => { // Replace with the path to your painting image
  const paintingGeometry = new THREE.PlaneGeometry(2, 3);
  const paintingMaterial = new THREE.MeshStandardMaterial({ map: texture });

  // Painting on the left wall
  const paintingLeft = new THREE.Mesh(paintingGeometry, paintingMaterial);
  paintingLeft.position.set(-4.9, 1.5, 0); // Higher placement
  paintingLeft.rotation.y = Math.PI / 2;
  scene.add(paintingLeft);

  // Painting on the right wall
  const paintingRight = new THREE.Mesh(paintingGeometry, paintingMaterial);
  paintingRight.position.set(4.9, 1.5, 0); // Higher placement
  paintingRight.rotation.y = -Math.PI / 2;
  scene.add(paintingRight);
});

// Function to create a tree
function createTree(x, z) {
  const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2);
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.set(x, 1, z);
  trunk.castShadow = true;
  scene.add(trunk);

  const foliageGeometry = new THREE.SphereGeometry(1.5, 8, 8);
  const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x006400 });
  const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
  foliage.position.set(x, 3, z);
  foliage.castShadow = true;
  scene.add(foliage);
}

// Add trees around the house
createTree(10, 10);
createTree(-10, 10);
createTree(10, -10);
createTree(-10, -10);
createTree(15, 0);
createTree(-15, 0);
createTree(0, -15);

// Camera position and animation
camera.position.set(0, 5, 20);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

let animationPhase = 0; // Animation state control
let animationProgress = 0; // Progress of the current phase

function animateCamera() {
  if (animationPhase === 0) {
    // Move camera toward house entrance
    camera.position.z -= 0.05;
    if (camera.position.z <= 5) {
      animationPhase = 1;
      animationProgress = 0;
    }
  } else if (animationPhase === 1) {
    // Rotate around painting on left wall
    animationProgress += 0.01;
    camera.position.set(-4.9 + Math.sin(animationProgress), 1.5, 5 + Math.cos(animationProgress));
    if (animationProgress >= Math.PI * 2) {
      animationPhase = 2;
      animationProgress = 0;
    }
  } else if (animationPhase === 2) {
    // Move camera back and above the house
    camera.position.z += 0.05;
    camera.position.y += 0.02;
    if (camera.position.y >= 10) {
      animationPhase = 3;
      animationProgress = 0; // Reset progress for next phase
    }
  } else if (animationPhase === 3) {
    // Circle around the house to show different angles
    animationProgress += 0.01;
    camera.position.x = 20 * Math.cos(animationProgress);
    camera.position.z = 20 * Math.sin(animationProgress);
    camera.position.y = 10; // Set height above the house
    camera.lookAt(0, 1.5, 0); // Focus on the center of the house
    if (animationProgress >= Math.PI * 2) {
      animationPhase = 0; // Reset to start over
      animationProgress = 0; // Reset progress for the next loop
    }
  }
}


// Animation loop
function animate() {
  animateCamera();
  controls.update();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

// Handle window resize
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
