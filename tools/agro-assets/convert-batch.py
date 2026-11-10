# Conversión por lotes en una sola sesión de Blender. Entrada: JSON [{src, dst, anim}]. Solo lee del kit; escribe en copias.
import bpy, sys, os, json
jobs = json.load(open(sys.argv[sys.argv.index('--') + 1]))
ok = fail = 0
for j in jobs:
    try:
        bpy.ops.wm.open_mainfile(filepath=j['src'])
        for o in list(bpy.data.objects):
            if o.type in ('CAMERA', 'LIGHT'): bpy.data.objects.remove(o, do_unlink=True)
        if j.get('decimate'):  # simplificación por colapso de aristas; el exportador aplica el modificador
            for o in bpy.data.objects:
                if o.type == 'MESH':
                    m = o.modifiers.new('simplificar', 'DECIMATE'); m.ratio = j['decimate']; m.use_collapse_triangulate = True
        os.makedirs(os.path.dirname(j['dst']), exist_ok=True)
        bpy.ops.export_scene.gltf(filepath=j['dst'], export_format='GLB', export_apply=True, export_yup=True, export_animations=bool(j.get('anim')),
            export_image_format='AUTO', export_materials='EXPORT', export_cameras=False, export_lights=False, export_extras=False)
        ok += 1
    except Exception as e:
        fail += 1; print('FALLO', j['src'], e)
print('RESUMEN ok=%d fallos=%d' % (ok, fail))
