/**
 * ChronoCraft: Gravity Rift (Definitive Edition)
 * Pure Three.js + Web Audio API voxel sandbox implementation.
 */

// =============================================================================
// 1. CONFIGURATION & CONSTANTS
// =============================================================================
const WORLD_WIDTH = 64;
const WORLD_DEPTH = 64;
const WORLD_HEIGHT = 48;
const SEA_LEVEL = 14;

// Block Types Registry
const BLOCKS = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  COBBLE: 4,
  OAK_LOG: 5,
  OAK_LEAVES: 6,
  OAK_PLANKS: 7,
  DIAMOND_ORE: 8,
  GOLD_ORE: 9,
  IRON_ORE: 10,
  COAL_ORE: 11,
  GLASS: 12,
  WATER: 13,
  SAND: 14,
  TNT: 15,
  OBSIDIAN: 16,
  GLOWSTONE: 17,
  BEDROCK: 18
};

const BLOCK_NAMES = {
  [BLOCKS.GRASS]: "Grass Block",
  [BLOCKS.DIRT]: "Dirt",
  [BLOCKS.STONE]: "Stone",
  [BLOCKS.COBBLE]: "Cobblestone",
  [BLOCKS.OAK_LOG]: "Oak Log",
  [BLOCKS.OAK_LEAVES]: "Oak Leaves",
  [BLOCKS.OAK_PLANKS]: "Oak Planks",
  [BLOCKS.DIAMOND_ORE]: "Diamond Ore",
  [BLOCKS.GOLD_ORE]: "Gold Ore",
  [BLOCKS.IRON_ORE]: "Iron Ore",
  [BLOCKS.COAL_ORE]: "Coal Ore",
  [BLOCKS.GLASS]: "Glass",
  [BLOCKS.WATER]: "Water",
  [BLOCKS.SAND]: "Sand",
  [BLOCKS.TNT]: "TNT",
  [BLOCKS.OBSIDIAN]: "Obsidian",
  [BLOCKS.GLOWSTONE]: "Glowstone",
  [BLOCKS.BEDROCK]: "Bedrock"
};

// =============================================================================
// 2. PROCEDURAL SOUND SYNTHESIZER (Web Audio API)
// =============================================================================
class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playFootstep(isStone = false) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = isStone ? 'triangle' : 'sine';
    const baseFreq = isStone ? 120 + Math.random() * 40 : 80 + Math.random() * 30;
    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isStone ? 800 : 350, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }

  playBlockBreak() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 650;
    filter.Q.value = 1.2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  playBlockPlace() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.07);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playHurt() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.19);
  }

  playFuse() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2500;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  playExplosion() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.7;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.7);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  playGravityFlip(isInverted) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const start = isInverted ? 180 : 540;
    const end = isInverted ? 540 : 180;
    osc.frequency.setValueAtTime(start, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(end, this.ctx.currentTime + 0.28);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playRewindTick() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600 + Math.random() * 400, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playFanfare() {
    if (!this.ctx) return;
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const startTime = this.ctx.currentTime + idx * 0.1;
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.32);
    });
  }
}

const sounds = new SoundEngine();

// =============================================================================
// 3. PROCEDURAL PIXEL TEXTURE GENERATOR
// =============================================================================
function createPixelTexture(type) {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');

  function noise(colorHex, variance) {
    const r = parseInt(colorHex.slice(1, 3), 16);
    const g = parseInt(colorHex.slice(3, 5), 16);
    const b = parseInt(colorHex.slice(5, 7), 16);

    for (let x = 0; x < 16; x++) {
      for (let y = 0; y < 16; y++) {
        const delta = (Math.random() * 2 - 1) * variance;
        const nr = Math.min(255, Math.max(0, r + delta));
        const ng = Math.min(255, Math.max(0, g + delta));
        const nb = Math.min(255, Math.max(0, b + delta));
        ctx.fillStyle = `rgb(${nr|0},${ng|0},${nb|0})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  switch (type) {
    case BLOCKS.GRASS:
      noise('#5b8e32', 20);
      break;
    case BLOCKS.DIRT:
      noise('#866043', 25);
      break;
    case BLOCKS.STONE:
      noise('#7a7a7a', 20);
      break;
    case BLOCKS.COBBLE:
      noise('#5c5c5c', 35);
      for (let i = 0; i < 16; i += 4) {
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(0, i, 16, 1);
        ctx.fillRect(i, 0, 1, 16);
      }
      break;
    case BLOCKS.OAK_LOG:
      noise('#685332', 20);
      ctx.fillStyle = '#47361b';
      for (let x = 3; x < 16; x += 4) ctx.fillRect(x, 0, 1, 16);
      break;
    case BLOCKS.OAK_LEAVES:
      noise('#3a7a28', 35);
      break;
    case BLOCKS.OAK_PLANKS:
      noise('#9c7f4e', 18);
      ctx.fillStyle = '#5c4520';
      for (let y = 3; y < 16; y += 4) ctx.fillRect(0, y, 16, 1);
      break;
    case BLOCKS.DIAMOND_ORE:
      noise('#7a7a7a', 15);
      ctx.fillStyle = '#4dedf4';
      ctx.fillRect(3, 4, 2, 2); ctx.fillRect(9, 3, 2, 2); ctx.fillRect(5, 10, 2, 2); ctx.fillRect(11, 11, 2, 2);
      break;
    case BLOCKS.GOLD_ORE:
      noise('#7a7a7a', 15);
      ctx.fillStyle = '#fcee4b';
      ctx.fillRect(4, 3, 2, 2); ctx.fillRect(10, 5, 2, 2); ctx.fillRect(3, 11, 2, 2);
      break;
    case BLOCKS.IRON_ORE:
      noise('#7a7a7a', 15);
      ctx.fillStyle = '#d8af93';
      ctx.fillRect(2, 5, 2, 2); ctx.fillRect(11, 4, 2, 2); ctx.fillRect(7, 10, 2, 2);
      break;
    case BLOCKS.COAL_ORE:
      noise('#7a7a7a', 15);
      ctx.fillStyle = '#1c1c1c';
      ctx.fillRect(3, 3, 3, 2); ctx.fillRect(9, 8, 2, 3); ctx.fillRect(5, 12, 2, 2);
      break;
    case BLOCKS.GLASS:
      ctx.fillStyle = 'rgba(210, 240, 255, 0.4)';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(2, 2, 2, 2); ctx.fillRect(11, 11, 2, 2);
      break;
    case BLOCKS.WATER:
      ctx.fillStyle = 'rgba(30, 90, 220, 0.65)';
      ctx.fillRect(0, 0, 16, 16);
      break;
    case BLOCKS.SAND:
      noise('#dbcf9c', 18);
      break;
    case BLOCKS.TNT:
      noise('#c43224', 20);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 6, 16, 4);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 4px sans-serif';
      ctx.fillText('TNT', 4, 9.5);
      break;
    case BLOCKS.OBSIDIAN:
      noise('#1a1228', 25);
      break;
    case BLOCKS.GLOWSTONE:
      noise('#fadc6a', 30);
      break;
    case BLOCKS.BEDROCK:
      noise('#222222', 45);
      break;
    default:
      noise('#ff00ff', 0);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

// Generate shared material cache
const materials = {};
Object.values(BLOCKS).forEach(id => {
  if (id === BLOCKS.AIR) return;
  const isTransparent = id === BLOCKS.GLASS || id === BLOCKS.WATER;
  materials[id] = new THREE.MeshLambertMaterial({
    map: createPixelTexture(id),
    transparent: isTransparent,
    opacity: isTransparent ? (id === BLOCKS.WATER ? 0.65 : 0.4) : 1.0
  });
});

// =============================================================================
// 4. VOXEL WORLD ENGINE & INTERACTIVE TRIAL GENERATOR
// =============================================================================
class VoxelWorld {
  constructor(scene) {
    this.scene = scene;
    this.blocks = new Uint8Array(WORLD_WIDTH * WORLD_HEIGHT * WORLD_DEPTH);
    this.meshInstances = {};
    this.maxInstances = 20000;
    this.initInstancing();
  }

  getIndex(x, y, z) {
    if (x < 0 || x >= WORLD_WIDTH || y < 0 || y >= WORLD_HEIGHT || z < 0 || z >= WORLD_DEPTH) return -1;
    return x + y * WORLD_WIDTH + z * WORLD_WIDTH * WORLD_HEIGHT;
  }

  getBlock(x, y, z) {
    const idx = this.getIndex(x, y, z);
    return idx === -1 ? BLOCKS.AIR : this.blocks[idx];
  }

  setBlockInternal(x, y, z, blockType) {
    const idx = this.getIndex(x, y, z);
    if (idx !== -1) this.blocks[idx] = blockType;
  }

  initInstancing() {
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    Object.keys(materials).forEach(id => {
      const instancedMesh = new THREE.InstancedMesh(boxGeo, materials[id], this.maxInstances);
      instancedMesh.count = 0;
      instancedMesh.castShadow = true;
      instancedMesh.receiveShadow = true;
      this.meshInstances[id] = instancedMesh;
      this.scene.add(instancedMesh);
    });
  }

  generateWorld() {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      for (let z = 0; z < WORLD_DEPTH; z++) {
        // Bedrock floor
        this.setBlockInternal(x, 0, z, BLOCKS.BEDROCK);

        // Procedural smooth hills
        const height = Math.floor(
          12 + Math.sin(x * 0.15) * 4 + Math.cos(z * 0.15) * 4 + Math.sin((x + z) * 0.08) * 3
        );

        for (let y = 1; y < WORLD_HEIGHT; y++) {
          if (y < height - 3) {
            // Underground stone & ores
            let block = BLOCKS.STONE;
            const r = Math.random();
            if (r < 0.015 && y < 14) block = BLOCKS.DIAMOND_ORE;
            else if (r < 0.025 && y < 18) block = BLOCKS.GOLD_ORE;
            else if (r < 0.04) block = BLOCKS.IRON_ORE;
            else if (r < 0.06) block = BLOCKS.COAL_ORE;
            this.setBlockInternal(x, y, z, block);
          } else if (y < height) {
            this.setBlockInternal(x, y, z, BLOCKS.DIRT);
          } else if (y === height) {
            this.setBlockInternal(x, y, z, height <= SEA_LEVEL + 1 ? BLOCKS.SAND : BLOCKS.GRASS);
          } else if (y <= SEA_LEVEL) {
            this.setBlockInternal(x, y, z, BLOCKS.WATER);
          }
        }

        // Spawn trees
        if (x > 8 && x < WORLD_WIDTH - 8 && z > 8 && z < WORLD_DEPTH - 8) {
          if (height > SEA_LEVEL + 1 && Math.random() < 0.02) {
            this.buildTree(x, height + 1, z);
          }
        }
      }
    }

    // Build the "Chrono-Rift Trials" interactive course
    this.buildTrialAcademy();
    this.rebuildAllMeshes();
  }

  buildTree(x, y, z) {
    for (let i = 0; i < 4; i++) this.setBlockInternal(x, y + i, z, BLOCKS.OAK_LOG);
    for (let lx = -2; lx <= 2; lx++) {
      for (let lz = -2; lz <= 2; lz++) {
        for (let ly = 2; ly <= 4; ly++) {
          if (Math.abs(lx) === 2 && Math.abs(lz) === 2 && ly === 4) continue;
          if (this.getBlock(x + lx, y + ly, z + lz) === BLOCKS.AIR) {
            this.setBlockInternal(x + lx, y + ly, z + lz, BLOCKS.OAK_LEAVES);
          }
        }
      }
    }
  }

  buildTrialAcademy() {
    // Stage 1: Ceiling Traverse Track (Obsidian)
    for (let x = 6; x <= 22; x++) {
      this.setBlockInternal(x, 26, 8, BLOCKS.OBSIDIAN);
      this.setBlockInternal(x, 26, 9, BLOCKS.OBSIDIAN);
    }
    this.setBlockInternal(22, 26, 8, BLOCKS.GLOWSTONE); // Stage 1 target beacon

    // Stage 2: Collapsing Sand Bridge over Void Pit
    for (let z = 12; z <= 22; z++) {
      this.setBlockInternal(22, 14, z, BLOCKS.SAND);
    }
    this.setBlockInternal(22, 15, 23, BLOCKS.DIAMOND_ORE); // Stage 2 Key

    // Stage 3: Creeper Detonation Bridge
    for (let x = 24; x <= 34; x++) {
      this.setBlockInternal(x, 14, 23, BLOCKS.COBBLE);
    }
    this.setBlockInternal(28, 15, 23, BLOCKS.TNT);

    // Stage 4: Vertical Rift Gauntlet (Alternating ceiling & floor spikes)
    for (let z = 25; z <= 35; z += 3) {
      this.setBlockInternal(34, 15, z, BLOCKS.OBSIDIAN);
      this.setBlockInternal(34, 25, z + 1, BLOCKS.OBSIDIAN);
    }
    this.setBlockInternal(34, 15, 36, BLOCKS.GLOWSTONE); // Final Victory Beacon
  }

  isBlockOccluded(x, y, z) {
    const neighbors = [
      this.getBlock(x + 1, y, z),
      this.getBlock(x - 1, y, z),
      this.getBlock(x, y + 1, z),
      this.getBlock(x, y - 1, z),
      this.getBlock(x, y, z + 1),
      this.getBlock(x, y, z - 1)
    ];
    return neighbors.every(n => n !== BLOCKS.AIR && n !== BLOCKS.WATER && n !== BLOCKS.GLASS);
  }

  rebuildAllMeshes() {
    const counts = {};
    Object.keys(materials).forEach(id => counts[id] = 0);
    const dummy = new THREE.Object3D();

    for (let x = 0; x < WORLD_WIDTH; x++) {
      for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let z = 0; z < WORLD_DEPTH; z++) {
          const type = this.getBlock(x, y, z);
          if (type === BLOCKS.AIR) continue;
          if (this.isBlockOccluded(x, y, z)) continue;

          const mesh = this.meshInstances[type];
          if (mesh && counts[type] < this.maxInstances) {
            dummy.position.set(x + 0.5, y + 0.5, z + 0.5);
            dummy.updateMatrix();
            mesh.setMatrixAt(counts[type], dummy.matrix);
            counts[type]++;
          }
        }
      }
    }

    Object.keys(materials).forEach(id => {
      const mesh = this.meshInstances[id];
      mesh.count = counts[id];
      mesh.instanceMatrix.needsUpdate = true;
    });
  }

  setBlock(x, y, z, type) {
    this.setBlockInternal(x, y, z, type);
    this.rebuildAllMeshes();
  }

  getHighestSolidY(x, z) {
    for (let y = WORLD_HEIGHT - 1; y >= 0; y--) {
      const b = this.getBlock(x, y, z);
      if (b !== BLOCKS.AIR && b !== BLOCKS.WATER) return y;
    }
    return 10;
  }
}

// =============================================================================
// 5. ANIMATED MOBS (Creepers, Zombies, Pigs)
// =============================================================================
class MobManager {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.mobs = [];
  }

  spawnMob(type, x, y, z) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    let mainColor = 0x33aa33;
    if (type === 'zombie') mainColor = 0x228833;
    if (type === 'pig') mainColor = 0xffaacc;

    const bodyMat = new THREE.MeshLambertMaterial({ color: mainColor });
    const headMat = new THREE.MeshLambertMaterial({ color: mainColor });

    // Body
    const bodyGeo = new THREE.BoxGeometry(0.6, type === 'pig' ? 0.6 : 0.9, 0.4);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = type === 'pig' ? 0.4 : 0.75;
    group.add(body);

    // Head
    const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = type === 'pig' ? 0.6 : 1.4;
    head.position.z = type === 'pig' ? 0.35 : 0;
    group.add(head);

    this.scene.add(group);

    this.mobs.push({
      type,
      mesh: group,
      head,
      body,
      pos: group.position,
      vel: new THREE.Vector3(),
      health: type === 'creeper' ? 20 : 15,
      fuse: 0,
      exploding: false
    });
  }

  update(delta, playerPos, onExplosion) {
    for (let i = this.mobs.length - 1; i >= 0; i--) {
      const mob = this.mobs[i];
      const dist = mob.pos.distanceTo(playerPos);

      // AI: Creeper pursuit & explosion
      if (mob.type === 'creeper') {
        if (dist < 12) {
          const dir = new THREE.Vector3().subVectors(playerPos, mob.pos).setY(0).normalize();
          mob.pos.addScaledVector(dir, delta * 2.0);
          mob.mesh.lookAt(playerPos.x, mob.pos.y, playerPos.z);

          if (dist < 3.2) {
            mob.fuse += delta;
            mob.body.material.color.setHex((Math.floor(mob.fuse * 10) % 2 === 0) ? 0xffffff : 0x33aa33);
            if (mob.fuse >= 1.5 && !mob.exploding) {
              mob.exploding = true;
              onExplosion(mob.pos);
              this.scene.remove(mob.mesh);
              this.mobs.splice(i, 1);
              continue;
            }
          } else {
            mob.fuse = Math.max(0, mob.fuse - delta);
            mob.body.material.color.setHex(0x33aa33);
          }
        }
      } else if (mob.type === 'zombie') {
        if (dist < 14) {
          const dir = new THREE.Vector3().subVectors(playerPos, mob.pos).setY(0).normalize();
          mob.pos.addScaledVector(dir, delta * 2.2);
          mob.mesh.lookAt(playerPos.x, mob.pos.y, playerPos.z);
        }
      }
    }
  }

  restoreMobState(snapshot) {
    // Clear current mobs
    this.mobs.forEach(m => this.scene.remove(m.mesh));
    this.mobs = [];

    // Reconstruct mobs from timeline snapshot
    snapshot.forEach(data => {
      this.spawnMob(data.type, data.x, data.y, data.z);
      const m = this.mobs[this.mobs.length - 1];
      m.health = data.health;
    });
  }

  getSnapshot() {
    return this.mobs.map(m => ({
      type: m.type,
      x: m.pos.x,
      y: m.pos.y,
      z: m.pos.z,
      health: m.health
    }));
  }
}

// =============================================================================
// 6. FIRST-PERSON PLAYER & SURVIVAL SIMULATION
// =============================================================================
class PlayerController {
  constructor(camera, world, mobs, scene) {
    this.camera = camera;
    this.world = world;
    this.mobs = mobs;
    this.scene = scene;

    // Movement & Orientation
    this.pos = new THREE.Vector3(24, 20, 24);
    this.vel = new THREE.Vector3();
    this.yaw = 0;
    this.pitch = 0;
    this.roll = 0;
    this.onGround = false;

    // Twist 1: Gravity Inversion
    this.gravityDir = 1.0; // 1.0 = normal (down), -1.0 = inverted (up)
    this.targetRoll = 0;

    // Survival Stats
    this.health = 20; // 10 Hearts
    this.hunger = 20; // 10 Drumsticks
    this.air = 20;    // 10 Bubbles
    this.xp = 0;
    this.level = 0;
    this.hungerTimer = 0;
    this.isSprinting = false;
    this.isSneaking = false;

    // Hotbar & Inventory
    this.hotbar = [
      { id: BLOCKS.COBBLE, count: 64 },
      { id: BLOCKS.OAK_PLANKS, count: 64 },
      { id: BLOCKS.DIRT, count: 64 },
      { id: BLOCKS.TNT, count: 16 },
      { id: BLOCKS.GLOWSTONE, count: 32 },
      { id: BLOCKS.OBSIDIAN, count: 16 },
      { id: BLOCKS.GLASS, count: 32 },
      { id: BLOCKS.SAND, count: 64 },
      { id: BLOCKS.OAK_LOG, count: 32 }
    ];
    this.activeSlot = 0;

    // First-Person 3D Arm
    this.arm = null;
    this.armSwing = 0;
    this.walkBob = 0;
    this.createPlayerArm();

    // Twist 2: Chrono-Timeline Ring Buffer (10 seconds @ 20 ticks/sec)
    this.timeline = [];
    this.maxTimelineTicks = 200;
    this.isRewinding = false;

    // Interactive Trial Tracker
    this.trialStage = 1;

    // Input States
    this.keys = {};
    this.setupListeners();
    this.setupSafeSpawn();
  }

  setupSafeSpawn() {
    const groundY = this.world.getHighestSolidY(24, 24);
    this.pos.set(24.5, groundY + 2.1, 24.5);
  }

  createPlayerArm() {
    this.armGroup = new THREE.Group();
    const armGeo = new THREE.BoxGeometry(0.2, 0.5, 0.2);
    const armMat = new THREE.MeshLambertMaterial({ color: 0xc89870 });
    this.arm = new THREE.Mesh(armGeo, armMat);
    this.arm.position.set(0.35, -0.3, -0.5);
    this.arm.rotation.set(0.2, -0.1, 0);
    this.armGroup.add(this.arm);
    this.camera.add(this.armGroup);
    this.scene.add(this.camera);
  }

  setupListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      // Slot keys 1-9
      if (e.code >= 'Digit1' && e.code <= 'Digit9') {
        this.activeSlot = parseInt(e.code.replace('Digit', '')) - 1;
        updateHotbarUI();
      }

      // Twist 1: Flip Gravity [G]
      if (e.code === 'KeyG') {
        this.toggleGravity();
      }

      // Toggle Inventory [E]
      if (e.code === 'KeyE') {
        toggleInventory();
      }

      // F3 Debug
      if (e.code === 'F3') {
        e.preventDefault();
        document.getElementById('debug-screen').classList.toggle('hidden');
      }

      // Teleport to Trial Course [T]
      if (e.code === 'KeyT') {
        this.teleportToTrial();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    window.addEventListener('wheel', (e) => {
      if (e.deltaY > 0) {
        this.activeSlot = (this.activeSlot + 1) % 9;
      } else {
        this.activeSlot = (this.activeSlot + 8) % 9;
      }
      updateHotbarUI();
    });

    // Mouse Look
    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement) {
        const sens = 0.0022;
        this.yaw -= e.movementX * sens;
        this.pitch -= e.movementY * sens;
        this.pitch = Math.max(-Math.PI / 2.05, Math.min(Math.PI / 2.05, this.pitch));
      }
    });

    // Mining & Placing
    window.addEventListener('mousedown', (e) => {
      if (!document.pointerLockElement) return;
      this.armSwing = 1.0;
      if (e.button === 0) this.raycastAction(true);  // Left-click: mine/attack
      if (e.button === 2) this.raycastAction(false); // Right-click: place
    });
  }

  toggleGravity() {
    this.gravityDir *= -1;
    this.targetRoll = this.gravityDir === -1 ? Math.PI : 0;
    sounds.playGravityFlip(this.gravityDir === -1);
    document.getElementById('grav-mode').innerText = this.gravityDir === -1 ? 'INVERTED (CEILING)' : 'NORMAL';
    document.getElementById('gravity-badge').style.borderColor = this.gravityDir === -1 ? '#ff00ff' : '#aa44ff';
  }

  teleportToTrial() {
    this.pos.set(6.5, 16, 8.5);
    this.vel.set(0, 0, 0);
    this.gravityDir = 1.0;
    this.targetRoll = 0;
    this.trialStage = 1;
    this.updateTrialUI();
    sounds.playFanfare();
  }

  raycastAction(isBreak) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const reach = 5.5;

    // Check mob hits on left click
    if (isBreak) {
      for (const mob of this.mobs.mobs) {
        if (mob.pos.distanceTo(this.pos) < 3.5) {
          mob.health -= 5;
          sounds.playHurt();
          if (mob.health <= 0) {
            this.scene.remove(mob.mesh);
            this.mobs.mobs.splice(this.mobs.mobs.indexOf(mob), 1);
            this.xp += 10;
            if (this.xp >= 30) {
              this.level++;
              this.xp = 0;
              sounds.playFanfare();
            }
          }
          return;
        }
      }
    }

    // Step along the camera forward ray
    const rayDir = raycaster.ray.direction;
    const start = this.camera.position.clone();
    for (let step = 0; step < reach * 10; step++) {
      const checkPos = start.clone().addScaledVector(rayDir, step * 0.1);
      const bx = Math.floor(checkPos.x);
      const by = Math.floor(checkPos.y);
      const bz = Math.floor(checkPos.z);

      const block = this.world.getBlock(bx, by, bz);
      if (block !== BLOCKS.AIR && block !== BLOCKS.WATER) {
        if (isBreak) {
          // Break block
          if (block === BLOCKS.BEDROCK) return;
          this.world.setBlock(bx, by, bz, BLOCKS.AIR);
          sounds.playBlockBreak();
          this.recordBlockAction(bx, by, bz, block, BLOCKS.AIR);
        } else {
          // Place block against normal
          const prev = start.clone().addScaledVector(rayDir, (step - 1) * 0.1);
          const pbx = Math.floor(prev.x);
          const pby = Math.floor(prev.y);
          const pbz = Math.floor(prev.z);

          const activeItem = this.hotbar[this.activeSlot];
          if (activeItem && activeItem.count > 0) {
            // Cannot place inside player bounding box
            const pbox = new THREE.Box3(
              new THREE.Vector3(this.pos.x - 0.3, this.pos.y - 0.9, this.pos.z - 0.3),
              new THREE.Vector3(this.pos.x + 0.3, this.pos.y + 0.9, this.pos.z + 0.3)
            );
            const bBox = new THREE.Box3(
              new THREE.Vector3(pbx, pby, pbz),
              new THREE.Vector3(pbx + 1, pby + 1, pbz + 1)
            );

            if (!pbox.intersectsBox(bBox)) {
              this.world.setBlock(pbx, pby, pbz, activeItem.id);
              sounds.playBlockPlace();
              activeItem.count--;
              updateHotbarUI();
              this.recordBlockAction(pbx, pby, pbz, BLOCKS.AIR, activeItem.id);
            }
          }
        }
        return;
      }
    }
  }

  recordBlockAction(x, y, z, oldType, newType) {
    if (this.timeline.length > 0) {
      const top = this.timeline[this.timeline.length - 1];
      top.blockEdits.push({ x, y, z, oldType, newType });
    }
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    sounds.playHurt();
    const hurtOverlay = document.getElementById('hurt-overlay');
    hurtOverlay.style.opacity = '1';
    setTimeout(() => hurtOverlay.style.opacity = '0', 120);

    if (this.health <= 0) {
      // Respawn
      this.health = 20;
      this.hunger = 20;
      this.setupSafeSpawn();
    }
    updateStatusHUD();
  }

  update(delta) {
    // Twist 2: Chrono-Rewind [HOLD R]
    if (this.keys['KeyR'] && this.timeline.length > 1) {
      this.isRewinding = true;
      document.getElementById('rewind-overlay').style.display = 'flex';
      const snap = this.timeline.pop();
      sounds.playRewindTick();

      // Restore position & state
      this.pos.copy(snap.pos);
      this.vel.set(0, 0, 0);
      this.health = snap.health;
      this.hunger = snap.hunger;
      this.gravityDir = snap.gravityDir;
      this.targetRoll = this.gravityDir === -1 ? Math.PI : 0;

      // Undo block edits
      snap.blockEdits.forEach(b => {
        this.world.setBlockInternal(b.x, b.y, b.z, b.oldType);
      });
      if (snap.blockEdits.length > 0) this.world.rebuildAllMeshes();

      // Restore mob snapshots
      this.mobs.restoreMobState(snap.mobs);
      updateStatusHUD();
      return;
    } else {
      this.isRewinding = false;
      document.getElementById('rewind-overlay').style.display = 'none';
    }

    // Save timeline snapshot (20 snapshots/sec)
    this.timeline.push({
      pos: this.pos.clone(),
      health: this.health,
      hunger: this.hunger,
      gravityDir: this.gravityDir,
      mobs: this.mobs.getSnapshot(),
      blockEdits: []
    });
    if (this.timeline.length > this.maxTimelineTicks) this.timeline.shift();
    document.getElementById('rewind-time').innerText = (this.timeline.length * 0.05).toFixed(1) + 's';

    // Hunger exhaustion & natural health regeneration
    this.hungerTimer += delta;
    if (this.hungerTimer > 4.0) {
      this.hungerTimer = 0;
      if (this.hunger > 17 && this.health < 20) {
        this.health = Math.min(20, this.health + 1);
        updateStatusHUD();
      }
    }

    // Smooth camera roll lerp for gravity inversion
    this.roll = THREE.MathUtils.lerp(this.roll, this.targetRoll, delta * 12);

    // Physics constants
    const speed = this.isSprinting ? 7.5 : 4.5;
    const accel = 60.0;
    const gravityAccel = 24.0 * this.gravityDir;

    // Movement vectors
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)).normalize();
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw)).normalize();
    const moveDir = new THREE.Vector3();

    if (this.keys['KeyW']) moveDir.add(forward);
    if (this.keys['KeyS']) moveDir.sub(forward);
    if (this.keys['KeyD']) moveDir.add(right);
    if (this.keys['KeyA']) moveDir.sub(right);
    if (moveDir.lengthSq() > 0) moveDir.normalize();

    this.isSprinting = !!this.keys['ControlLeft'] && moveDir.lengthSq() > 0;
    this.isSneaking = !!this.keys['ShiftLeft'];

    // Horizontal acceleration & friction
    this.vel.x += moveDir.x * accel * delta;
    this.vel.z += moveDir.z * accel * delta;
    const drag = this.onGround ? 12.0 : 2.5;
    this.vel.x -= this.vel.x * drag * delta;
    this.vel.z -= this.vel.z * drag * delta;

    // Gravity acceleration
    this.vel.y -= gravityAccel * delta;

    // Jump impulse
    if (this.keys['Space'] && this.onGround) {
      this.vel.y = 8.5 * this.gravityDir;
      this.onGround = false;
      sounds.playFootstep(false);
    }

    // Auto-step & Discrete axis AABB collision resolution
    this.resolveCollisions(delta);

    // Void floor fallback guard
    if (this.pos.y < -4 || this.pos.y > WORLD_HEIGHT + 10) {
      this.setupSafeSpawn();
      this.takeDamage(4);
    }

    // Camera view positioning
    const eyeHeight = this.isSneaking ? 1.3 : 1.62;
    this.camera.position.set(this.pos.x, this.pos.y + (this.gravityDir === 1 ? eyeHeight - 0.9 : -eyeHeight + 0.9), this.pos.z);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.set(this.pitch, this.yaw, this.roll);

    // Walking arm-bobbing & attack swing animations
    if (this.arm) {
      if (this.onGround && moveDir.lengthSq() > 0) {
        this.walkBob += delta * (this.isSprinting ? 14 : 9);
      } else {
        this.walkBob = THREE.MathUtils.lerp(this.walkBob, 0, delta * 6);
      }
      this.armSwing = Math.max(0, this.armSwing - delta * 4);
      this.arm.position.y = -0.3 + Math.sin(this.walkBob) * 0.04;
      this.arm.position.x = 0.35 + Math.cos(this.walkBob * 0.5) * 0.02;
      this.arm.rotation.x = 0.2 + Math.sin(this.armSwing * Math.PI) * 0.8;
    }

    // Footstep audio triggers
    if (this.onGround && moveDir.lengthSq() > 0 && Math.sin(this.walkBob) < -0.9) {
      sounds.playFootstep();
    }

    // Interactive Trial Stage Checkpoints
    this.checkTrialProgress();
  }

  resolveCollisions(delta) {
    const hw = 0.3; // Half width
    const hh = 0.9; // Half height

    // X Axis
    this.pos.x += this.vel.x * delta;
    if (this.checkBlockCollision(this.pos.x, this.pos.y, this.pos.z, hw, hh)) {
      this.pos.x -= this.vel.x * delta;
      this.vel.x = 0;
    }

    // Z Axis
    this.pos.z += this.vel.z * delta;
    if (this.checkBlockCollision(this.pos.x, this.pos.y, this.pos.z, hw, hh)) {
      this.pos.z -= this.vel.z * delta;
      this.vel.z = 0;
    }

    // Y Axis
    this.onGround = false;
    this.pos.y += this.vel.y * delta;
    if (this.checkBlockCollision(this.pos.x, this.pos.y, this.pos.z, hw, hh)) {
      if (this.gravityDir === 1 && this.vel.y < 0) this.onGround = true;
      if (this.gravityDir === -1 && this.vel.y > 0) this.onGround = true;
      this.pos.y -= this.vel.y * delta;
      this.vel.y = 0;
    }
  }

  checkBlockCollision(px, py, pz, hw, hh) {
    const minX = Math.floor(px - hw);
    const maxX = Math.floor(px + hw);
    const minY = Math.floor(py - hh);
    const maxY = Math.floor(py + hh);
    const minZ = Math.floor(pz - hw);
    const maxZ = Math.floor(pz + hw);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const b = this.world.getBlock(x, y, z);
          if (b !== BLOCKS.AIR && b !== BLOCKS.WATER) return true;
        }
      }
    }
    return false;
  }

  checkTrialProgress() {
    // Stage 1: Ceiling traverse checkpoint
    if (this.trialStage === 1 && this.pos.distanceTo(new THREE.Vector3(22.5, 25, 8.5)) < 2.0) {
      this.trialStage = 2;
      this.updateTrialUI();
      sounds.playFanfare();
    }
    // Stage 2: Sand bridge switch
    if (this.trialStage === 2 && this.pos.distanceTo(new THREE.Vector3(22.5, 15, 23.5)) < 2.0) {
      this.trialStage = 3;
      this.updateTrialUI();
      sounds.playFanfare();
    }
    // Stage 3: Creeper blast recovery
    if (this.trialStage === 3 && this.pos.distanceTo(new THREE.Vector3(34.5, 15, 23.5)) < 2.5) {
      this.trialStage = 4;
      this.updateTrialUI();
      sounds.playFanfare();
    }
    // Stage 4: Final Victory Beacon
    if (this.trialStage === 4 && this.pos.distanceTo(new THREE.Vector3(34.5, 15, 36.5)) < 2.0) {
      this.trialStage = 5;
      this.updateTrialUI();
      sounds.playFanfare();
    }
  }

  updateTrialUI() {
    const banner = document.getElementById('trial-banner');
    const title = document.getElementById('trial-title');
    const desc = document.getElementById('trial-desc');
    const badge = document.getElementById('trial-status');

    banner.style.opacity = '1';
    if (this.trialStage === 1) {
      title.innerText = 'STAGE 1: CEILING TRAVERSE';
      desc.innerText = 'Press [G] to invert gravity and sprint along the obsidian ceiling runway!';
      badge.innerText = 'STAGE 1';
    } else if (this.trialStage === 2) {
      title.innerText = 'STAGE 2: COLLAPSING SAND CORE';
      desc.innerText = 'Sprint across the sand runway, grab the Diamond Core, and hold [R] to rewind back safely!';
      badge.innerText = 'STAGE 2';
    } else if (this.trialStage === 3) {
      title.innerText = 'STAGE 3: EXPLOSION REVERSAL';
      desc.innerText = 'The bridge has been blown apart! Hold [R] to reconstruct the voxel bridge and pass!';
      badge.innerText = 'STAGE 3';
    } else if (this.trialStage === 4) {
      title.innerText = 'STAGE 4: VERTICAL RIFT GAUNTLET';
      desc.innerText = 'Chain mid-air [G] gravity flips between floor and ceiling spikes to reach the beacon!';
      badge.innerText = 'STAGE 4';
    } else if (this.trialStage === 5) {
      title.innerText = 'ACADEMY CHAMPION!';
      desc.innerText = 'You mastered Gravitational Inversion and Temporal Rewind! Press [T] to retry anytime.';
      badge.innerText = 'COMPLETED';
    }
  }
}

// =============================================================================
// 7. USER INTERFACE & FAST CRAFTING
// =============================================================================
function createStatusIcon(container, iconClass, count) {
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = `stat-icon ${iconClass}`;
    container.appendChild(el);
  }
}

function updateStatusHUD() {
  const healthBar = document.getElementById('health-bar');
  const hungerBar = document.getElementById('hunger-bar');
  const xpFill = document.getElementById('xp-bar-fill');
  const xpLevel = document.getElementById('xp-level-text');

  // Render 10 Hearts
  healthBar.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const heart = document.createElement('div');
    heart.className = 'stat-icon';
    heart.style.background = i * 2 < player.health ? '#ff2222' : '#330000';
    heart.style.border = '1px solid #000';
    heart.style.width = '14px';
    heart.style.height = '14px';
    healthBar.appendChild(heart);
  }

  // Render 10 Hunger drumsticks
  hungerBar.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const food = document.createElement('div');
    food.className = 'stat-icon';
    food.style.background = i * 2 < player.hunger ? '#d88b2d' : '#2b1b08';
    food.style.border = '1px solid #000';
    food.style.width = '14px';
    food.style.height = '14px';
    hungerBar.appendChild(food);
  }

  xpFill.style.width = `${(player.xp / 30) * 100}%`;
  xpLevel.innerText = player.level;
}

function updateHotbarUI() {
  const hotbarEl = document.getElementById('hotbar');
  hotbarEl.innerHTML = '';
  player.hotbar.forEach((slot, idx) => {
    const slotEl = document.createElement('div');
    slotEl.className = `hotbar-slot ${idx === player.activeSlot ? 'active' : ''}`;
    slotEl.title = BLOCK_NAMES[slot.id] || '';

    if (slot.count > 0) {
      const label = document.createElement('span');
      label.innerText = (BLOCK_NAMES[slot.id] || '').split(' ')[0];
      label.style.fontSize = '9px';
      label.style.color = '#fff';
      label.style.textShadow = '1px 1px 0 #000';
      slotEl.appendChild(label);

      const count = document.createElement('span');
      count.className = 'slot-count';
      count.innerText = slot.count;
      slotEl.appendChild(count);
    }

    slotEl.onclick = () => {
      player.activeSlot = idx;
      updateHotbarUI();
    };
    hotbarEl.appendChild(slotEl);
  });
}

function toggleInventory() {
  const gui = document.getElementById('inventory-gui');
  const isHidden = gui.classList.contains('hidden');
  if (isHidden) {
    gui.classList.remove('hidden');
    document.exitPointerLock();
  } else {
    gui.classList.add('hidden');
    document.body.requestPointerLock();
  }
}

// Fast Crafting Buttons
document.querySelectorAll('.recipe-btn').forEach(btn => {
  btn.onclick = () => {
    const recipe = btn.getAttribute('data-recipe');
    if (recipe === 'planks') {
      const logs = player.hotbar.find(s => s.id === BLOCKS.OAK_LOG && s.count >= 1);
      if (logs) {
        logs.count--;
        let slot = player.hotbar.find(s => s.id === BLOCKS.OAK_PLANKS);
        if (slot) slot.count += 4;
        sounds.playBlockPlace();
        updateHotbarUI();
      }
    } else if (recipe === 'tnt') {
      let slot = player.hotbar.find(s => s.id === BLOCKS.TNT);
      if (slot) {
        slot.count += 4;
        sounds.playBlockPlace();
        updateHotbarUI();
      }
    }
  };
});

document.getElementById('close-inv-btn').onclick = toggleInventory;

// =============================================================================
// 8. SCENE INITIALIZATION & GAME LOOP
// =============================================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.FogExp2(0x87ceeb, 0.015);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.getElementById('game-container').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xfffaed, 0.85);
sunLight.position.set(50, 80, 40);
sunLight.castShadow = true;
scene.add(sunLight);

// Instantiate Game Components
const world = new VoxelWorld(scene);
world.generateWorld();

const mobs = new MobManager(scene, world);
mobs.spawnMob('creeper', 18, 14, 18);
mobs.spawnMob('creeper', 28, 15, 23);
mobs.spawnMob('zombie', 12, 14, 12);
mobs.spawnMob('pig', 20, 14, 20);

const player = new PlayerController(camera, world, mobs, scene);

// Handle TNT Detonations
function triggerExplosion(pos) {
  sounds.playExplosion();
  const radius = 3;
  const bx = Math.floor(pos.x);
  const by = Math.floor(pos.y);
  const bz = Math.floor(pos.z);

  for (let x = -radius; x <= radius; x++) {
    for (let y = -radius; y <= radius; y++) {
      for (let z = -radius; z <= radius; z++) {
        if (x * x + y * y + z * z <= radius * radius) {
          const old = world.getBlock(bx + x, by + y, bz + z);
          if (old !== BLOCKS.AIR && old !== BLOCKS.BEDROCK) {
            world.setBlock(bx + x, by + y, bz + z, BLOCKS.AIR);
            player.recordBlockAction(bx + x, by + y, bz + z, old, BLOCKS.AIR);
          }
        }
      }
    }
  }

  // Knockback player if nearby
  const d = player.pos.distanceTo(pos);
  if (d < 5) {
    player.takeDamage(Math.floor((5 - d) * 3));
    player.vel.add(new THREE.Vector3().subVectors(player.pos, pos).normalize().multiplyScalar(12));
  }
}

// Menu and Start Handlers
const pauseScreen = document.getElementById('pause-screen');
document.getElementById('btn-play').onclick = () => {
  sounds.init();
  document.body.requestPointerLock();
};

document.getElementById('btn-trial').onclick = () => {
  sounds.init();
  player.teleportToTrial();
  document.body.requestPointerLock();
};

document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement) {
    pauseScreen.classList.add('hidden');
  } else {
    if (document.getElementById('inventory-gui').classList.contains('hidden')) {
      pauseScreen.classList.remove('hidden');
    }
  }
});

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Main Loop
let lastTime = performance.now();
let fpsCount = 0;
let fpsTimer = 0;

function animate(currentTime) {
  requestAnimationFrame(animate);

  const delta = Math.min(0.1, (currentTime - lastTime) / 1000);
  lastTime = currentTime;

  // FPS calculations
  fpsCount++;
  fpsTimer += delta;
  if (fpsTimer >= 1.0) {
    document.getElementById('dbg-fps').innerText = `FPS: ${fpsCount}`;
    fpsCount = 0;
    fpsTimer = 0;
  }

  // Update game components
  player.update(delta);
  mobs.update(delta, player.pos, triggerExplosion);

  // Update telemetry
  document.getElementById('dbg-pos').innerText = `XYZ: ${player.pos.x.toFixed(2)} / ${player.pos.y.toFixed(2)} / ${player.pos.z.toFixed(2)}`;
  document.getElementById('dbg-grav').innerText = `Gravity: ${player.gravityDir.toFixed(1)}`;
  document.getElementById('dbg-mobs').innerText = `Active Entities: ${mobs.mobs.length}`;

  renderer.render(scene, camera);
}

// Initialize HUD
updateStatusHUD();
updateHotbarUI();
requestAnimationFrame(animate);
