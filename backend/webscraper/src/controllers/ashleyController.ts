import { Request, Response } from 'express';
import { parseHTMLFile, addToDB } from '../services/ashleyService.js';

export const getAshleyCouches = async (req: Request, res: Response) => {
	console.log("trying to get ashley couches")
	const pages = 7;
	try {
		for (let i = 0; i < pages; i++) {
			try {
				const file_path = `src/html_files/ashley_couches/couch${i+1}.html`;
				const material_list: string[] = ["Fabric", "Chenille", "Leather", "Faux Leather", "Velvet", "Performance Fabric"];
				const material_string: string = "Fabric, Chenille, Faux Leather, Velvet, Performance Fabric";
				const product_type: string = "Couch";
				const category: string = "Living Room";
	
				// If scraping was successful, process the HTML
				const products = await parseHTMLFile(file_path, product_type, category, material_list, material_string);
				
	
				if (products) {
					const result = await addToDB(products);
		
					if (result.success) {
						console.log("Couches added successfully for page", i);
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
		console.log("All couches added!");
		res.json({ message: "Couches added successfully"});
	} catch (error) {
		console.error('Error:', error);
		res.status(500).json({ error: 'Failed to parse HTML and analyze materials' });
	}
};


export const getAshleyCoffeeTables = async (req: Request, res: Response) => {
	console.log("trying to get ashley coffee tables")
	const pages = 6;
	try {
		for (let i = 0; i < pages; i++) {
			try {
				const file_path = `src/html_files/ashley_coffee_tables/table${i+1}.html`;
				const material_list: string[] = ['Wood', 'Metal', 'Glass', 'Concrete', 'Faux Leather', 'Marble'];
				const material_string = "Wood, Metal, Faux Leather, Marble, Glass, Concrete";
				const product_type: string = "Coffee Table";
				const category: string = "Living Room";
	
				// If scraping was successful, process the HTML
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
		console.log("All Coffee Tables Added!");
		res.json({ message: "Coffee Tables added successfully"});
	} catch (error) {
		console.error('Error:', error);
		res.status(500).json({ error: 'Failed to parse HTML and analyze materials' });
	}
};

