import { Request, Response } from 'express';
import {scrapeCouches} from '../services/ashleyCouches.js';
import {scrapeTables} from '../services/ashleyCoffeeTables.js';


export const getAshleyCouches = async (req: Request, res: Response) => {
	console.log("trying to get ashley couches")
	try {
		await scrapeCouches(7);

		res.json({ message: "Couches added successfully"});
	} catch (error) {
		console.error('Error:', error);
		res.status(500).json({ error: 'Failed to parse HTML and analyze materials' });
	}
};


export const getAshleyCoffeeTables = async (req: Request, res: Response) => {
	console.log("trying to get ashley coffee tables")
	try {
		await scrapeTables(1);

		res.json({ message: "Coffee Tables added successfully"});
	} catch (error) {
		console.error('Error:', error);
		res.status(500).json({ error: 'Failed to parse HTML and analyze materials' });
	}
};

