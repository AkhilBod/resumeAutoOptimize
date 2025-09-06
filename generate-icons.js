const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    
    // Background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Add text
    ctx.fillStyle = 'white';
    ctx.font = `bold ${Math.floor(size * 0.3)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RT', size/2, size/2);
    
    // Add accent for larger icons
    if (size >= 48) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(size * 0.75, size * 0.25, size * 0.08, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    return canvas;
}

// Generate icons
const sizes = [16, 48, 128];
sizes.forEach(size => {
    const canvas = createIcon(size);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`icons/icon${size}.png`, buffer);
    console.log(`Generated icon${size}.png`);
});

console.log('All icons generated successfully!');
