const request = require('request');
const cheerio = require('cheerio');
const Telegraf = require('telegraf');
const bot = new Telegraf('YOUR_BOT_TOKEN_ID');

let b = false; // Inserisci del testo solo quando /avvisi è stato selezionato

const replyOptions = Telegraf.Markup.inlineKeyboard([
  Telegraf.Markup.urlButton('Sito Ufficiale', 'http://www.itisvoltanapoli.gov.it/'),
  Telegraf.Markup.urlButton('Orari', 'http://www.itisvoltanapoli.gov.it/orario/')
]).extra();

bot.start((ctx) => {
  ctx.replyWithHTML("<b>Ciao! Qui puoi vedere gli ultimi avvisi dell'ITIS, leggere un po' di storia ed altro!\n\nQuesto bot è sviluppato e mantenuto da</b> <a href=\"https://t.me/superserio\">@superserio</a>");
  ctx.reply("/avvisi - Vedi gli ultimi avvisi\n/storia - Leggi un po' di storia dell'ITIS Volta\n/regolamento - Scarica il regolamento d'Istituto", replyOptions);
});

bot.command('avvisi', (ctx) => {
  request('https://www.itisvoltanapoli.gov.it/avvisi', (err, res, body) => {
    if(!err && res.statusCode === 200) {
      const $ = cheerio.load(body);
      let str = "";
      $('.list-title').each((idx, el) => {
        let avviso = $(el).find('a').text();
        str += `${avviso.trim()}\n`;
      });
      
      ctx.reply(str);
      ctx.reply("Specifica il numero dell'avviso che t'interessa");
      b = true;

      let href = "";
      bot.on('text', (msg) => {
        if(b) {
          b = false;
          $('.list-title').each((idx, el) => {
            let avviso = $(el).find('a').text();
            if(avviso.includes(`Avviso ${msg.message.text}`)) {
              href = $(el).find('a').attr('href');
            }
          });
          
          if(href !== "") {
            const replyOptions = Telegraf.Markup.inlineKeyboard([
              Telegraf.Markup.urlButton(`Leggi l'avviso completo`, `https://www.itisvoltanapoli.gov.it${href}`),
            ]).extra();

            request(`https://www.itisvoltanapoli.gov.it${href}`, (err, res, body) => {
              const $ = cheerio.load(body);
              return msg.reply($('.item-page').find('div').find('p').text(), replyOptions);
            });
          } else {
            return msg.reply("Non sono riuscito a trovare l'avviso che stai cercando :|");
          }
        }
      });
    }
  });
});

bot.command('storia', (ctx) => {
  request('https://www.itisvoltanapoli.gov.it/storia/', (err, res, body) => {
    if(!err && res.statusCode === 200) {
      const $ = cheerio.load(body);
      
      let storia = $('.my_text_box').find('p').text();
      ctx.reply(storia);
      ctx.replyWithPhoto("https://www.ottopagine.it/public/thumb/658x370/12-2016/5/news105035.jpg");
    }
  });
});

bot.command('regolamento', (ctx) => {
  Telegraf.Markup.urlButton('❤️', 'http://telegraf.js.org');
  ctx.replyWithDocument('https://www.itisvoltanapoli.gov.it/regolamento-d-istituto/file');
});

bot.startPolling();