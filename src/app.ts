import { Context, Markup, Telegraf, Telegram } from 'telegraf';
import { ArgenPropScraper } from './argenprop';
import { Update } from 'typegram';

const token: string = process.env.BOT_TOKEN as string;

const bot: Telegraf<Context<Update>> = new Telegraf(token);

bot.start(async (ctx) => {
  const scraper = new ArgenPropScraper();

  const phs: string[] = await scraper.scrape(
    'https://www.argenprop.com/casa-y-ph-alquiler-localidad-capital-federal-3-ambientes-y-4-ambientes-y-5-o-m%C3%A1s-ambientes-hasta-150000-pesos'
  );

  const flats: string[] = await scraper.scrape(
    'https://www.argenprop.com/departamento-alquiler-localidad-capital-federal-2-dormitorios-y-3-dormitorios-y-4-dormitorios-y-5-o-m%C3%A1s-dormitorios-hasta-150000-pesos'
  );

  phs.forEach((flat) => {
    ctx.replyWithHTML(`PH: ${flat}`);
  });

  flats.forEach((flat) => {
    ctx.replyWithHTML(`DPTO: ${flat}`);
  });
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
