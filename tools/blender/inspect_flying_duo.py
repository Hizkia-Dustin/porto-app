import bpy

bpy.context.scene.frame_set(50)
for name in (
    "Male.Head", "Male.Blouse", "Male.UpperArm.L", "Male.Forearm.L", "Male.Hand.L",
    "Male.Thigh.L", "Male.Shin.L", "Male.Foot.L", "Male.Cape.1", "Male.Hologram.R.Panel",
    "Female.Head", "Female.Blouse", "Female.UpperArm.R", "Female.Thigh.R", "Female.Skirt",
):
    obj = bpy.data.objects.get(name)
    if obj:
        print(name, "loc", tuple(round(v, 3) for v in obj.matrix_world.translation),
              "dim", tuple(round(v, 3) for v in obj.dimensions), "parent", obj.parent_bone)

for rig_name in ("Male.Rig", "Female.Rig"):
    rig = bpy.data.objects.get(rig_name)
    action = rig.animation_data.action if rig and rig.animation_data else None
    print(rig_name, "bones", len(rig.data.bones), "action", action.name if action else None,
          "frame_range", tuple(action.frame_range) if action else None)
