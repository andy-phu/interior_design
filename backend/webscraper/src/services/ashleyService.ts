import fs from 'fs';
import path from 'path';
import os from 'os';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ScrapedProduct } from '../types/types.js';
import { isValidURL, reformatPrice, fileToGenerativePart, downloadImage } from '../utils/helpers.js';
import * as cheerio from 'cheerio';
import prisma from '../prisma/prisma.js';
import axios from 'axios';

const gemini = process.env.GEMINI || "";





export const scrapePage = async (url: string) =>{

    if (!isValidURL(url)){
        return false;
    }
    const options = {
        method: 'POST',
        url: 'https://scrapeninja.p.rapidapi.com/scrape-js',
        headers: {
          'x-rapidapi-key': '3406cf51b5mshba278aa6fac79b7p1bedc0jsn58a074047b14',
          'x-rapidapi-host': 'scrapeninja.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        data: {
            url: url,
            method: 'GET',
            retryNum: 1,
            geo: 'us',
            js: true,
            blockImages: false,
            blockMedia: false,
            viewport: {
              width: 353,
              height: 745,
              deviceScaleFactor: 3,
              isMobile: true,
              hasTouch: true,
              isLandscape: false
            },
            waitForSelector: '.sale-price'
        }
    };

    try {
        const response = await axios.request(options);
        let resJson = await response.data;

        // Basic error handling. Modify if neccessary
        if (!resJson.info || ![200, 404].includes(resJson.info.statusCode)) {
            throw new Error(JSON.stringify(resJson));
        }
      
        console.log('target website response status: ', resJson.info.statusCode);
        console.log('target website response body: ', resJson.body);

        console.log(response.data);
        const filePath = 'src/html_files/ashley_couches/couch_page_1.html'; // Change this to your desired file path

        // Write the content to the file, overwriting it each time
        fs.writeFileSync(filePath, resJson.body, 'utf8'); // Use 'utf8' encoding
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }


}

// export const scrapeAllCouches = async () =>{
//     const base_url: string = 'https://www.ashleyfurniture.com/c/furniture/living-room/sofas/'
//     // https://www.ashleyfurniture.com/c/furniture/living-room/sofas/?start=48&sz=48
//     for(let i = 1; i < 7; i++){
//         let multi: Number = i * 48;
//         const new_url: string = `${base_url}?start=${multi}&sz=48`;

//         try{
//             const scrape_result = await scrapePage(new_url);
//             if (scrape_result){
//                 const products = await parseHTMLFile('src/html_files/ashley_couches/couch_page_1.html');
		
//                 if (products != undefined){
//                     const analyzed_products = await materialAnalyzer(products);
//                     const result = await addCouches(analyzed_products);  
//                     if (result.success) {
//                         console.log("Couches added successfully");
//                         console.log(analyzed_products);
//                         return analyzed_products;
//                     } else {
//                         console.error("Failed to add couches:", result.error);
//                         return null;
//                     }			
//                 }else{
//                     console.error("ERROR: products are undefined, html was not parsed properly");
//                     return null;
//                 }            
//             }else{
//                 console.log("This page was not able to be scraped: ", new_url)
//             }
//         }catch(error){
//             console.error("ERROR: one of the pages weren't able to be scraped");
//             return null
//         }
//     }
// }

export const parseHTMLFile = async (filePath: string) =>{
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
                console.log(`EMPTY PRICED ITEM ${name}`);
                price = $(elem).find('.kit-price-info').text().trim();
                if (price === ""){
                    price = $(elem).find('.product-sales-price').text().trim();
                }
            } else if (price.includes("-")) {
                price = reformatPrice(price);
            }

            let material: string = "";
            const category: string = "Living Room";
            const product_type: string = "Couch";
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
                
                const material_list: string[] = ["Fabric", "Chenille", "Leather", "Faux Leather", "Velvet", "Performance Fabric"];
                
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
                        console.log(`Use Gemini API for the couch ${name}`);
                    }
                }
            }
        
            
            //make objects even if the materials are empty
            product_array.push({"name": name, "image": image, "price": price, "category": category, "productType": product_type, "material": material, "productLink": product_link, "brand" : brand});
        }

        
        //go through each product with empty materials and get groups of 5 products to download their uris
        //and put them through the gemini api 
        return materialAnalyzer(product_array);
    } catch (error) {
        console.error('Error:', error);
    }
}



export const materialAnalyzer = async (product_array: ScrapedProduct[]): Promise<ScrapedProduct[]> => {
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


export const addCouches = async (product_array: ScrapedProduct[]) => {
    try {
        for (let p of product_array) {
            const existingCouch = await prisma.couch.findUnique({
                where: { name: p.name }
            });

            if (!existingCouch){
                await prisma.couch.create({
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