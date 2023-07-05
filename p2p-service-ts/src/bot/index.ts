import { Telegraf, Markup, Context } from 'telegraf';
import { QrCodePix } from 'qrcode-pix';
import { ProviderService } from '@/services/providers.service';
import { OrderService } from '@/services/orders.service';

interface MatchedContext extends Context {
  match: RegExpExecArray;
}

class BotService {
  bot: Telegraf;
  providerService: ProviderService;
  orderService: OrderService;

  constructor() {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.providerService = new ProviderService();
    this.orderService = new OrderService();
  }

  public launch() {
    this.initializeMiddlewares();
    this.bot.launch();
  }

  private initializeMiddlewares() {
    this.bot.start(this.onBotStart.bind(this));
    this.bot.hears('✅ Set address', this.onSetProviderAddress.bind(this));
    this.bot.action(/accept_order:(\d+)/, this.onAcceptOrder.bind(this));
    this.bot.action(/upload_receipt:(\d+)/, this.onUploadReceipt.bind(this));
  }

  private async onBotStart(ctx: Context) {
    const providerId = ctx.chat.id;
    const polygonAddress = await this.providerService.getProvider(providerId);

    if (polygonAddress) {
      ctx.reply(`Hi, ${ctx.from.username}! \nYour address is: ${polygonAddress}`);
    } else {
      await ctx.reply(
        'Welcome! To start, please provide your Polygon address.',
        Markup.keyboard([
          ['✅ Set address'], // Row1 with 2 buttons
        ])
          .oneTime()
          .resize(),
      );
    }
  }

  private async onSetProviderAddress(ctx: Context) {
    ctx.reply('Please input your Polygon address:');
    this.bot.on('text', async (ctx) => {
      const polygonAddress = ctx.message.text;
      const providerId = ctx.chat.id;
      await this.providerService.saveProvider(providerId, polygonAddress);
      ctx.reply(`Polygon address saved: ${polygonAddress}`);
    });
  }

  private async onAcceptOrder(ctx: MatchedContext) {
    const orderId = Number(ctx.match[1]);
    const order = await this.orderService.getOrderById(orderId);

    console.log('order_id: ', orderId);
    if (!order.provider_id) {
      await this.providerService.updateProvider(ctx.chat.id, orderId);
      await this.orderService.updateOrder(orderId, 'accepted_by_provider', ctx.chat.id, 'fileLink');

      const qrCodePix = QrCodePix({
        version: '01',
        key: order.merchant, //or any PIX key
        name: 'Fulano de Tal',
        city: 'SAO PAULO',
        transactionId: 'YOUR_TRANSACTION_ID', //max 25 characters
        message: 'Pay me :)',
        cep: '99999999',
        value: order.amount,
      });

      console.log(qrCodePix);
      const qrCodeImage = await qrCodePix.base64();
      ctx.replyWithPhoto({ source: Buffer.from(qrCodeImage.split(',')[1], 'base64') });
      ctx.reply(
        'Order accepted. Please pay the transaction and upload the receipt.',
        Markup.inlineKeyboard([
          Markup.button.callback(
            'Transaction paid, upload receipt photo',
            `upload_receipt:${orderId}`,
          ),
        ]),
      );
    } else {
      ctx.reply('Sorry, this order has already been accepted by another provider.');
    }
  }

  private async onUploadReceipt(ctx: MatchedContext) {
    const orderId = Number(ctx.match[1]);
    const order = await this.orderService.getOrderById(orderId);

    if (order.provider_id === ctx.chat.id) {
      ctx.reply('Please upload the receipt photo.');
      this.bot.on('photo', async (ctx) => {
        const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        const fileLink = await ctx.telegram.getFileLink(fileId);
        const polygonAddress = await this.providerService.getProvider(order.provider_id);
        // mock data

        const response = {
          data: {
            success: true,
            polygonAddress: polygonAddress,
            usdtBalance: order.usdt_amount,
          },
        };

        if (response.data.success) {
          ctx.reply(
            `Success! Your Polygon address: ${response.data.polygonAddress}, USDt balance: ${response.data.usdtBalance}`,
          );
          await this.orderService.updateOrder(orderId, 'paid', null, fileLink.href);
          await this.providerService.updateProvider(order.provider_id, null);
        } else {
          ctx.reply('An error occurred while processing your payment. Please contact support.');
        }
      });
    } else {
      ctx.reply("This order doesn't belong to you.");
    }
  }
}

export const botService = new BotService();
