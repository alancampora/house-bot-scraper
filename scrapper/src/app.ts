import init from './init';
init();

import { Telegram } from 'telegraf';
import { ArgenPropScraper } from './argenprop';
import { ZonaPropScraper } from './zonaprop';
import dbConnect from './mongodb';
import { IPlace, PlaceModel } from './models';

import cron from 'node-cron';

const token: string = process.env.BOT_TOKEN as string;
const chatId: string = process.env.CHAT_ID as string;

const update = async (
  elementsType: string,
  items: IPlace[],
  telegramBot: any
) => {
  items.forEach(async (flat, index) => {
    setTimeout(async function () {
      const place = await PlaceModel.findOne({ code: flat.code });

      console.log('encontro el place?', { place });

      if (!place) {
        console.log('Log: new place found ' + flat.code);

        try {
          telegramBot.sendMessage(chatId, `${elementsType}: ${flat.html}`);
          const newPlace = new PlaceModel(flat);
          await newPlace.save();
        } catch (e) {
          console.log(e);
        }
      }
    }, index * 10000);
  });
};

const startBot = async () => {
  const telegramBot = new Telegram(token);
  await dbConnect();

  console.log('Log: db connected');

  cron.schedule('*/10 * * * *', async () => {
    console.log('Log: running cron');

    const scraper = new ArgenPropScraper();
    const zonapropScraper = new ZonaPropScraper();

    const phs: IPlace[] = await scraper.scrape(
      'https://www.argenprop.com/casa-y-ph-alquiler-localidad-capital-federal-3-ambientes-y-4-ambientes-y-5-o-m%C3%A1s-ambientes-hasta-150000-pesos'
    );

    const flats: IPlace[] = await scraper.scrape(
      'https://www.argenprop.com/departamento-alquiler-localidad-capital-federal-2-dormitorios-y-3-dormitorios-y-4-dormitorios-y-5-o-m%C3%A1s-dormitorios-hasta-150000-pesos'
    );

    const zonapropFlats: IPlace[] = await zonapropScraper.scrape(
      'https://www.zonaprop.com.ar/departamentos-alquiler-capital-federal-mas-de-3-ambientes-mas-55-m2-cubiertos-menos-150000-pesos-orden-publicado-descendente.html'
    );

    await update('Zona Props', zonapropFlats, telegramBot);
    await update('PH', phs, telegramBot);
    await update('DPTO', flats, telegramBot);
  });
};

const testZonaProp = async () => {
  const zonapropScraper = new ZonaPropScraper();
  try {
    const zonapropFlats: IPlace[] = await zonapropScraper.scrape(
      'https://www.zonaprop.com.ar/departamentos-alquiler-capital-federal-mas-de-3-ambientes-mas-55-m2-cubiertos-menos-150000-pesos-orden-publicado-descendente.html'
      //'https://www.zonaprop.com.ar'
    );

    console.log({ zonapropFlats });
  } catch (e) {
    console.error(e);
  }
};

startBot();
