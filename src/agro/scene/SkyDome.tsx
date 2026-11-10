// Cielo de Agro: domo con degradado (zenit azul → horizonte con la bruma del territorio) y resplandor del sol. Solo imagen.
// Sustituye al `Sky` físico, que en las capturas salía blanco. El horizonte usa el mismo color que la niebla para que el paisaje lejano se funda con él.
import {useMemo, useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {BackSide, Color, Mesh, ShaderMaterial, Vector3} from 'three';

const vertex = 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const fragment = `
uniform vec3 zenith; uniform vec3 mid; uniform vec3 horizon; uniform vec3 sunDir; uniform vec3 sunColor; varying vec3 vDir;
void main(){
  vec3 d = normalize(vDir); float h = max(d.y, 0.0);
  vec3 c = mix(horizon, mid, smoothstep(0.0, 0.22, h));
  c = mix(c, zenith, smoothstep(0.18, 0.85, h));
  float s = max(dot(d, normalize(sunDir)), 0.0);
  c += sunColor * (pow(s, 900.0) * 1.4 + pow(s, 12.0) * 0.20);
  gl_FragColor = vec4(c, 1.0);
}`;

export function SkyDome({haze, dust, sun}: {haze: string; dust: boolean; sun: Vector3}) {
  const mesh = useRef<Mesh>(null);
  const material = useMemo(() => new ShaderMaterial({
    side: BackSide, depthWrite: false, fog: false, vertexShader: vertex, fragmentShader: fragment,
    uniforms: {
      zenith: {value: new Color(dust ? '#5a93cf' : '#5690cc')}, mid: {value: new Color(dust ? '#a9c9e2' : '#9cc6ec')}, horizon: {value: new Color(haze)},
      sunDir: {value: sun.clone()}, sunColor: {value: new Color(dust ? '#ffd9a8' : '#fff0cf')},
    },
  }), [haze, dust, sun]);
  // El domo acompaña a la cámara: nunca se alcanza su borde.
  useFrame(({camera}) => { mesh.current?.position.copy(camera.position); });
  return <mesh ref={mesh} name="cielo" material={material} renderOrder={-10} frustumCulled={false} raycast={() => null}><sphereGeometry args={[9000, 32, 20]} /></mesh>;
}
