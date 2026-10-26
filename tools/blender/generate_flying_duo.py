from pathlib import Path
import math

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "assets" / "3d"
OUT.mkdir(parents=True, exist_ok=True)


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.armatures,
                       bpy.data.cameras, bpy.data.lights, bpy.data.materials):
        for block in list(datablocks):
            if block.users == 0:
                datablocks.remove(block)


def move_to_collection(obj, collection):
    for current in list(obj.users_collection):
        current.objects.unlink(obj)
    collection.objects.link(obj)


def material(name, color, metallic=0.0, roughness=0.5, emission=None, alpha=1.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = next(node for node in mat.node_tree.nodes if node.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if emission:
        socket = bsdf.inputs.get("Emission Color") or bsdf.inputs.get("Emission")
        if socket:
            socket.default_value = (*emission[0], 1.0)
        strength = bsdf.inputs.get("Emission Strength")
        if strength:
            strength.default_value = emission[1]
    if alpha < 1.0:
        bsdf.inputs["Alpha"].default_value = alpha
        mat.diffuse_color = (*color, alpha)
        try:
            mat.surface_render_method = "DITHERED"
        except Exception:
            pass
    return mat


def assign(obj, mat):
    if hasattr(obj.data, "materials"):
        obj.data.materials.append(mat)


def smooth(obj):
    if obj.type == "MESH":
        for poly in obj.data.polygons:
            poly.use_smooth = True


def bevel(obj, amount=0.035, segments=3):
    if obj.type == "MESH":
        mod = obj.modifiers.new("Soft edges", "BEVEL")
        mod.width = amount
        mod.segments = segments


def apply_scale(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.select_set(False)


def ellipsoid(name, location, scale, mat, collection, segments=28, rings=18):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    apply_scale(obj)
    move_to_collection(obj, collection)
    assign(obj, mat)
    smooth(obj)
    return obj


def cone(name, location, radius1, radius2, depth, mat, collection, vertices=32):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radius1, radius2=radius2,
                                    depth=depth, location=location)
    obj = bpy.context.object
    obj.name = name
    move_to_collection(obj, collection)
    assign(obj, mat)
    smooth(obj)
    bevel(obj, min(radius1, max(radius2, 0.04)) * 0.12, 2)
    return obj


def limb(name, start, end, r1, r2, mat, collection):
    start, end = Vector(start), Vector(end)
    direction = end - start
    obj = cone(name, (start + end) * 0.5, r1, r2, direction.length, mat, collection, 24)
    obj.rotation_euler = direction.to_track_quat("Z", "Y").to_euler()
    return obj


def cube(name, location, scale, mat, collection, bevel_width=0.03):
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    apply_scale(obj)
    move_to_collection(obj, collection)
    assign(obj, mat)
    bevel(obj, bevel_width, 3)
    return obj


def curve_line(name, points, radius, mat, collection, cyclic=False):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 2
    curve.bevel_depth = radius
    curve.bevel_resolution = 3
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(len(points) - 1)
    for bp, co in zip(spline.bezier_points, points):
        bp.co = co
        bp.handle_left_type = "AUTO"
        bp.handle_right_type = "AUTO"
    spline.use_cyclic_u = cyclic
    obj = bpy.data.objects.new(name, curve)
    collection.objects.link(obj)
    assign(obj, mat)
    return obj


def parent_keep_world(child, parent):
    world = child.matrix_world.copy()
    child.parent = parent
    child.matrix_world = world


def ribbon(name, points, widths, mat, collection, gold=None):
    verts = []
    for p, width in zip(points, widths):
        p = Vector(p)
        verts += [tuple(p + Vector((0, 0, width * 0.5))),
                  tuple(p - Vector((0, 0, width * 0.5)))]
    faces = [(i * 2, i * 2 + 1, i * 2 + 3, i * 2 + 2) for i in range(len(points) - 1)]
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    assign(obj, mat)
    smooth(obj)
    solid = obj.modifiers.new("Fabric thickness", "SOLIDIFY")
    solid.thickness = 0.018
    bevel(obj, 0.025, 2)
    if gold:
        upper = [(p[0], p[1] - 0.012, p[2] + w * 0.5) for p, w in zip(points, widths)]
        lower = [(p[0], p[1] - 0.012, p[2] - w * 0.5) for p, w in zip(points, widths)]
        trim_top = curve_line(name + ".TrimTop", upper, 0.015, gold, collection)
        trim_bottom = curve_line(name + ".TrimBottom", lower, 0.012, gold, collection)
        parent_keep_world(trim_top, obj)
        parent_keep_world(trim_bottom, obj)
    return obj


def parent_to_bone(obj, rig, bone_name):
    world = obj.matrix_world.copy()
    obj.parent = rig
    obj.parent_type = "BONE"
    obj.parent_bone = bone_name
    obj.matrix_world = world


def create_rig(name, collection, root):
    arm_data = bpy.data.armatures.new(name + ".Armature")
    rig = bpy.data.objects.new(name + ".Rig", arm_data)
    collection.objects.link(rig)
    rig.parent = root
    rig.show_in_front = True
    bpy.context.view_layer.objects.active = rig
    rig.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    specs = {
        "root": ((0, 0, 0.75), (0, 0, 1.05), None),
        "pelvis": ((0, 0, 0.95), (0, 0, 1.28), "root"),
        "spine": ((0, 0, 1.28), (0, 0, 1.72), "pelvis"),
        "chest": ((0, 0, 1.72), (0, 0, 2.12), "spine"),
        "neck": ((0, 0, 2.12), (0, 0, 2.32), "chest"),
        "head": ((0, 0, 2.32), (0, 0, 2.80), "neck"),
        "upper_arm.L": ((-0.34, 0, 2.02), (-0.96, 0, 1.90), "chest"),
        "forearm.L": ((-0.96, 0, 1.90), (-1.52, 0, 1.76), "upper_arm.L"),
        "hand.L": ((-1.52, 0, 1.76), (-1.76, 0, 1.70), "forearm.L"),
        "upper_arm.R": ((0.34, 0, 2.02), (0.96, 0, 1.90), "chest"),
        "forearm.R": ((0.96, 0, 1.90), (1.52, 0, 1.76), "upper_arm.R"),
        "hand.R": ((1.52, 0, 1.76), (1.76, 0, 1.70), "forearm.R"),
        "thigh.L": ((-0.20, 0, 1.04), (-0.24, 0, 0.30), "pelvis"),
        "shin.L": ((-0.24, 0, 0.30), (-0.25, 0, -0.42), "thigh.L"),
        "foot.L": ((-0.25, 0, -0.42), (-0.25, -0.35, -0.50), "shin.L"),
        "thigh.R": ((0.20, 0, 1.04), (0.24, 0, 0.30), "pelvis"),
        "shin.R": ((0.24, 0, 0.30), (0.25, 0, -0.42), "thigh.R"),
        "foot.R": ((0.25, 0, -0.42), (0.25, -0.35, -0.50), "shin.R"),
        "cape.01": ((0, 0.10, 1.96), (-0.70, 0.18, 1.92), "chest"),
        "cape.02": ((-0.70, 0.18, 1.92), (-1.45, 0.22, 1.86), "cape.01"),
        "cape.03": ((-1.45, 0.22, 1.86), (-2.25, 0.28, 1.78), "cape.02"),
        "cloth.01": ((0, 0.08, 1.28), (-0.55, 0.15, 1.10), "pelvis"),
        "cloth.02": ((-0.55, 0.15, 1.10), (-1.12, 0.20, 0.90), "cloth.01"),
        "cloth.03": ((-1.12, 0.20, 0.90), (-1.75, 0.26, 0.68), "cloth.02"),
    }
    created = {}
    for bone_name, (head, tail, parent_name) in specs.items():
        bone = arm_data.edit_bones.new(bone_name)
        bone.head, bone.tail = head, tail
        if parent_name:
            bone.parent = created[parent_name]
        created[bone_name] = bone
    bpy.ops.object.mode_set(mode="POSE")
    for pb in rig.pose.bones:
        pb.rotation_mode = "XYZ"
    bpy.ops.object.mode_set(mode="OBJECT")
    rig.select_set(False)
    return rig


def add_face(name, rig, collection, mats, feminine=False):
    head = ellipsoid(name + ".Head", (0, -0.01, 2.58),
                     (0.275 if feminine else 0.285, 0.24, 0.35), mats["skin"], collection)
    parent_to_bone(head, rig, "head")
    chin = ellipsoid(name + ".Chin", (0, -0.07, 2.39), (0.19, 0.17, 0.16), mats["skin"], collection)
    parent_to_bone(chin, rig, "head")
    for side in (-1, 1):
        eye = ellipsoid(name + (".Eye.L" if side < 0 else ".Eye.R"),
                        (side * 0.092, -0.235, 2.62), (0.057, 0.025, 0.034), mats["eye"], collection, 20, 12)
        parent_to_bone(eye, rig, "head")
        iris = ellipsoid(name + ".Iris", (side * 0.092, -0.258, 2.62), (0.021, 0.008, 0.022), mats["iris"], collection, 16, 10)
        parent_to_bone(iris, rig, "head")
        brow = curve_line(name + ".Brow", [(side * 0.17, -0.294, 2.72), (side * 0.10, -0.302, 2.75), (side * 0.03, -0.292, 2.72)], 0.012, mats["hair"], collection)
        parent_to_bone(brow, rig, "head")
    nose = cone(name + ".Nose", (0, -0.292, 2.54), 0.028, 0.008, 0.12, mats["skin"], collection, 16)
    nose.rotation_euler.x = math.radians(90)
    parent_to_bone(nose, rig, "head")
    lips = curve_line(name + ".Lips", [(-0.075, -0.305, 2.45), (0, -0.318, 2.43), (0.075, -0.305, 2.45)], 0.012, mats["lips"], collection)
    parent_to_bone(lips, rig, "head")
    scalp = ellipsoid(name + ".HairScalp", (0, 0.10, 2.75), (0.30, 0.19, 0.24), mats["hair"], collection)
    parent_to_bone(scalp, rig, "head")
    locks = [
        [(-0.26, -0.08, 2.86), (-0.18, -0.24, 2.78), (-0.26, -0.22, 2.60)],
        [(-0.10, -0.12, 2.94), (-0.02, -0.27, 2.84), (-0.10, -0.28, 2.68)],
        [(0.08, -0.10, 2.94), (0.18, -0.26, 2.84), (0.24, -0.20, 2.67)],
        [(0.26, -0.02, 2.84), (0.32, -0.12, 2.70), (0.29, -0.08, 2.52)],
    ]
    for i, pts in enumerate(locks):
        lock = curve_line(f"{name}.HairLock.{i:02d}", pts, 0.065 if feminine else 0.055, mats["hair"], collection)
        parent_to_bone(lock, rig, "head")
    if feminine:
        bun = ellipsoid(name + ".HairBun", (-0.20, 0.18, 2.75), (0.20, 0.19, 0.23), mats["hair"], collection)
        parent_to_bone(bun, rig, "head")
        for angle in range(0, 360, 72):
            a = math.radians(angle)
            petal = ellipsoid(name + ".Flower", (-0.29 + math.cos(a) * 0.06, -0.14, 2.78 + math.sin(a) * 0.06), (0.045, 0.015, 0.025), mats["ivory"], collection, 16, 8)
            parent_to_bone(petal, rig, "head")


def add_hologram(name, hand, rig, collection, mats, position, rotation=(math.radians(70), 0, 0)):
    panel = cube(name + ".Panel", position, (0.43, 0.018, 0.27), mats["holo"], collection, 0.025)
    panel.rotation_euler = rotation
    parent_to_bone(panel, rig, hand)
    frame_points = [(-0.40, -0.04, -0.24), (0.40, -0.04, -0.24), (0.40, -0.04, 0.24), (-0.40, -0.04, 0.24)]
    frame = curve_line(name + ".Frame", [Vector(position) + Vector(p) for p in frame_points], 0.015, mats["holo_bright"], collection, True)
    frame.rotation_euler = rotation
    parent_to_bone(frame, rig, hand)
    for i, z in enumerate((-0.12, 0.0, 0.12)):
        line = cube(name + f".UI.{i}", (position[0], position[1] - 0.05, position[2] + z), (0.24 - i * 0.04, 0.008, 0.012), mats["holo_bright"], collection, 0.006)
        line.rotation_euler = rotation
        parent_to_bone(line, rig, hand)
    return panel


def add_body(name, rig, collection, mats, feminine=False):
    neck = limb(name + ".Neck", (0, 0, 2.10), (0, 0, 2.34), 0.12, 0.13, mats["skin"], collection)
    parent_to_bone(neck, rig, "neck")
    blouse = cone(name + ".Blouse", (0, 0, 1.66), 0.36 if feminine else 0.39, 0.48 if feminine else 0.50, 0.83, mats["ivory"], collection)
    parent_to_bone(blouse, rig, "spine")
    bodice = cone(name + ".Bodice", (0, -0.055, 1.72), 0.30, 0.41, 0.66, mats["navy"], collection)
    bodice.scale.y = 0.62
    apply_scale(bodice)
    parent_to_bone(bodice, rig, "spine")
    left_lapel = curve_line(name + ".Lapel.L", [(-0.28, -0.31, 1.98), (-0.10, -0.36, 1.78), (0, -0.37, 1.55)], 0.018, mats["gold"], collection)
    right_lapel = curve_line(name + ".Lapel.R", [(0.28, -0.31, 1.98), (0.10, -0.36, 1.78), (0, -0.37, 1.55)], 0.018, mats["gold"], collection)
    parent_to_bone(left_lapel, rig, "spine")
    parent_to_bone(right_lapel, rig, "spine")
    brooch = ellipsoid(name + ".Brooch", (0.29, -0.34, 1.98), (0.075, 0.028, 0.075), mats["gold"], collection, 20, 10)
    parent_to_bone(brooch, rig, "chest")
    chain = curve_line(name + ".ChestChain", [(-0.25, -0.345, 1.87), (0, -0.39, 1.74), (0.25, -0.345, 1.87)], 0.010, mats["gold"], collection)
    parent_to_bone(chain, rig, "spine")
    for i, z in enumerate((1.73, 1.58, 1.43)):
        button = ellipsoid(name + f".Button.{i}", (0, -0.37, z), (0.028, 0.016, 0.028), mats["gold"], collection, 16, 8)
        parent_to_bone(button, rig, "spine")
    belt = bpy.ops.mesh.primitive_torus_add(major_radius=0.31, minor_radius=0.035, major_segments=32, minor_segments=8, location=(0, 0, 1.29))
    belt_obj = bpy.context.object
    belt_obj.name = name + ".GoldBelt"
    belt_obj.scale.y = 0.75
    apply_scale(belt_obj)
    move_to_collection(belt_obj, collection)
    assign(belt_obj, mats["gold"])
    parent_to_bone(belt_obj, rig, "pelvis")
    for side, label in ((-1, "L"), (1, "R")):
        shoulder = (side * 0.34, 0, 2.02)
        elbow = (side * 0.96, 0, 1.90)
        wrist = (side * 1.52, 0, 1.76)
        hand_end = (side * 1.76, -0.02, 1.70)
        upper = limb(name + ".UpperArm." + label, shoulder, elbow, 0.145, 0.115, mats["skin"], collection)
        lower = limb(name + ".Forearm." + label, elbow, wrist, 0.115, 0.075, mats["skin"], collection)
        hand = ellipsoid(name + ".Hand." + label, hand_end, (0.15, 0.075, 0.07), mats["skin"], collection, 20, 12)
        parent_to_bone(upper, rig, "upper_arm." + label)
        parent_to_bone(lower, rig, "forearm." + label)
        parent_to_bone(hand, rig, "hand." + label)
        puff = ellipsoid(name + ".PuffSleeve." + label, (side * 0.63, 0, 1.96), (0.28, 0.21, 0.25), mats["ivory"], collection)
        parent_to_bone(puff, rig, "upper_arm." + label)
        cuff = cone(name + ".Cuff." + label, (side * 1.40, 0, 1.79), 0.105, 0.075, 0.18, mats["gold"], collection, 20)
        cuff.rotation_euler = (0, math.radians(78 * side), 0)
        parent_to_bone(cuff, rig, "forearm." + label)
        for ring_i, x in enumerate((side * 1.28, side * 1.34)):
            ruffle = ellipsoid(name + f".Ruffle.{label}.{ring_i}", (x, 0, 1.81), (0.075, 0.13, 0.13), mats["ivory"], collection, 20, 10)
            parent_to_bone(ruffle, rig, "forearm." + label)
    pelvis = ellipsoid(name + ".Pelvis", (0, 0, 1.08), (0.35, 0.25, 0.29), mats["black" if not feminine else "ivory"], collection)
    parent_to_bone(pelvis, rig, "pelvis")
    for side, label in ((-1, "L"), (1, "R")):
        hip = (side * 0.20, 0, 1.04)
        knee = (side * 0.24, 0, 0.30)
        ankle = (side * 0.25, 0, -0.42)
        thigh_mat = mats["skin"] if feminine else mats["black"]
        shin_mat = mats["skin"] if feminine else mats["black"]
        thigh = limb(name + ".Thigh." + label, hip, knee, 0.18, 0.14, thigh_mat, collection)
        shin = limb(name + ".Shin." + label, knee, ankle, 0.14, 0.10, shin_mat, collection)
        boot_mat = mats["ivory"] if feminine else mats["leather"]
        boot = limb(name + ".Boot." + label, (side * 0.25, 0, -0.18), (side * 0.25, 0, -0.55), 0.13, 0.10, boot_mat, collection)
        foot = ellipsoid(name + ".Foot." + label, (side * 0.25, -0.21, -0.50), (0.12, 0.28, 0.12), boot_mat, collection)
        parent_to_bone(thigh, rig, "thigh." + label)
        parent_to_bone(shin, rig, "shin." + label)
        parent_to_bone(boot, rig, "shin." + label)
        parent_to_bone(foot, rig, "foot." + label)
    if feminine:
        skirt = cone(name + ".Skirt", (0, 0.08, 0.72), 0.94, 0.31, 1.52, mats["ivory"], collection, 48)
        skirt.scale.y = 0.55
        apply_scale(skirt)
        parent_to_bone(skirt, rig, "pelvis")
        overskirt = ribbon(name + ".NavyOverskirt", [(0.12, 0.10, 1.22), (-0.35, 0.16, 1.03), (-0.92, 0.25, 0.78), (-1.55, 0.34, 0.62)], [0.34, 0.55, 0.74, 0.88], mats["navy"], collection, mats["gold"])
        parent_to_bone(overskirt, rig, "cloth.01")
    else:
        coat_l = ribbon(name + ".CoatTail.L", [(-0.16, 0.10, 1.30), (-0.65, 0.18, 1.18), (-1.20, 0.25, 1.02), (-1.75, 0.30, 0.88)], [0.26, 0.36, 0.42, 0.38], mats["navy"], collection, mats["gold"])
        coat_r = ribbon(name + ".CoatTail.R", [(0.16, 0.10, 1.30), (-0.50, 0.25, 1.04), (-1.05, 0.32, 0.80), (-1.52, 0.36, 0.64)], [0.25, 0.35, 0.40, 0.34], mats["ivory"], collection, mats["gold"])
        parent_to_bone(coat_l, rig, "cloth.01")
        parent_to_bone(coat_r, rig, "cloth.02")
    cape_shapes = [
        ([(0.04, 0.15, 2.04), (-0.36, 0.21, 2.12), (-0.70, 0.25, 2.18), (-1.06, 0.30, 2.15), (-1.45, 0.35, 2.22), (-1.82, 0.39, 2.10), (-2.18, 0.44, 2.02)], [0.35, 0.46, 0.55, 0.61, 0.66, 0.61, 0.56], "cape.01", mats["navy"]),
        ([(0.02, 0.19, 1.94), (-0.30, 0.25, 1.86), (-0.58, 0.31, 1.72), (-0.94, 0.35, 1.66), (-1.28, 0.39, 1.54), (-1.66, 0.44, 1.56), (-2.08, 0.50, 1.47)], [0.28, 0.36, 0.44, 0.50, 0.54, 0.50, 0.44], "cape.02", mats["ivory"]),
        ([(0.10, 0.22, 1.82), (-0.24, 0.30, 1.67), (-0.50, 0.38, 1.50), (-0.82, 0.42, 1.43), (-1.12, 0.48, 1.30), (-1.48, 0.53, 1.31), (-1.82, 0.58, 1.12)], [0.22, 0.31, 0.38, 0.43, 0.46, 0.41, 0.35], "cape.03", mats["navy"]),
    ]
    for i, (pts, widths, bone, mat) in enumerate(cape_shapes):
        cloth = ribbon(name + f".Cape.{i+1}", pts, widths, mat, collection, mats["gold"])
        parent_to_bone(cloth, rig, bone)


def create_character(name, feminine, mats):
    collection = bpy.data.collections.new(name + ".Collection")
    bpy.context.scene.collection.children.link(collection)
    root = bpy.data.objects.new(name + ".ROOT", None)
    collection.objects.link(root)
    rig = create_rig(name, collection, root)
    add_body(name, rig, collection, mats, feminine)
    add_face(name, rig, collection, mats, feminine)
    if feminine:
        add_hologram(name + ".Hologram.R", "hand.R", rig, collection, mats, (1.82, -0.02, 1.90), (math.radians(74), math.radians(-8), math.radians(-10)))
        add_hologram(name + ".Hologram.L", "hand.L", rig, collection, mats, (-1.78, -0.02, 1.92), (math.radians(70), math.radians(6), math.radians(12)))
    else:
        add_hologram(name + ".Hologram.R", "hand.R", rig, collection, mats, (1.86, -0.02, 1.92), (math.radians(70), math.radians(-8), math.radians(-12)))
    return collection, root, rig


def animate_flight(rig, feminine=False):
    rig.animation_data_create()
    action = bpy.data.actions.new(("Female" if feminine else "Male") + "_FlightScroll")
    rig.animation_data.action = action
    frames = [1, 25, 50, 75, 100]
    poses = [
        {"root": ((0, 0, 0), (0, 0, 0)),
         "upper_arm.L": ((0, 0, math.radians(-8)), None), "upper_arm.R": ((0, 0, math.radians(8)), None),
         "thigh.L": ((math.radians(-8), 0, math.radians(4)), None), "thigh.R": ((math.radians(8), 0, math.radians(-4)), None)},
        {"root": ((0, 0, 0.10), (math.radians(-3), math.radians(2), math.radians(2))),
         "upper_arm.L": ((math.radians(-18), math.radians(-24), math.radians(-14)), None), "forearm.L": ((0, math.radians(-28), math.radians(-18)), None),
         "upper_arm.R": ((math.radians(18), math.radians(22), math.radians(18)), None), "forearm.R": ((0, math.radians(30), math.radians(12)), None),
         "hand.L": ((math.radians(8), math.radians(-12), math.radians(-18)), None), "hand.R": ((math.radians(-8), math.radians(12), math.radians(18)), None),
         "thigh.L": ((math.radians(34), math.radians(-6), math.radians(8)), None), "shin.L": ((math.radians(-48), 0, 0), None),
         "thigh.R": ((math.radians(-20), math.radians(8), math.radians(-10)), None), "shin.R": ((math.radians(28), 0, 0), None)},
        {"root": ((0, -0.04, 0.18), (math.radians(-6), math.radians(-2), math.radians(-3))),
         "upper_arm.L": ((math.radians(-28), math.radians(-34), math.radians(-18)), None), "forearm.L": ((0, math.radians(-38), math.radians(-22)), None),
         "upper_arm.R": ((math.radians(22), math.radians(34), math.radians(22)), None), "forearm.R": ((0, math.radians(42), math.radians(16)), None),
         "hand.L": ((math.radians(12), math.radians(-18), math.radians(-28)), None), "hand.R": ((math.radians(-12), math.radians(20), math.radians(24)), None),
         "thigh.L": ((math.radians(52), math.radians(-8), math.radians(12)), None), "shin.L": ((math.radians(-70), 0, 0), None),
         "thigh.R": ((math.radians(-32), math.radians(12), math.radians(-16)), None), "shin.R": ((math.radians(44), 0, 0), None)},
        {"root": ((0, 0.03, 0.08), (math.radians(2), math.radians(3), math.radians(3))),
         "upper_arm.L": ((math.radians(-16), math.radians(-18), math.radians(-10)), None), "forearm.L": ((0, math.radians(-20), math.radians(-12)), None),
         "upper_arm.R": ((math.radians(12), math.radians(18), math.radians(14)), None), "forearm.R": ((0, math.radians(24), math.radians(10)), None),
         "hand.L": ((math.radians(5), math.radians(-8), math.radians(-12)), None), "hand.R": ((math.radians(-5), math.radians(8), math.radians(12)), None),
         "thigh.L": ((math.radians(22), math.radians(-4), math.radians(6)), None), "shin.L": ((math.radians(-36), 0, 0), None),
         "thigh.R": ((math.radians(-12), math.radians(5), math.radians(-7)), None), "shin.R": ((math.radians(22), 0, 0), None)},
        {"root": ((0, 0, 0), (0, 0, 0)),
         "upper_arm.L": ((0, 0, math.radians(-8)), None), "upper_arm.R": ((0, 0, math.radians(8)), None),
         "thigh.L": ((math.radians(-8), 0, math.radians(4)), None), "thigh.R": ((math.radians(8), 0, math.radians(-4)), None)},
    ]
    cloth_values = [0, 14, -12, 10, 0]
    for frame, pose, flutter in zip(frames, poses, cloth_values):
        bpy.context.scene.frame_set(frame)
        for pb in rig.pose.bones:
            pb.location = (0, 0, 0)
            pb.rotation_euler = (0, 0, 0)
        for bone_name, (rot, loc) in pose.items():
            pb = rig.pose.bones[bone_name]
            if rot:
                pb.rotation_euler = rot
            if loc:
                pb.location = loc
        if feminine:
            rig.pose.bones["upper_arm.L"].rotation_euler.y -= math.radians(8)
            rig.pose.bones["upper_arm.R"].rotation_euler.y += math.radians(10)
        for i, bone_name in enumerate(("cape.01", "cape.02", "cape.03", "cloth.01", "cloth.02", "cloth.03")):
            pb = rig.pose.bones[bone_name]
            pb.rotation_euler.y = math.radians(flutter * (0.55 + i * 0.12) * (-1 if i % 2 else 1))
            pb.rotation_euler.z = math.radians(flutter * 0.25)
        for pb in rig.pose.bones:
            pb.keyframe_insert("location", frame=frame, group=pb.name)
            pb.keyframe_insert("rotation_euler", frame=frame, group=pb.name)
    try:
        for fcurve in action.fcurves:
            for point in fcurve.keyframe_points:
                point.interpolation = "LINEAR"
    except Exception:
        pass


def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def setup_studio():
    studio = bpy.data.collections.new("STUDIO")
    bpy.context.scene.collection.children.link(studio)
    world = bpy.context.scene.world or bpy.data.worlds.new("World")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = next(node for node in world.node_tree.nodes if node.type == "BACKGROUND")
    bg.inputs["Color"].default_value = (0.008, 0.015, 0.028, 1)
    bg.inputs["Strength"].default_value = 0.22
    camera_data = bpy.data.cameras.new("Camera")
    camera = bpy.data.objects.new("Camera", camera_data)
    studio.objects.link(camera)
    camera.location = (0, -14.5, 2.6)
    camera.data.lens = 56
    look_at(camera, (0, 0, 1.35))
    bpy.context.scene.camera = camera
    for name, loc, energy, size, color in (
        ("Key", (-4.5, -5.5, 7.0), 1500, 5.0, (1.0, 0.78, 0.55)),
        ("Fill", (4.0, -3.0, 4.0), 1050, 4.0, (0.45, 0.65, 1.0)),
        ("Rim", (0.0, 3.0, 6.0), 1800, 3.0, (0.35, 0.55, 1.0)),
    ):
        data = bpy.data.lights.new(name, "AREA")
        data.energy = energy
        data.shape = "DISK"
        data.size = size
        data.color = color
        light = bpy.data.objects.new(name, data)
        studio.objects.link(light)
        light.location = loc
        look_at(light, (0, 0, 1.2))
    return studio, camera


def render(path, camera, roots, positions, frame=50, resolution=(1000, 760)):
    for root, position in zip(roots, positions):
        root.location = position
    bpy.context.scene.frame_set(frame)
    visible_positions = [p for p in positions if abs(p[0]) < 10]
    camera.location = (0, -9.2 if len(visible_positions) == 1 else -14.5, 2.6)
    look_at(camera, (sum(p[0] for p in visible_positions) / len(visible_positions), 0, 1.35))
    scene = bpy.context.scene
    scene.render.resolution_x, scene.render.resolution_y = resolution
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = str(path)
    scene.render.film_transparent = False
    bpy.ops.render.render(write_still=True)


def export_collection(collection, root, path):
    stored = root.location.copy()
    root.location = (0, 0, 0)
    bpy.context.scene.frame_set(1)
    bpy.ops.object.select_all(action="DESELECT")
    for obj in collection.all_objects:
        obj.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(path), export_format="GLB", use_selection=True,
                              export_animations=True, export_yup=True)
    root.location = stored


clear_scene()

mats = {
    "skin": material("Skin warm", (0.74, 0.43, 0.29), 0.0, 0.52),
    "hair": material("Hair dark brown", (0.035, 0.018, 0.012), 0.0, 0.32),
    "eye": material("Eye white", (0.82, 0.78, 0.68), 0.0, 0.28),
    "iris": material("Iris amber", (0.12, 0.055, 0.025), 0.0, 0.2),
    "lips": material("Lips", (0.42, 0.09, 0.075), 0.0, 0.45),
    "ivory": material("Ivory silk", (0.78, 0.65, 0.46), 0.0, 0.3),
    "navy": material("Midnight navy fabric", (0.015, 0.035, 0.11), 0.0, 0.26),
    "black": material("Black trousers", (0.012, 0.010, 0.012), 0.0, 0.42),
    "leather": material("Black leather", (0.018, 0.012, 0.010), 0.0, 0.18),
    "gold": material("Antique gold", (0.58, 0.28, 0.045), 0.78, 0.2),
    "holo": material("Hologram glass", (0.04, 0.30, 0.54), 0.05, 0.12, ((0.05, 0.55, 1.0), 4.0), 0.34),
    "holo_bright": material("Hologram light", (0.06, 0.55, 1.0), 0.0, 0.08, ((0.08, 0.75, 1.0), 8.0), 0.72),
}

male_collection, male_root, male_rig = create_character("Male", False, mats)
female_collection, female_root, female_rig = create_character("Female", True, mats)
animate_flight(male_rig, False)
animate_flight(female_rig, True)

scene = bpy.context.scene
scene.frame_start = 1
scene.frame_end = 100
engine_ids = [item.identifier for item in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items]
scene.render.engine = "BLENDER_EEVEE" if "BLENDER_EEVEE" in engine_ids else engine_ids[0]
scene.render.image_settings.color_mode = "RGBA"
setup, camera = setup_studio()

export_collection(male_collection, male_root, OUT / "male-floating-rigged.glb")
export_collection(female_collection, female_root, OUT / "female-floating-rigged.glb")

render(OUT / "male-preview.png", camera, [male_root, female_root], [(0, 0, 0), (40, 0, 0)], 50, (900, 900))
render(OUT / "female-preview.png", camera, [male_root, female_root], [(-40, 0, 0), (0, 0, 0)], 50, (900, 900))
render(OUT / "flying-duo-preview.png", camera, [male_root, female_root], [(-2.15, 0, 0), (2.15, 0, 0)], 50, (1300, 760))

scene.frame_set(50)
male_root.location = (-2.15, 0, 0)
female_root.location = (2.15, 0, 0)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "flying-duo-rigged.blend"))

print("Generated:")
for filename in ("flying-duo-rigged.blend", "male-floating-rigged.glb", "female-floating-rigged.glb",
                 "male-preview.png", "female-preview.png", "flying-duo-preview.png"):
    path = OUT / filename
    print(f"- {path} ({path.stat().st_size} bytes)")
