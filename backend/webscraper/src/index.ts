import express, {urlencoded, json} from "express";
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';

const port = process.env.PORT || 8000;
const app = express();

app.use(urlencoded({extended : true}));
app.use(json());

app.get("/", async (req, res) => {
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
  (puppeteer as any).use(StealthPlugin());

  // Launch the browser and await its resolution
  const browser = await (puppeteer as any).launch({ headless: true,
    protocolTimeout: 900000});

  try {
      const page = await browser.newPage();
      await page.goto('https://www.ashleyfurniture.com/c/furniture/living-room/sofas',{
        timeout: 900000,  // Increase timeout to 60 seconds
        waitUntil: 'networkidle2'  // Wait until there are no more than 2 network connections for at least 500 ms
      });

      await autoScroll(page);

      await page.waitForSelector(".name-link", { timeout: 800000 }); // Timeout of 60 seconds
      await page.waitForFunction(() => document.querySelectorAll(".grid-tile").length > 0);

      const elements = await page.$$(".grid-tile");
      const results = [];

      for (const element of elements) {
            const data = await page.evaluate((el : Element) => {
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
            }, element);
        
            if (JSON.stringify(data) !== JSON.stringify({text: null, image: null, price: null, description: null, product_link: null})){
                results.push(data);
            }
      }

      console.log("Scraping completed:", results, results.length);

      return results;  // Return results instead of just completing
  } catch (error) {
      console.error('Error during scraping:', error);  // Log error for debugging
      throw error;  // Re-throw error to be handled by the catch block in the route handler
  } finally {
      await browser.close();  // Ensure the browser closes even if an error occurs
  }
}


app.listen(port, () => {
    console.log(`Server is listening at port ${port}`);
});


async function autoScroll(page: Page): Promise<void> {
    await page.evaluate(async () => {
        const distance = 5;  // How far to scroll each step
        let lastHeight = 0;

        while (true) {
            // Scroll down
            window.scrollBy(0, distance);
            await new Promise(resolve => setTimeout(resolve, 10000));  // Wait for new content to load

            // Check if new content has been loaded
            const currentHeight = document.body.scrollHeight;
            if (currentHeight === lastHeight) {
                break;
            }
            lastHeight = currentHeight;
        }
    });
}