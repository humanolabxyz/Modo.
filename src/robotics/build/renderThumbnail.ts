import {AmbientLight, Box3, Color, DirectionalLight, OrthographicCamera, Scene, SRGBColorSpace, Vector3, WebGLRenderTarget, type Object3D, type WebGLRenderer} from 'three';

/** QA/export utility: renders the actual component meshes with the existing renderer. */
export function renderThumbnail(renderer: WebGLRenderer, source: Object3D): string {
  const width = 320, height = 240, object = source.clone(true), scene = new Scene();
  object.position.set(0, 0, 0); object.quaternion.identity(); object.updateMatrixWorld(true);
  scene.add(object, new AmbientLight('#ffffff', 2.2));
  const key = new DirectionalLight('#ffffff', 3.6); key.position.set(-1, 2, 3); scene.add(key);
  const fill = new DirectionalLight('#d7e8ff', 1.3); fill.position.set(2, 1, -2); scene.add(fill);
  const box = new Box3().setFromObject(object), center = box.getCenter(new Vector3()), size = box.getSize(new Vector3());
  const radius = Math.max(size.length(), 0.02), camera = new OrthographicCamera(-1, 1, 1, -1, 0.001, radius * 15);
  camera.position.copy(center).add(new Vector3(1.1, 1.4, 1.8).multiplyScalar(radius)); camera.lookAt(center); camera.updateMatrixWorld();
  const projected = new Box3();
  for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) projected.expandByPoint(new Vector3(x, y, z).applyMatrix4(camera.matrixWorldInverse));
  const halfH = Math.max((projected.max.y - projected.min.y) / 2, (projected.max.x - projected.min.x) / 2 * height / width) * 1.16;
  camera.top = halfH; camera.bottom = -halfH; camera.right = halfH * width / height; camera.left = -camera.right; camera.updateProjectionMatrix();
  const target = new WebGLRenderTarget(width, height); target.texture.colorSpace = SRGBColorSpace; target.samples = 4;
  const previous = renderer.getRenderTarget(), clear = renderer.getClearColor(new Color()), alpha = renderer.getClearAlpha();
  try {
    renderer.setRenderTarget(target); renderer.setClearColor('#ffffff', 0); renderer.clear(); renderer.render(scene, camera);
    const pixels = new Uint8Array(width * height * 4); renderer.readRenderTargetPixels(target, 0, 0, width, height, pixels);
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d')!, data = ctx.createImageData(width, height);
    for (let y = 0; y < height; y++) data.data.set(pixels.subarray((height - y - 1) * width * 4, (height - y) * width * 4), y * width * 4);
    ctx.putImageData(data, 0, 0); return canvas.toDataURL('image/webp', 0.93);
  } finally {
    renderer.setRenderTarget(previous); renderer.setClearColor(clear, alpha); target.dispose();
  }
}
