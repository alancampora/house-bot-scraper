import { Telegram } from 'telegraf';
import { ArgenPropScraper } from './argenprop';
import dbConnect from './mongodb';
import { IPlace, PlaceModel } from './models';

import cron from 'node-cron';

const token: string = process.env.BOT_TOKEN as string;
const chatId: string = process.env.CHAT_ID as string;

const telegramBot = new Telegram(token);

const delay = (time:number) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

const startBot = async () => {
  await dbConnect();

  console.log('Log: db connected');

  cron.schedule('*/10 * * * *', async () => {
    console.log('Log: running cron');

    const scraper = new ArgenPropScraper();

    const phs: IPlace[] = await scraper.scrape(
      'https://www.argenprop.com/casa-y-ph-alquiler-localidad-capital-federal-3-ambientes-y-4-ambientes-y-5-o-m%C3%A1s-ambientes-hasta-150000-pesos'
    );

    const flats: IPlace[] = await scraper.scrape(
      'https://www.argenprop.com/departamento-alquiler-localidad-capital-federal-2-dormitorios-y-3-dormitorios-y-4-dormitorios-y-5-o-m%C3%A1s-dormitorios-hasta-150000-pesos'
    );

    phs.forEach(async (flat) => {
      const place = await PlaceModel.findOne({ code: flat.code });

      if (!place) {
        console.log('Log: new place found ' + flat.code);

        const newPlace = new PlaceModel(flat);

        await newPlace.save();

        telegramBot.sendMessage(chatId, `PH: ${flat.html}`);
 
        await delay(5000);
      }
    });

    flats.forEach(async (flat) => {
      const place = await PlaceModel.find({ code: flat.code });

      if (!place) {
        console.log('Log: new place found ' + flat.code);

        const newPlace = new PlaceModel(flat);

        await newPlace.save();

        telegramBot.sendMessage(chatId, `DPTO: ${flat.html}`);

        await delay(5000);
      }
    });
  });
};

startBot();
