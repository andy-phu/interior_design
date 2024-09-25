import { Request, Response } from 'express';
import {scrapeCouches } from '../services/ashleyService.js';

export const getAshleyCouches = async (req: Request, res: Response) => {
	console.log("trying to get ashley couches")
	try {
		await scrapeCouches(7);
		//test out scraping the first page again hopefully replacing
		await scrapeCouches(1); 
		res.json({ message: "Couches added successfully"});
	} catch (error) {
		console.error('Error:', error);
		res.status(500).json({ error: 'Failed to parse HTML and analyze materials' });
	}
};

