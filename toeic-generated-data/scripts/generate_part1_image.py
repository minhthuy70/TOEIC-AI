#!/usr/bin/env python3
"""
Generate ONE Part 1 TOEIC image using Stable Diffusion 1.5.

Optimized for:
- NVIDIA RTX 4050 Laptop 6GB VRAM
- Python 3.11
- PyTorch CUDA
- Stable Diffusion 1.5

Features:
- Reads prompt directly from part1_images_manifest.json
- Generates realistic TOEIC-style photograph
- Strong negative prompt
- Fixed landscape composition
- Avoids extra people when possible
- Uses CUDA FP16
- Does NOT overwrite existing image unless --force is used
- Supports --index
"""

import argparse
import json
import os
import random
import sys
from pathlib import Path

import torch
from diffusers import StableDiffusionPipeline
from PIL import Image


# ============================================================
# PATHS
# ============================================================

SCRIPT_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = SCRIPT_DIR.parent

MANIFEST_FILE = OUTPUT_DIR / "part1_images_manifest.json"

MODEL_ID = "runwayml/stable-diffusion-v1-5"


# ============================================================
# SETTINGS
# ============================================================

# RTX 4050 6GB:
# 512x384 is much safer than 768x512 with SD 1.5.
WIDTH = 512
HEIGHT = 384

NUM_STEPS = 35

GUIDANCE_SCALE = 7.0

# Keep seed fixed while testing so you can compare results.
DEFAULT_SEED = 12345


# ============================================================
# NEGATIVE PROMPT
# ============================================================

NEGATIVE_PROMPT = """
cartoon,
anime,
illustration,
painting,
drawing,
3d render,
cgi,
digital art,
fantasy,
surreal,

deformed,
distorted,
bad anatomy,
incorrect anatomy,
extra limbs,
extra arms,
extra hands,
extra fingers,
missing fingers,
fused fingers,
duplicate person,
multiple identical people,
cloned person,
duplicate body,
extra head,
extra face,
two heads,
three heads,

bad hands,
deformed hands,
malformed hands,
mutated hands,
long fingers,
extra fingers,

deformed face,
bad face,
asymmetrical face,
distorted face,
duplicate face,

blurry,
low quality,
low resolution,
pixelated,
jpeg artifacts,
oversharpened,

text,
letters,
words,
caption,
subtitle,
answer choices,
sign,
logo,
brand,
watermark,
signature,

camera distortion,
fisheye,
extreme perspective,
extreme wide angle,
dramatic cinematic lighting,
dark shadows,
overexposed,
underexposed,

crowded scene,
unnecessary people,
background people,
people in background,

cropped person,
cut off body,
cut off head,
cut off hands,

NSFW,
nudity
"""


# ============================================================
# LOAD MANIFEST
# ============================================================

def load_manifest():
    if not MANIFEST_FILE.exists():
        print(f"[ERROR] Không tìm thấy manifest:")
        print(MANIFEST_FILE)
        sys.exit(1)

    with open(MANIFEST_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


# ============================================================
# GET IMAGE ENTRY
# ============================================================

def get_image_entry(manifest, index):
    images = manifest.get("images", [])

    if not images:
        print("[ERROR] Manifest không có images.")
        sys.exit(1)

    if index < 1 or index > len(images):
        print(
            f"[ERROR] --index phải nằm trong khoảng "
            f"1 -> {len(images)}"
        )
        sys.exit(1)

    return images[index - 1]


# ============================================================
# BUILD PROMPT
# ============================================================

def build_prompt(entry):
    scene = entry.get("scene_description", "")
    correct_answer = entry.get("correct_option_text", "")
    original_prompt = entry.get("image_prompt", "")

    # Prompt ưu tiên nội dung cụ thể từ question JSON.
    prompt = f"""
A realistic TOEIC Listening Part 1 photograph.

The photograph shows EXACTLY this situation:

{scene}

The main action must clearly communicate:

{correct_answer}

IMPORTANT COMPOSITION:
- One clear main subject.
- The main subject performs the described action.
- Keep the main subject fully visible.
- Show the relevant object clearly.
- Medium camera distance.
- Natural eye-level camera angle.
- Normal realistic perspective.
- Simple uncluttered background.
- No unnecessary people.
- No unusual camera angle.
- No overhead camera.
- No extreme close-up.
- No fisheye lens.
- No dramatic cinematic composition.

PHOTOGRAPH STYLE:
- Photorealistic.
- Looks like a professional TOEIC Part 1 test photograph.
- Natural indoor lighting.
- Realistic human proportions.
- Realistic skin.
- Realistic clothing.
- Realistic hands.
- Realistic facial features.
- Sharp subject.
- Natural colors.
- Documentary photography.
- 35mm photography.
- Clean composition.

The image must make the correct answer obvious from the photograph.

DO NOT add text, captions, subtitles, logos, watermarks, signs,
answer choices, or any written information.

Original scene information:
{original_prompt}
"""

    return " ".join(prompt.split())


# ============================================================
# LOAD MODEL
# ============================================================

def load_model():
    print("=" * 70)
    print("LOADING IMAGE GENERATION MODEL")
    print("=" * 70)

    if not torch.cuda.is_available():
        print("[ERROR] CUDA không khả dụng.")
        print()
        print("Hãy kiểm tra:")
        print("  python -c \"import torch; print(torch.cuda.is_available())\"")
        sys.exit(1)

    device = "cuda"

    print(f"Device: {device}")
    print(f"GPU: {torch.cuda.get_device_name(0)}")
    print(f"CUDA: {torch.version.cuda}")
    print()

    # Clear GPU memory
    torch.cuda.empty_cache()

    print("Loading Stable Diffusion 1.5...")
    print("Nếu chạy lần đầu, model sẽ được tải về cache.")
    print()

    pipe = StableDiffusionPipeline.from_pretrained(
        MODEL_ID,
        torch_dtype=torch.float16,
        safety_checker=None,
        requires_safety_checker=False,
    )

    # Memory optimization for 6GB VRAM
    pipe.enable_attention_slicing()

    try:
        pipe.enable_xformers_memory_efficient_attention()
        print("[OK] xFormers attention enabled.")
    except Exception:
        print("[INFO] xFormers không khả dụng, dùng attention slicing.")

    pipe = pipe.to(device)

    # Prevent unnecessary CPU/GPU copies
    pipe.enable_vae_slicing()

    print("[OK] Model loaded.")
    print()

    return pipe


# ============================================================
# GENERATE IMAGE
# ============================================================

def generate_image(pipe, entry, force=False, seed=DEFAULT_SEED):
    image_url = entry.get("image_url")

    if not image_url:
        print("[ERROR] Entry không có image_url.")
        sys.exit(1)

    output_path = OUTPUT_DIR / image_url

    output_path.parent.mkdir(parents=True, exist_ok=True)

    # ========================================================
    # DO NOT OVERWRITE
    # ========================================================

    if output_path.exists() and not force:
        print("[SKIP] File đã tồn tại:")
        print(output_path)
        print()
        print("Nếu muốn tạo lại:")
        print(f"python .\\toeic-generated-data\\scripts\\generate_part1_image.py --index {entry.get('question_id', 1)} --force")
        return

    prompt = build_prompt(entry)

    print("=" * 70)
    print("GENERATING IMAGE")
    print("=" * 70)

    print(f"Test:       {entry.get('test_id')}")
    print(f"Question:   {entry.get('question_id')}")
    print(f"Scene:      {entry.get('scene_description')}")
    print(f"Answer:     {entry.get('correct_option_text')}")
    print(f"Output:     {output_path}")
    print(f"Resolution: {WIDTH}x{HEIGHT}")
    print(f"Steps:      {NUM_STEPS}")
    print(f"CFG:        {GUIDANCE_SCALE}")
    print(f"Seed:       {seed}")
    print()

    print("Prompt:")
    print(prompt)
    print()

    # Fixed seed
    generator = torch.Generator(device="cuda").manual_seed(seed)

    try:
        with torch.inference_mode():

            result = pipe(
                prompt=prompt,
                negative_prompt=NEGATIVE_PROMPT,
                width=WIDTH,
                height=HEIGHT,
                num_inference_steps=NUM_STEPS,
                guidance_scale=GUIDANCE_SCALE,
                generator=generator,
            )

        image = result.images[0]

        # ====================================================
        # SAVE
        # ====================================================

        image.save(
            output_path,
            format="JPEG",
            quality=95,
            optimize=True,
        )

        print()
        print("=" * 70)
        print("[SUCCESS]")
        print("=" * 70)
        print(f"Saved: {output_path}")
        print(f"Size:  {image.size}")
        print()

    except torch.cuda.OutOfMemoryError:
        print()
        print("=" * 70)
        print("[ERROR] CUDA OUT OF MEMORY")
        print("=" * 70)
        print()
        print("RTX 4050 6GB không đủ VRAM cho cấu hình hiện tại.")
        print("Thử giảm WIDTH/HEIGHT xuống:")
        print()
        print("WIDTH = 448")
        print("HEIGHT = 336")
        print()
        print("Sau đó chạy lại.")
        print()

        torch.cuda.empty_cache()

    except Exception as e:
        print()
        print("=" * 70)
        print("[ERROR]")
        print("=" * 70)
        print(str(e))
        print()

        torch.cuda.empty_cache()


# ============================================================
# MAIN
# ============================================================

def main():
    parser = argparse.ArgumentParser(
        description="Generate TOEIC Part 1 image"
    )

    parser.add_argument(
        "--index",
        type=int,
        required=True,
        help="Image index in manifest (1-based)",
    )

    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing image",
    )

    parser.add_argument(
        "--seed",
        type=int,
        default=DEFAULT_SEED,
        help="Random seed",
    )

    args = parser.parse_args()

    print()
    print("=" * 70)
    print("TOEIC PART 1 IMAGE GENERATOR")
    print("=" * 70)
    print()

    manifest = load_manifest()

    entry = get_image_entry(
        manifest,
        args.index,
    )

    pipe = load_model()

    generate_image(
        pipe,
        entry,
        force=args.force,
        seed=args.seed,
    )


if __name__ == "__main__":
    main()