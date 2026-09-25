import bpy, math, sys, os
argv=sys.argv
output_path=argv[argv.index("--")+1]
os.makedirs(os.path.dirname(output_path),exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)

def mat(name,base,metal=.25,rough=.28,emission=None,strength=0):
 m=bpy.data.materials.new(name);m.use_nodes=True
 b=m.node_tree.nodes.get("Principled BSDF")
 b.inputs["Base Color"].default_value=(*base,1);b.inputs["Metallic"].default_value=metal;b.inputs["Roughness"].default_value=rough
 if emission:
  if "Emission Color" in b.inputs:b.inputs["Emission Color"].default_value=(*emission,1);b.inputs["Emission Strength"].default_value=strength
  elif "Emission" in b.inputs:b.inputs["Emission"].default_value=(*emission,1);b.inputs["Emission Strength"].default_value=strength
 return m
white=mat("M_White",(0.8,.84,.88),.45,.22); red=mat("M_Crimson",(.55,.015,.025),.35,.24)
cyan=mat("M_Cockpit",(0,.35,.55),.15,.16,(0,.65,1),2.5); glow=mat("M_Engine",(0,.25,.5),.25,.2,(0,.8,1),4)

# Fuselaje orientado X
bpy.ops.mesh.primitive_cone_add(vertices=12,radius1=.6,radius2=.05,depth=3,location=(0,0,0),rotation=(0,math.radians(90),0))
body=bpy.context.object;body.name="Fuselage";body.data.materials.append(white)
sub=body.modifiers.new("Subsurf","SUBSURF");sub.levels=1;sub.render_levels=1
# Cabina
bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,radius=.35,location=(.55,0,.18))
cockpit=bpy.context.object;cockpit.name="Cockpit";cockpit.scale=(1.35,.72,.52);cockpit.data.materials.append(cyan)
# alas sólidas: cubos finos en vez de planos sin espesor
parts=[body,cockpit]
for y,sgn in [(.62,1),(-.62,-1)]:
 bpy.ops.mesh.primitive_cube_add(size=1,location=(-.25,y,-.08));w=bpy.context.object;w.name="Wing_L" if sgn==1 else "Wing_R";w.scale=(.9,.65,.055);w.rotation_euler[2]=math.radians(-10*sgn);w.data.materials.append(red);parts.append(w)
# motores
for y,name in [(.36,"Engine_L"),(-.36,"Engine_R")]:
 bpy.ops.mesh.primitive_cylinder_add(vertices=12,radius=.19,depth=.72,location=(-1.18,y,-.12),rotation=(0,math.radians(90),0))
 e=bpy.context.object;e.name=name;e.data.materials.append(glow);parts.append(e)
# aplicar escalas/modificadores individualmente, conservar materiales y objetos separados en GLB
for o in parts:
 bpy.context.view_layer.objects.active=o;o.select_set(True)
 if o==body:bpy.ops.object.modifier_apply(modifier="Subsurf")
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.select_set(False)
# raíz vacía para jerarquía
root=bpy.data.objects.new("A1_Cometa",None);bpy.context.collection.objects.link(root)
for o in parts:o.parent=root
bpy.ops.export_scene.gltf(filepath=output_path,export_format="GLB",export_apply=True,export_materials="EXPORT")
tris=sum(len(o.data.polygons) for o in parts if hasattr(o.data,"polygons"))
print(f"A1 Cometa generada: {output_path}; caras={tris}")
