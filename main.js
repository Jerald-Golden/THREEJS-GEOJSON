import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';


var Data;

const response = await fetch('countries_states.json');
const data = await response.json();
Data = data.features;

let totalLines = 0;

// console.log(Data);

var Mapshape = "plane";

function changeToSphere() {
    scene.children = [];
    Mapshape = "sphere";
    startCreating(Mapshape);
}
function changeToPlane() {
    scene.children = [];
    Mapshape = "plane";
    startCreating(Mapshape);
}

var scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set(0, 0, 300);


const renderer = new THREE.WebGLRenderer({ canvas: my_canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 10;
controls.update();

const light = new THREE.AmbientLight(0xffffff);

window.addEventListener('resize', onWindowResize);


const material = new THREE.LineBasicMaterial({ color: 0xffffff });

function startCreating(Mapshape) {
    Data.forEach(element => {
        if (element.geometry.type === "Polygon") {
            let coordinates = element.geometry.coordinates;
            createLine(coordinates[0], Mapshape);
        }
        else if (element.geometry.type === "MultiPolygon") {
            let coordinates = element.geometry.coordinates;
            coordinates.forEach(element => {
                createLine(element[0], Mapshape);
            })
        }
    });
}


function createLine(coordinates, Mapshape) {
    scene.add(camera);
    scene.add(light);

    if (Mapshape === "sphere") {
        // console.log(coordinates);
        totalLines++;
        const vertex = [];
        let lines = [];
        let value = [];
        for (let i = 0; i < coordinates.length; i++) {
            value = [];
            const coordinate = coordinates[i];
            vertex.push(coordinate[0], coordinate[1]);
            var lon = coordinate[0];
            var lat = coordinate[1];

            value.push(Math.cos(lat * Math.PI / 180) * Math.cos(lon * Math.PI / 180) * 100);
            value.push(Math.cos(lat * Math.PI / 180) * Math.sin(lon * Math.PI / 180) * 100);
            value.push(Math.sin(lat * Math.PI / 180) * 100);
            lines.push(new THREE.Vector3(value[0], value[1], value[2]));
        }
        lines.push(lines[0]);
        const geometry = new THREE.BufferGeometry().setFromPoints(lines);
        const line = new THREE.Line(geometry, material);
        line.rotation.setFromVector3(new THREE.Vector3(-Math.PI / 2, 0, -Math.PI));
        scene.add(line);

    } else if (Mapshape === "plane") {
        totalLines++;
        let lines = [];
        for (let i = 0; i < coordinates.length; i++) {
            const coordinate = coordinates[i];
            const vertex = new THREE.Vector2(coordinate[0], coordinate[1]);
            lines.push(vertex);
        }
        lines.push(new THREE.Vector2(coordinates[0][0], coordinates[0][1]));
        // console.log(lines);

        const geometry = new THREE.BufferGeometry().setFromPoints(lines);
        const line = new THREE.Line(geometry, material);
        scene.add(line);

    }
}

changeToSphere();

// console.log("TOTAL LINES = " + totalLines);

document.getElementById("button-sphere").addEventListener("click", function () {
    changeToSphere();
});

document.getElementById("button-plane").addEventListener("click", function () {
    changeToPlane();
});


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera)
}
render()
