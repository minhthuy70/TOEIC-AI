#!/usr/bin/env python3
"""
Part 1 Images Generation Script for TOEIC Tests
Uses AI image generation to create images from the manifest
"""

import json
import os
from pathlib import Path
from typing import Dict, List

SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR.parent
IMAGES_MANIFEST_FILE = OUTPUT_DIR / "part1_images_manifest.json"
IMAGES_OUTPUT_DIR = OUTPUT_DIR / "images"


def generate_images_with_ai(manifest: Dict):
    """
    Generate images using AI image generation
    This script provides a template for AI image generation integration.
    You can use DALL-E, Stable Diffusion, Midjourney, or any other AI image service.
    """
    
    print("Part 1 Images Generation Script")
    print("=" * 50)
    print("\nNOTE: This script requires AI image generation API access.")
    print("Options for AI image generation:")
    print("  - OpenAI DALL-E API: pip install openai")
    print("  - Stable Diffusion: pip install diffusers")
    print("  - Replicate API: pip install replicate")
    print("\nUncomment the AI implementation you want to use below.")
    print("=" * 50)
    
    images = manifest.get("images", [])
    
    # Create images directory structure
    for image_entry in images:
        image_url = image_entry.get("image_url")
        if image_url:
            image_path = OUTPUT_DIR / image_url
            image_path.parent.mkdir(parents=True, exist_ok=True)
    
    print(f"\nImages directory structure created at: {IMAGES_OUTPUT_DIR}")
    print(f"Total images to generate: {len(images)}")
    
    # AI Image Generation Options (uncomment one):
    
    # Option 1: Using OpenAI DALL-E
    """
    from openai import OpenAI
    import requests
    
    client = OpenAI(api_key="your-openai-api-key")
    
    for i, image_entry in enumerate(images):
        if i % 50 == 0:
            print(f"Processing {i}/{len(images)}...")
        
        prompt = image_entry.get("image_prompt", "")
        image_path = OUTPUT_DIR / image_entry.get("image_url")
        
        if prompt and not image_path.exists():
            try:
                response = client.images.generate(
                    model="dall-e-3",
                    prompt=prompt,
                    size="1024x1024",
                    quality="standard",
                    n=1,
                )
                
                image_url = response.data[0].url
                img_response = requests.get(image_url)
                
                with open(image_path, 'wb') as f:
                    f.write(img_response.content)
                    
            except Exception as e:
                print(f"Error generating {image_path}: {e}")
    """
    
    # Option 2: Using Stable Diffusion (local)
    """
    from diffusers import StableDiffusionPipeline
    import torch
    
    pipe = StableDiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5")
    pipe = pipe.to("cuda")
    
    for i, image_entry in enumerate(images):
        if i % 50 == 0:
            print(f"Processing {i}/{len(images)}...")
        
        prompt = image_entry.get("image_prompt", "")
        image_path = OUTPUT_DIR / image_entry.get("image_url")
        
        if prompt and not image_path.exists():
            try:
                image = pipe(prompt).images[0]
                image.save(str(image_path))
            except Exception as e:
                print(f"Error generating {image_path}: {e}")
    """
    
    # Option 3: Using Replicate API
    """
    import replicate
    
    os.environ["REPLICATE_API_TOKEN"] = "your-replicate-api-token"
    
    for i, image_entry in enumerate(images):
        if i % 50 == 0:
            print(f"Processing {i}/{len(images)}...")
        
        prompt = image_entry.get("image_prompt", "")
        image_path = OUTPUT_DIR / image_entry.get("image_url")
        
        if prompt and not image_path.exists():
            try:
                output = replicate.run(
                    "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
                    input={"prompt": prompt}
                )
                
                import requests
                img_response = requests.get(output)
                
                with open(image_path, 'wb') as f:
                    f.write(img_response.content)
                    
            except Exception as e:
                print(f"Error generating {image_path}: {e}")
    """
    
    print("\n" + "=" * 50)
    print("To generate Part 1 images:")
    print("1. Set up an AI image generation service (see above)")
    print("2. Add your API key or configure local model")
    print("3. Uncomment the AI implementation in this script")
    print("4. Run: python scripts/generate_part1_images.py")
    print("=" * 50)


def check_images_manifest():
    """Check if images manifest exists and load it"""
    if not IMAGES_MANIFEST_FILE.exists():
        print(f"Error: Images manifest not found at {IMAGES_MANIFEST_FILE}")
        print("Run generate_part1_images_manifest.py first.")
        return None
    
    with open(IMAGES_MANIFEST_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def main():
    """Main function"""
    manifest = check_images_manifest()
    
    if manifest:
        generate_images_with_ai(manifest)


if __name__ == "__main__":
    main()
