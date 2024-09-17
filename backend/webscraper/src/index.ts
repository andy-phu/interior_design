import express, { Request, Response } from 'express';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';

const port = process.env.PORT || 8000;
const app = express();

app.get("/", async (req: Request, res: Response) => {
  try {
    const data = await WebScrapingLocalTest();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
          message: 'Server error occurred',
        });
  }
});
    
async function WebScrapingLocalTest() {
    console.log("Starting to scrape");
    (puppeteer as any).use(StealthPlugin());

    const browser = await (puppeteer as any).launch({ headless: false, protocolTimeout: 900000 });
    try {
        const page = await browser.newPage();
        await page.goto('https://www.ashleyfurniture.com/c/furniture/living-room/sofas', {
        timeout: 60000,
        waitUntil: 'networkidle2'
        });

        // Scroll and load all products
        await loadAllProducts(page);

        // Wait for all product tiles to be present
        await page.waitForSelector(".grid-tile", { timeout: 900000 });

        // Scrape all products at once
        const results = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".grid-tile")).map(el => {
                    const nameLink = el.querySelector('.name-link');
                    const imgElement = el.querySelector('.alternate-image') as HTMLImageElement;
                    const price = el.querySelector('.sale-price');
                    const description = el.querySelector('.thumb-link') as HTMLImageElement;
                    const product_link = el.querySelector('.thumb-link') as HTMLImageElement;
                    return {
                        text: nameLink ? nameLink.textContent?.trim() ?? null : null,
                        image: imgElement ? imgElement.src : null,
                        price: price ? price.textContent?.trim() ?? null : null, 
                        description: description ? description.dataset.gtmdata : null,
                        product_link: product_link ? product_link.dataset.href : null
                    };
        }).filter(data => 
            Object.values(data).every(value => value !== null)
        );
        });

        console.log("Scraping completed:", results, results.length);
        return results;

    } catch (error) {
        console.error('Error during scraping:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

async function scrollToBottom(page: Page, timeout = 100000, checkInterval = 3000) {
  let lastHeight = 0;
  let currentHeight = await page.evaluate(() => document.body.scrollHeight);

  while (lastHeight !== currentHeight) {
    lastHeight = currentHeight;
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    
    await new Promise(resolve => setTimeout(resolve, checkInterval));
    
    currentHeight = await page.evaluate(() => document.body.scrollHeight);

    if (timeout <= 0) break;
    timeout -= checkInterval;
  }
}

async function loadAllProducts(page: Page): Promise<void> {
    // Rest of your scrolling code...
    await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
            totalHeight += distance;
            if(totalHeight >= scrollHeight){
            clearInterval(timer);
            resolve();
            }
        }, 100);
    });
    });

    // Use the new scrollToBottom function
    await scrollToBottom(page);
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
