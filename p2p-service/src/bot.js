// src/bot.js
const { Telegraf } = require("telegraf");
const { Markup } = require("telegraf");
const {
  saveOrder,
  getOrderById,
  updateOrder,
  saveProvider,
  getProviders,
  updateProvider,
  getProvider,
} = require("./database");
const QRCode = require("qrcode");
const { GelatoRelayPack } = require("@safe-global/relay-kit");
const pollRelayTaskStatus = require("./utils/pollRelayTaskStatus");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start(async (ctx) => {
  const providerId = ctx.chat.id;
  const polygonAddress = await getProvider(providerId);

  if (polygonAddress) {
    ctx.reply(`Hi, ${ctx.from.username}! \nYour address is: ${polygonAddress}`);
  } else {
    await ctx.reply(
      "Welcome! To start, please provide your Polygon address.",
      Markup.keyboard([
        ["✅ Set address"], // Row1 with 2 buttons
      ])
        .oneTime()
        .resize()
    );
  }
});

bot.hears("✅ Set address", (ctx) => {
  ctx.reply("Please input your Polygon address:");
  bot.on("text", async (ctx) => {
    const polygonAddress = ctx.message.text;
    const providerId = ctx.chat.id;
    await saveProvider(providerId, polygonAddress);
    ctx.reply(`Polygon address saved: ${polygonAddress}`);
  });
});

bot.action(/accept_order:(\d+)/, async (ctx) => {
  const orderId = Number(ctx.match[1]);
  const order = await getOrderById(orderId);

  console.log("order_id: ", orderId);
  if (!order.provider_id) {
    await updateProvider(ctx.chat.id, orderId);
    await updateOrder(orderId, ctx.chat.id, "fileLink", "accepted_by_provider");

    ctx.reply("Order accepted. Please wait for user to sign the transaction");
  } else {
    ctx.reply(
      "Sorry, this order has already been accepted by another provider."
    );
  }
});

bot.action(/upload_receipt:(\d+)/, async (ctx) => {
  const orderId = Number(ctx.match[1]);
  const order = await getOrderById(orderId);

  if (order.provider_id === ctx.chat.id) {
    ctx.reply("Please upload the receipt photo.");
    bot.on("photo", async (ctx) => {
      const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
      const fileLink = await ctx.telegram.getFileLink(fileId);

      const relayAdapter = new GelatoRelayPack(process.env.GELATO_RELAY_API_KEY);

      ctx.reply("Thank you! Sending you USDT...");

      const { taskId } = await relayAdapter.relayTransaction(JSON.parse(order.relay_transaction));
      console.log('taskID:', taskId)

      ctx.reply("Waiting for the transaction");

      const { transactionHash } = await pollRelayTaskStatus(taskId, relayAdapter);

      const response = {
        data: {
          success: true,
          transactionHash,
          relayTaskId: taskId,
        },
      };

      if (response.data.success) {
        ctx.reply([
          `Success!`,
          `Relay task: https://relay.gelato.digital/tasks/status/${response.data.relayTaskId}`,
          `Transaction: https://polygonscan.com/tx/${response.data.transactionHash}`
        ].join('\n'));
        await updateOrder(orderId, null, fileLink.href, "paid");
        await updateProvider(order.provider_id, null);
      } else {
        ctx.reply(
          "An error occurred while processing your payment. Please contact support."
        );
      }
    });
  } else {
    ctx.reply("This order doesn't belong to you.");
  }
});

bot.launch();

async function sendOrderToProviders(order) {
  const providers = await getProviders();
  for (const provider of providers) {
    await bot.telegram.sendMessage(
      provider.telegram_id,
      `New order: ${order.amount} VND (${order.usdt_amount} USDT) to ${order.merchant}`,
      Markup.inlineKeyboard([
        Markup.button.callback("Accept order", `accept_order:${order.id}`),
      ])
    );
  }
}

async function sendConfirmedOrderToProvider(order, providerTelegramId) {
  const qrImage = await QRCode.toBuffer(order.qr_data);

  await bot.telegram.sendPhoto(providerTelegramId, { source: qrImage });
  await bot.telegram.sendMessage(
    providerTelegramId,
    "Please pay the transaction and upload the receipt.",
    Markup.inlineKeyboard([
      Markup.button.callback(
        "Transaction paid, upload receipt photo",
        `upload_receipt:${order.id}`
      ),
    ])
  );
}

module.exports = {
  sendOrderToProviders,
  sendConfirmedOrderToProvider,
};
