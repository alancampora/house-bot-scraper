import { Context, Telegraf } from 'telegraf';
import { ArgenPropScraper } from './argenprop';
import { Update } from 'typegram';
import dbConnect from './mongodb';
import { IPlace, PlaceModel } from './models';

import cron from 'node-cron';

const token: string = process.env.BOT_TOKEN as string;

const bot: Telegraf<Context<Update>> = new Telegraf(token);

bot.start(async (ctx) => {
  await dbConnect();

  cron.schedule('*/10 * * * *', async () => {
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
        const newPlace = new PlaceModel(flat);

        await newPlace.save();

        ctx.replyWithHTML(`PH: ${flat.html}`);
      }
    });

    flats.forEach(async (flat) => {
      const place = await PlaceModel.find({ code: flat.code });

      if (!place) {
        const newPlace = new PlaceModel(flat);

        await newPlace.save();

        ctx.replyWithHTML(`DPTO: ${flat.html}`);
      }
    });
  });
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
