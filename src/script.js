import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'

/**
 * Debug
 */
const gui = new dat.GUI()

const parameters = {
    materialColor: '#ffeded'
}

gui
    .addColor(parameters, 'materialColor')
    .onChange(()=>{
        material.color.set(parameters.materialColor)
        particlesMaterial.color.set(parameters.materialColor)
    })

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */
// Texture
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('textures/gradients/3.jpg')
// filter the image to its doesn't look ruff.
// fit light intensity to the near image color
gradientTexture.magFilter = THREE.NearestFilter

// Material 
const material = new THREE.MeshToonMaterial({color: parameters.materialColor, gradientMap: gradientTexture})
// Meshes
const objectsDistance = 4
const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4,16,60),
    material
)
const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1,2,32),
    material
)
const mesh3 = new THREE.Mesh(
    new THREE.SphereGeometry( 1.3, 16, 8 ),
    material
   // new THREE.MeshBasicMaterial({color: '#ff0000'})
)
mesh1.position.y = - objectsDistance * 0
mesh2.position.y = - objectsDistance * 1
mesh3.position.y = - objectsDistance * 2
// object position from left and right
mesh1.position.x = 2
mesh2.position.x = -2
mesh3.position.x = 2
// added objects to the scenes
scene.add(mesh1, mesh2, mesh3);
// array with meshes
const sectionMeshes = [mesh1, mesh2, mesh3]
/**
 * Particles
 */
// Geometry
const particlesCount = 250
const positions = new Float32Array(particlesCount * 3) // store all of x y and z
// loop to make particles
for(let i = 0; i < particlesCount; i++){
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10
    positions[i * 3 + 1] = Math.random() * 0.5 - Math.random() * objectsDistance * sectionMeshes.length
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10
}
const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
// Material
const particlesMaterial = new THREE.PointsMaterial({
    color:parameters.materialColor,
    sizeAttenuation: true,
    size: 0.03
})
// points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)
/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
directionalLight.position.set(1,1,0);
scene.add(directionalLight);
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
/**
 * Scroll
 */
let scrollY = window.scrollY
let currentSection = 0

window.addEventListener('scroll', ()=>{
    scrollY = window.scrollY
    const newSection = Math.round(scrollY / sizes.height)
    if(newSection != currentSection){
        currentSection = newSection

        gsap.to(
            sectionMeshes[currentSection].rotation,{
                duration: 1.5,
                ease: 'power2.inOut',
                x: '+=6',
                y: '+=3',
                z: '+=1.5'
            }

        )
    }
    
})
/**
 * Cursor
 */
const cursor = {}
cursor.x = 0
cursor.y = 0
// user mouse movement
window.addEventListener('mousemove', (event) => {
    cursor.x=event.clientX / sizes.width - 0.5 // make value as small as possible
    cursor.y=event.clientY / sizes.height - 0.5

    
})
/**
 * Animate
 */
const clock = new THREE.Clock()
// calculate delta time meaning time between now and each frame
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime // current time - time before
    // update time for the next frame
    previousTime = elapsedTime
    //Animate camera
    // Objects assign to each section of the page
    camera.position.y = - scrollY / sizes.height * objectsDistance
    // cursor movement with objects
    const parallaxX = cursor.x
    const parallaxY = - cursor.y // invalid cursor movement with opposite
    // move group objects with the scroll since the camera moves inside the group
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime
    // Animate meshes
    for(const mesh of sectionMeshes){
        // rotation related to time
        mesh.rotation.x += deltaTime * 0.1
        mesh.rotation.y += deltaTime * 0.12
        mesh3.rotation.x = elapsedTime * - 0.12
        mesh3.rotation.y = elapsedTime * - 0.12

    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()