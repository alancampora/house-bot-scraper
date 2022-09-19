import axios from 'axios';
import cheerio from 'cheerio';

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
        console.log({ price });
        const address = $(item).find('.card__address').text().trim();
        return `<a href="${linkElement}">${address}</a><b> ${price}</b>`;
      });

    return flats;
  }
}
