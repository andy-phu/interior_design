import express, { Request, Response, response } from 'express';
// import puppeteer from 'puppeteer-extra';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// import { Browser, Page } from 'puppeteer';
import * as dotenv from 'dotenv';
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import axios from 'axios';
import os from 'os';

const port = process.env.PORT || 8000;
const app = express();
const gemini = process.env.GEMINI || "";

type ScrapedProduct = {
    name: string | undefined;
    image: string | undefined;
    price: string | undefined;
    description: string | undefined;
    material: string | undefined;
    // product_link: string | null;
};




// Assuming the HTML file is in the same directory as the script
const htmlFilePath = 'src/test.html'; // Provide the path to your HTML file


function reformatPrice(priceString: string) {
    // Remove newline characters and extra spaces
    const cleanedPrice = priceString
        .replace(/\n/g, ' ')  // Replace new lines with spaces
        .replace(/\s*-\s*/g, ' - ')  // Ensure single space around dash
        .trim();              // Trim leading and trailing whitespace

    // Optionally, you can add more specific formatting rules here
    return cleanedPrice;
}


function fileToGenerativePart(path: string, mimeType: string) {
    return {
      inlineData: {
        data: Buffer.from(fs.readFileSync(path)).toString("base64"),
        mimeType
      },
    };
  }

  
app.get("/", async (req: Request, res: Response) => {
    async function parseHTMLFile(filePath: string) {
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



            let counter: number = 0;
            const productTiles = $('.product-tile').toArray();  // Convert jQuery object to array
            
            for (let elem of productTiles) {
                // Extract product name
                const name = $(elem).find('.product-name h3 a.name-link').text().trim();
                
                const image = $(elem).find('img.alternate-image').attr('src');
            
                let price: string = $(elem).find('.product-sales-price').text().trim();
                
                if (price === "") {
                    price = $(elem).find('.kit-price-info').text().trim();
                } else if (price.includes("-")) {
                    price = reformatPrice(price);
                }
                let material: string = "";

                const description = $(elem).find('.thumb-link').attr('data-gtmdata');
                
                if (description != null) {
                    const descriptionObject = JSON.parse(description);
                    const name = descriptionObject.name;
                    const brand = descriptionObject.brand;
                    const category = descriptionObject.category;
            
                    const dimension35 = descriptionObject.dimension35;
                    let dimension38: string = descriptionObject.dimension38;
                    const dimension14 = descriptionObject.dimension14;
                    const dimension47 = descriptionObject.dimension47;
            
                    if (myMap.get(name) == "") {
                        myMap.set(name, dimension35);
                    }
                    
                    const material_list: string[] = ["Fabric", "Chenille", "Faux Leather", "Velvet", "Performance Fabric"];
                    
                    // Check if the name has one of these materials in it
                    for (let mat of material_list) {
                        if (name.includes(mat)) {
                            console.log("Name that contains mat:", name);
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
            
                        if (dimension47 != undefined && dimension38 != undefined && material_list.includes(dimension47)) {
                            material = dimension47;
                        } else if (dimension47 != undefined && dimension38 != undefined && !material_list.includes(dimension47)) {
                            material = dimension38;
                        } else if (dimension47 == undefined && dimension38 != undefined) {
                            material = dimension38;
                        } else {
                            // Use Gemini API to identify the color
                            counter += 1;
                            console.log(`Use Gemini API for the couch ${name} ${counter}`);
                            
                            if (image != undefined){
                                const tempFilePath = path.join(os.tmpdir(), 'temp_image.webp'); // Adjust the filename as needed
                                const imageResponse = await axios.get(image, { responseType: 'arraybuffer' });
                                fs.writeFileSync(tempFilePath, Buffer.from(imageResponse.data));
    
                                // Upload the temporary file to the Gemini API
                                const fileManager = new GoogleAIFileManager(gemini);
                                const uploadResult = await fileManager.uploadFile(
                                tempFilePath,
                                {
                                    mimeType: "image/webp", // Replace with the correct mime type if necessary
                                    displayName: "temp_image",
                                },
                                );
    
    

                                // Get the previously uploaded file's metadata.
                                const getResponse = await fileManager.getFile(uploadResult.file.name);
    
                                // View the response.
                                console.log(
                                  `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`,
                                );


                                  
                                const genAI = new GoogleGenerativeAI(gemini);
                                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                                const result = await model.generateContent([
                                  "Choose one material that represents the sofa in the image uploaded based on these options: Fabric, Chenille, Faux Leather, Velvet, Performance Fabric. For your response only use one word, no explanation needed. Make sure you response matches the option exactly with the correct spelling and captilization",
                                  {
                                    fileData: {
                                        fileUri: uploadResult.file.uri, // Use the uploaded file URI
                                        mimeType: "image/webp",
                                    }
                                  },
                                ]);
                                // const result = await model.generateContent(["Choose one material that represents each sofa in the image uploaded based on these options: Fabric, Chenille, Faux Leather, Velvet, Performance Fabric. Make sure you response matches the option exactly with the correct spelling and captilization", ...imageParts]);

                                console.log(result.response.text().trim());
                                if (material_list.includes(result.response.text().trim())){
                                    material = result.response.text();
                                }else{
                                    console.log("gemini said a material that is not on the list!!")
                                }

                            }

                        }
                    }
            

                    // Log the results
                    console.log("Name:", name);
                    console.log("Brand:", brand);
                    console.log("Category:", category);
                    console.log("Dimension 38:", dimension38);
                    console.log("Dimension 14:", dimension14);
                    console.log("Dimension 47:", dimension47);
                    console.log("Material:", material);
                }
            
                const description_array = description?.split(",");
                
                console.log("------------------------");

                //make objects even if the materials are empty
                product_array.push({ "name": name, "image": image, "price": price, "description": description, "material": material });
            }

            
            //go through each product with empty materials and get groups of 5 products to download their uris
            //and put them through the gemini api 


     


            return product_array;
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Use the parseHTMLFile function instead of scraping the URL
    const result = parseHTMLFile(htmlFilePath);

    // console.log("========================")
    // console.log(result);

    res.json(result);
    

    
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

async function downloadImage(imageUrl: string, filePath: string) {
    try {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer'   
   });
      fs.writeFileSync(filePath, Buffer.from(response.data));
    } catch (error) {
      console.error('Error downloading image:', error);
      // Handle the error appropriately, e.g., log it or retry the download
    }
}

//takes in all products, puts those that have valid materials in one array and those that dont into another
//fix those that dont have valid materials using gemini api 
//combine final to the valid material array and return the new product_array
async function materialAnalyzer(product_array: ScrapedProduct[]){
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

    // Process each chunk
    for (const chunk of chunks) {
        // Extract images from the chunk
        const images: (string | undefined)[] = chunk.map((prod) => prod.image);
        const tempFiles: string[] = []; // Array to store temporary file paths
        const imageParts = [];  

        for (let i = 0; i < images.length; i++) {
            if (images[i] !== undefined) {
                const tempFilePath = path.join(os.tmpdir(), `temp_image_${i}.jpg`);
                const imagePath = images[i] ?? "";
                await downloadImage(imagePath, tempFilePath); // Replace with actual download logic
                tempFiles.push(tempFilePath);
                
                // Converts local file information to a GoogleGenerativeAI.Part object.
                imageParts.push(fileToGenerativePart(tempFilePath, "image/webp"));

            }
        }
        const genAI = new GoogleGenerativeAI(gemini);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "Choose one material that represents each sofa in the image uploaded based on these options: Fabric, Chenille, Faux Leather, Velvet, Performance Fabric. Make sure you response matches the option exactly with the correct spelling and captilization";

        const result = await model.generateContent([prompt, ...imageParts]);

        console.log(result.response.text().trim());
 

        // Clean up temporary files (optional)
        if (tempFiles.length > 0) {
        for (const tempFile of tempFiles) {
            try {
            await fs.unlinkSync(tempFile);
            } catch (error) {
            console.error(`Error deleting temporary file: ${tempFile}`, error);
            // Handle deletion errors gracefully
            }
        }
        }
    }



    // Return the updated product array with identified materials
    return [...valid_mats, ...invalid_mats];



    

    
}


//if it's in the name thats the material 
//if there is dimension 38 and 47 go for 47

//fabric, chenille, leather, faux leather, velvet, performance fabric

// https://ashleyfurniture.scene7.com/is/image/AshleyFurniture/99704-38?$AFHS-Grid-1X$
//https://ashleyfurniture.scene7.com/is/image/AshleyFurniture/33706-38?$AFHS-Grid-1X$