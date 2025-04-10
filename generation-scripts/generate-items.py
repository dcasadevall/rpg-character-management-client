import openai
import json
import time
import os
import requests

# Set up OpenAI client
client = openai.OpenAI(api_key="OPEN_API_KEY")

# Load your items
with open('seed-data.json', 'r') as f:
    data = json.load(f)

items = data['items']

# Make a directory to save images
os.makedirs('generated-images', exist_ok=True)

# Helper to create a good prompt
def create_prompt(item_name, equipment_type):
    return f"A detailed fantasy RPG {equipment_type.lower()} called '{item_name}', isolated on a white background, realistic painting style. No violence or blood. Just the icon of the item."

# Generate images
for item in items:
    name = item['name']
    item_id = item['id']
    equipment_type = item['equipmentType']
    prompt = create_prompt(name, equipment_type)

    print(f"Generating image for: {name}")

    response = client.images.generate(
        model="dall-e-3",
        prompt=prompt,
        size="1024x1024",
        n=1,
        quality="standard"
    )

    # Image url
    image_url = response.data[0].url
    print(f"{item_id}-{name}: {image_url}")

    # Create a safe filename
    safe_name = name.replace(' ', '_').replace('/', '_')
    filename = f"generated-images/{item_id}-{safe_name}.png"

    # Download the image
    img_data = requests.get(image_url).content
    with open(filename, 'wb') as handler:
        handler.write(img_data)

    time.sleep(1)  # avoid hitting the rate limits

