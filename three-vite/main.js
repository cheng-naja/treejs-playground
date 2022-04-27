import gsap from 'gsap';
import * as THREE from 'https://unpkg.com/three@0.139.2/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

const gui = new dat.GUI();
const world = {
  plane: {
    width: 400,
    height: 400,
    widthSegments: 50,
    heightSegments: 50
  }
}
gui.add(world.plane, 'width', 1, 500).onChange(generatePlane);
gui.add(world.plane, 'height', 1, 500).onChange(generatePlane);
gui.add(world.plane, 'widthSegments', 1, 100).onChange(generatePlane);
gui.add(world.plane, 'heightSegments', 1, 100).onChange(generatePlane);

function generatePlane() {
  planeMesh.geometry.dispose();
  planeMesh.geometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments
  );

  const { array } = planeMesh.geometry.attributes.position;
  const randomValues = [];
  for (let i = 3; i < array.length; i++) {

    if (i % 3 === 0) {
      const x = array[i];
      const y = array[i + 1];
      const z = array[i + 2];
      array[i] = x + (Math.random() - 0.5) * 3;
      array[i + 1] = y + (Math.random() - 0.5) * 3;
      array[i + 2] = z + (Math.random() - 0.5) * 3;
    }
    randomValues.push(Math.random() * Math.PI * 2);
  }

  planeMesh.geometry.attributes.position.randomValues = randomValues;
  planeMesh.geometry.attributes.position.originalPosition
    = planeMesh.geometry.attributes.position.array;

  const colors = []
  for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
    colors.push(0, 0.19, 0.4);
  }

  planeMesh.geometry.setAttribute(
    'color',
    new THREE.BufferAttribute(new Float32Array(colors), 3)
  );
}

const raycaster = new THREE.Raycaster();
const scene = new THREE.Scene();
const camera = new THREE
  .PerspectiveCamera(75,
    innerWidth / innerHeight,
    0.1,
    1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);

document.body.appendChild(renderer.domElement);

const planeGeometry = new THREE.PlaneGeometry(
  world.plane.width,
  world.plane.height,
  world.plane.widthSegments,
  world.plane.heightSegments
);
const planeMaterial = new THREE.MeshPhongMaterial({
  // color: 0xFF0000,
  side: THREE.DoubleSide,
  flatShading: THREE.FlatShading,
  vertexColors: true
});

const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
const light = new THREE.DirectionalLight(0xFFFFFF, 1);
light.position.set(0, -1, 1)
const backLight = new THREE.DirectionalLight(0xFFFFFF, 1);
backLight.position.set(0, 0, -1)

scene.add(planeMesh);
generatePlane();
scene.add(light);
scene.add(backLight);

new OrbitControls(camera, renderer.domElement);
camera.position.z = 50;

const mouse = {
  x: undefined,
  y: undefined
}

let frame = 0;

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  raycaster.setFromCamera(mouse, camera);
  frame += 0.01;

  const { array, originalPosition, randomValues } = planeMesh.geometry.attributes.position;

  for (let i = 0; i < array.length; i += 3) {
    // x
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.01;
    // y
    array[i + 1] = originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.001;
  }

  planeMesh.geometry.attributes.position.needsUpdate = true;

  const intersect = raycaster.intersectObject(planeMesh)

  if (intersect.length > 0) {

    const { color } = intersect[0].object.geometry.attributes;

    // vertices 1
    color.setX(intersect[0].face.a, 0.1);
    color.setY(intersect[0].face.a, 0.5);
    color.setZ(intersect[0].face.a, 1);

    // vertices 2
    color.setX(intersect[0].face.b, 0.1);
    color.setY(intersect[0].face.b, 0.5);
    color.setZ(intersect[0].face.b, 1);

    // vertices 3
    color.setX(intersect[0].face.c, 0.1);
    color.setY(intersect[0].face.c, 0.5);
    color.setZ(intersect[0].face.c, 1);

    color.needsUpdate = true;

    const initialColor = {
      r: 0,
      g: 0.19,
      b: 0.4
    }
    const hoverColor = {
      r: 0,
      g: 0.5,
      b: 1
    }

    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      duration: 1,
      onUpdate: () => {
        // vertices 1
        color.setX(intersect[0].face.a, hoverColor.r);
        color.setY(intersect[0].face.a, hoverColor.g);
        color.setZ(intersect[0].face.a, hoverColor.b);

        // vertices 2
        color.setX(intersect[0].face.b, hoverColor.r);
        color.setY(intersect[0].face.b, hoverColor.g);
        color.setZ(intersect[0].face.b, hoverColor.b);

        // vertices 3
        color.setX(intersect[0].face.c, hoverColor.r);
        color.setY(intersect[0].face.c, hoverColor.g);
        color.setZ(intersect[0].face.c, hoverColor.b);
      }
    })
  }

  // planeMesh.rotation.x += 0.001;
  // planeMesh.rotation.y += 0.001;
}

animate();

addEventListener('mousemove', (event) => {
  // console.log('move');
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;
})