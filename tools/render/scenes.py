"""Procedural Blender (Cycles) scenes for Gentle Company's product imagery.

Everything is generated in code: geometry, materials, light. The packaging is
Gentle Company's proposed packaging design; final manufactured packaging may
differ. All lettering on the packaging comes from label artwork typeset with
the brand fonts in make_textures.py, mapped onto the surfaces as an accurate
graphic layer, never from AI-generated text.

Usage (with the `bpy` module installed, e.g. `pip install bpy==5.2.3`):

    python tools/render/make_textures.py          # label artwork first
    python tools/render/scenes.py --list
    python tools/render/scenes.py hero_wide --samples 160
    python tools/render/scenes.py all --samples 96

Output PNGs are written to tools/render/out/ and post-processed by
tools/build_images.py.
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
# Art direction: "Daylight vanity". Warm plaster and stone, soft window light
# with leaf shadows, clear glass and matte packaging, cocoa ink.
# ---------------------------------------------------------------------------
PALETTE = {
    "plaster": (0.90, 0.83, 0.75),
    "plaster_apricot": (0.86, 0.66, 0.53),
    "plaster_clay": (0.40, 0.22, 0.16),
    "sand": (0.86, 0.79, 0.70),
    "travertine": (0.82, 0.73, 0.62),
    "marble": (0.92, 0.90, 0.87),
    "linen": (0.91, 0.88, 0.83),
    "cocoa": (0.10, 0.07, 0.06),
    "ink": (0.035, 0.025, 0.02),
    "champagne": (0.86, 0.74, 0.55),
    "liquid": (0.99, 0.74, 0.52),
    # packaging colours by line
    "pack_body": (0.76, 0.48, 0.34),   # apricot
    "pack_face": (0.84, 0.80, 0.74),   # milk
    "pack_lip": (0.66, 0.36, 0.33),    # rose
    # backdrops by line
    "bg_body": (0.80, 0.63, 0.52),
    "bg_face": (0.76, 0.73, 0.68),
    "bg_lip": (0.78, 0.59, 0.55),
}

LINES = {
    "body": {"pack": PALETTE["pack_body"], "bg": PALETTE["bg_body"]},
    "face": {"pack": PALETTE["pack_face"], "bg": PALETTE["bg_face"]},
    "lip": {"pack": PALETTE["pack_lip"], "bg": PALETTE["bg_lip"]},
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
    s.view_settings.look = "AgX - High Contrast"
    s.view_settings.exposure = -0.85
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
# Packaging
# ---------------------------------------------------------------------------
_mats = {}


def load_image(name, non_color=False):
    img = bpy.data.images.load(str(TEX / name), check_existing=True)
    if non_color:
        img.colorspace_settings.name = "Non-Color"
    return img


def printed_mat(name, color, label_key, lw, lh, zc, rough=0.55, coat=0.0, ink=PALETTE["ink"]):
    """Matte packaging with the label artwork printed on its front (-Y) face.

    The artwork is projected front-on in object space: `lw` x `lh` metres,
    centred at height `zc`. Ink follows the image's alpha exactly.
    """
    m, nt, n, l = node_mat(name)
    p = n["Principled BSDF"]
    p.inputs["Roughness"].default_value = rough
    p.inputs["Coat Weight"].default_value = coat
    coord = n.new("ShaderNodeTexCoord")
    sep = n.new("ShaderNodeSeparateXYZ")
    l.new(coord.outputs["Object"], sep.inputs[0])
    mu = n.new("ShaderNodeMath")
    mu.operation = "MULTIPLY_ADD"
    mu.inputs[1].default_value = 1.0 / lw
    mu.inputs[2].default_value = 0.5
    l.new(sep.outputs["X"], mu.inputs[0])
    mv = n.new("ShaderNodeMath")
    mv.operation = "MULTIPLY_ADD"
    mv.inputs[1].default_value = 1.0 / lh
    mv.inputs[2].default_value = 0.5 - zc / lh
    l.new(sep.outputs["Z"], mv.inputs[0])
    comb = n.new("ShaderNodeCombineXYZ")
    l.new(mu.outputs[0], comb.inputs["X"])
    l.new(mv.outputs[0], comb.inputs["Y"])
    img = n.new("ShaderNodeTexImage")
    img.image = load_image(f"label_{label_key}.png")
    img.extension = "CLIP"
    img.interpolation = "Cubic"
    l.new(comb.outputs[0], img.inputs["Vector"])
    front = n.new("ShaderNodeMath")
    front.operation = "LESS_THAN"
    front.inputs[1].default_value = 0.0
    l.new(sep.outputs["Y"], front.inputs[0])
    mask = n.new("ShaderNodeMath")
    mask.operation = "MULTIPLY"
    l.new(img.outputs["Alpha"], mask.inputs[0])
    l.new(front.outputs[0], mask.inputs[1])
    mix = n.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.inputs["A"].default_value = (*color, 1)
    mix.inputs["B"].default_value = (*ink, 1)
    l.new(mask.outputs[0], mix.inputs["Factor"])
    l.new(mix.outputs["Result"], p.inputs["Base Color"])
    # ink is slightly glossier than the matte stock
    rmix = n.new("ShaderNodeMath")
    rmix.operation = "MULTIPLY_ADD"
    rmix.inputs[1].default_value = -0.25
    rmix.inputs[2].default_value = rough
    l.new(mask.outputs[0], rmix.inputs[0])
    l.new(rmix.outputs[0], p.inputs["Roughness"])
    return m


def materials():
    if "glass" in _mats:
        return _mats
    _mats["glass"] = principled("glass", (0.99, 0.985, 0.97), rough=0.015, transmission=1.0, ior=1.5)
    liq = principled("liquid", (0.99, 0.70, 0.46), rough=0.02, transmission=1.0, ior=1.34)
    _mats["liquid"] = liq
    _mats["cap"] = textured_surface("cap_cocoa", (0.06, 0.042, 0.035), var=0.008, bump=0.04, scale=80, rough=0.38)
    _mats["collar"] = principled("champagne_metal", PALETTE["champagne"], rough=0.25, metallic=1.0)
    _mats["actuator"] = principled("actuator", (0.12, 0.09, 0.075), rough=0.35)
    # paper label: printed artwork image, uncoated stock
    m, nt, n, l = node_mat("paper_label")
    p = n["Principled BSDF"]
    img = n.new("ShaderNodeTexImage")
    img.image = load_image("label_body_mist_paper.png")
    img.interpolation = "Cubic"
    l.new(img.outputs["Color"], p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = 0.78
    p.inputs["Sheen Weight"].default_value = 0.2
    _mats["label"] = m
    return _mats


BOTTLE = {"w": 0.052, "d": 0.034, "h": 0.104, "base": 0.009, "cap_r": 0.0138, "cap_h": 0.036}


def bottle(location=(0, 0, 0), rotation_z=0.0, cap_on=True, scale=1.0):
    """Body Mist Nº 01: heavy clear-glass block, apricot liquid, cream paper label, cocoa cap."""
    mats = materials()
    w, d, h = BOTTLE["w"], BOTTLE["d"], BOTTLE["h"]
    shell = box("glass", (w, d, h), (0, 0, h / 2), mats["glass"], bevel=0.0085)
    sol = shell.modifiers.new("wall", "SOLIDIFY")
    sol.thickness = 0.0024
    sol.offset = -1.0
    sol.use_even_offset = True
    parts = [shell]
    base = BOTTLE["base"]
    parts.append(box("base", (w - 0.006, d - 0.006, base - 0.0024), (0, 0, 0.0024 + (base - 0.0024) / 2), mats["glass"], bevel=0.004))
    lh = h * 0.72
    parts.append(box("liquid", (w - 0.0058, d - 0.0058, lh), (0, 0, base + 0.0004 + lh / 2), mats["liquid"], bevel=0.0058))
    parts.append(cylinder("neck", 0.0085, 0.008, (0, 0, h - 0.0005), mats["glass"]))
    parts.append(cylinder("collar", 0.0105, 0.0042, (0, 0, h + 0.004), mats["collar"], bevel=0.0008))
    if cap_on:
        parts.append(cylinder("cap", BOTTLE["cap_r"], BOTTLE["cap_h"], (0, 0, h + 0.0007), mats["cap"], bevel=0.0032))
    else:
        parts.append(cylinder("actuator", 0.0078, 0.013, (0, 0, h + 0.0082), mats["actuator"], bevel=0.0018))
        nozzle = cylinder("nozzle", 0.0012, 0.004, (0, 0, 0), principled("nozzle", (0.01, 0.01, 0.01), rough=0.6))
        nozzle.location = (0, -0.0062, h + 0.0165)
        nozzle.rotation_euler = (math.pi / 2, 0, 0)
        parts.append(nozzle)
    lab = plane("label", 0.0345, 0.046, (0, -d / 2 - 0.00035, h * 0.47), rotation=(math.pi / 2, 0, 0), mat=mats["label"])
    parts.append(lab)
    # Glass and liquid let light through; without caustics Cycles would treat them as opaque
    # shadow casters and the base would refract a black patch. Let light pass instead.
    for p in parts:
        if p.name.split(".")[0] in ("glass", "base", "neck", "liquid"):
            p.visible_shadow = False
    root = bpy.data.objects.new("bottle_root", None)
    bpy.context.collection.objects.link(root)
    for p in parts:
        p.parent = root
    root.location = location
    root.rotation_euler = (0, 0, rotation_z)
    root.scale = (scale, scale, scale)
    return root


def bottle_cap(location, rotation=(0, 0, 0)):
    """The cap on its own (for the cap-off shots)."""
    mats = materials()
    c = cylinder("cap_loose", BOTTLE["cap_r"], BOTTLE["cap_h"], (0, 0, 0), mats["cap"], bevel=0.0032)
    c.location = location
    c.rotation_euler = rotation
    return c


def _root(name, parts, location, rot=0.0):
    root = bpy.data.objects.new(name + "_root", None)
    bpy.context.collection.objects.link(root)
    for p in parts:
        p.parent = root
    root.location = location
    root.rotation_euler = (0, 0, rot)
    return root


def cap_mat():
    if "pack_cap" not in _mats:
        _mats["pack_cap"] = principled("pack_cap", (0.06, 0.042, 0.035), rough=0.36)
    return _mats["pack_cap"]


def fmt_tube(key, line, r, h, location, rot=0.0):
    """Squeeze tube standing on its cap, crimp at the top."""
    bm = bmesh.new()
    seg, rings = 64, 18
    rows = []
    for j in range(rings + 1):
        t = j / rings
        z = 0.016 + t * h
        flat = t ** 2.4
        rows.append([bm.verts.new((r * math.cos(a) * (1 + 0.28 * flat), r * math.sin(a) * (1 - 0.93 * flat), z))
                     for a in [math.tau * i / seg for i in range(seg)]])
    for j in range(rings):
        for i in range(seg):
            bm.faces.new((rows[j][i], rows[j][(i + 1) % seg], rows[j + 1][(i + 1) % seg], rows[j + 1][i]))
    bm.faces.new(rows[-1][::-1])
    lw = 2 * r * 1.25
    mat = printed_mat(f"{key}_tube", LINES[line]["pack"], key, lw, lw / 0.8, 0.016 + h * 0.36, rough=0.5, coat=0.15)
    body = obj_from_bmesh(key, bm, mat, subsurf=1)
    capo = cylinder(key + "_cap", r * 0.86, 0.017, (0, 0, 0), cap_mat(), bevel=0.002)
    return _root(key, [body, capo], location, rot)


JAR_LABEL = {"scale": 1.02}  # label width as a multiple of the jar diameter (smaller for close-ups)


def fmt_jar(key, line, r, h, location, rot=0.0):
    lw = 2 * r * JAR_LABEL["scale"]
    mat = printed_mat(f"{key}_jar", LINES[line]["pack"], key, lw, lw / 0.8, h * 0.5, rough=0.42, coat=0.2)
    body = cylinder(key, r, h, (0, 0, 0), mat, bevel=0.004, segments=128)
    lid = cylinder(key + "_lid", r * 1.015, h * 0.46, (0, 0, h), cap_mat(), bevel=0.0035, segments=128)
    return _root(key, [body, lid], location, rot)


def fmt_pump(key, line, r, h, location, rot=0.0):
    lw = 2 * r * 1.12
    mat = printed_mat(f"{key}_pump", LINES[line]["pack"], key, lw, lw / 0.8, h * 0.5, rough=0.45, coat=0.2)
    body = cylinder(key, r, h, (0, 0, 0), mat, bevel=0.006, segments=128)
    collar = cylinder(key + "_collar", r * 0.46, 0.014, (0, 0, h - 0.001), cap_mat(), bevel=0.002)
    stem = cylinder(key + "_stem", r * 0.17, 0.022, (0, 0, h + 0.012), cap_mat())
    head = box(key + "_head", (r * 0.62, r * 1.5, 0.013), (0, -r * 0.42, h + 0.039), cap_mat(), bevel=0.004)
    return _root(key, [body, collar, stem, head], location, rot)


def fmt_toner(key, line, r, h, location, rot=0.0):
    lw = 2 * r * 1.12
    mat = printed_mat(f"{key}_bottle", LINES[line]["pack"], key, lw, lw / 0.8, h * 0.45, rough=0.3, coat=0.4)
    prof = [(0, 0), (r - 0.004, 0), (r, 0.004), (r, h - 0.012), (r * 0.62, h - 0.002), (r * 0.42, h), (0, h)]
    body = lathe(key, prof, 128, mat, subsurf=1)
    cap = cylinder(key + "_cap", r * 0.5, 0.028, (0, 0, h - 0.002), cap_mat(), bevel=0.003)
    return _root(key, [body, cap], location, rot)


def fmt_dropper(key, line, r, h, location, rot=0.0):
    lw = 2 * r * 1.3
    mat = printed_mat(f"{key}_dropper", LINES[line]["pack"], key, lw, lw / 0.8, h * 0.46, rough=0.25, coat=0.5)
    prof = [(0, 0), (r - 0.003, 0), (r, 0.003), (r, h - 0.008), (r * 0.6, h), (0, h)]
    body = lathe(key, prof, 128, mat, subsurf=1)
    collar = cylinder(key + "_collar", r * 0.62, 0.016, (0, 0, h - 0.001), cap_mat(), bevel=0.002)
    bulb = lathe(key + "_bulb", [(0, 0), (r * 0.5, 0), (r * 0.5, 0.012), (r * 0.44, 0.026), (r * 0.28, 0.034), (0, 0.036)],
                 64, cap_mat(), subsurf=1, location=(0, 0, h + 0.015))
    return _root(key, [body, collar, bulb], location, rot)


def fmt_stick(key, line, r, h, location, rot=0.0):
    lw = 2 * r * 1.55
    mat = printed_mat(f"{key}_stick", LINES[line]["pack"], key, lw, lw / 0.8, h * 0.6, rough=0.4, coat=0.2)
    body = cylinder(key, r, h, (0, 0, 0), mat, bevel=0.002, segments=96)
    cap = cylinder(key + "_cap", r * 1.01, h * 0.34, (0, 0, h * 0.995), cap_mat(), bevel=0.0025, segments=96)
    return _root(key, [body, cap], location, rot)


FORMATS = {"tube": fmt_tube, "jar": fmt_jar, "pump": fmt_pump, "toner": fmt_toner, "dropper": fmt_dropper, "stick": fmt_stick}

# Proposed packaging for the coming-soon range: (label key, line, format, dimensions)
RANGE = {
    "up_body_wash": ("body_wash", "body", "pump", {"r": 0.027, "h": 0.135}),
    "up_body_lotion": ("body_lotion", "body", "tube", {"r": 0.021, "h": 0.15}),
    "up_body_scrub": ("body_scrub", "body", "jar", {"r": 0.043, "h": 0.05}),
    "up_body_butter": ("body_butter", "body", "jar", {"r": 0.037, "h": 0.046}),
    "up_hand_cream": ("hand_cream", "body", "tube", {"r": 0.0155, "h": 0.105}),
    "up_cleanser": ("cleanser", "face", "pump", {"r": 0.022, "h": 0.118}),
    "up_toner": ("toner", "face", "toner", {"r": 0.023, "h": 0.125}),
    "up_serum": ("serum", "face", "dropper", {"r": 0.017, "h": 0.074}),
    "up_moisturiser": ("moisturiser", "face", "jar", {"r": 0.032, "h": 0.042}),
    "up_sunscreen": ("sunscreen", "face", "tube", {"r": 0.018, "h": 0.13}),
    "up_mask": ("mask", "face", "jar", {"r": 0.036, "h": 0.044}),
    "up_lip_balm": ("lip_balm", "lip", "stick", {"r": 0.0098, "h": 0.07}),
    "up_lip_treatment": ("lip_treatment", "lip", "tube", {"r": 0.011, "h": 0.088}),
}


def product(range_key, location, rot=0.0):
    key, line, fmt, dims = RANGE[range_key]
    return FORMATS[fmt](key, line, dims["r"], dims["h"], location, rot)


def product_height(range_key):
    key, line, fmt, d = RANGE[range_key]
    extra = {"tube": 0.016, "jar": d["h"] * 0.46, "pump": 0.046, "toner": 0.026, "dropper": 0.051, "stick": d["h"] * 0.34}[fmt]
    return d["h"] + extra


BOTTLE_TOP = BOTTLE["h"] + BOTTLE["cap_h"]


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


def screen(direction, center, pattern="leaves.png", distance=0.7, size=2.4, repeat=4.0, rot=0.0, window=None):
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
    img.extension = "REPEAT" if pattern == "leaves.png" else "CLIP"
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


def room(wall_color=PALETTE["plaster"], floor_color=PALETTE["sand"], wall_y=0.32, floor=True):
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
    dens.inputs[1].default_value = 45.0
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




def sweep(color, width=3.0, depth=1.2, height=1.4, radius=0.3, y0=0.55, var=0.02):
    # floor is flat until y = y0 - radius (0.25 m behind the product), so nothing sinks into the curve
    """Seamless studio backdrop: floor curving up into a wall at y=y0."""
    prof = [(-depth, 0.0)]
    for i in range(0, 17):
        a = math.pi / 2 * i / 16
        prof.append((y0 - radius + radius * math.sin(a), radius - radius * math.cos(a)))
    prof.append((y0, height))
    bm = bmesh.new()
    left = [bm.verts.new((-width / 2, y, z)) for y, z in prof]
    right = [bm.verts.new((width / 2, y, z)) for y, z in prof]
    for i in range(len(prof) - 1):
        bm.faces.new((left[i], right[i], right[i + 1], left[i + 1]))
    m = textured_surface("sweep", color, var=var, bump=0.05, scale=6, rough=0.9)
    return obj_from_bmesh("sweep", bm, m, smooth=True)


def studio(color, key=22.0, leaves=True, sun_dir=(0.55, 0.62, -0.5), sun_energy=4.5):
    """Soft packshot light: big key from the left, fill, rim, and leaf shadow across the sweep."""
    world(color=tuple(c * 0.9 for c in color), strength=0.18)
    sweep(color)
    area((-0.42, -0.38, 0.42), (0, 0, 0.06), size=0.6, energy=key, color=(1.0, 0.96, 0.9))
    area((0.5, -0.32, 0.16), (0, 0, 0.06), size=0.9, energy=key * 0.2)
    area((0.18, 0.4, 0.38), (0, 0, 0.08), size=0.4, energy=key * 0.45, color=(1.0, 0.93, 0.85))
    if leaves:
        d = sun(sun_dir, energy=sun_energy, angle_deg=1.6)
        screen(d, (0, 0.05, 0.08), pattern="leaves.png", distance=0.55, size=1.6, repeat=1.4)


def frame(height, fill=0.62, lens=90, elev_deg=7.0, aspect=0.8, x=0.0, look_frac=0.48, yaw_deg=0.0):
    """Place a camera so an object `height` tall fills `fill` of the frame height."""
    sensor = 36.0
    fov_v = 2 * math.atan((sensor / 2) / lens) if aspect <= 1 else 2 * math.atan((sensor / 2 / aspect) / lens)
    dist = (height / fill) / (2 * math.tan(fov_v / 2))
    e = math.radians(elev_deg)
    yw = math.radians(yaw_deg)
    tz = height * look_frac
    loc = (x + dist * math.cos(e) * math.sin(yw), -dist * math.cos(e) * math.cos(yw), tz + dist * math.sin(e))
    return camera(loc, (x, 0, tz), lens=lens, dof=True, fstop=8.0)


def stone(location, size, color=PALETTE["travertine"]):
    return plinth(size, (location[0], location[1], location[2] + size[2] / 2), color=color)


def water(z, size=(1.2, 0.6), location=(0, -0.35)):
    m, nt, n, l = node_mat("water")
    p = n["Principled BSDF"]
    p.inputs["Base Color"].default_value = (0.86, 0.9, 0.88, 1)
    p.inputs["Roughness"].default_value = 0.02
    p.inputs["Transmission Weight"].default_value = 1.0
    p.inputs["IOR"].default_value = 1.33
    coord = n.new("ShaderNodeTexCoord")
    noise = n.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 28
    noise.inputs["Detail"].default_value = 3
    l.new(coord.outputs["Object"], noise.inputs["Vector"])
    bmp = n.new("ShaderNodeBump")
    bmp.inputs["Strength"].default_value = 0.25
    l.new(noise.outputs["Fac"], bmp.inputs["Height"])
    l.new(bmp.outputs["Normal"], p.inputs["Normal"])
    return plane("water", size[0], size[1], (location[0], location[1], z), mat=m)


def mirror(location, r=0.16):
    m = principled("mirror", (0.95, 0.93, 0.9), rough=0.02, metallic=1.0)
    frame_m = principled("mirror_frame", PALETTE["champagne"], rough=0.3, metallic=1.0)
    disc = cylinder("mirror", r, 0.004, (0, 0, 0), m, segments=128)
    rim = cylinder("mirror_rim", r + 0.006, 0.003, (0, 0, -0.002), frame_m, segments=128)
    root = _root("mirror", [disc, rim], location)
    root.rotation_euler = (math.pi / 2, 0, 0)
    return root


# ---------------------------------------------------------------------------
# Scenes. Each returns (width, height) in pixels at scale 1.
# ---------------------------------------------------------------------------
def hero_wide():
    """Campaign hero: the bottle on travertine against warm apricot plaster, leaf light."""
    world(color=(0.9, 0.72, 0.6), strength=0.25)
    room(wall_color=PALETTE["plaster_apricot"], floor_color=PALETTE["travertine"], wall_y=0.2)
    stone((0.11, 0.0, 0.0), (0.26, 0.17, 0.07))
    bottle(location=(0.11, -0.005, 0.07), rotation_z=math.radians(-8))
    stone((-0.06, -0.03, 0.0), (0.09, 0.09, 0.03), color=PALETTE["marble"])
    linen((0.27, -0.02, 0.0), size=(0.16, 0.12, 0.016))
    d = sun((0.62, 0.5, -0.42), energy=6.0, angle_deg=1.2, color=(1.0, 0.86, 0.7))
    screen(d, (0.1, 0.1, 0.12), pattern="leaves.png", distance=0.6, size=2.0, repeat=1.2)
    area((-0.3, -0.5, 0.3), (0.1, 0, 0.12), size=1.0, energy=9, color=(1, 0.95, 0.9))
    area((0.4, -0.2, 0.25), (0.11, 0, 0.13), size=0.3, energy=4)
    camera((0.03, -0.66, 0.2), (0.03, 0.02, 0.125), lens=58, dof=0.66, fstop=5.6)
    return 2400, 1350


def hero_portrait():
    world(color=(0.9, 0.72, 0.6), strength=0.25)
    room(wall_color=PALETTE["plaster_apricot"], floor_color=PALETTE["travertine"], wall_y=0.16)
    stone((0.0, 0.0, 0.0), (0.2, 0.15, 0.07))
    bottle(location=(0.0, -0.005, 0.07), rotation_z=math.radians(-8))
    linen((0.13, -0.04, 0.0), size=(0.14, 0.12, 0.016))
    d = sun((0.62, 0.5, -0.42), energy=6.0, angle_deg=1.2, color=(1.0, 0.86, 0.7))
    screen(d, (0.0, 0.1, 0.12), pattern="leaves.png", distance=0.6, size=2.0, repeat=1.2)
    area((-0.3, -0.5, 0.3), (0, 0, 0.12), size=1.0, energy=9, color=(1, 0.95, 0.9))
    camera((0.0, -0.6, 0.18), (0.0, 0.0, 0.135), lens=70, dof=0.6, fstop=5.6)
    return 1440, 1800


def glass_card(y=0.075, z=0.045, w=0.34, h=0.11, strength=2.2):
    """A white card behind the bottle, seen only through the glass (like a photographer's bounce card)."""
    m, nt, n, l = node_mat("card")
    out = n["Material Output"]
    n.remove(n["Principled BSDF"])
    em = n.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (1.0, 0.95, 0.9, 1)
    em.inputs["Strength"].default_value = strength
    l.new(em.outputs[0], out.inputs["Surface"])
    ob = plane("card", w, h, (0, y, z), rotation=(math.pi / 2, 0, 0), mat=m)
    ob.visible_camera = False
    ob.visible_diffuse = False
    ob.visible_shadow = False
    return ob


def _stand(x=0.0, r=0.06, h=0.014):
    """Low travertine disc: the heavy glass base refracts bright stone instead of floor shadow."""
    st = textured_surface("stand", PALETTE["travertine"], var=0.04, bump=0.4, scale=26, rough=0.7, pits=True)
    cylinder("stand", r, h, (x, 0, 0), st, bevel=0.002, segments=128)
    return h


def pack_front():
    """Clean packshot: cards, gallery lead image, structured data."""
    studio(PALETTE["bg_body"], sun_dir=(0.62, 0.5, -0.42), sun_energy=3.6)
    z = _stand()
    glass_card()
    bottle(location=(0, 0, z), rotation_z=0.0)
    frame(BOTTLE_TOP + z, fill=0.62, elev_deg=7)
    return 1600, 2000


def pack_angle():
    studio(PALETTE["bg_body"], sun_dir=(0.5, 0.6, -0.45), sun_energy=3.6)
    z = _stand()
    glass_card()
    bottle(location=(0, 0, z), rotation_z=math.radians(-32))
    frame(BOTTLE_TOP + z, fill=0.62, elev_deg=10)
    return 1600, 2000


def pack_open():
    studio(PALETTE["bg_body"], sun_dir=(0.62, 0.5, -0.42), sun_energy=3.6)
    z = _stand(r=0.075)
    glass_card()
    bottle(location=(-0.016, 0, z), cap_on=False, rotation_z=math.radians(-10))
    bottle_cap((0.036, -0.018, z))
    frame(BOTTLE["h"] + 0.03 + z, fill=0.6, elev_deg=10, x=0.004)
    return 1600, 2000


def detail_label():
    """Macro on the label: the wordmark, legible."""
    studio(PALETTE["bg_body"], key=12, sun_energy=2.5)
    bottle(rotation_z=math.radians(-12))
    camera((0.02, -0.19, 0.055), (0.0, -0.017, 0.05), lens=100, dof=True, fstop=5.6)
    return 1600, 2000


def mist():
    """The spray, backlit against clay plaster."""
    world(color=(0.45, 0.3, 0.24), strength=0.12)
    room(wall_color=PALETTE["plaster_clay"], floor_color=PALETTE["travertine"], wall_y=0.25)
    stone((-0.05, 0, 0), (0.16, 0.14, 0.05))
    bottle(location=(-0.06, 0, 0.05), cap_on=False, rotation_z=math.radians(-6))
    mist_plume((-0.06 + 0.002, -0.012, 0.05 + BOTTLE["h"] + 0.0165), (0.6, -0.12, 0.3), length=0.22, spread=0.085, count=6000)
    area((0.12, 0.12, 0.3), (0.02, -0.03, 0.19), size=0.1, energy=26, color=(1, 0.88, 0.74))
    area((-0.35, -0.4, 0.3), (-0.05, 0, 0.12), size=0.9, energy=9)
    camera((0.0, -0.52, 0.16), (0.005, 0, 0.14), lens=55, dof=0.53, fstop=5.6)
    return 1600, 2000


def vanity():
    """Bathroom vanity: marble counter, round mirror, folded towel, leaf light."""
    world(color=(0.92, 0.86, 0.8), strength=0.3)
    room(wall_color=PALETTE["plaster"], floor_color=PALETTE["marble"], wall_y=0.22)
    counter = textured_surface("marble_top", PALETTE["marble"], var=0.03, bump=0.05, scale=4, rough=0.25, veins=True)
    box("counter", (1.6, 0.5, 0.04), (0, -0.03, 0.02), counter, bevel=0.003)
    vase = principled("vase", (0.78, 0.66, 0.56), rough=0.5, coat=0.2)
    lathe("vase", [(0, 0), (0.03, 0), (0.042, 0.03), (0.04, 0.075), (0.018, 0.11), (0.014, 0.135), (0.017, 0.14), (0, 0.14)], 96, vase, subsurf=1, location=(0.2, 0.08, 0.04))
    tray = principled("tray", (0.86, 0.8, 0.72), rough=0.35, coat=0.3)
    cylinder("tray", 0.085, 0.008, (-0.02, -0.02, 0.04), tray, bevel=0.003)
    bottle(location=(-0.02, -0.02, 0.048), rotation_z=math.radians(-14))
    linen((0.17, -0.04, 0.04), size=(0.16, 0.12, 0.03))
    stone((-0.17, -0.01, 0.04), (0.07, 0.07, 0.022), color=PALETTE["travertine"])
    d = sun((0.55, 0.55, -0.45), energy=5.0, angle_deg=1.4, color=(1.0, 0.88, 0.74))
    screen(d, (0, 0.1, 0.2), pattern="leaves.png", distance=0.6, size=2.0, repeat=1.0)
    area((-0.4, -0.5, 0.35), (0, 0, 0.12), size=1.2, energy=12)
    camera((0.0, -0.6, 0.2), (0.0, 0.0, 0.13), lens=68, dof=0.6, fstop=5.6)
    return 1600, 2000


def ritual():
    """Bath ledge: travertine edge, still water, linen."""
    world(color=(0.9, 0.84, 0.78), strength=0.3)
    room(wall_color=PALETTE["plaster"], floor_color=PALETTE["travertine"], wall_y=0.2)
    stone((0, 0.02, 0.0), (0.7, 0.2, 0.1))
    box("tub", (1.4, 0.4, 0.06), (0, -0.3, 0.03), textured_surface("tub", PALETTE["marble"], var=0.02, bump=0.05, scale=5, rough=0.3), bevel=0.004)
    bottle(location=(-0.04, 0.0, 0.1), rotation_z=math.radians(10))
    linen((0.11, 0.01, 0.1), size=(0.15, 0.11, 0.024))
    d = sun((-0.55, 0.55, -0.45), energy=5.5, angle_deg=1.2, color=(1.0, 0.88, 0.74))
    screen(d, (0, 0.1, 0.15), pattern="leaves.png", distance=0.6, size=2.0, repeat=1.1)
    area((0.35, -0.5, 0.35), (0, 0, 0.15), size=1.2, energy=10)
    camera((0.0, -0.6, 0.25), (-0.01, 0.0, 0.16), lens=72, dof=0.6, fstop=5.6)
    return 1600, 2000


def _group(items, color, plinths=None):
    studio(color, key=15, sun_energy=3.2)
    for p in plinths or []:
        stone(*p)
    top = 0
    for range_key, loc, rot in items:
        if range_key == "body_mist":
            bottle(location=loc, rotation_z=rot)
            top = max(top, loc[2] + BOTTLE_TOP)
        else:
            product(range_key, loc, rot)
            top = max(top, loc[2] + product_height(range_key))
    return top


def family_body():
    top = _group([
        ("up_body_wash", (-0.105, 0.03, 0.0), 0.15),
        ("body_mist", (-0.02, -0.01, 0.0), math.radians(-8)),
        ("up_body_lotion", (0.06, 0.02, 0.0), -0.1),
        ("up_hand_cream", (0.115, -0.03, 0.0), -0.25),
        ("up_body_butter", (-0.065, -0.085, 0.0), 0.2),
        ("up_body_scrub", (0.045, -0.095, 0.0), -0.15),
    ], PALETTE["bg_body"])
    camera((0.0, -0.62, 0.24), (0.0, -0.02, 0.07), lens=60, dof=0.62, fstop=8)
    return 1600, 2000


def family_face():
    _group([
        ("up_toner", (-0.09, 0.02, 0.0), 0.1),
        ("up_cleanser", (-0.02, 0.035, 0.0), 0.0),
        ("up_sunscreen", (0.05, 0.02, 0.0), -0.15),
        ("up_serum", (0.105, -0.02, 0.0), -0.3),
        ("up_moisturiser", (-0.06, -0.085, 0.0), 0.2),
        ("up_mask", (0.03, -0.09, 0.0), -0.1),
    ], PALETTE["bg_face"])
    camera((0.0, -0.6, 0.23), (0.0, -0.02, 0.065), lens=60, dof=0.6, fstop=8)
    return 1600, 2000


def family_lip():
    _group([
        ("up_lip_treatment", (-0.016, 0.0, 0.0), 0.15),
        ("up_lip_balm", (0.018, -0.012, 0.0), -0.2),
    ], PALETTE["bg_lip"])
    camera((0.0, -0.28, 0.08), (0.0, 0.0, 0.05), lens=85, dof=0.28, fstop=5.6)
    return 1600, 2000


def lineup():
    """The whole proposed range on one long travertine shelf."""
    world(color=(0.92, 0.85, 0.78), strength=0.3)
    room(wall_color=PALETTE["plaster"], floor_color=PALETTE["sand"], wall_y=0.2)
    stone((0, 0.0, 0.0), (1.1, 0.16, 0.05))
    z = 0.05
    order = ["up_body_scrub", "up_body_wash", "up_body_lotion", "up_hand_cream", "up_body_butter", "body_mist",
             "up_toner", "up_cleanser", "up_serum", "up_sunscreen", "up_moisturiser", "up_lip_treatment", "up_lip_balm", "up_mask"]
    widths = {k: (RANGE[k][3]["r"] * 2 if k in RANGE else BOTTLE["w"]) for k in order}
    gap = 0.012
    total = sum(widths.values()) + gap * (len(order) - 1)
    x = -total / 2
    for i, k in enumerate(order):
        cx = x + widths[k] / 2
        yy = -0.01 + (0.012 if i % 2 else -0.008)
        if k == "body_mist":
            bottle(location=(cx, yy - 0.01, z), rotation_z=0.0)
        else:
            product(k, (cx, yy, z), rot=0.0)
        x += widths[k] + gap
    d = sun((0.6, 0.5, -0.45), energy=5.0, angle_deg=1.4, color=(1.0, 0.88, 0.74))
    screen(d, (0, 0.1, 0.12), pattern="leaves.png", distance=0.6, size=2.4, repeat=1.0)
    area((-0.4, -0.6, 0.35), (0, 0, 0.1), size=1.6, energy=16)
    area((0.5, -0.5, 0.2), (0, 0, 0.1), size=1.2, energy=6)
    camera((0.0, -1.32, 0.22), (0.0, 0.0, 0.1), lens=50, dof=1.32, fstop=11)
    return 2400, 1350


HANDLES = {"body_mist": "body-mist-no-01", "up_body_wash": "body-wash", "up_body_lotion": "body-lotion", "up_body_scrub": "body-scrub",
           "up_body_butter": "body-butter", "up_hand_cream": "hand-body-cream", "up_cleanser": "face-cleanser", "up_toner": "toner",
           "up_serum": "face-serum", "up_moisturiser": "moisturiser", "up_sunscreen": "sunscreen", "up_mask": "face-masks",
           "up_lip_balm": "lip-balm", "up_lip_treatment": "lip-treatment"}


def hotspots(out_js):
    """Project each product in the lineup scene into image space (percent) for the site's hotspots."""
    import json
    from bpy_extras.object_utils import world_to_camera_view
    _mats.clear()
    s = reset()
    w, h = lineup()
    s.render.resolution_x, s.render.resolution_y = w, h
    bpy.context.view_layer.update()
    cam = s.camera
    spots = []
    for ob in bpy.data.objects:
        if not ob.name.endswith("_root"):
            continue
        key = ob.name[:-5]
        rk = "body_mist" if key == "bottle" else next((k for k, v in RANGE.items() if v[0] == key), None)
        if not rk:
            continue
        height = BOTTLE_TOP if rk == "body_mist" else product_height(rk)
        p = world_to_camera_view(s, cam, ob.matrix_world.translation + Vector((0, 0, height * 0.55)))
        spots.append({"handle": HANDLES[rk], "x": round(p.x * 100, 1), "y": round((1 - p.y) * 100, 1)})
    spots.sort(key=lambda d: d["x"])
    Path(out_js).write_text(
        "// Generated by tools/render/scenes.py --hotspots — position of each product in the lineup image (% of width / height).\n"
        f"export const hotspots = {json.dumps(spots, indent=2)};\n",
        encoding="utf-8",
    )
    print("hotspots:", len(spots))


def upcoming_single(range_key):
    line = RANGE[range_key][1]
    studio(LINES[line]["bg"])
    JAR_LABEL["scale"] = 0.74  # close-up: keep the two-line wordmark within the jar's short body
    product(range_key, (0, 0, 0), rot=0.0)
    # frame by height, or by width for wide jars (product ≤ ~55% of the frame width)
    width = 2 * RANGE[range_key][3]["r"]
    frame(max(product_height(range_key), width * 1.27), fill=0.56, elev_deg=6, look_frac=0.48)
    return 1200, 1500


SCENES = {
    "hero_wide": hero_wide,
    "hero_portrait": hero_portrait,
    "pack_front": pack_front,
    "pack_angle": pack_angle,
    "pack_open": pack_open,
    "detail_label": detail_label,
    "mist": mist,
    "vanity": vanity,
    "ritual": ritual,
    "lineup": lineup,
    "family_body": family_body,
    "family_face": family_face,
    "family_lip": family_lip,
}
for _k in RANGE:
    SCENES[_k] = (lambda k: (lambda: upcoming_single(k)))(_k)


SCALE = {k: 0.85 for k in RANGE}
SCALE.update({"pack_front": 0.9, "pack_angle": 0.8, "pack_open": 0.8, "detail_label": 0.8, "mist": 0.8,
              "vanity": 0.8, "ritual": 0.8, "family_body": 0.8, "family_face": 0.8, "family_lip": 0.8})


def render(name, samples, scale, threads):
    _mats.clear()
    s = reset()
    w, h = SCENES[name]()
    scale = scale * SCALE.get(name, 1.0)
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
    ap.add_argument("scene", nargs="?", default="pack_front")
    ap.add_argument("--samples", type=int, default=96)
    ap.add_argument("--scale", type=float, default=1.0)
    ap.add_argument("--threads", type=int, default=0)
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--hotspots", help="write lineup hotspot positions to this .js file and exit")
    a = ap.parse_args()
    if a.hotspots:
        hotspots(a.hotspots)
        sys.exit()
    if a.list:
        print("\n".join(SCENES))
        sys.exit()
    names = list(SCENES) if a.scene == "all" else a.scene.split(",")
    for nm in names:
        render(nm, a.samples, a.scale, a.threads)
