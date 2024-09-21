import { Request, Response } from 'express';
import { parseHTMLFile, materialAnalyzer, addCouches } from '../services/ashleyService.js';

export const getAshleyCouches = async (req: Request, res: Response) => {
	console.log("trying to get ashley couches")
	try {
		//Use scrapefly to get a list of html files and pass it to parse html file, this would be a for loop and append it to a jsonArray
		const html_file_path = 'src/html_files/ashley_couches/couch_page_1.html';
		
		const products = await parseHTMLFile(html_file_path);
		
		if (products != undefined){
			const analyzed_products = await materialAnalyzer(products);
			const result = await addCouches(analyzed_products);  
            if (result.success) {
                console.log("Couches added successfully");
				console.log(analyzed_products);
                res.json({ message: "Couches added successfully", data: analyzed_products });
            } else {
                console.error("Failed to add couches:", result.error);
                res.status(500).json({ error: "Failed to add couches", details: result.error });
            }			
		}else{
			console.error("ERROR: products are undefined, html was not parsed properly")
		}
	} catch (error) {
		console.error('Error:', error);
		res.status(500).json({ error: 'Failed to parse HTML and analyze materials' });
	}
};

