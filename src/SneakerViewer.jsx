import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default function SneakerViewer() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const w = mount.clientWidth
    const h = mount.clientHeight

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(42, w / h, 0.01, 100)
    camera.position.set(0, 0.1, 2.6)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.5
    mount.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight(0xffffff, 2.5)
    scene.add(ambient)

    const key = new THREE.DirectionalLight(0xffffff, 3.5)
    key.position.set(4, 6, 4)
    scene.add(key)

    const fill = new THREE.DirectionalLight(0xaabbff, 1.2)
    fill.position.set(-4, 2, -3)
    scene.add(fill)

    const rim = new THREE.DirectionalLight(0xff2222, 0.9)
    rim.position.set(0, -4, -4)
    scene.add(rim)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableZoom = false
    controls.enablePan = false
    controls.autoRotate = true
    controls.autoRotateSpeed = 2.2
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.minPolarAngle = Math.PI / 4
    controls.maxPolarAngle = Math.PI / 1.6

    const loader = new GLTFLoader()
    loader.load(
      '/models/sneaker.glb',
      (gltf) => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 1.9 / maxDim
        model.scale.setScalar(scale)
        model.position.sub(center.multiplyScalar(scale))
        scene.add(model)
      },
      undefined,
      (err) => console.error('GLB load error:', err)
    )

    let rafId
    const animate = () => {
      rafId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const ro = new ResizeObserver(() => {
      const rw = mount.clientWidth
      const rh = mount.clientHeight
      camera.aspect = rw / rh
      camera.updateProjectionMatrix()
      renderer.setSize(rw, rh)
    })
    ro.observe(mount)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      controls.dispose()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="sneaker-viewer" />
}
