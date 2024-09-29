import fs from 'fs';
import path from 'path';
import os from 'os';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseHTMLFile, addToDB } from '../services/ashleyService.js';
import * as cheerio from 'cheerio';
import prisma from '../prisma/prisma.js';
import { createLogger, transports, format } from 'winston';
import { fileURLToPath } from 'url';
import { ScrapedProduct } from '../types/types.js';

// Manually define __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



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





export const scrapeTables = async (pages: number) => {
  for (let i = 0; i < pages; i++) {
    try {
        const file_path = `src/html_files/ashley_coffee_tables/table${i+1}.html`;
        
          // If scraping was successful, process the HTML
          const material_list: string[] = ['Wood', 'Metal', 'Glass', 'Concrete', 'Faux Leather', 'Marble'];
          const material_string = "Wood, Metal, Faux Leather, Marble, Glass, Concrete";
          const product_type: string = "Coffee Table";
          const category: string = "Living Room";

          const products = await parseHTMLFile(file_path, product_type, category, material_list, material_string);

          if (products) {
            const result = await addToDB(products);

            if (result.success) {
              console.log("Coffee Tables added successfully for page", i);
            } else {
              console.error("Failed to add couches:", result.error);
              break;  // Exit retry loop on failure
            }
          } else {
            console.error("ERROR: products are undefined, HTML was not parsed properly");
            break;  // Exit retry loop if parsing failed
          }
      } catch (error) {
        console.error("Error during scraping:", error);
      }

  }



  console.log("All pages processed.");

}






