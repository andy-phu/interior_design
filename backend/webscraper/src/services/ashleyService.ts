import fs from 'fs';
import path from 'path';
import os from 'os';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ScrapedProduct } from '../types/types.js';
import { isValidURL, reformatPrice, fileToGenerativePart, downloadImage } from '../utils/helpers.js';
import * as cheerio from 'cheerio';
import prisma from '../prisma/prisma.js';
import axios from 'axios';
import { createLogger, transports, format } from 'winston';
import { fileURLToPath } from 'url';

// Manually define __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gemini = process.env.GEMINI || "";

const logger = createLogger({
    level: 'info', // Set the logging level
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add timestamp
      format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message}`;
      })
    ),
    transports: [
      new transports.File({ filename: path.join(__dirname, 'app.log') }), // Log to a file
      new transports.Console() // Optionally log to console too
    ]
});



export const parseHTMLFile = async (filePath: string, product_type: string, category: string, material_list: string[], material_string: string) =>{
    try {
        // Read the HTML file

        const html = fs.readFileSync(filePath, 'utf8');

        
        // Load the HTML content into Cheerio
        const $ = cheerio.load(html);
        
        // Extract data using Cheerio
        let product_array:ScrapedProduct[] = [];
        
        const myMap = new Map();

        // grid-tile-new-row 2 normal grid-tiles 
        // get the colors from this 
        $('.grid-tile').each((i, elem) => {
            const color = $(elem).attr('data-colors-to-show');
            const name = $(elem).attr('data-cnstrc-item-name');
            myMap.set(name, color);
        });

        $('.grid-tile new-row').each((i, elem) => {
            const color = $(elem).attr('data-colors-to-show');
            const name = $(elem).attr('data-cnstrc-item-name');
            myMap.set(name, color);
        });



        const productTiles = $('.product-tile').toArray();  // Convert jQuery object to array
        
        for (let elem of productTiles) {
            // Extract product name
            const name = $(elem).find('.product-name h3 a.name-link').text().trim();
            const product_link = $(elem).find('.product-name h3 a.name-link').attr('href') || "";
            const image = $(elem).find('img.alternate-image').attr('src') || "";
        
            let price: string = $(elem).find('.sale-price').text().trim();
            // console.log(`price test: ${name} : ${price}`);
            if (price === "") {
                price = $(elem).find('.kit-price-info').text().trim();
                if (price === ""){
                    price = $(elem).find('.product-sales-price').text().trim();
                }

                if (price === ""){
                    price = "0";
                }
            } else if (price.includes("-")) {
                price = reformatPrice(price);
            }

            let material: string = "";
            const brand: string = "Ashley";

            const description = $(elem).find('.thumb-link').attr('data-gtmdata');
            
            if (description != null) {
                const descriptionObject = JSON.parse(description);
                const name = descriptionObject.name;
        
                const dimension35 = descriptionObject.dimension35;
                let dimension38: string = descriptionObject.dimension38;

                
                const dimension47 = descriptionObject.dimension47;
        
                if (myMap.get(name) == "") {
                    myMap.set(name, dimension35);
                }
                

                // Check if the name has one of these materials in it
                for (let mat of material_list) {
                    if (name.includes(mat)) {
                        // console.log("Name that contains mat:", name);
                        material = mat;
                    }
                }
                
                if (material == "") {
                    // Check if the dimension 38 has more than one material listed, if so get the first one
                    let dim38_multiple_materials: string[] = [];
        
                    if (dimension38?.includes(",")) {
                        dim38_multiple_materials = dimension38.split(",");
                        dimension38 = dim38_multiple_materials[0];
                    }

                    if (dimension38?.includes("and")) {
                      dim38_multiple_materials = dimension38.split(" ");
                      dimension38 = dim38_multiple_materials[0];
                    }
        
                    if (dimension47 != "" && dimension38 != "" && material_list.includes(dimension47)) {
                        material = dimension47;
                    } else if (dimension47 != "" && dimension38 != "" && !material_list.includes(dimension47)) {
                        material = dimension38;
                    } else if (dimension47 == "" && dimension38 != "") {
                        material = dimension38;
                    } else {
                        // Use Gemini API to identify the material
                        // counter += 1;
                        material = "";
                        console.log(`Use Gemini API for the ${product_type} ${name}`);
                    }
                }
            }
        
            
            //make objects even if the materials are empty
            product_array.push({"name": name, "image": image, "price": price, "category": category, "productType": product_type, "material": material, "productLink": product_link, "brand" : brand});
        }

        
        //go through each product with empty materials and get groups of 5 products to download their uris
        //and put them through the gemini api 
        return materialAnalyzer(product_array, product_type, material_string);
    } catch (error) {
        console.error('Error:', error);
    }
}



export const materialAnalyzer = async (product_array: ScrapedProduct[], product_type: string, material_string: string): Promise<ScrapedProduct[]> => {
    let valid_mats: ScrapedProduct[] = product_array.filter((prod) => (prod.material != ""));
    let invalid_mats: ScrapedProduct[] = product_array.filter((prod) => prod.material == undefined);

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

        const prompt = `Choose one material that represents each ${product_type} in the image uploaded based on these options: ${material_string}. Make sure you response matches the option exactly with the correct spelling and capitalization. Each answer should be separated by a comma on one line.`;

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


export const addToDB = async (product_array: ScrapedProduct[]) => {
    try {
        for (let p of product_array) {
            const existing = await prisma.product.findUnique({
                where: { name: p.name }
            });

            if (existing && existing.price === "0" && p.price != "0"){
                logger.info(`updating ${existing.name} with a new price ${existing.price}`);
                await prisma.product.update({
                    where: { name: existing.name },  // Identify the row to update by ID
                    data: {
                        price: p.price,             // Update specific fields (e.g., price)
                        image: p.image,             // Optionally update other fields
                        material: p.material,       // Update material, etc.
                        productLink: p.productLink
                    }
                });
            }
            else if (!existing){
                await prisma.product.create({
                    data: {
                        name: p.name,
                        image: p.image, 
                        price: p.price, 
                        category: p.category,
                        productType: p.productType,
                        brand: p.brand,
                        material: p.material, 
                        productLink: p.productLink 
                    }
                });
            }else{
                console.log(`The ${p.name} already exists in the db, thus was not added`);
            }

        }
        return { success: true};
    } catch (error) {
        return { success: false, error: error };
    }
}