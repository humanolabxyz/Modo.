# Conversión .blend/.fbx -> .glb con Blender (headless). Trabaja SIEMPRE sobre una copia de salida; nunca escribe en el kit.
# Uso: blender -b -P convert.py -- <entrada> <salida.glb> [--anim]
import bpy, sys, os
a = sys.argv[sys.argv.index('--') + 1:]
src, dst, anim = a[0], a[1], '--anim' in a
if src.lower().endswith('.blend'):
    bpy.ops.wm.open_mainfile(filepath=src)
else:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=src)
for o in list(bpy.data.objects):
    if o.type in ('CAMERA', 'LIGHT'): bpy.data.objects.remove(o, do_unlink=True)
os.makedirs(os.path.dirname(dst), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=dst, export_format='GLB', export_apply=True, export_yup=True, export_animations=anim,
    export_image_format='AUTO', export_materials='EXPORT', export_cameras=False, export_lights=False, export_extras=False)
print('OK', dst, os.path.getsize(dst))
