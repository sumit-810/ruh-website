"""Procedural Blender (Cycles) scenes for the brand's provisional visual assets.

Everything here is original: geometry, materials and lighting are generated in
code. The bottle is a CONCEPT design only - it is not the final manufactured
packaging. Change BOTTLE / PALETTE below to restyle every render consistently.

Usage (with the `bpy` module installed, e.g. `pip install bpy==5.2.3`):

    python scenes.py --list
    python scenes.py hero_wide --samples 160
    python scenes.py all --samples 128 --scale 1.0

Output PNGs are written to ./out/ and post-processed by build_images.py.
"""
import argparse
import math
import sys
from pathlib import Path

import bpy  # must be imported before Blender's other modules
import addon_utils
import bmesh
from mathutils import Vector

HERE = Path(__file__).parent
TEX = HERE / "textures"
OUT = HERE / "out"

# ---------------------------------------------------------------------------
# Art direction
# ---------------------------------------------------------------------------
PALETTE = {
    "limewash": (0.91, 0.84, 0.75),
    "limewash_warm": (0.91, 0.83, 0.75),
    "sand": (0.86, 0.79, 0.70),
    "travertine": (0.80, 0.70, 0.58),
    "clay": (0.36, 0.125, 0.065),      # bottle cap / brand accent
    "clay_soft": (0.78, 0.60, 0.53),
    "champagne": (0.86, 0.74, 0.55),
    "liquid": (0.97, 0.84, 0.70),
    "rose_wall": (0.86, 0.74, 0.69),
    "cocoa": (0.20, 0.14, 0.11),
    "linen": (0.90, 0.86, 0.80),
}

BOTTLE = {
    "radius": 0.022,
    "body_h": 0.096,
    "cap_h": 0.044,
    "cap_color": PALETTE["clay"],
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    addon_utils.enable("cycles", default_set=True)
    s = bpy.context.scene
    s.render.engine = "CYCLES"
    s.cycles.device = "CPU"
    s.cycles.use_denoising = True
    s.cycles.denoiser = "OPENIMAGEDENOISE"
    s.cycles.max_bounces = 12
    s.cycles.transmission_bounces = 12
    s.cycles.transparent_max_bounces = 16
    s.cycles.volume_bounces = 2
    s.cycles.caustics_reflective = False
    s.cycles.caustics_refractive = False
    s.cycles.blur_glossy = 0.5
    s.cycles.use_adaptive_sampling = True
    s.cycles.adaptive_threshold = 0.02
    s.view_settings.view_transform = "AgX"
    s.view_settings.look = "AgX - Medium High Contrast"
    s.render.image_settings.file_format = "PNG"
    s.render.image_settings.color_depth = "16"
    s.render.film_transparent = False
    return s


def node_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    return m, nt, nt.nodes, nt.links


def principled(name, color, rough=0.5, metallic=0.0, transmission=0.0, ior=1.45,
               coat=0.0, sss=0.0, alpha=1.0):
    m, nt, n, l = node_mat(name)
    p = n["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metallic
    p.inputs["Transmission Weight"].default_value = transmission
    p.inputs["IOR"].default_value = ior
    p.inputs["Coat Weight"].default_value = coat
    p.inputs["Subsurface Weight"].default_value = sss
    p.inputs["Alpha"].default_value = alpha
    return m


def textured_surface(name, color, var=0.06, bump=0.25, scale=18.0, rough=0.85, pits=False, veins=False):
    """Limewash / stone: colour variation + soft bump, all procedural."""
    m, nt, n, l = node_mat(name)
    p = n["Principled BSDF"]
    p.inputs["Roughness"].default_value = rough
    coord = n.new("ShaderNodeTexCoord")
    noise = n.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = scale
    noise.inputs["Detail"].default_value = 8
    noise.inputs["Roughness"].default_value = 0.62
    l.new(coord.outputs["Object"], noise.inputs["Vector"])
    ramp = n.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (*[max(0, c - var) for c in color], 1)
    ramp.color_ramp.elements[1].color = (*[min(1, c + var * 0.5) for c in color], 1)
    l.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    col = ramp.outputs["Color"]
    if veins:
        wave = n.new("ShaderNodeTexWave")
        wave.inputs["Scale"].default_value = 3.0
        wave.inputs["Distortion"].default_value = 9.0
        wave.inputs["Detail"].default_value = 4
        l.new(coord.outputs["Object"], wave.inputs["Vector"])
        mix = n.new("ShaderNodeMix")
        mix.data_type = "RGBA"
        mix.blend_type = "MULTIPLY"
        mix.inputs["Factor"].default_value = 0.08
        l.new(col, mix.inputs["A"])
        l.new(wave.outputs["Color"], mix.inputs["B"])
        col = mix.outputs["Result"]
    l.new(col, p.inputs["Base Color"])
    bmp = n.new("ShaderNodeBump")
    bmp.inputs["Strength"].default_value = bump
    bmp.inputs["Distance"].default_value = 0.002
    h = noise.outputs["Fac"]
    if pits:
        vor = n.new("ShaderNodeTexVoronoi")
        vor.inputs["Scale"].default_value = scale * 6
        l.new(coord.outputs["Object"], vor.inputs["Vector"])
        mx = n.new("ShaderNodeMath")
        mx.operation = "MINIMUM"
        l.new(noise.outputs["Fac"], mx.inputs[0])
        l.new(vor.outputs["Distance"], mx.inputs[1])
        h = mx.outputs[0]
    l.new(h, bmp.inputs["Height"])
    l.new(bmp.outputs["Normal"], p.inputs["Normal"])
    return m


def obj_from_bmesh(name, bm, mat=None, smooth=True, subsurf=0):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    if smooth:
        for poly in me.polygons:
            poly.use_smooth = True
    if mat:
        me.materials.append(mat)
    if subsurf:
        mod = ob.modifiers.new("sub", "SUBSURF")
        mod.levels = subsurf
        mod.render_levels = subsurf
    return ob


def lathe(name, profile, segments=96, mat=None, subsurf=1, location=(0, 0, 0)):
    """Revolve a list of (radius, z) points around Z."""
    bm = bmesh.new()
    verts = [bm.verts.new((r, 0, z)) for r, z in profile]
    for a, b in zip(verts, verts[1:]):
        bm.edges.new((a, b))
    bmesh.ops.spin(bm, geom=bm.verts[:] + bm.edges[:], cent=(0, 0, 0), axis=(0, 0, 1),
                   angle=math.tau, steps=segments, use_duplicate=False)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    ob = obj_from_bmesh(name, bm, mat, subsurf=subsurf)
    ob.location = location
    return ob


def box(name, size, location, mat=None, bevel=0.002):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= size[0]
        v.co.y *= size[1]
        v.co.z *= size[2]
    ob = obj_from_bmesh(name, bm, mat, smooth=False)
    ob.location = location
    if bevel:
        mod = ob.modifiers.new("bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 4
        mod.limit_method = "ANGLE"
        ob.modifiers.new("wn", "WEIGHTED_NORMAL")
        for poly in ob.data.polygons:
            poly.use_smooth = True
    return ob


def plane(name, w, h, location, rotation=(0, 0, 0), mat=None):
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=0.5)
    for v in bm.verts:
        v.co.x *= w
        v.co.y *= h
    uv = bm.loops.layers.uv.new()
    for f in bm.faces:
        for loop in f.loops:
            loop[uv].uv = (loop.vert.co.x / w + 0.5, loop.vert.co.y / h + 0.5)
    ob = obj_from_bmesh(name, bm, mat, smooth=False)
    ob.location = location
    ob.rotation_euler = rotation
    return ob


def cylinder(name, r, h, location, mat=None, segments=96, bevel=0.0):
    prof = [(0, 0), (r - bevel, 0)]
    if bevel:
        for i in range(1, 5):
            a = math.pi / 2 * i / 4
            prof.append((r - bevel + bevel * math.sin(a), bevel - bevel * math.cos(a)))
        for i in range(0, 5):
            a = math.pi / 2 * i / 4
            prof.append((r - bevel + bevel * math.cos(a), h - bevel + bevel * math.sin(a)))
    else:
        prof += [(r, 0), (r, h)]
    prof += [(0, h)]
    return lathe(name, prof, segments, mat, subsurf=0, location=location)


# ---------------------------------------------------------------------------
# The concept bottle
# ---------------------------------------------------------------------------
_mats = {}


def materials():
    if _mats:
        return _mats
    _mats["glass"] = principled("frosted_glass", (0.97, 0.95, 0.93), rough=0.46, transmission=1.0, ior=1.5)
    _mats["liquid"] = principled("liquid", PALETTE["liquid"], rough=0.05, transmission=1.0, ior=1.33)
    cap = textured_surface("cap_ceramic", BOTTLE["cap_color"], var=0.025, bump=0.06, scale=60, rough=0.55)
    _mats["cap"] = cap
    _mats["collar"] = principled("champagne_metal", PALETTE["champagne"], rough=0.22, metallic=1.0)
    # label: transparent sleeve with printed ink
    m, nt, n, l = node_mat("label_ink")
    out = n["Material Output"]
    p = n["Principled BSDF"]
    p.inputs["Base Color"].default_value = (0.05, 0.035, 0.03, 1)
    p.inputs["Roughness"].default_value = 0.5
    img = n.new("ShaderNodeTexImage")
    img.image = bpy.data.images.load(str(TEX / "label.png"))
    img.extension = "CLIP"
    tr = n.new("ShaderNodeBsdfTransparent")
    mix = n.new("ShaderNodeMixShader")
    l.new(img.outputs["Alpha"], mix.inputs["Fac"])
    l.new(tr.outputs[0], mix.inputs[1])
    l.new(p.outputs[0], mix.inputs[2])
    l.new(mix.outputs[0], out.inputs["Surface"])
    _mats["label"] = m
    return _mats


def label_sleeve(r, z0, h, segments=128):
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new()
    ring0, ring1 = [], []
    for i in range(segments + 1):
        a = -math.pi / 2 + math.tau * (i / segments - 0.5)
        x, y = r * math.cos(a), r * math.sin(a)
        ring0.append(bm.verts.new((x, y, z0)))
        ring1.append(bm.verts.new((x, y, z0 + h)))
    for i in range(segments):
        f = bm.faces.new((ring0[i], ring0[i + 1], ring1[i + 1], ring1[i]))
        us = (i / segments, (i + 1) / segments)
        for loop, (u, v) in zip(f.loops, [(us[0], 0), (us[1], 0), (us[1], 1), (us[0], 1)]):
            loop[uv].uv = (u, v)
    return obj_from_bmesh("label", bm, materials()["label"], smooth=True)


def bottle(location=(0, 0, 0), rotation_z=0.0, cap_on=True, scale=1.0):
    mats = materials()
    r, bh, ch = BOTTLE["radius"], BOTTLE["body_h"], BOTTLE["cap_h"]
    parts = []
    # frosted glass body with softly rounded heel and shoulder
    prof = [(0, 0), (r - 0.004, 0)]
    for i in range(1, 6):
        a = math.pi / 2 * i / 5
        prof.append((r - 0.004 + 0.004 * math.sin(a), 0.004 - 0.004 * math.cos(a)))
    prof += [(r, bh - 0.006)]
    for i in range(1, 6):
        a = math.pi / 2 * i / 5
        prof.append((r - 0.006 + 0.006 * math.cos(a), bh - 0.006 + 0.006 * math.sin(a)))
    prof += [(0.0075, bh), (0.0075, bh + 0.008), (0, bh + 0.008)]
    parts.append(lathe("glass", prof, 128, mats["glass"], subsurf=0))
    # liquid (thick glass base, fill line near the shoulder)
    lr = r - 0.0009
    parts.append(cylinder("liquid", lr, bh * 0.80, (0, 0, 0.011), mats["liquid"], bevel=0.003))
    # printed label
    parts.append(label_sleeve(r + 0.00025, 0.013, 2 * math.pi * r / 2))
    # champagne collar line
    parts.append(cylinder("collar", r + 0.0002, 0.0026, (0, 0, bh - 0.0004), mats["collar"], bevel=0.0006))
    if cap_on:
        parts.append(cylinder("cap", r + 0.0002, ch, (0, 0, bh + 0.0022), mats["cap"], bevel=0.004))
    else:
        # actuator + dip tube neck for the "open" shot
        parts.append(cylinder("actuator", 0.0085, 0.014, (0, 0, bh + 0.002), mats["collar"], bevel=0.0015))
    root = bpy.data.objects.new("bottle_root", None)
    bpy.context.collection.objects.link(root)
    for p in parts:
        p.parent = root
    root.location = location
    root.rotation_euler = (0, 0, rotation_z)
    root.scale = (scale, scale, scale)
    return root


# ---------------------------------------------------------------------------
# Upcoming-product silhouettes (for "coming soon" imagery, seen through glass)
# ---------------------------------------------------------------------------
def tube(name, r, h, location, mat, cap_mat, rot=0.0):
    """Squeeze tube standing on its cap, crimp at the top."""
    bm = bmesh.new()
    seg = 48
    rings = 14
    rows = []
    for j in range(rings + 1):
        t = j / rings
        z = 0.012 + t * h
        flat = t ** 2.2  # ellipse flattens toward the crimp
        rows.append([bm.verts.new((r * math.cos(a) * (1 + 0.25 * flat), r * math.sin(a) * (1 - 0.94 * flat), z))
                     for a in [math.tau * i / seg for i in range(seg)]])
    for j in range(rings):
        for i in range(seg):
            bm.faces.new((rows[j][i], rows[j][(i + 1) % seg], rows[j + 1][(i + 1) % seg], rows[j + 1][i]))
    bm.faces.new(rows[-1][::-1])
    ob = obj_from_bmesh(name, bm, mat, subsurf=1)
    capo = cylinder(name + "_cap", r * 0.82, 0.014, (0, 0, 0), cap_mat, bevel=0.002)
    root = bpy.data.objects.new(name + "_root", None)
    bpy.context.collection.objects.link(root)
    ob.parent = root
    capo.parent = root
    root.location = location
    root.rotation_euler = (0, 0, rot)
    return root


def jar(name, r, h, location, mat, lid_mat):
    body = cylinder(name, r, h, (0, 0, 0), mat, bevel=0.004)
    lid = cylinder(name + "_lid", r * 1.02, h * 0.42, (0, 0, h), lid_mat, bevel=0.004)
    root = bpy.data.objects.new(name + "_root", None)
    bpy.context.collection.objects.link(root)
    body.parent = root
    lid.parent = root
    root.location = location
    return root


def pump(name, r, h, location, mat, head_mat):
    body = cylinder(name, r, h, (0, 0, 0), mat, bevel=0.005)
    collar = cylinder(name + "_collar", r * 0.42, 0.012, (0, 0, h), head_mat, bevel=0.002)
    stem = cylinder(name + "_stem", r * 0.14, 0.02, (0, 0, h + 0.012), head_mat)
    head = box(name + "_head", (r * 0.5, r * 1.3, 0.012), (0, -r * 0.35, h + 0.036), head_mat, bevel=0.003)
    root = bpy.data.objects.new(name + "_root", None)
    bpy.context.collection.objects.link(root)
    for p in (body, collar, stem, head):
        p.parent = root
    root.location = location
    return root


def dropper(name, r, h, location, mat, bulb_mat):
    body = cylinder(name, r, h, (0, 0, 0), mat, bevel=0.003)
    collar = cylinder(name + "_collar", r * 0.6, 0.014, (0, 0, h), bulb_mat, bevel=0.002)
    bulb = lathe(name + "_bulb", [(0, 0), (r * 0.5, 0), (r * 0.5, 0.012), (r * 0.42, 0.024), (r * 0.25, 0.03), (0, 0.031)],
                 48, bulb_mat, subsurf=1, location=(0, 0, h + 0.014))
    root = bpy.data.objects.new(name + "_root", None)
    bpy.context.collection.objects.link(root)
    for p in (body, collar, bulb):
        p.parent = root
    root.location = location
    return root


def stick(name, r, h, location, mat, cap_mat):
    body = cylinder(name, r, h * 0.45, (0, 0, 0), mat, bevel=0.002)
    cap = cylinder(name + "_cap", r * 1.01, h * 0.55, (0, 0, h * 0.45 + 0.001), cap_mat, bevel=0.003)
    root = bpy.data.objects.new(name + "_root", None)
    bpy.context.collection.objects.link(root)
    body.parent = root
    cap.parent = root
    root.location = location
    return root


# ---------------------------------------------------------------------------
# Set pieces
# ---------------------------------------------------------------------------
def look_at(ob, target):
    d = Vector(target) - ob.location
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


def camera(loc, target, lens=85, dof=None, fstop=4.0, shift_x=0.0, shift_y=0.0):
    cam = bpy.data.cameras.new("cam")
    cam.lens = lens
    cam.sensor_width = 36
    cam.shift_x = shift_x
    cam.shift_y = shift_y
    ob = bpy.data.objects.new("cam", cam)
    bpy.context.collection.objects.link(ob)
    ob.location = loc
    look_at(ob, target)
    if dof:
        cam.dof.use_dof = True
        cam.dof.focus_distance = (Vector(target) - Vector(loc)).length if dof is True else dof
        cam.dof.aperture_fstop = fstop
    bpy.context.scene.camera = ob
    return ob


def world(color=(0.93, 0.78, 0.64), strength=0.3):
    w = bpy.data.worlds.new("w")
    bpy.context.scene.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (*color, 1)
    bg.inputs["Strength"].default_value = strength


def sun(direction, energy=5.5, angle_deg=0.4, color=(1.0, 0.89, 0.74)):
    li = bpy.data.lights.new("sun", "SUN")
    li.energy = energy
    li.angle = math.radians(angle_deg)
    li.color = color
    ob = bpy.data.objects.new("sun", li)
    bpy.context.collection.objects.link(ob)
    d = Vector(direction).normalized()
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    return d


def area(loc, target, size=1.0, energy=30, color=(1, 0.97, 0.93)):
    li = bpy.data.lights.new("fill", "AREA")
    li.size = size
    li.energy = energy
    li.color = color
    ob = bpy.data.objects.new("fill", li)
    bpy.context.collection.objects.link(ob)
    ob.location = loc
    look_at(ob, target)
    return ob


def screen(direction, center, pattern="jaali_star.png", distance=0.7, size=2.4, repeat=4.0, rot=0.0, window=None):
    """Invisible-to-camera lattice that throws patterned window light.

    window: if set (e.g. 2.5), the clipped arch artwork is scaled down to
    1/window of the plane and centred, so the rest of the plane blocks the sun.
    """
    m, nt, n, l = node_mat("screen")
    out = n["Material Output"]
    n.remove(n["Principled BSDF"])
    coord = n.new("ShaderNodeTexCoord")
    mapping = n.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (repeat, repeat, 1)
    mapping.inputs["Rotation"].default_value = (0, 0, rot)
    if window:
        mapping.inputs["Scale"].default_value = (window, window, 1)
        mapping.inputs["Location"].default_value = (0.5 - 0.5 * window, 0.5 - 0.5 * window, 0)
    img = n.new("ShaderNodeTexImage")
    img.image = bpy.data.images.load(str(TEX / pattern))
    img.image.colorspace_settings.name = "Non-Color"
    img.extension = "REPEAT" if pattern == "jaali_star.png" else "CLIP"
    l.new(coord.outputs["UV"], mapping.inputs["Vector"])
    l.new(mapping.outputs["Vector"], img.inputs["Vector"])
    tr = n.new("ShaderNodeBsdfTransparent")
    df = n.new("ShaderNodeBsdfDiffuse")
    df.inputs["Color"].default_value = (0.02, 0.02, 0.02, 1)
    mix = n.new("ShaderNodeMixShader")
    l.new(img.outputs["Color"], mix.inputs["Fac"])
    l.new(df.outputs[0], mix.inputs[1])
    l.new(tr.outputs[0], mix.inputs[2])
    l.new(mix.outputs[0], out.inputs["Surface"])
    d = Vector(direction).normalized()
    loc = Vector(center) - d * distance
    ob = plane("screen", size, size, loc, mat=m)
    ob.rotation_euler = d.to_track_quat("Z", "Y").to_euler()
    ob.visible_camera = False
    ob.visible_glossy = False
    ob.visible_transmission = False
    return ob


def room(wall_color=PALETTE["limewash"], floor_color=PALETTE["sand"], wall_y=0.32, floor=True):
    wall = textured_surface("limewash", wall_color, var=0.05, bump=0.35, scale=9, rough=0.92)
    plane("wall", 4, 3, (0, wall_y, 1.2), rotation=(math.pi / 2, 0, 0), mat=wall)
    if floor:
        fl = textured_surface("floor", floor_color, var=0.04, bump=0.2, scale=14, rough=0.8)
        plane("floor", 4, 4, (0, 0, 0), mat=fl)


def plinth(size, location, color=PALETTE["travertine"]):
    st = textured_surface("travertine", color, var=0.05, bump=0.5, scale=22, rough=0.75, pits=True, veins=True)
    return box("plinth", size, location, st, bevel=0.0025)


def mist_plume(origin, direction, length=0.28, spread=0.11, count=7000, seed=7):
    """Fine spray: thousands of tiny droplets in a cone, plus a faint scattering haze."""
    import random
    rnd = random.Random(seed)
    d = Vector(direction).normalized()
    q = d.to_track_quat("Z", "Y")
    bm = bmesh.new()
    for _ in range(count):
        t = rnd.random() ** 0.7                      # more droplets near the nozzle
        rad = spread * t * math.sqrt(rnd.random())
        a = rnd.random() * math.tau
        local = Vector((rad * math.cos(a), rad * math.sin(a), length * t))
        pos = Vector(origin) + q @ local
        size = 0.0003 + 0.0008 * rnd.random() * (1 - 0.5 * t)
        geom = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=size)
        bmesh.ops.translate(bm, verts=geom["verts"], vec=pos)
    drop = principled("droplet", (1, 1, 1), rough=0.02, transmission=1.0, ior=1.33)
    ob = obj_from_bmesh("droplets", bm, drop, smooth=True)
    # haze
    m, nt, n, l = node_mat("haze")
    out = n["Material Output"]
    n.remove(n["Principled BSDF"])
    sc = n.new("ShaderNodeVolumeScatter")
    sc.inputs["Color"].default_value = (1, 0.97, 0.93, 1)
    sc.inputs["Anisotropy"].default_value = 0.55
    coord = n.new("ShaderNodeTexCoord")
    grad = n.new("ShaderNodeTexGradient")
    grad.gradient_type = "SPHERICAL"
    mp = n.new("ShaderNodeMapping")
    mp.inputs["Location"].default_value = (0.5, 0.5, 0.35)
    l.new(coord.outputs["Generated"], mp.inputs["Vector"])
    mp.inputs["Location"].default_value = (-0.5, -0.5, -0.45)
    mp.inputs["Scale"].default_value = (2.0, 2.0, 1.1)
    l.new(mp.outputs["Vector"], grad.inputs["Vector"])
    noise = n.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 18
    l.new(coord.outputs["Object"], noise.inputs["Vector"])
    mul = n.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    l.new(grad.outputs["Fac"], mul.inputs[0])
    l.new(noise.outputs["Fac"], mul.inputs[1])
    dens = n.new("ShaderNodeMath")
    dens.operation = "MULTIPLY"
    dens.inputs[1].default_value = 60.0
    l.new(mul.outputs[0], dens.inputs[0])
    l.new(dens.outputs[0], sc.inputs["Density"])
    l.new(sc.outputs[0], out.inputs["Volume"])
    bmc = bmesh.new()
    bmesh.ops.create_cone(bmc, cap_ends=True, cap_tris=False, segments=48, radius1=0.006, radius2=spread * 1.1, depth=length)
    for v in bmc.verts:
        v.co.z += length / 2
    haze = obj_from_bmesh("haze", bmc, m, smooth=True)
    haze.location = origin
    haze.rotation_euler = q.to_euler()
    return ob


def linen(location, size=(0.22, 0.14, 0.018), color=PALETTE["linen"]):
    m = textured_surface("towel", color, var=0.05, bump=1.2, scale=180, rough=1.0)
    ob = box("towel", size, location, m, bevel=0.007)
    return ob


def sphere(name, r, location, mat):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=64, v_segments=32, radius=r)
    ob = obj_from_bmesh(name, bm, mat)
    ob.location = location
    return ob


def reeded_glass(location, w=0.7, h=0.5, rot_z=0.0):
    m, nt, n, l = node_mat("reeded")
    p = n["Principled BSDF"]
    p.inputs["Base Color"].default_value = (0.98, 0.97, 0.95, 1)
    p.inputs["Roughness"].default_value = 0.08
    p.inputs["Transmission Weight"].default_value = 1.0
    p.inputs["IOR"].default_value = 1.5
    coord = n.new("ShaderNodeTexCoord")
    wave = n.new("ShaderNodeTexWave")
    wave.wave_type = "BANDS"
    wave.bands_direction = "X"
    wave.wave_profile = "SIN"
    wave.inputs["Scale"].default_value = 70
    l.new(coord.outputs["Object"], wave.inputs["Vector"])
    bmp = n.new("ShaderNodeBump")
    bmp.inputs["Strength"].default_value = 1.0
    bmp.inputs["Distance"].default_value = 0.02
    l.new(wave.outputs["Fac"], bmp.inputs["Height"])
    l.new(bmp.outputs["Normal"], p.inputs["Normal"])
    ob = box("reeded", (w, 0.006, h), location, m, bevel=0.0)
    ob.rotation_euler = (0, 0, rot_z)
    return ob


# ---------------------------------------------------------------------------
# Scenes. Each returns (width, height).
# ---------------------------------------------------------------------------
SUN_LEFT = (0.62, 0.55, -0.42)
SUN_RIGHT = (-0.6, 0.6, -0.45)


def hero_wide():
    world()
    room(wall_y=0.30)
    plinth((0.30, 0.22, 0.11), (0.16, 0.06, 0.055))
    bottle((0.16, 0.04, 0.11), rotation_z=0.0)
    stone = sphere("pebble", 0.022, (0.25, 0.0, 0.118), textured_surface("pebble", PALETTE["sand"], 0.04, 0.3, 40, 0.7))
    stone.scale = (1.0, 0.85, 0.42)
    d = sun(SUN_LEFT, energy=6.0)
    screen(d, (0.10, 0.14, 0.2), pattern="jaali_arch.png", distance=0.9, size=4.0, window=4.0)
    area((0.4, -0.9, 0.4), (0.1, 0.1, 0.15), size=1.5, energy=14)
    camera((0.02, -0.92, 0.25), (0.06, 0.1, 0.17), lens=50, dof=True, fstop=5.6)
    return 2400, 1350


def hero_portrait():
    world()
    room(wall_y=0.30)
    plinth((0.26, 0.20, 0.11), (0.0, 0.06, 0.055))
    bottle((0.0, 0.04, 0.11))
    d = sun(SUN_LEFT, energy=6.0)
    screen(d, (0.02, 0.12, 0.2), pattern="jaali_arch.png", distance=0.9, size=4.0, window=5.0)
    area((0.4, -0.9, 0.4), (0, 0.1, 0.15), size=1.5, energy=14)
    camera((0, -0.70, 0.235), (0, 0.06, 0.17), lens=75, dof=True, fstop=5.6)
    return 1600, 2000


def pack_front():
    """Clean packshot on a warm seamless backdrop for cards and the gallery."""
    bpy.context.scene.view_settings.exposure = -0.45
    world((0.93, 0.84, 0.74), 0.22)
    sweep = textured_surface("sweep", (0.86, 0.78, 0.69), var=0.012, bump=0.03, scale=6, rough=0.95)
    plane("floor", 3, 3, (0, 0, 0), mat=sweep)
    plane("wall", 3, 2, (0, 0.6, 1.0), rotation=(math.pi / 2, 0, 0), mat=sweep)
    bottle((0, 0, 0))
    area((-0.5, -0.6, 0.6), (0, 0, 0.07), size=1.0, energy=16)
    area((0.6, -0.3, 0.3), (0, 0, 0.07), size=1.0, energy=4)
    area((0.0, 0.4, 0.5), (0, 0, 0.1), size=0.8, energy=8)
    camera((0, -0.44, 0.075), (0, 0, 0.071), lens=85)
    return 1600, 2000


def pack_angle():
    bpy.context.scene.view_settings.exposure = -0.3
    world((0.93, 0.86, 0.78), 0.3)
    sweep = textured_surface("sweep", (0.88, 0.81, 0.72), var=0.012, bump=0.03, scale=6, rough=0.95)
    plane("floor", 3, 3, (0, 0, 0), mat=sweep)
    plane("wall", 3, 2, (0, 0.6, 1.0), rotation=(math.pi / 2, 0, 0), mat=sweep)
    bottle((0, 0, 0), rotation_z=math.radians(-28))
    d = sun((0.55, 0.65, -0.52), energy=4.0, angle_deg=2.5)
    area((-0.6, -0.5, 0.4), (0, 0, 0.07), size=1.2, energy=12)
    camera((0.22, -0.40, 0.16), (0, 0, 0.068), lens=90)
    return 1600, 2000


def pack_open():
    bpy.context.scene.view_settings.exposure = -0.45
    world((0.93, 0.84, 0.74), 0.22)
    sweep = textured_surface("sweep", (0.86, 0.78, 0.69), var=0.012, bump=0.03, scale=6, rough=0.95)
    plane("floor", 3, 3, (0, 0, 0), mat=sweep)
    plane("wall", 3, 2, (0, 0.6, 1.0), rotation=(math.pi / 2, 0, 0), mat=sweep)
    bottle((-0.02, 0, 0), cap_on=False)
    capm = materials()["cap"]
    cap = cylinder("cap_loose", BOTTLE["radius"], BOTTLE["cap_h"], (0, 0, 0), capm, bevel=0.004)
    cap.rotation_euler = (math.pi / 2, 0, math.radians(20))
    cap.location = (0.045, -0.03, BOTTLE["radius"])
    area((-0.5, -0.6, 0.6), (0, 0, 0.07), size=1.0, energy=16)
    area((0.6, -0.3, 0.3), (0, 0, 0.07), size=1.0, energy=4)
    camera((0.04, -0.46, 0.15), (0.01, 0, 0.06), lens=85)
    return 1600, 2000


def detail_cap():
    world()
    room(wall_y=0.20)
    plinth((0.2, 0.16, 0.11), (0, 0.04, 0.055))
    bottle((0, 0.03, 0.11), rotation_z=math.radians(8))
    d = sun(SUN_LEFT, energy=4.8, angle_deg=0.6)
    screen(d, (0, 0.05, 0.2), distance=0.6, size=2.0, repeat=7.0)
    area((0.3, -0.6, 0.3), (0, 0, 0.2), size=1.0, energy=8)
    # focus on the cap's front surface (bottle axis is at y=0.03, radius 0.022)
    camera((0.03, -0.26, 0.25), (0.004, 0.009, 0.205), lens=100, dof=True, fstop=6.3)
    return 1600, 2000


def mist():
    world((0.93, 0.88, 0.82), 0.3)
    room(wall_color=PALETTE["limewash_warm"], wall_y=0.35)
    plinth((0.22, 0.18, 0.09), (-0.05, 0.05, 0.045))
    b = bottle((-0.05, 0.04, 0.09), cap_on=False)
    top = (-0.05 + 0.006, 0.04 - 0.005, 0.09 + BOTTLE["body_h"] + 0.012)
    mist_plume(top, (0.9, -0.12, 0.22), length=0.30, spread=0.075)
    d = sun((0.5, 0.62, -0.6), energy=5.0, angle_deg=1.0)
    screen(d, (0.05, 0.15, 0.25), pattern="jaali_arch.png", distance=0.9, size=4.0, window=3.0)
    area((0.4, -0.8, 0.3), (0, 0.1, 0.15), size=1.5, energy=10)
    camera((0.03, -0.62, 0.23), (0.03, 0.06, 0.21), lens=60, dof=True, fstop=5.6)
    return 1600, 2000


def ritual_ledge():
    world()
    room(wall_color=PALETTE["limewash"], wall_y=0.16)
    ledge = textured_surface("ledge", PALETTE["travertine"], 0.05, 0.4, 20, 0.6, pits=True, veins=True)
    box("ledge", (0.9, 0.3, 0.06), (0, 0.01, 0.03), ledge, bevel=0.003)
    linen((-0.10, 0.03, 0.069), size=(0.2, 0.15, 0.018))
    linen((-0.10, 0.03, 0.087), size=(0.19, 0.14, 0.016), color=(0.88, 0.80, 0.74))
    bottle((0.07, 0.03, 0.06), rotation_z=math.radians(-6))
    dish = principled("dish", (0.93, 0.9, 0.86), rough=0.25)
    cylinder("dish", 0.04, 0.008, (0.16, -0.01, 0.06), dish, bevel=0.003)
    sphere("soapstone", 0.014, (0.16, -0.01, 0.08), textured_surface("pebble2", PALETTE["clay_soft"], 0.03, 0.1, 40, 0.6))
    d = sun((0.7, 0.45, -0.55), energy=5.5, angle_deg=0.5)
    screen(d, (0.02, 0.06, 0.16), pattern="jaali_arch.png", distance=0.8, size=4.0, window=3.6, rot=0.0)
    area((0.3, -0.8, 0.3), (0, 0, 0.1), size=1.6, energy=14)
    camera((0.0, -0.62, 0.20), (0.02, 0.04, 0.11), lens=55, dof=True, fstop=5.0)
    return 1600, 2000


def niche():
    """Bottle standing in an arched limewash alcove - a nod to havelis and stepwells."""
    world((0.93, 0.80, 0.68), 0.32)
    lime = textured_surface("lime_niche", PALETTE["limewash"], var=0.05, bump=0.35, scale=9, rough=0.92)
    wall = box("wall_block", (1.6, 0.14, 1.2), (0, 0.07, 0.42), lime, bevel=0.0)
    # cutter: rectangle + half-cylinder = arch, recessed 9 cm into the wall
    nw, nh, depth = 0.17, 0.25, 0.09
    cut_box = box("cut_box", (nw, depth * 2, nh), (0, 0, 0.12 + nh / 2), None, bevel=0.0)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=96, radius1=nw / 2, radius2=nw / 2, depth=depth * 2)
    cut_cyl = obj_from_bmesh("cut_cyl", bm, None, smooth=True)
    cut_cyl.rotation_euler = (math.pi / 2, 0, 0)
    cut_cyl.location = (0, 0, 0.12 + nh)
    for c in (cut_box, cut_cyl):
        mod = wall.modifiers.new("cut", "BOOLEAN")
        mod.operation = "DIFFERENCE"
        mod.object = c
        mod.solver = "EXACT"
        c.hide_render = True
        c.hide_viewport = True
    fl = textured_surface("floor_n", PALETTE["sand"], 0.04, 0.2, 14, 0.8)
    plane("floor", 4, 4, (0, -0.5, 0), mat=fl)
    bottle((0.0, 0.045, 0.12), rotation_z=math.radians(-4))
    d = sun((0.62, 0.62, -0.48), energy=6.0, angle_deg=0.45)
    screen(d, (0.0, 0.0, 0.3), pattern="jaali_arch.png", distance=0.9, size=4.0, window=3.4)
    area((0.3, -1.0, 0.4), (0, 0, 0.25), size=1.6, energy=12)
    camera((0.0, -0.70, 0.235), (0, 0.02, 0.215), lens=75, dof=True, fstop=8)
    return 1600, 2000


def detail_label():
    """Macro of the printed label in patterned light."""
    world()
    room(wall_y=0.12)
    plinth((0.2, 0.16, 0.11), (0, 0.04, 0.055))
    bottle((0, 0.03, 0.11), rotation_z=math.radians(-3))
    d = sun(SUN_LEFT, energy=6.0, angle_deg=0.4)
    screen(d, (0, 0.03, 0.17), pattern="jaali_arch.png", distance=0.6, size=3.0, window=7.0)
    area((0.3, -0.6, 0.3), (0, 0, 0.2), size=1.0, energy=8)
    camera((0.0, -0.21, 0.165), (0, 0.009, 0.16), lens=100, dof=True, fstop=6.3)
    return 1600, 2000


def wall_light():
    """Atmospheric wall study (no product) for story / section breaks."""
    world((0.93, 0.88, 0.82), 0.3)
    room(wall_color=PALETTE["limewash"], wall_y=0.05)
    plinth((0.5, 0.25, 0.04), (0.18, -0.07, 0.02), color=PALETTE["sand"])
    d = sun((0.55, 0.7, -0.45), energy=5.5, angle_deg=0.45)
    screen(d, (0.1, 0.05, 0.42), pattern="jaali_arch.png", distance=0.9, size=4.0, window=3.2)
    camera((0, -1.1, 0.4), (0, 0.05, 0.38), lens=50)
    return 2400, 1500


def upcoming_group(kind):
    """Silhouettes of future formats behind reeded glass - shapes are generic, not designs."""
    world((0.94, 0.9, 0.85), 0.4)
    room(wall_color=PALETTE["limewash"] if kind != "lip" else PALETTE["rose_wall"], wall_y=0.25)
    plinth((0.6, 0.3, 0.05), (0, 0.08, 0.025), color=PALETTE["travertine"])
    z = 0.05
    soft = textured_surface("soft_" + kind, (0.90, 0.86, 0.80), 0.02, 0.08, 30, 0.7)
    clay = materials()["cap"]
    sand = textured_surface("sand_" + kind, PALETTE["sand"], 0.02, 0.05, 30, 0.5)
    rose = textured_surface("rose_" + kind, PALETTE["clay_soft"], 0.02, 0.05, 30, 0.5)
    frost = materials()["glass"]
    if kind == "body":
        pump("wash", 0.03, 0.15, (-0.14, 0.09, z), soft, clay)
        tube("lotion", 0.024, 0.15, (-0.05, 0.10, z), sand, clay, rot=0.2)
        jar("butter", 0.045, 0.05, (0.05, 0.06, z), rose, clay)
        tube("hand", 0.015, 0.09, (0.12, 0.05, z), soft, clay, rot=-0.3)
        jar("scrub", 0.035, 0.04, (0.18, 0.12, z), sand, clay)
    elif kind == "face":
        pump("cleanser", 0.022, 0.12, (-0.16, 0.10, z), soft, clay)
        cylinder("toner", 0.024, 0.14, (-0.08, 0.12, z), frost, bevel=0.004)
        cylinder("toner_cap", 0.012, 0.02, (-0.08, 0.12, z + 0.14), clay, bevel=0.003)
        dropper("serum", 0.018, 0.07, (-0.01, 0.06, z), frost, clay)
        jar("cream", 0.034, 0.04, (0.07, 0.07, z), soft, clay)
        tube("spf", 0.018, 0.11, (0.15, 0.11, z), sand, clay, rot=0.1)
    else:  # lip
        stick("balm", 0.009, 0.075, (-0.04, 0.08, z), soft, clay)
        tube("treatment", 0.011, 0.075, (0.02, 0.09, z), rose, clay, rot=0.4)
        stick("balm2", 0.009, 0.075, (0.07, 0.11, z), sand, clay)
    d = sun(SUN_LEFT, energy=5.8, angle_deg=0.5)
    screen(d, (0.02, 0.08, 0.14), pattern="jaali_arch.png", distance=0.9, size=4.0, window=3.4)
    area((0.3, -0.9, 0.3), (0, 0, 0.1), size=1.6, energy=12)
    if kind == "lip":
        camera((0, -0.42, 0.13), (0.01, 0.09, 0.085), lens=85, dof=True, fstop=6.0)
    else:
        camera((0, -0.62, 0.17), (0.01, 0.08, 0.11), lens=55, dof=True, fstop=7.0)
    return 1600, 2000


def upcoming_single(kind):
    """One generic format behind reeded glass for each coming-soon item."""
    world((0.94, 0.9, 0.85), 0.4)
    walls = {"warm": PALETTE["limewash_warm"], "rose": PALETTE["rose_wall"], "lime": PALETTE["limewash"]}
    shape, tone = kind
    room(wall_color=walls[tone], wall_y=0.22)
    plinth((0.26, 0.2, 0.06), (0, 0.06, 0.03))
    z = 0.06
    soft = textured_surface("soft", (0.90, 0.86, 0.80) if tone != "rose" else PALETTE["clay_soft"], 0.02, 0.08, 30, 0.7)
    clay = materials()["cap"]
    frost = materials()["glass"]
    if shape == "pump":
        pump("x", 0.03, 0.15, (0, 0.06, z), soft, clay)
    elif shape == "tube":
        tube("x", 0.024, 0.15, (0, 0.06, z), soft, clay, rot=0.3)
    elif shape == "tube_small":
        tube("x", 0.016, 0.10, (0, 0.06, z), soft, clay, rot=0.3)
    elif shape == "jar":
        jar("x", 0.045, 0.05, (0, 0.06, z), soft, clay)
    elif shape == "jar_small":
        jar("x", 0.034, 0.04, (0, 0.06, z), soft, clay)
    elif shape == "dropper":
        dropper("x", 0.02, 0.08, (0, 0.06, z), frost, clay)
    elif shape == "toner":
        cylinder("x", 0.026, 0.15, (0, 0.06, z), frost, bevel=0.004)
        cylinder("xc", 0.013, 0.022, (0, 0.06, z + 0.15), clay, bevel=0.003)
    elif shape == "stick":
        stick("x", 0.010, 0.08, (0, 0.06, z), soft, clay)
    d = sun(SUN_LEFT, energy=5.8, angle_deg=0.5)
    screen(d, (0.0, 0.06, 0.14), pattern="jaali_arch.png", distance=0.9, size=4.0, window=4.0)
    area((0.3, -0.9, 0.3), (0, 0, 0.1), size=1.6, energy=12)
    small = shape in ("stick", "tube_small", "dropper", "jar_small")
    tz = z + (0.05 if small else 0.075)
    camera((0, -0.46 if small else -0.56, tz + 0.03), (0, 0.06, tz), lens=85 if small else 70, dof=True, fstop=6.0)
    return 1200, 1500


UPCOMING = {
    "up_body_wash": ("pump", "lime"),
    "up_body_lotion": ("tube", "warm"),
    "up_body_scrub": ("jar_small", "warm"),
    "up_body_butter": ("jar", "rose"),
    "up_hand_cream": ("tube_small", "lime"),
    "up_cleanser": ("pump", "warm"),
    "up_toner": ("toner", "lime"),
    "up_serum": ("dropper", "rose"),
    "up_moisturiser": ("jar_small", "lime"),
    "up_sunscreen": ("tube", "warm"),
    "up_mask": ("jar", "lime"),
    "up_lip_balm": ("stick", "rose"),
    "up_lip_treatment": ("tube_small", "rose"),
}

SCENES = {
    "hero_wide": hero_wide,
    "hero_portrait": hero_portrait,
    "pack_front": pack_front,
    "pack_angle": pack_angle,
    "pack_open": pack_open,
    "detail_cap": detail_cap,
    "mist": mist,
    "ritual_ledge": ritual_ledge,
    "niche": niche,
    "detail_label": detail_label,
    "wall_light": wall_light,
    "up_group_body": lambda: upcoming_group("body"),
    "up_group_face": lambda: upcoming_group("face"),
    "up_group_lip": lambda: upcoming_group("lip"),
}
for key, val in UPCOMING.items():
    SCENES[key] = (lambda v: (lambda: upcoming_single(v)))(val)


SCALE = {"hero_wide": 1.0, "wall_light": 0.8}
SCALE.update({k: 0.6 for k in UPCOMING})


def render(name, samples, scale, threads):
    _mats.clear()
    s = reset()
    w, h = SCENES[name]()
    scale = scale if scale != 1.0 else SCALE.get(name, 0.8)
    s.render.resolution_x = int(w * scale)
    s.render.resolution_y = int(h * scale)
    s.render.resolution_percentage = 100
    s.cycles.samples = samples
    s.render.threads_mode = "FIXED" if threads else "AUTO"
    if threads:
        s.render.threads = threads
    OUT.mkdir(exist_ok=True)
    s.render.filepath = str(OUT / f"{name}.png")
    bpy.ops.render.render(write_still=True)
    print("rendered", name, flush=True)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("scene", nargs="?", default="hero_portrait")
    ap.add_argument("--samples", type=int, default=128)
    ap.add_argument("--scale", type=float, default=1.0)
    ap.add_argument("--threads", type=int, default=0)
    ap.add_argument("--list", action="store_true")
    a = ap.parse_args()
    if a.list:
        print("\n".join(SCENES))
        sys.exit()
    names = list(SCENES) if a.scene == "all" else a.scene.split(",")
    for nm in names:
        render(nm, a.samples, a.scale, a.threads)
