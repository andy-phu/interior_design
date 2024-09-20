import fs from 'fs';
import path from 'path';
import os from 'os';
import axios from 'axios';

export const reformatPrice = (priceString: string) => {
  const cleanedPrice = priceString
    .replace(/\n/g, ' ')
    .replace(/\s*-\s*/g, ' - ')
    .trim();
  return cleanedPrice;
};

export const downloadImage = async (imageUrl: string, filePath: string) => {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(filePath, Buffer.from(response.data));
  } catch (error) {
    console.error('Error downloading image:', error);
  }
};