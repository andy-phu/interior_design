import fs from 'fs';
import path from 'path';
import os from 'os';
import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ScrapedProduct } from '../types/types.js';
import { fileToGenerativePart, downloadImage } from '../utils/helpers.js';

const gemini = process.env.GEMINI || "";

export const materialAnalyzer = async (product_array: ScrapedProduct[]): Promise<ScrapedProduct[]> => {
    let valid_mats: ScrapedProduct[] = product_array.filter((prod) => (prod.material != ""));
    let invalid_mats: ScrapedProduct[] = product_array.filter((prod) => prod.material === "");

    function chunkArray<T>(array: T[], size: number): T[][] {
        const result: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    }

    // Chunk invalid_mats into groups of 5
    const chunks = chunkArray(invalid_mats, 5);
    let final_materials: string[] = [];
    // Process each chunk
    for (const chunk of chunks) {
        // Extract images from the chunk
        const images: (string | undefined)[] = chunk.map((prod) => prod.image);
        const tempFiles: string[] = []; // Array to store temporary file paths
        const imageParts = [];  

        for (let i = 0; i < images.length; i++) {
            if (images[i] !== undefined) {
                const tempFilePath = path.join(os.tmpdir(), `temp_image_${i}.webp`);
                const imagePath = images[i] ?? "";
                await downloadImage(imagePath, tempFilePath); // Replace with actual download logic
                tempFiles.push(tempFilePath);
                
                // Converts local file information to a GoogleGenerativeAI.Part object.
                imageParts.push(fileToGenerativePart(tempFilePath, "image/webp"));
            }
        }
        const genAI = new GoogleGenerativeAI(gemini);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "Choose one material that represents each sofa in the image uploaded based on these options: Fabric, Chenille, Faux Leather, Velvet, Performance Fabric. Make sure you response matches the option exactly with the correct spelling and capitalization. Each answer should be separated by a comma on one line.";

        const result = await model.generateContent([prompt, ...imageParts]);

        const result_arr = result.response.text().trim().split(",");
        
        let trimmedMaterials = result_arr.map(material => material.trim());
        final_materials = final_materials.concat(trimmedMaterials);

        // Clean up temporary files (optional)
        if (tempFiles.length > 0) {
            for (const tempFile of tempFiles) {
                try {
                    // Check if the file exists before attempting to delete it
                    if (fs.existsSync(tempFile)) {
                        await fs.unlinkSync(tempFile);  // Remove the file
                    }
                } catch (error) {
                    console.error(`Error deleting temporary file: ${tempFile}`, error);
                }
            }
        }
    }

    for (let i = 0; i < invalid_mats.length; i++){
        invalid_mats[i].material = final_materials[i];
    }

    // Return the updated product array with identified materials
    return [...valid_mats, ...invalid_mats];
};