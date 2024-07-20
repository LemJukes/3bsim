// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('simulation').appendChild(renderer.domElement);

// Create wireframe models for the stars
const geometry = new THREE.SphereGeometry(0.5, 16, 16);
const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
const stars = [
    new THREE.Mesh(geometry, material),
    new THREE.Mesh(geometry, material),
    new THREE.Mesh(geometry, material)
];

stars.forEach(star => scene.add(star));

// Create a dot for the center of mass
const comGeometry = new THREE.SphereGeometry(0.1, 16, 16);
const comMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
const comDot = new THREE.Mesh(comGeometry, comMaterial);
scene.add(comDot);

// Position the camera
camera.position.z = 20; // Initial camera distance

// Constants
const G = 1; // Gravitational constant for simulation
const dt = 0.01; // Time step for simulation

// Star properties
const starsData = [
    { 
        mass: 1, 
        position: new THREE.Vector3(), 
        velocity: new THREE.Vector3(), 
        size: 1, 
        angularVelocity: new THREE.Vector3(), 
        orientation: new THREE.Quaternion(), 
        momentOfInertia: 0 // Will be calculated based on mass and size
    },
    { 
        mass: 1, 
        position: new THREE.Vector3(), 
        velocity: new THREE.Vector3(), 
        size: 1, 
        angularVelocity: new THREE.Vector3(), 
        orientation: new THREE.Quaternion(), 
        momentOfInertia: 0 // Will be calculated based on mass and size
    },
    { 
        mass: 1, 
        position: new THREE.Vector3(), 
        velocity: new THREE.Vector3(), 
        size: 1, 
        angularVelocity: new THREE.Vector3(), 
        orientation: new THREE.Quaternion(), 
        momentOfInertia: 0 // Will be calculated based on mass and size
    }
];

stars.forEach(star => scene.add(star));

let animationId;
let simulationStopped = false; // Flag to indicate if the simulation is stopped
let startConditions = 'default'; // Initialize startConditions
let startPositions = []; // Store starting positions

// Helper function to get random position within the visible window
function getRandomPosition() {
    return new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8
    );
}

// Function to calculate mass based on size
function calculateMass(size) {
    const radius = size / 2;
    return (4 / 3) * Math.PI * Math.pow(radius, 3);
}

// Function to calculate the moment of inertia
function calculateMomentOfInertia(mass, size) {
    const radius = size / 2;
    return (2 / 5) * mass * Math.pow(radius, 2);
}

// Function to set star properties based on input data
function setStarProperties(starData, position, velocity, size, angularVelocity) {
    starData.position.copy(position);
    starData.velocity.copy(velocity);
    starData.size = size;
    starData.mass = calculateMass(size);
    starData.momentOfInertia = calculateMomentOfInertia(starData.mass, size);
    starData.angularVelocity.copy(angularVelocity);
}

// Function to apply star properties to Three.js objects
function applyStarPropertiesToScene() {
    stars.forEach((star, index) => {
        star.position.copy(starsData[index].position);
        star.scale.setScalar(starsData[index].size);
        star.setRotationFromQuaternion(starsData[index].orientation);
    });
    renderer.render(scene, camera);
}

// Set initial conditions for stars
function setInitialConditions() {
    if (startPositions.length > 0) {
        // Restore the saved starting positions
        starsData.forEach((starData, index) => {
            setStarProperties(
                starData,
                startPositions[index].position,
                startPositions[index].velocity,
                startPositions[index].size,
                startPositions[index].angularVelocity
            );
        });
        applyStarPropertiesToScene();
        return;
    }

    if (startConditions === 'default') {
        setStarProperties(starsData[0], new THREE.Vector3(-5, 0, 0), new THREE.Vector3(0, 1.5, 0), 1, new THREE.Vector3(0, 0.5, 0));
        setStarProperties(starsData[1], new THREE.Vector3(5, 0, 0), new THREE.Vector3(0, -1.5, 0), 1, new THREE.Vector3(0, -0.5, 0));
        setStarProperties(starsData[2], new THREE.Vector3(0, 5, 0), new THREE.Vector3(1.5, 0, 0), 1, new THREE.Vector3(0.5, 0, 0));
    } else if (startConditions === 'random') {
        starsData.forEach(star => {
            const position = getRandomPosition();
            const velocity = new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);
            const size = Math.random() * 1.5 + 0.5; // Random size between 0.5 and 2
            const angularVelocity = new THREE.Vector3((Math.random() - 0.5) * 1, (Math.random() - 0.5) * 1, (Math.random() - 0.5) * 1);
            setStarProperties(star, position, velocity, size, angularVelocity);
        });
    } else if (startConditions === 'custom') {
        starsData[0].position.set(
            parseFloat(document.getElementById('body1X').value),
            parseFloat(document.getElementById('body1Y').value),
            parseFloat(document.getElementById('body1Z').value)
        );
        starsData[0].size = parseFloat(document.getElementById('body1Size').value);
        starsData[0].mass = calculateMass(starsData[0].size);
        starsData[0].momentOfInertia = calculateMomentOfInertia(starsData[0].mass, starsData[0].size);

        starsData[1].position.set(
            parseFloat(document.getElementById('body2X').value),
            parseFloat(document.getElementById('body2Y').value),
            parseFloat(document.getElementById('body2Z').value)
        );
        starsData[1].size = parseFloat(document.getElementById('body2Size').value);
        starsData[1].mass = calculateMass(starsData[1].size);
        starsData[1].momentOfInertia = calculateMomentOfInertia(starsData[1].mass, starsData[1].size);

        starsData[2].position.set(
            parseFloat(document.getElementById('body3X').value),
            parseFloat(document.getElementById('body3Y').value),
            parseFloat(document.getElementById('body3Z').value)
        );
        starsData[2].size = parseFloat(document.getElementById('body3Size').value);
        starsData[2].mass = calculateMass(starsData[2].size);
        starsData[2].momentOfInertia = calculateMomentOfInertia(starsData[2].mass, starsData[2].size);

        starsData.forEach(star => {
            star.velocity.set(0, 0, 0);
        });
    }

    // Save the initial conditions as starting positions
    startPositions = starsData.map(star => ({
        position: star.position.clone(),
        velocity: star.velocity.clone(),
        size: star.size,
        angularVelocity: star.angularVelocity.clone()
    }));

    applyStarPropertiesToScene();
}

// Update star positions and sizes based on slider input
function updateStar(starIndex, axis, value) {
    if (axis === 'size') {
        starsData[starIndex].size = parseFloat(value);
        starsData[starIndex].mass = calculateMass(starsData[starIndex].size); // Recalculate mass based on size
        starsData[starIndex].momentOfInertia = calculateMomentOfInertia(starsData[starIndex].mass, starsData[starIndex].size); // Recalculate moment of inertia based on size
        stars[starIndex].scale.setScalar(parseFloat(value));
    } else {
        starsData[starIndex].position[axis] = parseFloat(value);
        stars[starIndex].position[axis] = parseFloat(value);
    }
    renderer.render(scene, camera); // Re-render the scene to reflect changes
}

// Function to calculate gravitational forces
function calculateForces() {
    const forces = starsData.map(() => new THREE.Vector3());

    for (let i = 0; i < starsData.length; i++) {
        for (let j = 0; j < starsData.length; j++) {
            if (i !== j) {
                const direction = new THREE.Vector3().subVectors(starsData[j].position, starsData[i].position);
                const distance = direction.length();
                const forceMagnitude = (G * starsData[i].mass * starsData[j].mass) / (distance * distance);
                const force = direction.normalize().multiplyScalar(forceMagnitude);
                forces[i].add(force);
            }
        }
    }

    return forces;
}

// Function to calculate torques based on gravitational forces
function calculateTorque(star1, star2) {
    const distanceVector = new THREE.Vector3().subVectors(star2.position, star1.position);
    const distance = distanceVector.length();
    const forceMagnitude = (G * star1.mass * star2.mass) / (distance * distance);
    const force = distanceVector.normalize().multiplyScalar(forceMagnitude);
    const torque = new THREE.Vector3().crossVectors(star1.position, force);
    return torque;
}

// Function to update rotational dynamics
function updateRotationalDynamics(star, torque, dt) {
    const angularAcceleration = torque.clone().divideScalar(star.momentOfInertia);
    star.angularVelocity.add(angularAcceleration.multiplyScalar(dt));
    const angularVelocityQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(), star.angularVelocity.clone().multiplyScalar(dt));
    star.orientation.multiply(angularVelocityQuat);
}

// Function to calculate the center of mass of the system
function calculateCenterOfMass() {
    let totalMass = 0;
    const centerOfMass = new THREE.Vector3();

    starsData.forEach(star => {
        totalMass += star.mass;
        centerOfMass.add(star.position.clone().multiplyScalar(star.mass));
    });

    centerOfMass.divideScalar(totalMass);
    return centerOfMass;
}

// Function to calculate the velocity of the center of mass of the system
function calculateCenterOfMassVelocity() {
    let totalMass = 0;
    const velocity = new THREE.Vector3();

    starsData.forEach(star => {
        totalMass += star.mass;
        velocity.add(star.velocity.clone().multiplyScalar(star.mass));
    });

    velocity.divideScalar(totalMass);
    return velocity;
}

// Function to update positions and velocities
function updatePositionsAndVelocities(forces) {
    for (let i = 0; i < starsData.length; i++) {
        const acceleration = forces[i].clone().divideScalar(starsData[i].mass);
        starsData[i].velocity.add(acceleration.multiplyScalar(dt));
        starsData[i].position.add(starsData[i].velocity.clone().multiplyScalar(dt));
        stars[i].position.copy(starsData[i].position); // Update Three.js object position
    }
}

// Function to update the entire system's rotation around its center of mass
function updateSystemRotation(centerOfMass, dt) {
    starsData.forEach(star => {
        const relativePosition = star.position.clone().sub(centerOfMass);
        const distance = relativePosition.length();
        const angularVelocity = star.angularVelocity.length();
        const rotationAxis = star.angularVelocity.clone().normalize();
        const angle = angularVelocity * dt;

        const rotationQuat = new THREE.Quaternion().setFromAxisAngle(rotationAxis, angle);
        const newPosition = relativePosition.applyQuaternion(rotationQuat).add(centerOfMass);
        star.position.copy(newPosition);

        const newOrientation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(), star.angularVelocity.clone().multiplyScalar(dt));
        star.orientation.multiply(newOrientation);
    });

    // Update Three.js objects
    stars.forEach((star, index) => {
        star.position.copy(starsData[index].position);
        star.setRotationFromQuaternion(starsData[index].orientation); // Update Three.js object rotation
    });
}

// Function to update camera position and zoom
function updateCamera(centerOfMass) {
    // Calculate the required zoom level to keep all bodies in view
    let maxDistance = 0;
    starsData.forEach(star => {
        const distance = star.position.distanceTo(centerOfMass) + star.size; // Include the size of the star in the distance
        if (distance > maxDistance) {
            maxDistance = distance;
        }
    });

    // Move the camera to track the center of mass and keep all bodies in view
    camera.position.x = centerOfMass.x;
    camera.position.y = centerOfMass.y;
    camera.position.z = centerOfMass.z + maxDistance * 2; // Adjust the factor to control the zoom level
}

// Function to update the console overlay
function updateConsole(centerOfMass, comVelocity) {
    const consoleOverlay = document.getElementById('consoleOverlay');
    if (!consoleOverlay) return;

    let content = '';

    starsData.forEach((star, index) => {
        const speed = star.velocity.length();
        content += `Star ${index + 1}:<br>`;
        content += `Position: (${star.position.x.toFixed(2)}, ${star.position.y.toFixed(2)}, ${star.position.z.toFixed(2)})<br>`;
        content += `Speed: ${speed.toFixed(2)}<br>`;
        content += `Rotation Speed: ${star.angularVelocity.length().toFixed(2)}<br><br>`;
    });

    content += `Center of Mass Position: (${centerOfMass.x.toFixed(2)}, ${centerOfMass.y.toFixed(2)}, ${centerOfMass.z.toFixed(2)})<br>`;
    content += `Center of Mass Speed: ${comVelocity.length().toFixed(2)}<br>`;
    content += `Camera Position: (${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)})<br>`;

    consoleOverlay.innerHTML = content;
}

// Toggle the console overlay visibility
document.getElementById('toggleConsoleButton').addEventListener('click', () => {
    const consoleOverlay = document.getElementById('consoleOverlay');
    if (!consoleOverlay) return;
    consoleOverlay.style.display = consoleOverlay.style.display === 'none' ? 'block' : 'none';
});

// Check for ejection or collision conditions
function checkConditions() {
    let ejected = false;
    let collided = false;

    for (let i = 0; i < starsData.length; i++) {
        const speed = starsData[i].velocity.length();
        if (speed > 5) { // Adjust this threshold as needed for ejection
            ejected = true;
            break;
        }
    }

    for (let i = 0; i < starsData.length; i++) {
        for (let j = i + 1; j < starsData.length; j++) {
            const distance = starsData[i].position.distanceTo(starsData[j].position);
            if (distance < (starsData[i].size + starsData[j].size) / 2) { // Check for collision
                collided = true;
                break;
            }
        }
    }

    if (ejected) {
        stopSimulation("Body Ejected - Simulation Stopped");
    } else if (collided) {
        stopSimulation("Bodies Collided - Simulation Stopped");
    }
}

// Function to stop the simulation and display a message
function stopSimulation(message) {
    simulationStopped = true;
    if (animationId) cancelAnimationFrame(animationId);
    document.getElementById('statusMessage').innerText = message;
    document.getElementById('statusMessage').style.display = 'block';
}

// Function to simulate the system
function simulate() {
    if (!simulationStopped) {
        const forces = calculateForces();
        updatePositionsAndVelocities(forces);

        for (let i = 0; i < starsData.length; i++) {
            for (let j = 0; j < starsData.length; j++) {
                if (i !== j) {
                    const torque = calculateTorque(starsData[i], starsData[j]);
                    updateRotationalDynamics(starsData[i], torque, dt);
                }
            }
            stars[i].setRotationFromQuaternion(starsData[i].orientation); // Update Three.js object rotation
        }

        const centerOfMass = calculateCenterOfMass();
        const comVelocity = calculateCenterOfMassVelocity();
        updateSystemRotation(centerOfMass, dt);
        updateCamera(centerOfMass); // Update the camera position and zoom level
        comDot.position.copy(centerOfMass); // Update the position of the center of mass dot
        updateConsole(centerOfMass, comVelocity); // Update the console overlay

        checkConditions(); // Check for ejection or collision
    }
}

// Function to animate the scene
function animate() {
    simulate();
    renderer.render(scene, camera);
    if (!simulationStopped) {
        animationId = requestAnimationFrame(animate);
    }
}

// Event listeners for controls
document.getElementById('startButton').addEventListener('click', () => {
    if (animationId) cancelAnimationFrame(animationId);
    simulationStopped = false;
    animate();
});

document.getElementById('stopButton').addEventListener('click', () => {
    if (animationId) cancelAnimationFrame(animationId);
    simulationStopped = true;
});

document.getElementById('resetButton').addEventListener('click', () => {
    if (animationId) cancelAnimationFrame(animationId);
    simulationStopped = false;
    document.getElementById('statusMessage').style.display = 'none';
    setInitialConditions();
});

// Event listeners for options buttons
document.getElementById('defaultButton').addEventListener('click', () => {
    startConditions = 'default';
    document.getElementById('customSettings').style.display = 'none';
    setInitialConditions();
});

document.getElementById('randomButton').addEventListener('click', () => {
    startConditions = 'random';
    document.getElementById('customSettings').style.display = 'none';
    setInitialConditions();
});

document.getElementById('customButton').addEventListener('click', () => {
    startConditions = 'custom';
    document.getElementById('customSettings').style.display = 'block';
    setInitialConditions();
});

// Event listeners for sliders to update star positions and sizes
document.querySelectorAll('#customSettings input[type="range"]').forEach((slider, index) => {
    slider.addEventListener('input', (event) => {
        const id = event.target.id;
        const axis = id.includes('Size') ? 'size' : id.slice(-1).toLowerCase();
        const starIndex = Math.floor(index / 4); // Adjusted for 4 sliders per star
        updateStar(starIndex, axis, event.target.value);
    });
});

// Initial render
setInitialConditions();
renderer.render(scene, camera);
