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

        const imgs =
          $(item)
            .find('.flickity-slider img')
            .toArray()
            .map(
              (element) =>
                $(element).attr('src') ||
                $(element).attr('data-flickity-lazyload') ||
                ''
            );
        const address = $(item).find('[data-qa=POSTING_CARD_LOCATION]').text().trim();
        const price = $(item).find('[data-qa=POSTING_CARD_PRICE]').text().trim();
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
  //async scrape(url: string) {
  //const response = await axios.get(url, {
  //headers: {
  //'User-Agent':
  //'Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0',
  //},
  //});

  //chromium.launch({ headless: true }).then(async (browser) => {
  //const context = await browser.newContext();
  //const page = await context.newPage();
  //await page.goto(url, {
  //waitUntil: 'networkidle',
  //});
  //await page.screenshot({ path: `bot-check.png`, fullPage: true });
  //await browser.close();
  //});

  //const html = response.data;

  //const $ = cheerio.load(html);

  //const flats = $('.postings-container')
  //.toArray()
  //.map((item) => {
  //const linkElement = ('https://www.argenprop.com' +
  //$(item)
  //.find('[data-qa="posting PROPERTY"]')
  //.attr('data-to-posting')) as string;

  //const price = $(item)
  //.find('.card__price')
  //.text()
  //.replace(/\n/gm, ' ')
  //.replace(/[\s]*/g, '');

  //const imgs = $(item)
  //.find('.card__photos img')
  //.toArray()
  //.map((element) => {
  //const src = $(element).attr('data-src');
  //return src;
  //});

  //const title = $(item)
  //.find('.card__title--primary.show-mobile')
  //.text()
  //.trim();

  //const address = $(item).find('.card__address').text().trim();

  //return {
  //source: 'zonaprop',
  //code: linkElement,
  //url: 'test',
  //imgs: ['test'],
  //title: 'title',
  //html: 'html',
  //} as IPlace;
  //});

  //return flats;
  //}
}
