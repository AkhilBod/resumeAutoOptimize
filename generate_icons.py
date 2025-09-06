from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size):
    # Create a new image with transparent background
    image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    
    # Create gradient effect with solid colors
    # Background with gradient-like effect
    for i in range(size):
        for j in range(size):
            # Create gradient from purple to blue
            r = int(102 + (118 - 102) * i / size)  # 667eea to 764ba2
            g = int(126 + (75 - 126) * i / size)
            b = int(234 + (162 - 234) * i / size)
            draw.point((i, j), (r, g, b, 255))
    
    # Add text
    try:
        # Try to use a system font
        font_size = max(8, size // 4)
        font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
    except:
        # Fallback to default font
        font_size = max(8, size // 4)
        font = ImageFont.load_default()
    
    # Calculate text position
    text = "RT"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    
    # Draw text
    draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)
    
    # Add accent dot for larger icons
    if size >= 48:
        accent_x = int(size * 0.75)
        accent_y = int(size * 0.25)
        accent_radius = max(2, int(size * 0.08))
        draw.ellipse([accent_x - accent_radius, accent_y - accent_radius, 
                     accent_x + accent_radius, accent_y + accent_radius], 
                    fill=(255, 255, 255, 200))
    
    return image

# Create icons directory if it doesn't exist
os.makedirs('icons', exist_ok=True)

# Generate icons
sizes = [16, 48, 128]
for size in sizes:
    icon = create_icon(size)
    icon.save(f'icons/icon{size}.png', 'PNG')
    print(f'Generated icon{size}.png')

print('All icons generated successfully!')
