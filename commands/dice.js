function dice(message, command, db) {
  const args = message.content.split(" ");
  const bet = parseInt(args[1]);

  if (!bet || isNaN(bet) || bet <= 0) {
    return message.channel.send("Please enter a valid bet amount.");
  }

  db.get(
    `SELECT * FROM users WHERE id = ?`,
    [message.author.id],
    (err, user) => {
      if (err) {
        console.error(err.message);
        return message.channel.send("Database error.");
      }
      if (!user) {
        return message.channel.send(
          "You are not registered. Use `!register` first."
        );
      }

      if (user.gold < bet) {
        return message.channel.send(
          "You don’t have enough gold to make that bet."
        );
      }

      const playerRoll = Math.floor(Math.random() * 99) + 1;
      const dealerRoll = Math.floor(Math.random() * 99) + 1;

      message.channel.send("You roll the dice...").then(() => {
        setTimeout(() => {
          message.channel.send(`You rolled a **${playerRoll}**.`).then(() => {
            setTimeout(() => {
              message.channel.send("The dealer is rolling...").then(() => {
                setTimeout(() => {
                  message.channel
                    .send(`Dealer rolled a **${dealerRoll}**.`)
                    .then(() => {
                      let resultMessage = "";

                      if (playerRoll > dealerRoll) {
                        db.run(
                          `UPDATE users SET gold = gold + ? WHERE id = ?`,
                          [bet, message.author.id]
                        );
                        resultMessage = `You won **${bet}** gold!`;
                      } else if (playerRoll < dealerRoll) {
                        db.run(
                          `UPDATE users SET gold = gold - ? WHERE id = ?`,
                          [bet, message.author.id]
                        );
                        resultMessage = `The dealer wins! You lost **${bet}** gold.`;
                      } else {
                        resultMessage = `It's a tie! You get your **${bet}** gold back.`;
                      }

                      message.channel.send(resultMessage);
                    });
                }, 1000);
              });
            }, 1000);
          });
        }, 1000);
      });
    }
  );
}

module.exports = dice;
