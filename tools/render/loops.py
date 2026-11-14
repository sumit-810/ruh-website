"""Seamless "living still life" loops, rendered locally from the scenes in scenes.py.

Only the window light moves: the leaf screen that throws the shadow pattern
drifts and sways on a closed path, so the last frame flows into the first.
The packaging, camera and set stay perfectly still (a cinemagraph), and the
label artwork is the same typeset texture used for the stills.

Usage (with the `bpy` module installed, e.g. `pip install bpy==5.2.3`):

    python tools/render/loops.py --list
    python tools/render/loops.py hero_wide --frames 48 --samples 48 --scale 0.4
    python tools/render/loops.py hero_wide --frames 48 --start 0 --end 24   # split across processes

Frames are written to tools/render/out/loops/<name>/0000.png and encoded with
tools/encode_loops.mjs (ffmpeg). Nothing here uses a network service.
"""
import argparse
import math
import sys
from pathlib import Path

import bpy

sys.path.insert(0, str(Path(__file__).parent))
import scenes  # noqa: E402

OUT = Path(__file__).parent / "out" / "loops"

# name: (scene function in scenes.py, sway amplitude in screen UV, flutter amplitude[, light breathing, sway rotation in degrees])
# The hero loops move more (and the sunlight breathes, like a passing cloud) so the motion is
# noticeable at full-screen size; the smaller panels keep a quieter drift.
LOOPS = {
    "hero_wide": ("hero_wide", 0.05, 0.012, 0.12, 2.2),
    "hero_portrait": ("hero_portrait", 0.05, 0.012, 0.12, 2.2),
    "family_body": ("family_body", 0.026, 0.005),
    "family_face": ("family_face", 0.026, 0.005),
    "family_lip": ("family_lip", 0.026, 0.005),
}

# Loop sizes (pixels). Panels and the portrait hero are tall; the wide hero is 16:9.
SIZES = {
    "hero_wide": (1280, 720),
    "hero_portrait": (720, 900),
    "family_body": (720, 900),
    "family_face": (720, 900),
    "family_lip": (720, 900),
}


def screen_mappings():
    """The Mapping nodes of every leaf screen in the scene."""
    maps = []
    for ob in bpy.data.objects:
        if not ob.name.startswith("screen") or not ob.data or not ob.data.materials:
            continue
        for node in ob.data.materials[0].node_tree.nodes:
            if node.type == "MAPPING":
                maps.append((node, tuple(node.inputs["Location"].default_value), node.inputs["Rotation"].default_value[2]))
    return maps


def sway(t, amp, flutter, rot_deg=0.9):
    """Closed path for loop phase t in [0, 1): integer harmonics only, so f(0) == f(1)."""
    tau = 2 * math.pi
    dx = amp * math.sin(tau * t) + flutter * math.sin(tau * 3 * t + 0.7)
    dy = 0.45 * amp * math.sin(tau * 2 * t + 1.1) + 0.6 * flutter * math.sin(tau * 5 * t + 0.3)
    rot = math.radians(rot_deg) * math.sin(tau * t + 0.4)
    return dx, dy, rot


def breathe(t, depth):
    """Sunlight strength factor: one slow swell per loop, starting at the still's level (1.0 at t=0)."""
    return 1 + depth * math.sin(2 * math.pi * t)


def suns():
    return [(li, li.energy) for li in bpy.data.lights if li.type == "SUN"]


def render_loop(name, frames, samples, scale, start, end):
    fn, amp, flutter, *rest = LOOPS[name]
    depth = rest[0] if rest else 0.0
    rot_deg = rest[1] if len(rest) > 1 else 0.9
    scenes._mats.clear()
    s = scenes.reset()
    scenes.SCENES[fn]()
    w, h = SIZES[name]
    s.render.resolution_x = int(w * scale)
    s.render.resolution_y = int(h * scale)
    s.render.resolution_percentage = 100
    s.cycles.samples = samples
    s.cycles.adaptive_threshold = 0.03
    s.render.use_persistent_data = True  # geometry stays put; only a texture offset changes per frame
    s.render.image_settings.color_depth = "8"
    maps = screen_mappings()
    if not maps:
        raise SystemExit(f"{name}: no leaf screen found")
    lights = suns()
    out = OUT / name
    out.mkdir(parents=True, exist_ok=True)
    for f in range(start, min(end, frames)):
        dx, dy, rot = sway(f / frames, amp, flutter, rot_deg)
        for node, (lx, ly, lz), r0 in maps:
            node.inputs["Location"].default_value = (lx + dx, ly + dy, lz)
            node.inputs["Rotation"].default_value[2] = r0 + rot
        for li, e0 in lights:
            li.energy = e0 * breathe(f / frames, depth)
        s.render.filepath = str(out / f"{f:04d}.png")
        bpy.ops.render.render(write_still=True)
        print(f"{name} {f + 1}/{frames}", flush=True)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("name", nargs="?")
    ap.add_argument("--frames", type=int, default=48)
    ap.add_argument("--samples", type=int, default=48)
    ap.add_argument("--scale", type=float, default=1.0)
    ap.add_argument("--start", type=int, default=0)
    ap.add_argument("--end", type=int, default=10**6)
    ap.add_argument("--list", action="store_true")
    a = ap.parse_args()
    if a.list or not a.name:
        print("\n".join(LOOPS))
        sys.exit()
    render_loop(a.name, a.frames, a.samples, a.scale, a.start, a.end)
