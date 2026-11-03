"""Import the manufacturer's pinned E6 URDF and STL geometry, retaining MIT notices.
Visual meshes use a 0.6 mm vertex grid; kinematic/inertial data is not rounded.
No runtime download or ROS installation is needed by PanelLab.
"""
import hashlib
import json
import math
from pathlib import Path
import struct
import urllib.request
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
REV = 'ec201c40d5db63185a3593ec9c39f80fe25aa527'
URL = f'https://raw.githubusercontent.com/Dobot-Arm/DOBOT_6Axis_ROS2_V4/{REV}/'
SOURCES = ROOT / 'docs/robotica/fuentes/dobot-e6'
PUBLIC = ROOT / 'public/robotics/e6'
PUBLIC.mkdir(parents=True, exist_ok=True)
SOURCES.mkdir(parents=True, exist_ok=True)
def fetch(path):
    return urllib.request.urlopen(URL + path, timeout=60).read()
for path in ['dobot_rviz/urdf/me6_robot.urdf', 'me6_moveit/config/me6_robot.srdf', 'LICENSE']:
    data = fetch(path)
    (SOURCES / Path(path).name).write_bytes(data)
(PUBLIC / 'LICENSE.txt').write_bytes((SOURCES / 'LICENSE').read_bytes())
robot = ET.parse(SOURCES / 'me6_robot.urdf').getroot()
vec = lambda s: list(map(float, s.split()))
links, meshes = [], []
for link in robot.findall('link'):
    visual = link.find('visual')
    if visual is None:
        continue
    name = link.attrib['name']
    file = Path(visual.find('geometry/mesh').attrib['filename']).name
    data = fetch('dobot_rviz/meshes/me6/' + file)
    count = struct.unpack_from('<I', data, 80)[0]
    triangles, cells, samples = [], {}, []
    low, high = [math.inf]*3, [-math.inf]*3
    for i in range(count):
        points = struct.unpack_from('<9f', data, 84 + 50*i + 12)
        tri = []
        for n in range(3):
            v = points[n*3:n*3+3]
            for axis in range(3):
                low[axis] = min(low[axis], v[axis]); high[axis] = max(high[axis], v[axis])
            key = tuple(round(x/.0006) for x in v)
            if key not in cells:
                cells[key] = len(samples); samples.append([*v, 1])
            else:
                acc = samples[cells[key]]
                for axis in range(3): acc[axis] += v[axis]
                acc[3] += 1
            tri.append(cells[key])
        triangles.append(tri)
    vertices = [[v[a]/v[3] for a in range(3)] for v in samples]
    faces, seen = [], set()
    for tri in triangles:
        key = tuple(sorted(tri))
        if len(set(tri)) < 3 or key in seen: continue
        seen.add(key); faces.append(tri)
    output = bytearray(b'PanelLab E6: Dobot MIT; visual vertex clustering 0.6mm'.ljust(80,b' '))
    output += struct.pack('<I',len(faces))
    for tri in faces:
        a,b,c = [vertices[i] for i in tri]
        u,v = [[p[i]-a[i] for i in range(3)] for p in [b,c]]
        norm = [u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
        length = math.sqrt(sum(x*x for x in norm)) or 1
        output += struct.pack('<12fH',*(x/length for x in norm),*a,*b,*c,0)
    (PUBLIC / file).write_bytes(output)
    inertia = link.find('inertial')
    links.append({'name':name, 'mass':float(inertia.find('mass').attrib['value']), 'com':vec(inertia.find('origin').attrib['xyz']),
                  'inertia':{k:float(v) for k,v in inertia.find('inertia').attrib.items()},
                  'center':[(low[i]+high[i])/2 for i in range(3)], 'half':[(high[i]-low[i])/2 for i in range(3)]})
    meshes.append({'file':file,'url':URL+'dobot_rviz/meshes/me6/'+file,'sourceSha256':hashlib.sha256(data).hexdigest(),'sourceTriangles':count,'visualTriangles':len(faces),'bytes':len(output)})
    print(file,count,'->',len(faces),'triangles')
joints=[]
for j in robot.findall('joint'):
    if j.attrib['type'] != 'revolute': continue
    limit=j.find('limit').attrib
    joints.append({'origin':vec(j.find('origin').attrib['xyz']),'rpy':vec(j.find('origin').attrib['rpy']), 'axis':vec(j.find('axis').attrib['xyz']),
                   'lower':float(limit['lower']),'upper':float(limit['upper']),'velocity':float(limit['velocity']),'effort':float(limit['effort'])})
srdf=ET.parse(SOURCES/'me6_robot.srdf').getroot()
ignored=[[x.attrib['link1'],x.attrib['link2']] for x in srdf.findall('disable_collisions')]
home=[float(x.attrib['value'])*180/math.pi for x in srdf.find('group_state').findall('joint')]
text='// Generated from Dobot official ROS2 E6 model, MIT. See docs/robotica/fuentes/dobot-e6.\n'
for name,value in [('E6_LINKS',links),('E6_JOINTS',joints),('E6_IGNORED_COLLISIONS',ignored),('E6_HOME',home)]:
    text+=f'export const {name} = '+json.dumps(value,separators=(',',':'))+';\n'
(ROOT/'src/robotics/arm/e6Data.ts').write_text(text,encoding='utf-8')
(SOURCES/'manifest.json').write_text(json.dumps({'repository':'https://github.com/Dobot-Arm/DOBOT_6Axis_ROS2_V4','revision':REV,'license':'MIT','visualGridMetres':.0006,'meshes':meshes},indent=2),encoding='utf-8')
