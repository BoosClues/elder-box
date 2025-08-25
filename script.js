import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

const overlay = document.getElementById('overlay');
const glyphGrid = document.getElementById('glyphGrid');

/**
 * Simple sound manager using the Web Audio API to avoid binary assets.
 */
class SoundManager {
  constructor() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new Ctx();
  }
  play(name) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    switch (name) {
      case 'valve':
        osc.frequency.value = 120;
        break;
      case 'telescope':
        osc.frequency.value = 440;
        break;
      default:
        osc.frequency.value = 300;
    }
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }
}

const sound = new SoundManager();

function glyphPlaceholder(label) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = '#ccc';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 32, 32);
  return canvas.toDataURL();
}

/**
 * Core puzzle game controller handling sequential stages.
 */
class PuzzleGame {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.stage = 0;
    this.requiredGlyphs = ['moon','bat','child','blood','vampire'];
    this.inputGlyphs = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.initBox();
    this.setNarration('A dark pedestal holds an obsidian box. Your blood will wake it.');
  }

  initBox() {
    const geom = new THREE.BoxGeometry(1,1,1);
    const mat = new THREE.MeshStandardMaterial({color:0x111111});
    this.box = new THREE.Mesh(geom,mat);
    this.scene.add(this.box);

    // pop-up telescope placeholder
    const cyl = new THREE.CylinderGeometry(0.05,0.05,0.2,32);
    const cylMat = new THREE.MeshStandardMaterial({color:0x888888});
    this.telescope = new THREE.Mesh(cyl,cylMat);
    this.telescope.position.set(0,0.6,0);
    this.telescope.visible = false; // hidden until activated
    this.scene.add(this.telescope);
  }

  setNarration(text) {
    overlay.textContent = text;
  }

  nextStage() {
    this.stage++;
    switch(this.stage) {
      case 1: this.stage1(); break;
      case 2: this.stage2(); break;
      case 3: this.stage3(); break;
      case 4: this.stage4(); break;
      case 5: this.stage5(); break;
      case 6: this.stage6(); break;
      case 7: this.stage7(); break;
      default: this.setNarration('The box falls silent.');
    }
  }

  // 1. Prick your finger to start the blood flow.
  stage1() {
    this.setNarration('Stage 1: Prick your finger. Click the box to bleed.');
    const handler = (e) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const hit = this.raycaster.intersectObject(this.box);
      if (hit.length) {
        sound.play('click');
        this.renderer.domElement.removeEventListener('click', handler);
        this.setNarration('Blood drips into hidden veins.');
        this.nextStage();
      }
    };
    this.renderer.domElement.addEventListener('click', handler);
  }

  // 2. Increase the blood pressure using knobs and valves and gauges.
  stage2() {
    this.setNarration('Stage 2: Adjust valves to raise pressure. (Placeholder knob)');
    sound.play('valve');
    // TODO: interactive valve puzzle
    setTimeout(()=>this.nextStage(),1000);
  }

  // 3. Rearrange 5 IV tubes.
  stage3() {
    this.setNarration('Stage 3: Connect the IV tubes. (Placeholder)');
    // TODO: drag-drop tube puzzle
    setTimeout(()=>{
      this.setNarration('A stanza glows upon the box.');
      this.nextStage();
    },1000);
  }

  // 4. Riddle glyph grid.
  stage4() {
    this.setNarration('Stage 4: Decode the glowing riddle.');
    glyphGrid.innerHTML = '';
    glyphGrid.style.display = 'block';
    const glyphs = ['moon','bat','child','blood','vampire','walrus','oyster','bird','sun'];
    glyphs.forEach(g => {
      const img = document.createElement('img');
      img.src = glyphPlaceholder(g);
      img.alt = g;
      img.addEventListener('click', () => this.handleGlyph(g));
      glyphGrid.appendChild(img);
    });
  }

  handleGlyph(g) {
    this.inputGlyphs.push(g);
    sound.play('click');
    if (this.inputGlyphs.length === this.requiredGlyphs.length) {
      glyphGrid.style.display = 'none';
      if (this.requiredGlyphs.every((v,i)=>v===this.inputGlyphs[i])) {
        this.setNarration('Glyphs align; a hidden panel slides open.');
        this.nextStage();
      } else {
        this.setNarration('Wrong order. The glyphs reset.');
        this.inputGlyphs = [];
        this.stage4();
      }
    }
  }

  // 5. Vampire head orientation puzzle.
  stage5() {
    this.setNarration('Stage 5: Daylight approaches. Rotate the vampire head upside down.');
    // TODO: 3D model of vampire head with rotation interaction
    setTimeout(()=>{
      this.setNarration('The vampire sleeps inverted, revealing a key.');
      this.nextStage();
    },1000);
  }

  // 6. Multi-tier ring maze.
  stage6() {
    this.setNarration('Stage 6: Align the blood rings to continue the flow.');
    // TODO: ring puzzle logic where rotating affects others
    setTimeout(()=>{
      this.setNarration('The blood forms the outline of a key.');
      this.nextStage();
    },1000);
  }

  // 7. Hardened obsidian key and final unlock.
  stage7() {
    this.telescope.visible = true; // show telescope for cool mechanic
    sound.play('telescope');
    this.setNarration('Stage 7: Forge the key and reveal the artifact.');
    // TODO: animate blood solidifying into key, allow user to unlock box
  }
}

// basic Three.js scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.HemisphereLight(0xffffff,0x444444,1);
scene.add(light);

const game = new PuzzleGame(scene,camera,renderer);

game.nextStage(); // start at stage 1

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene,camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
