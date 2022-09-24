import { IPlace } from './models';
import puppeteer from 'puppeteer-extra';
import randUserAgent from 'rand-user-agent';
import proxyChain from 'proxy-chain';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import cheerio from 'cheerio';

const stealth = StealthPlugin();
puppeteer.use(stealth);

export class ZonaPropScraper {
  async scrape(url: string) {
    const agent = randUserAgent('desktop');
    const proxyUrl = 'http://userid:pw@ip:port';
    const proxy = async () => {
      return proxyChain.anonymizeProxy(proxyUrl);
    };

    const browser = await puppeteer.launch({
      headless: false,
      args: [
        '--proxy-server=' + proxy,
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    });
    const page = await browser.newPage();

    await page.setJavaScriptEnabled(true);
    await page.setUserAgent(agent);
    await page.goto(url, {
      //waitUntil: 'networkidle2',
    });

    const html = await page.evaluate(() => {
      // @ts-ignore
      return document.documentElement.innerHTML;
    });

    const $ = cheerio.load(html);

    const flats = $('.postings-container')
      .find('[data-qa="posting PROPERTY"]')
      .toArray()
      .map((item) => {
        const linkElement = ('https://www.zonaprop.com.ar' +
          $(item).attr('data-to-posting')) as string;

        const imgs = $(item)
          .find('.flickity-slider img')
          .toArray()
          .map(
            (element) =>
              $(element).attr('src') ||
              $(element).attr('data-flickity-lazyload') ||
              ''
          );
        const address = $(item)
          .find('[data-qa=POSTING_CARD_LOCATION]')
          .text()
          .trim();
        const price = $(item)
          .find('[data-qa=POSTING_CARD_PRICE]')
          .text()
          .trim();
        const title = $(item).find('h2').text().trim();

        return {
          source: 'zonaprop',
          code: linkElement,
          url: linkElement,
          imgs,
          title,
          html: `${address}, ${price}, URL:${linkElement}`,
        };
      });

    console.log({ flats });

    await browser.close();

    //@ts-ignore
    return flats as IPlace[];
  }
}
