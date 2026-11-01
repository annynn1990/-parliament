import * as THREE from "three";

const $ = (s) => document.querySelector(s);
const seatRows = [8, 9, 9, 10, 12];
const seats = [];
let id = 1;
seatRows.forEach((count, row) => {
  for (let i = 0; i < count; i++) {
    const angle = THREE.MathUtils.degToRad(-70 + (140 * i) / (count - 1));
    const radius = 5.2 + row * 1.12;
    seats.push({
      id: id++, row: row + 1, number: i + 1,
      x: Math.sin(angle) * radius,
      z: 1.4 + Math.cos(angle) * radius,
      yaw: Math.atan2(-Math.sin(angle) * radius, -7.4 - (1.4 + Math.cos(angle) * radius)),
      name: "", party: "待編列", present: false, vote: null,
      group: null, bodyMaterial: null, backMaterial: null, ring: null
    });
  }
});

const root = $("#three-root");
const scene = new THREE.Scene();
scene.background = new THREE.Color("#101a15");
scene.fog = new THREE.Fog("#101a15", 23, 44);
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(0, 16.8, 25.8);
camera.lookAt(0, 1.2, 0);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
root.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight("#dce5d7", "#26372b", 2.0));
const keyLight = new THREE.DirectionalLight("#ffe3b2", 3.1);
keyLight.position.set(-7, 15, 8);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -18; keyLight.shadow.camera.right = 18;
keyLight.shadow.camera.top = 18; keyLight.shadow.camera.bottom = -18;
scene.add(keyLight);
const frontLight = new THREE.SpotLight("#f2d7a4", 170, 32, Math.PI / 5, 0.6, 1.4);
frontLight.position.set(0, 12, -9);
frontLight.target.position.set(0, 0, 1);
scene.add(frontLight, frontLight.target);
const rimLight = new THREE.PointLight("#739b78", 36, 22);
rimLight.position.set(0, 6, 10);
scene.add(rimLight);

const mat = (color, roughness = 0.72, metalness = 0.05) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });
const materials = {
  floor: mat("#1a2a21", 0.94),
  dark: mat("#101a15", 0.82),
  wood: mat("#694b2f", 0.48),
  trim: mat("#b28d55", 0.32, 0.45),
  gold: mat("#c3a166", 0.3, 0.55),
  green: mat("#315743", 0.62),
  cushion: mat("#334d3d", 0.9),
  wall: mat("#213329", 0.88),
  stone: mat("#4b594b", 0.78),
  cream: mat("#e5d8bb", 0.42, 0.2)
};
function mesh(geometry, material, parent, position, cast = true) {
  const object = new THREE.Mesh(geometry, material);
  if (position) object.position.set(...position);
  object.castShadow = cast;
  object.receiveShadow = true;
  if (parent) parent.add(object);
  return object;
}
function box(parent, size, position, material, radius = 0) {
  const geometry = radius
    ? new THREE.BoxGeometry(...size)
    : new THREE.BoxGeometry(...size);
  return mesh(geometry, material, parent, position);
}
function cylinder(parent, radiusTop, radiusBottom, height, position, material, segments = 48) {
  return mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material, parent, position);
}

const floor = mesh(new THREE.CircleGeometry(17, 96), materials.floor, scene, [0, -0.18, 0]);
floor.rotation.x = -Math.PI / 2;
const floorInset = mesh(new THREE.CircleGeometry(11.9, 96), mat("#22382b", 0.96), scene, [0, -0.155, 0]);
floorInset.rotation.x = -Math.PI / 2;
const floorRing = mesh(new THREE.RingGeometry(11.6, 11.72, 96), materials.trim, scene, [0, -0.13, 0]);
floorRing.rotation.x = -Math.PI / 2;

// Curved rear wall and gold architectural ribs.
const wallCurve = new THREE.EllipseCurve(0, 0, 15.5, 15.5, Math.PI * 0.12, Math.PI * 0.88, false, 0);
const wallPoints = wallCurve.getPoints(80).map(p => new THREE.Vector3(p.x, 0, p.y + 1.0));
const wallPath = new THREE.CatmullRomCurve3(wallPoints);
mesh(new THREE.TubeGeometry(wallPath, 100, 0.28, 10, false), materials.wall, scene, [0, 4.4, 0]);
const wallCrownPoints = wallPoints.map(p => new THREE.Vector3(p.x, 8.7, p.z));
mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(wallCrownPoints), 100, 0.13, 8, false), materials.trim, scene);
for (let i = 0; i < 9; i++) {
  const a = THREE.MathUtils.degToRad(-78 + i * 19.5);
  const x = Math.sin(a) * 15.3;
  const z = 1.0 + Math.cos(a) * 15.3;
  const pillar = cylinder(scene, 0.19, 0.25, 8.6, [x, 4.3, z], materials.stone, 16);
  cylinder(scene, 0.34, 0.34, 0.32, [x, 0.17, z], materials.trim, 24);
  cylinder(scene, 0.27, 0.27, 0.18, [x, 8.48, z], materials.trim, 24);
}

// Dais, steps and lectern.
const dais = new THREE.Group();
dais.position.set(0, 0, -7.6);
scene.add(dais);
const platform = cylinder(dais, 4.5, 4.5, 0.46, [0, 0.25, 0], materials.wood, 64);
platform.scale.set(1.3, 1, 0.68);
const platformEdge = cylinder(dais, 4.58, 4.58, 0.13, [0, 0.06, 0], materials.gold, 64);
platformEdge.scale.set(1.3, 1, 0.68);
const step = cylinder(dais, 5.15, 5.15, 0.16, [0, 0.02, 0], materials.dark, 64);
step.scale.set(1.3, 1, 0.68);
for (const x of [-2.1, 2.1]) {
  box(dais, [0.65, 1.5, 0.65], [x, 1.0, -0.45], materials.wood);
  box(dais, [0.8, 0.12, 0.8], [x, 1.78, -0.45], materials.gold);
}
const chairGroup = new THREE.Group();
chairGroup.position.set(0, 0.43, -1.0);
dais.add(chairGroup);
box(chairGroup, [1.18, 0.3, 0.95], [0, 0.65, 0], materials.wood);
box(chairGroup, [1.18, 1.45, 0.25], [0, 1.35, -0.37], materials.wood);
box(chairGroup, [0.96, 0.09, 0.1], [0, 1.98, -0.23], materials.gold);
box(chairGroup, [0.98, 0.12, 0.1], [0, 0.98, 0.49], materials.cushion);
for (const x of [-0.62, 0.62]) {
  box(chairGroup, [0.16, 0.65, 0.8], [x, 0.83, 0.02], materials.wood);
}
const lectern = new THREE.Group();
lectern.position.set(0, 0, -3.85);
dais.add(lectern);
box(lectern, [1.45, 1.4, 0.85], [0, 0.78, 0], materials.wood);
box(lectern, [1.62, 0.13, 0.98], [0, 1.52, 0], materials.gold);
box(lectern, [1.2, 0.08, 0.7], [0, 1.63, 0], materials.cream);
const lecternBadge = mesh(new THREE.CircleGeometry(0.28, 32), materials.gold, lectern, [0, 0.83, 0.436]);
lecternBadge.rotation.x = 0;
const lecternW = new THREE.Group();
lecternW.position.set(0, 0.82, 0.446);
lectern.add(lecternW);
const badgeTextCanvas = document.createElement("canvas");
badgeTextCanvas.width = 128; badgeTextCanvas.height = 128;
const ctx = badgeTextCanvas.getContext("2d");
ctx.fillStyle = "#c3a166"; ctx.font = "bold 72px Georgia"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("W", 64, 67);
const badgeTexture = new THREE.CanvasTexture(badgeTextCanvas);
const badgeText = mesh(new THREE.PlaneGeometry(0.36, 0.36), new THREE.MeshBasicMaterial({ map: badgeTexture, transparent: true }), lecternW, [0, 0, 0.01], false);

// An illuminated imperial crest on the back wall.
const crest = new THREE.Group();
crest.position.set(0, 6.7, -15.25);
scene.add(crest);
mesh(new THREE.TorusGeometry(0.95, 0.055, 12, 64), materials.gold, crest);
mesh(new THREE.CircleGeometry(0.82, 64), mat("#1d3025", 0.5), crest, [0, 0, -0.015], false);
const crestTexture = new THREE.CanvasTexture(badgeTextCanvas);
mesh(new THREE.PlaneGeometry(1.12, 1.12), new THREE.MeshBasicMaterial({ map: crestTexture, transparent: true }), crest, [0, 0, 0.03], false);

// Audience benches become individual sculpted desks and chairs in five semicircular rows.
const partyColors = {
  "執政黨團": "#a7824e",
  "在野黨團": "#4f8997",
  "無黨籍": "#8972a3",
  "主席團": "#9a9f72",
  "待編列": "#56645a"
};
const seatParts = [];
function makeSeat(seat) {
  const group = new THREE.Group();
  group.position.set(seat.x, 0, seat.z);
  group.rotation.y = seat.yaw;
  scene.add(group);
  const material = mat(partyColors[seat.party], 0.68);
  seat.bodyMaterial = material;
  seat.backMaterial = material;
  box(group, [0.86, 0.13, 0.82], [0, 0.56, 0.02], material);
  box(group, [0.82, 0.82, 0.16], [0, 1.02, -0.32], material);
  box(group, [0.9, 0.11, 0.85], [0, 1.46, -0.29], materials.trim);
  for (const side of [-1, 1]) {
    box(group, [0.11, 0.42, 0.75], [side * 0.49, 0.78, 0.03], materials.wood);
    box(group, [0.13, 0.1, 0.77], [side * 0.49, 0.98, 0.03], materials.trim);
    cylinder(group, 0.055, 0.07, 0.45, [side * 0.35, 0.26, -0.08], materials.wood, 10);
  }
  const desk = box(group, [1.25, 0.12, 0.56], [0, 1.18, 0.94], materials.wood);
  box(group, [1.29, 0.045, 0.59], [0, 1.26, 0.94], materials.trim);
  box(group, [0.08, 0.62, 0.08], [-0.45, 0.83, 1.07], materials.wood);
  box(group, [0.08, 0.62, 0.08], [0.45, 0.83, 1.07], materials.wood);
  const ringMat = new THREE.MeshBasicMaterial({ color: "#e5cf9d", transparent: true, opacity: 0.0, side: THREE.DoubleSide });
  const ring = mesh(new THREE.RingGeometry(0.52, 0.62, 32), ringMat, group, [0, 0.035, 0]);
  ring.rotation.x = -Math.PI / 2;
  seat.group = group;
  seat.ring = ring;
  group.traverse(obj => {
    if (obj.isMesh) {
      obj.userData.seatId = seat.id;
      seatParts.push(obj);
    }
  });
}
seats.forEach(makeSeat);

// Floor-level radial indicators and side galleries.
for (const side of [-1, 1]) {
  const sconce = new THREE.Group();
  sconce.position.set(side * 12.8, 0, -1.8);
  scene.add(sconce);
  cylinder(sconce, 0.55, 0.7, 0.35, [0, 0.18, 0], materials.trim, 24);
  cylinder(sconce, 0.24, 0.32, 2.0, [0, 1.28, 0], materials.stone, 24);
  const lamp = new THREE.PointLight("#edc982", 22, 8);
  lamp.position.set(0, 2.6, 0);
  sconce.add(lamp);
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let selectedSeatId = 1;
let hoverSeatId = null;
let dragging = false;
let pointerDown = null;
let lastX = 0, lastY = 0;
let theta = 0, phi = 1.12, distance = 29;
const target = new THREE.Vector3(0, 1.15, 0.2);
let onSeatSelect = () => {};
function seatFromEvent(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(seatParts, false)[0];
  return hit ? hit.object.userData.seatId : null;
}
function updateCamera() {
  phi = THREE.MathUtils.clamp(phi, 0.48, 1.38);
  distance = THREE.MathUtils.clamp(distance, 18, 42);
  camera.position.set(
    target.x + distance * Math.sin(phi) * Math.sin(theta),
    target.y + distance * Math.cos(phi),
    target.z + distance * Math.sin(phi) * Math.cos(theta)
  );
  camera.lookAt(target);
}
renderer.domElement.addEventListener("pointerdown", event => {
  dragging = true;
  pointerDown = { x: event.clientX, y: event.clientY, time: performance.now() };
  lastX = event.clientX; lastY = event.clientY;
  renderer.domElement.setPointerCapture(event.pointerId);
});
renderer.domElement.addEventListener("pointermove", event => {
  if (dragging) {
    const dx = event.clientX - lastX, dy = event.clientY - lastY;
    if (pointerDown && (Math.abs(event.clientX - pointerDown.x) + Math.abs(event.clientY - pointerDown.y) > 5)) {
      theta -= dx * 0.006;
      phi -= dy * 0.0045;
      updateCamera();
    }
    lastX = event.clientX; lastY = event.clientY;
  } else {
    const id = seatFromEvent(event);
    if (id !== hoverSeatId) {
      hoverSeatId = id;
      renderer.domElement.style.cursor = id ? "pointer" : "grab";
    }
  }
});
renderer.domElement.addEventListener("pointerup", event => {
  const moved = pointerDown ? Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) : 99;
  if (moved < 6) {
    const id = seatFromEvent(event);
    if (id) chooseSeat(id);
  }
  dragging = false;
  pointerDown = null;
});
renderer.domElement.addEventListener("pointercancel", () => { dragging = false; pointerDown = null; });
renderer.domElement.addEventListener("wheel", event => {
  event.preventDefault();
  distance += event.deltaY * 0.014;
  updateCamera();
}, { passive: false });
renderer.domElement.addEventListener("dblclick", () => {
  theta = 0; phi = 1.12; distance = 29; updateCamera();
});
updateCamera();

function chooseSeat(id) {
  selectedSeatId = id;
  renderChamberSeats();
  onSeatSelect(id);
}
function colorFor(seat) {
  if (seat.party === "執政黨團") return "#a7824e";
  if (seat.party === "在野黨團") return "#4f8997";
  if (seat.party === "無黨籍") return "#8972a3";
  if (seat.party === "主席團") return "#9a9f72";
  return "#56645a";
}
function renderChamberSeats() {
  seats.forEach(seat => {
    const color = colorFor(seat);
    seat.bodyMaterial.color.set(color);
    seat.bodyMaterial.emissive.set(seat.present ? "#2c6740" : "#000000");
    seat.bodyMaterial.emissiveIntensity = seat.present ? 0.25 : 0;
    seat.ring.material.opacity = seat.id === selectedSeatId ? 0.9 : 0;
    seat.ring.material.color.set(seat.vote ? "#f1d18b" : "#f8e5bb");
    seat.ring.scale.setScalar(seat.id === selectedSeatId ? 1 : seat.vote ? 0.88 : 1);
  });
}
function resize() {
  const width = root.clientWidth || 800;
  const height = root.clientHeight || 500;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}
const resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(root);
resize();
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
$("#loading-overlay").classList.add("is-hidden");
window.setTimeout(() => $("#loading-overlay")?.remove(), 500);

// Parliament interaction layer.
const agenda = ["確認議程", "政府施政報告", "法案審議", "臨時動議"];
let activeAgenda = 0;
let rollCallStarted = false;
let votingActive = false;
let votingClosed = false;
let toastTimer = null;
function seatById(id) { return seats.find(seat => seat.id === id); }
function toast(message) {
  const node = $("#toast");
  node.textContent = message;
  node.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => node.classList.remove("is-visible"), 2400);
}
function selectSeat(id) {
  const seat = seatById(id);
  $("#selected-seat-no").textContent = "R" + seat.row + "-" + String(seat.number).padStart(2, "0");
  $("#member-name").value = seat.name;
  $("#member-party").value = seat.party;
  $("#seat-state").textContent = seat.name ? seat.party : "待編列";
  $("#attendance-toggle").setAttribute("aria-pressed", String(seat.present));
  $("#attendance-hint").textContent = rollCallStarted ? (seat.present ? "已登記出席" : "尚未登記出席") : "點名程序尚未開始";
  $("#member-vote").textContent = seat.vote || "尚未投票";
  document.querySelectorAll("[data-vote]").forEach(button => {
    button.classList.toggle("is-selected", button.dataset.vote === seat.vote);
    button.disabled = !votingActive;
  });
}
function renderStats() {
  const present = seats.filter(seat => seat.present).length;
  const yes = seats.filter(seat => seat.vote === "贊成").length;
  const no = seats.filter(seat => seat.vote === "反對").length;
  const abstain = seats.filter(seat => seat.vote === "棄權").length;
  const voted = yes + no + abstain;
  $("#present-count").textContent = present;
  $("#yes-count").textContent = yes;
  $("#no-count").textContent = no;
  $("#abstain-count").textContent = abstain;
  $("#vote-count-label").textContent = voted + " / 48 已投票";
  $("#bottom-voted-count").textContent = voted;
  $("#vote-progress-fill").style.width = (voted / seats.length * 100) + "%";
  renderChamberSeats();
}
function selectAndRender(id) {
  selectedSeatId = id;
  renderChamberSeats();
  selectSeat(id);
}
onSeatSelect = id => selectSeat(id);
function select(id) { chooseSeat(id); selectSeat(id); }
selectSeat(selectedSeatId);

$("#save-member").addEventListener("click", () => {
  const seat = seatById(selectedSeatId);
  seat.name = $("#member-name").value.trim();
  seat.party = $("#member-party").value;
  $("#seat-state").textContent = seat.name ? seat.party : "待編列";
  renderStats();
  toast("已更新 " + $("#selected-seat-no").textContent + " 席次資料");
});
$("#attendance-toggle").addEventListener("click", () => {
  if (!rollCallStarted) { toast("請先開始點名程序"); return; }
  const seat = seatById(selectedSeatId);
  seat.present = !seat.present;
  selectSeat(selectedSeatId); renderStats();
  toast(seat.present ? "已登記本席出席" : "已取消本席出席");
});
$("#rollcall-btn").addEventListener("click", () => {
  rollCallStarted = !rollCallStarted;
  $("#rollcall-btn").textContent = rollCallStarted ? "結束點名" : "開始點名";
  $("#attendance-hint").textContent = rollCallStarted ? "點選開關登記各席出席" : "點名程序尚未開始";
  $("#session-status").textContent = rollCallStarted ? "正在進行出席點名" : "議事示範模式";
  selectSeat(selectedSeatId);
  toast(rollCallStarted ? "點名程序已開始，請逐席登記" : "點名程序已結束");
});
$("#voting-btn").addEventListener("click", () => {
  if (votingActive) {
    votingActive = false; votingClosed = true;
    $("#voting-btn").textContent = "重新開始表決";
    $("#voting-status").textContent = "已結束";
    $("#voting-status").classList.remove("is-active");
    $("#session-status").textContent = "表決已結束";
    document.querySelectorAll("[data-vote]").forEach(button => button.disabled = true);
    toast("表決結束：" + seats.filter(s => s.vote === "贊成").length + " 贊成、" + seats.filter(s => s.vote === "反對").length + " 反對");
  } else {
    if (votingClosed) { seats.forEach(seat => seat.vote = null); votingClosed = false; }
    votingActive = true;
    $("#voting-btn").textContent = "結束表決";
    $("#voting-status").textContent = "進行中";
    $("#voting-status").classList.add("is-active");
    $("#session-status").textContent = "正在進行議案表決";
    document.querySelectorAll("[data-vote]").forEach(button => button.disabled = false);
    toast("表決開始，請選取議席後登記投票");
  }
  selectSeat(selectedSeatId); renderStats();
});
document.querySelectorAll("[data-vote]").forEach(button => button.addEventListener("click", () => {
  if (!votingActive) return;
  const seat = seatById(selectedSeatId);
  seat.vote = button.dataset.vote;
  selectSeat(selectedSeatId); renderStats();
  toast("已登記 " + $("#selected-seat-no").textContent + "：" + seat.vote);
}));
$("#reset-votes").addEventListener("click", () => {
  seats.forEach(seat => seat.vote = null);
  votingActive = false; votingClosed = false;
  $("#voting-btn").textContent = "開始表決";
  $("#voting-status").textContent = "未開始";
  $("#voting-status").classList.remove("is-active");
  $("#session-status").textContent = rollCallStarted ? "正在進行出席點名" : "議事示範模式";
  selectSeat(selectedSeatId); renderStats(); toast("本次表決紀錄已重設");
});
document.querySelectorAll("[data-agenda]").forEach(button => button.addEventListener("click", () => {
  activeAgenda = Number(button.dataset.agenda);
  document.querySelectorAll(".agenda-item").forEach(item => item.classList.toggle("is-active", item === button));
  $("#current-agenda-title").textContent = agenda[activeAgenda];
  toast("目前議程：" + agenda[activeAgenda]);
}));
$("#export-btn").addEventListener("click", () => {
  const record = {
    title: "黃名帝國議會議事紀錄",
    exportedAt: new Date().toISOString(),
    agenda: agenda[activeAgenda],
    rollCallStarted, votingActive,
    seats: seats.map(seat => ({
      seat: "R" + seat.row + "-" + String(seat.number).padStart(2, "0"),
      name: seat.name, party: seat.party, present: seat.present, vote: seat.vote
    }))
  };
  const blob = new Blob([JSON.stringify(record, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = "wongming-parliament-record.json"; link.click();
  URL.revokeObjectURL(url);
  toast("已匯出本次議事紀錄 JSON");
});
