import sharp from 'sharp';

export async function addWatermark(inputBuffer, text){
  const svg = `
    <svg width="100%" height="100%">
      <text x="50%" y="50%"
        font-size="36"
        fill="rgba(255,0,0,0.4)"
        text-anchor="middle"
        dominant-baseline="middle"
        transform="rotate(-30, 200, 200)">
        ${text}
      </text>
    </svg>
  `;
  return sharp(inputBuffer)
    .composite([{ input: Buffer.from(svg), gravity: 'center' }])
    .png()
    .toBuffer();
}
