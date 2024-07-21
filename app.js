import * as THREE from 'three';

// Create the scene
const scene = new THREE.Scene();

// Create a camera looking down onto the x,y plane
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 150);

// Create the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

// Append the renderer to the document
document.getElementById('simulation-container').appendChild(renderer.domElement);

// Array to hold the bodies
const bodies = [];

// Function to create a random wireframe spherical body
function createBody() {
    const radius = 5;
    const segments = 16;
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    const material = new THREE.MeshBasicMaterial({
        color: Math.random() * 0xffffff,
        wireframe: true
    });

    const sphere = new THREE.Mesh(geometry, material);
    sphere.mass = Math.random() * 10 + 1; // Random mass between 1 and 10
    sphere.position.set(
        Math.random() * 100 - 50,
        Math.random() * 100 - 50,
        0
    );
    sphere.rotation.set(
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI
    );

    return sphere;
}

// Create three bodies and add them to the scene and array
for (let i = 0; i < 3; i++) {
    const body = createBody();
    bodies.push(body);
    scene.add(body);
}

// Function to calculate the center of mass of the system
function calculateCenterOfMass(bodies) {
    let totalMass = 0;
    let centerX = 0;
    let centerY = 0;

    bodies.forEach(body => {
        totalMass += body.mass;
        centerX += body.position.x * body.mass;
        centerY += body.position.y * body.mass;
    });

    return {
        x: centerX / totalMass,
        y: centerY / totalMass
    };
}

// Calculate the center of mass
const centerOfMass = calculateCenterOfMass(bodies);

// Move the camera to be centered on the center of mass
camera.position.set(centerOfMass.x, centerOfMass.y, 150);
camera.lookAt(centerOfMass.x, centerOfMass.y, 0);

// Function to handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Render the scene
const animate = function () {
    requestAnimationFrame(animate);

    // Rotate each body
    bodies.forEach(body => {
        body.rotation.x += 0.01;
        body.rotation.y += 0.01;
    });

    renderer.render(scene, camera);
};

animate();
