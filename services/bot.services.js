export const tgBotService = () => {
    const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const imageUrl = "https://skinning-template.s3.us-west-1.amazonaws.com/tap-to-earn/1.png";
        const gameDescription = `
  Hey there! Welcome to GachyiTap the official Tap2Earn of Gachyiland! 
Tap and earn Polymer (PLM) Tokens!

Gachyiland is a Web3-enabled gaming ecosystem that integrates secure user authentication, a marketplace for game assets, and seamless in-game item purchases.

Got friends, relatives, co-workers?
Bring them all into the game.
More buddies, more PLM Tokens!

Fine Print: 
  - Unless otherwise stated, 1  Coin in the game = 0.25 gPLM
  - 1 PLM = 1000 gPLM
  - Token claims will occur later.
  - Game available for a limited period only. 
  - Real Human or Genuine Taps  only otherwise your ID will be blacklisted and any tokens that you earned will be nullified.

Developed By @Gachyiland`;
        bot.
            sendMediaGroup
            (chatId, [
                {
                    type
                        :
                        "photo"
                    ,
                    media
                        : imageUrl,
                    caption
                        : gameDescription,
                    parse_mode
                        :
                        "HTML"
                }
            ]).
            catch
            (
                error => {
                    console.
                        error
                        (
                            "Error sending media group:"
                            , error);
                });
    });
}