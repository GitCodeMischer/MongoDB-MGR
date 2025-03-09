const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const sizes = [
  16, 32, 72, 96, 128, 144, 152, 192, 384, 512
];

async function generateIcons() {
  const iconDir = path.join(process.cwd(), 'public', 'icons');
  
  try {
    // Create icons directory if it doesn't exist
    await fs.mkdir(iconDir, { recursive: true });
    
    // Read the SVG file
    const svgBuffer = await fs.readFile(path.join(process.cwd(), 'public', 'mongodb-icon.svg'));
    
    // Generate PNG icons for each size
    for (const size of sizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(iconDir, `icon-${size}x${size}.png`));
      
      console.log(`Generated ${size}x${size} icon`);
    }
    
    // Generate favicon.ico (16x16 PNG)
    await sharp(svgBuffer)
      .resize(16, 16)
      .png()
      .toFile(path.join(iconDir, 'favicon.png'));
    
    // Copy the 16x16 PNG to favicon.ico
    await fs.copyFile(
      path.join(iconDir, 'favicon.png'),
      path.join(iconDir, 'favicon.ico')
    );
    
    // Clean up temporary favicon PNG
    await fs.unlink(path.join(iconDir, 'favicon.png'));
    
    console.log('Generated favicon.ico');
    
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons(); 