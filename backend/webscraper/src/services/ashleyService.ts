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
            product_array.push({"name": name, "image": image, "price": price, "category": category, "product_type": product_type, "material": material, "product_link": product_link, "brand" : brand, "style": "", "description":""});
        }

        
        //go through each product with empty materials and get groups of 5 products to download their uris
        //and put them through the gemini api 
        return materialAnalyzer(product_array, product_type, material_string);
    } catch (error) {
        console.error('Error:', error);
    }
}


//splits array into smaller chunks based on the size given
function chunkArray<T>(array: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

//figure out a way to incorporate the style analyzer in this one function so you dont have to call gemini 2x the amt
//thinking abt running gemini for each product getting material and style but only updating material if the material is invalid 
export const materialAnalyzer = async (product_array: ScrapedProduct[], product_type: string, material_string: string): Promise<ScrapedProduct[]> => {
    let valid_mats: ScrapedProduct[] = product_array.filter((prod) => (prod.material != ""));
    let invalid_mats: ScrapedProduct[] = product_array.filter((prod) => prod.material == undefined);


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

        const prompt = `Choose one material that represents each ${product_type} in the image uploaded based on these options: ${material_string}. Make sure your response matches the option exactly with the correct spelling and capitalization. Each answer should be separated by a comma on one line.`;

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

    // console.log("finished getting materials from gemini");
    for (let i = 0; i < invalid_mats.length; i++){
        invalid_mats[i].material = final_materials[i];
    }

    // Return the updated product array with identified materials
    return [...valid_mats, ...invalid_mats];
};


//goes through the product array after it has all the materials from gemini and 
//have gemini give each product a style based on the style string 
export const getStyle = async (product_array: ScrapedProduct[], style_string: string): Promise<ScrapedProduct[]> =>{
    const product_type = product_array[0].product_type;
    const chunks = chunkArray(product_array, 10);
    let final_styles: string[] = [];

    for (const chunk of chunks) {
        // Extract images from the chunk
        const images: (string | undefined)[] = chunk.map((prod) => prod.image);
        const tempFiles: string[] = []; // Array to store temporary file paths
        const imageParts = [];  

        for (let i = 0; i < images.length; i++) {
            if (images[i] !== undefined)    {
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
        // console.log(`style chunk .......... starting`);
        const prompt = `Choose one style that represents each ${product_type} in the image uploaded based on these options: ${style_string}. Make sure your response matches the option exactly with the correct spelling and capitalization. Each answer should be separated by a comma on one line.`;

        const result = await model.generateContent([prompt, ...imageParts]);

        const result_arr = result.response.text().trim().split(",");


        let trimmed_styles = result_arr.map(style => style.trim());
        // console.log("trimmed_styles:",trimmed_styles);
        final_styles = final_styles.concat(trimmed_styles);

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

    for (let i = 0; i < final_styles.length; i++){
        product_array[i].style = final_styles[i];
    }

    return product_array;
}


// Generates a description for each product using Gemini AI based on the image
export const getDescription = async (product_array: ScrapedProduct[]): Promise<ScrapedProduct[]> => {
    const chunks = chunkArray(product_array, 8);  // Break the product array into chunks of 10
    let final_descriptions: string[] = [];

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
        
        console.log(`description chunk .......... starting`);
        
        const prompt = `Generate a product description for each image uploaded in one sentence. Each answer should be separated by a comma on one line. This is an example for a description: Two beige upholstered bar stools with a light wood frame`;

        const result = await model.generateContent([prompt, ...imageParts]);
        
        // Split the result into an array of descriptions
        const result_arr = result.response.text().trim().split(",");

        let trimmed_descriptions = result_arr.map(desc => desc.trim());
        console.log("descriptions:", result_arr);
        final_descriptions = final_descriptions.concat(trimmed_descriptions);

        // Clean up temporary files
        if (tempFiles.length > 0) {
            for (const tempFile of tempFiles) {
                try {
                    if (fs.existsSync(tempFile)) {
                        await fs.unlinkSync(tempFile);  // Remove the file
                    }
                } catch (error) {
                    console.error(`Error deleting temporary file: ${tempFile}`, error);
                }
            }
        }
    }
    

    // Assign the generated descriptions back to the products
    for (let i = 0; i < final_descriptions.length; i++) {
        if (final_descriptions[i] === undefined){
            console.log("description is undefined for", product_array[i]);
        }
        if (product_array[i] !== undefined){
            product_array[i].description = final_descriptions[i];
        }
        
    }   

    return product_array;
}


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
                        product_link: p.product_link
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
                        product_type: p.product_type,
                        brand: p.brand,
                        material: p.material, 
                        product_link: p.product_link,
                        style: p.style,
                        description: p.description
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