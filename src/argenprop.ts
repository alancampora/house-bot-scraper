import axios from 'axios';
import cheerio from 'cheerio';
import { IPlace } from './models';

export class ArgenPropScraper {
  async scrape(url: string) {
    const response = await axios.get(url);
    const html = response.data;

    const $ = cheerio.load(html);

    const flats = $('.listing__item')
      .toArray()
      .map((item) => {
        const linkElement = ('https://www.argenprop.com' +
          $(item).find('a').attr('href')) as string;

        const price = $(item)
          .find('.card__price')
          .text()
          .replace(/\n/gm, ' ')
          .replace(/[\s]*/g, '');

        const imgs = $(item)
          .find('.card__photos img')
          .toArray()
          .map((element) => {
            const src = $(element).attr('data-src');
            return src;
          });

        const title = $(item)
          .find('.card__title--primary.show-mobile')
          .text()
          .trim();

        const address = $(item).find('.card__address').text().trim();

        return {
          source: 'argenprop',
          code: linkElement,
          url: linkElement,
          imgs,
          title,
          html: `${address}, ${price}, URL:${linkElement}`,
        } as IPlace;
      });

    return flats;
  }
}
