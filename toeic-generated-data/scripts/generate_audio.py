#!/usr/bin/env python3
"""
Audio Generation Script for TOEIC Tests
Uses TTS to generate MP3 files from the audio manifest
"""

import json
import os
from pathlib import Path
from typing import Dict, List

SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR.parent
AUDIO_MANIFEST_FILE = OUTPUT_DIR / "audio_manifest.json"
AUDIO_OUTPUT_DIR = OUTPUT_DIR / "audio"


def generate_audio_with_tts(manifest: Dict):
    """
    Generate audio files using TTS
    This script provides a template for TTS integration.
    You can use gTTS, edge-tts, or any other TTS service.
    """
    
    print("Audio Generation Script")
    print("=" * 50)
    print("\nNOTE: This script requires TTS library installation.")
    print("Install one of the following:")
    print("  - gTTS: pip install gtts")
    print("  - edge-tts: pip install edge-tts")
    print("\nUncomment the TTS implementation you want to use below.")
    print("=" * 50)
    
    audio_files = manifest.get("audio_files", [])
    
    # Create audio directory structure
    for audio_entry in audio_files:
        audio_url = audio_entry.get("audio_url")
        if audio_url:
            audio_path = OUTPUT_DIR / audio_url
            audio_path.parent.mkdir(parents=True, exist_ok=True)
    
    print(f"\nAudio directory structure created at: {AUDIO_OUTPUT_DIR}")
    print(f"Total audio files to generate: {len(audio_files)}")
    
    # TTS Implementation Options (uncomment one):
    
    # Option 1: Using gTTS (Google Text-to-Speech)
    """
    from gtts import gTTS
    import pygame
    
    pygame.mixer.init()
    
    for i, audio_entry in enumerate(audio_files):
        if i % 100 == 0:
            print(f"Processing {i}/{len(audio_files)}...")
        
        transcript = audio_entry.get("transcript", "")
        audio_path = OUTPUT_DIR / audio_entry.get("audio_url")
        
        if transcript and not audio_path.exists():
            try:
                tts = gTTS(text=transcript, lang='en', slow=False)
                tts.save(str(audio_path))
            except Exception as e:
                print(f"Error generating {audio_path}: {e}")
    """
    
    # Option 2: Using edge-tts (Microsoft Edge TTS)
    """
    import asyncio
    import edge_tts
    
    async def generate_audio():
        for i, audio_entry in enumerate(audio_files):
            if i % 100 == 0:
                print(f"Processing {i}/{len(audio_files)}...")
            
            transcript = audio_entry.get("transcript", "")
            audio_path = OUTPUT_DIR / audio_entry.get("audio_url")
            
            if transcript and not audio_path.exists():
                try:
                    communicate = edge_tts.Communicate(transcript, " en-US-AriaNeural")
                    await communicate.save(str(audio_path))
                except Exception as e:
                    print(f"Error generating {audio_path}: {e}")
    
    asyncio.run(generate_audio())
    """
    
    # Option 3: Using pyttsx3 (offline TTS)
    """
    import pyttsx3
    
    engine = pyttsx3.init()
    
    for i, audio_entry in enumerate(audio_files):
        if i % 100 == 0:
            print(f"Processing {i}/{len(audio_files)}...")
        
        transcript = audio_entry.get("transcript", "")
        audio_path = OUTPUT_DIR / audio_entry.get("audio_url")
        
        if transcript and not audio_path.exists():
            try:
                engine.save_to_file(transcript, str(audio_path))
                engine.runAndWait()
            except Exception as e:
                print(f"Error generating {audio_path}: {e}")
    """
    
    print("\n" + "=" * 50)
    print("To generate audio files:")
    print("1. Install a TTS library (see above)")
    print("2. Uncomment the TTS implementation in this script")
    print("3. Run: python scripts/generate_audio.py")
    print("=" * 50)


def check_audio_manifest():
    """Check if audio manifest exists and load it"""
    if not AUDIO_MANIFEST_FILE.exists():
        print(f"Error: Audio manifest not found at {AUDIO_MANIFEST_FILE}")
        print("Run generate_audio_manifest.py first.")
        return None
    
    with open(AUDIO_MANIFEST_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def main():
    """Main function"""
    manifest = check_audio_manifest()
    
    if manifest:
        generate_audio_with_tts(manifest)


if __name__ == "__main__":
    main()
