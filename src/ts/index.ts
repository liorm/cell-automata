import * as THREE from 'three';
import {Colors} from "./colors";
import {AutomataArena, GameOfLifeArena} from "./arena";

let camera;
let scene;
let renderer;
let mouse;

let cubeGeo;
let cubeMaterials: THREE.Material[] = [];

const cells: THREE.Mesh[] = [];
function toIndex(x, y, z) {
  return z * arena.width * arena.height + y * arena.width + x;
}

const CELL_W = 2;
const CELL_H = 2;
const CELL_D = 2;

let EVOLUTION_INTERVAL_MS = 0;

let lastEvolutionTime = performance.now();

const arena: AutomataArena = new GameOfLifeArena();

init()
render()

function init() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(Colors.background)

  cubeGeo = new THREE.BoxBufferGeometry(CELL_W, CELL_H, CELL_D);
  for (let age = 0; age < arena.maxAge; ++age) {
    const mat = new THREE.MeshBasicMaterial({
      color: Colors.cellColorRange((age + 1) / (arena.maxAge)).hex(),
    });
    cubeMaterials.push(mat);
  }

  //
  // Bounding box
  //
  const boxGeo = new THREE.EdgesGeometry(
      new THREE.BoxBufferGeometry(
          arena.width * CELL_W,
          arena.height * CELL_H,
          arena.depth * CELL_D));
  const boxMat = new THREE.LineBasicMaterial({color: Colors.boundingBox});
  const boxWireframe = new THREE.LineSegments(boxGeo, boxMat);
  boxWireframe.position.set(
      arena.width * CELL_W / 2,
      arena.height * CELL_H / 2,
      arena.depth * CELL_D / 2);
  scene.add( boxWireframe );

  // cells
  for (let y = 0; y < arena.height; ++y) {
    for (let x = 0; x < arena.width; ++x) {
      const voxel = new THREE.Mesh(cubeGeo, cubeMaterials[0]);
      voxel.position.set(x * CELL_W, y * CELL_H, arena.depth / 2 * CELL_D);
      voxel.visible = false;
      scene.add(voxel);
      cells.push(voxel);
    }
  }

  arena.setCellAge(arena.height - 3, arena.height - 1, 0, 1);
  arena.setCellAge(arena.height - 3, arena.height - 2, 0, 1);
  arena.setCellAge(arena.height - 3, arena.height - 3, 0, 1);
  arena.setCellAge(arena.height - 2, arena.height - 3, 0, 1);
  arena.setCellAge(arena.height - 1, arena.height - 2, 0, 1);

  mouse = new THREE.Vector2()

  // lights

  const ambientLight = new THREE.AmbientLight(0x606060);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 0.75, 0.5).normalize();
  scene.add(directionalLight);

  camera = new THREE.PerspectiveCamera(
      25,
      window.innerWidth / window.innerHeight,
      1,
      10000
  )
  camera.position.set(arena.width * CELL_W * 2, arena.height * CELL_H * 2, 800);``
  camera.lookAt(arena.width * CELL_W / 2, arena.height * CELL_H / 2, 0)


  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize, false);

  setTimeout( () => evolve());
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

function render() {
  renderer.render(scene, camera)
}

function evolve() {
  const now = performance.now();

  arena.evolve();

  // Apply next.
  for (let y = 0; y < arena.height; ++y) {
    for (let x = 0; x < arena.width; ++x) {
      for (let z = 0; z < arena.depth; ++z) {
        const voxel = cells[toIndex(x, y, z)];
        const age = arena.getCellAge(x, y, z);
        if ( age > 0 ) {
          voxel.visible = true;
          voxel.material = cubeMaterials[age - 1];
        } else {
          voxel.visible = false;
        }
      }
    }
  }

  lastEvolutionTime = now;
  render();

  if (EVOLUTION_INTERVAL_MS === 0) {
    requestAnimationFrame(() => evolve());
  } else {
    setTimeout( () => evolve(), EVOLUTION_INTERVAL_MS);
  }
}
