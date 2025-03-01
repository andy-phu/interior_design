import fs from 'fs';
import path from 'path';
import os from 'os';
import axios from 'axios';

export const fileToGenerativePart = (path: string, mimeType: string) =>{
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(path)).toString("base64"),
        mimeType
      },
    };
}

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const isValidURL = (url: string): boolean =>{
  try {
    new URL(url);  // Will throw an error if the URL is invalid
    return true;
  } catch (_) {
    return false;
  }
}


export const reformatPrice = (priceString: string) => {
  const cleanedPrice = priceString
    .replace(/\n/g, ' ')
    .replace(/\s*-\s*/g, ' - ')
    .trim();
  const priceParts = cleanedPrice.split(' - ');
  let onePrice = priceParts[0].trim();
  if (onePrice.includes("$$")){
    // console.log("two double signs")
    onePrice = onePrice.replace("$$", "$");
  }
  return onePrice;
};

export const downloadImage = async (imageUrl: string, filePath: string) => {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(filePath, Buffer.from(response.data));
  } catch (error) {
    console.error('Error downloading image:', error);
  }
};


export const reformatName = (name: string) => {
  const formattedName = name
    .replace(/(?<!\w)(adjustable|upholstered|counter\s*height|swivel|height|backless|high\s*back)(?!\w)/gi, '') // Remove adjectives
    .replace(/(?<!\w)(counter\s*stool|bar\s*stool|counterstool|barstool)(?!\w).*/gi, '') // Remove "counter stool", "bar stool" & variations
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Add spaces between merged words (e.g., "RobbinBrook" → "Robbin Brook")
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .trim(); // Trim spaces at start/end
  return formattedName;
};

