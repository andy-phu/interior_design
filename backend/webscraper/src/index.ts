import express from 'express';
import dotenv from 'dotenv';
import getAshleyCouches from './routes/routes.js';
import getAshleyCoffeeTables from './routes/routes.js';
import getAshleyAccentChairs  from './routes/routes.js';
import getAshleyBarStools  from './routes/routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json()); // Middleware to parse JSON bodies
// app.use('/api', getAshleyCouches); // Mount the product routes at the /api path
// app.use('/api', getAshleyCoffeeTables);
// app.use('/api', getAshleyAccentChairs);
app.use('/api', getAshleyBarStools);

app.get('/api', (req, res) => {
  res.send('Server is working!');
});






app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});





















// import express, { Request, Response, response } from 'express';
// // import puppeteer from 'puppeteer-extra';
// // import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// // import { Browser, Page } from 'puppeteer';
// import * as dotenv from 'dotenv';
// import { GoogleAIFileManager } from "@google/generative-ai/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import fs from 'fs';
// import path from 'path';
// import * as cheerio from 'cheerio';
// import axios from 'axios';
// import os from 'os';

// const port = process.env.PORT || 8000;
// const app = express();
// const gemini = process.env.GEMINI || "";

// type ScrapedProduct = {
//     id: string | undefined;
//     name: string | undefined;
//     image: string | undefined;
//     price: string | undefined;
//     category: string | undefined;
//     product_type: string | undefined;
//     brand: string | undefined;
//     material: string | undefined;
//     product_link: string | undefined;
// };




// // Assuming the HTML file is in the same directory as the script
// const htmlFilePath = 'src/ashley_furniture_couches/couch_page_2.html'; // Provide the path to your HTML file


// function reformatPrice(priceString: string) {
//     // Remove newline characters and extra spaces
//     const cleanedPrice = priceString
//         .replace(/\n/g, ' ')  // Replace new lines with spaces
//         .replace(/\s*-\s*/g, ' - ')  // Ensure single space around dash
//         .trim();              // Trim leading and trailing whitespace

//     // Optionally, you can add more specific formatting rules here
//     return cleanedPrice;
// }


// function fileToGenerativePart(path: string, mimeType: string) {
//     return {
//       inlineData: {
//         data: Buffer.from(fs.readFileSync(path)).toString("base64"),
//         mimeType
//       },
//     };
// }

  
// app.get("/", async (req: Request, res: Response) => {
//     async function parseHTMLFile(filePath: string) {
//         try {
//             // Read the HTML file
//             const html = fs.readFileSync(filePath, 'utf8');

//             // Load the HTML content into Cheerio
//             const $ = cheerio.load(html);

//             // Extract data using Cheerio
//             let product_array:ScrapedProduct[] = [];
            
//             const myMap = new Map();

//             // grid-tile-new-row 2 normal grid-tiles 
//             // get the colors from this 
//             $('.grid-tile').each((i, elem) => {
//                 const color = $(elem).attr('data-colors-to-show');
//                 const name = $(elem).attr('data-cnstrc-item-name');
//                 myMap.set(name, color);
//             });

//             $('.grid-tile new-row').each((i, elem) => {
//                 const color = $(elem).attr('data-colors-to-show');
//                 const name = $(elem).attr('data-cnstrc-item-name');
//                 myMap.set(name, color);
//             });



//             let id: number = 0;
//             const productTiles = $('.product-tile').toArray();  // Convert jQuery object to array
            
//             for (let elem of productTiles) {
//                 // Extract product name
//                 const name = $(elem).find('.product-name h3 a.name-link').text().trim();
//                 const product_link = $(elem).find('.product-name h3 a.name-link').attr('href');
//                 const image = $(elem).find('img.alternate-image').attr('src');
            
//                 let price: string = $(elem).find('.product-sales-price').text().trim();
                
//                 if (price === "") {
//                     price = $(elem).find('.kit-price-info').text().trim();
//                 } else if (price.includes("-")) {
//                     price = reformatPrice(price);
//                 }

//                 let material: string = "";
//                 const category: string = "Living Room";
//                 const product_type: string = "Couch" 
//                 const brand: string = "Ashley";

//                 const description = $(elem).find('.thumb-link').attr('data-gtmdata');
                
//                 if (description != null) {
//                     const descriptionObject = JSON.parse(description);
//                     const name = descriptionObject.name;
            
//                     const dimension35 = descriptionObject.dimension35;
//                     let dimension38: string = descriptionObject.dimension38;
//                     const dimension47 = descriptionObject.dimension47;
            
//                     if (myMap.get(name) == "") {
//                         myMap.set(name, dimension35);
//                     }
                    
//                     const material_list: string[] = ["Fabric", "Chenille", "Leather", "Faux Leather", "Velvet", "Performance Fabric"];
                    
//                     // Check if the name has one of these materials in it
//                     for (let mat of material_list) {
//                         if (name.includes(mat)) {
//                             console.log("Name that contains mat:", name);
//                             material = mat;
//                         }
//                     }
                    
//                     if (material == "") {
//                         // Check if the dimension 38 has more than one material listed, if so get the first one
//                         let dim38_multiple_materials: string[] = [];
            
//                         if (dimension38?.includes(",")) {
//                             dim38_multiple_materials = dimension38.split(",");
//                             dimension38 = dim38_multiple_materials[0];
//                         }
            
//                         if (dimension47 != undefined && dimension38 != undefined && material_list.includes(dimension47)) {
//                             material = dimension47;
//                         } else if (dimension47 != undefined && dimension38 != undefined && !material_list.includes(dimension47)) {
//                             material = dimension38;
//                         } else if (dimension47 == undefined && dimension38 != undefined) {
//                             material = dimension38;
//                         } else {
//                             // Use Gemini API to identify the color
//                             // counter += 1;
//                             // console.log(`Use Gemini API for the couch ${name} ${counter}`);
//                         }
//                     }
            

             
//                 }
            
                
//                 id+=1;
//                 //make objects even if the materials are empty
//                 product_array.push({"id": String(id), "name": name, "image": image, "price": price, "category": category, "product_type": product_type, "material": material, "product_link": product_link, "brand" : brand});
//             }

            
//             //go through each product with empty materials and get groups of 5 products to download their uris
//             //and put them through the gemini api 
//             const final_array = await materialAnalyzer(product_array);
//             // console.log(final_array);
//             return materialAnalyzer(product_array);
//         } catch (error) {
//             console.error('Error:', error);
//         }
//     }

//     // Use the parseHTMLFile function instead of scraping the URL
//     const result = await parseHTMLFile(htmlFilePath);

//     // console.log("========================")
//     console.log(result);

//     res.json(result);
    

    
// });

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

// async function downloadImage(imageUrl: string, filePath: string) {
//     try {
//       const response = await axios.get(imageUrl, { responseType: 'arraybuffer'   
//    });
//       fs.writeFileSync(filePath, Buffer.from(response.data));
//     } catch (error) {
//       console.error('Error downloading image:', error);
//       // Handle the error appropriately, e.g., log it or retry the download
//     }
// }

// //takes in all products, puts those that have valid materials in one array and those that dont into another
// //fix those that dont have valid materials using gemini api 
// //combine final to the valid material array and return the new product_array
// async function materialAnalyzer(product_array: ScrapedProduct[]){
//     let valid_mats: ScrapedProduct[] = product_array.filter((prod) => (prod.material != ""));
//     let invalid_mats: ScrapedProduct[] = product_array.filter((prod) => prod.material === "");

//     function chunkArray<T>(array: T[], size: number): T[][] {
//         const result: T[][] = [];
//         for (let i = 0; i < array.length; i += size) {
//             result.push(array.slice(i, i + size));
//         }
//         return result;
//     }

//     // Chunk invalid_mats into groups of 5
//     const chunks = chunkArray(invalid_mats, 5);
//     let final_materials: string[] = [];
//     // Process each chunk
//     for (const chunk of chunks) {
//         // Extract images from the chunk
//         const images: (string | undefined)[] = chunk.map((prod) => prod.image);
//         const tempFiles: string[] = []; // Array to store temporary file paths
//         const imageParts = [];  

//         for (let i = 0; i < images.length; i++) {
//             if (images[i] !== undefined) {
//                 const tempFilePath = path.join(os.tmpdir(), `temp_image_${i}.webp`);
//                 const imagePath = images[i] ?? "";
//                 await downloadImage(imagePath, tempFilePath); // Replace with actual download logic
//                 tempFiles.push(tempFilePath);
                
//                 // Converts local file information to a GoogleGenerativeAI.Part object.
//                 imageParts.push(fileToGenerativePart(tempFilePath, "image/webp"));

//             }
//         }
//         const genAI = new GoogleGenerativeAI(gemini);
//         const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//         const prompt = "Choose one material that represents each sofa in the image uploaded based on these options: Fabric, Chenille, Faux Leather, Velvet, Performance Fabric. Make sure you response matches the option exactly with the correct spelling and captilization. Each answer should be seperated by a comma on one line.";

//         const result = await model.generateContent([prompt, ...imageParts]);

//         const result_arr = result.response.text().trim().split(",");
        
//         let trimmedMaterials = result_arr.map(material => material.trim());
//         final_materials = final_materials.concat(trimmedMaterials);

//         // Clean up temporary files (optional)
//         if (tempFiles.length > 0) {
//             for (const tempFile of tempFiles) {
//                 try {
//                     // Check if the file exists before attempting to delete it
//                     if (fs.existsSync(tempFile)) {
//                         await fs.unlinkSync(tempFile);  // Remove the file
//                         // console.log(`Successfully deleted temporary file: ${tempFile}`);
//                     } else {
//                         // console.log(`File not found, skipping deletion: ${tempFile}`);
//                     }
//                 } catch (error) {
//                     console.error(`Error deleting temporary file: ${tempFile}`, error);
//                     // Handle deletion errors gracefully
//                 }
//             }
//         }
//     }

//     for (let i = 0; i < invalid_mats.length; i++){
//         // console.log(invalid_mats[i]);
//         invalid_mats[i].material = final_materials[i];
   
//     }

//     // Return the updated product array with identified materials
//     return [...valid_mats, ...invalid_mats];



    

    
// }


// //if it's in the name thats the material 
// //if there is dimension 38 and 47 go for 47

// //fabric, chenille, leather, faux leather, velvet, performance fabric

// // https://ashleyfurniture.scene7.com/is/image/AshleyFurniture/99704-38?$AFHS-Grid-1X$
// //https://ashleyfurniture.scene7.com/is/image/AshleyFurniture/33706-38?$AFHS-Grid-1X$




