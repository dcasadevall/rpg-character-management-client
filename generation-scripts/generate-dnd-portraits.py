import openai
import base64
import os

# === STEP 1: Set your API key here ===
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set.")
client = openai.OpenAI(api_key=openai_api_key)

# === STEP 2: Define all Race/Subrace/Class combinations ===
races = {
    "Dwarf": ["Hill", "Mountain"],
    "Elf": ["High", "Wood", "Drow"],
    "Halfling": ["Lightfoot", "Stout"],
    "Human": [None],
    "Dragonborn": [None],
    "Gnome": ["Forest", "Rock", "Deep"],
    "Half-Elf": [None],
    "Half-Orc": [None],
    "Tiefling": [None],
}

classes = [
    "Cleric", "Fighter", "Rogue", "Wizard", "Barbarian", "Bard",
    "Druid", "Monk", "Paladin", "Ranger", "Sorcerer", "Warlock"
]

# === STEP 3: Directory to save images ===
output_dir = "character_selection_images"
os.makedirs(output_dir, exist_ok=True)

# === STEP 4: Start generating images ===
for race, subraces in races.items():
    for subrace in subraces:
        for class_name in classes:
            # Prepare filename
            if subrace:
                filename = f"{race}-{subrace}-{class_name}.png"
            else:
                filename = f"{race}-{class_name}.png"
            filepath = os.path.join(output_dir, filename)

            # Prepare prompt
            prompt = (
                f"A full-body fantasy character portrait of a {race}. no other chatacter should be in the image. "
                + (f" ({subrace} subrace)" if subrace else "")
                + f" as a {class_name}. "
                "Standing upright in an idle pose, facing slightly sideways. "
                "Full body visible from head to feet, no parts cropped. "
                f"Wearing traditional {class_name.lower()} gear and holding appropriate class weapons. "
                "Set in a detailed fantasy background appropriate for the character's race and class, such as mountains, forests, battlefields, libraries, or mystical places. "
                "Serious, realistic fantasy style. 1024x1024 resolution."
            )


            print(f"Generating {filename}...")

            try:
                # NEW API call
                response = client.images.generate(
                    model="dall-e-3",
                    prompt=prompt,
                    size="1024x1024",
                    quality="standard",
                    n=1,
                    response_format="b64_json"
                )

                image_data = response.data[0].b64_json

                # Save image
                with open(filepath, "wb") as f:
                    f.write(base64.b64decode(image_data))

                print(f"Saved {filename}")

            except Exception as e:
                print(f"Failed to generate {filename}: {e}")

print("✅ Done generating all character images!")

