function skin(message, command, db, handleLevelUp) {
  if (command === "skin") {
    db.get(
      `SELECT * FROM users WHERE id = ?`,
      [message.author.id],
      (err, row) => {
        if (err) {
          return console.error(err.message);
        }
        if (!row) {
          return message.channel.send(
            "You are not registered. Use !register to signup."
          );
        }

        if (row.meat < 1) {
          return message.channel.send("You need at least 1 meat to skin.");
        }

        const skinPelt = Math.random() < 0.75;
        const ruinedPelt = Math.random() < 0.25;

        // Deduct 1 meat regardless of success/failure
        db.run(
          `UPDATE users SET meat = meat - 1 WHERE id = ?`,
          [message.author.id],
          function (err) {
            if (err) {
              return console.error(err.message);
            }

            if (skinPelt) {
              db.run(
                `UPDATE users SET skin = skin + 1, exp = exp + 25 WHERE id = ?`,
                [message.author.id],
                function (err) {
                  if (err) return console.error(err.message);
                  message.channel.send(
                    "You skin the meat, gaining 1 pelt and 25 exp!"
                  );
                  handleLevelUp(message.author.id);
                }
              );
            } else if (ruinedPelt) {
              db.run(
                `UPDATE users SET health = health - 25, exp = exp - 10 WHERE id = ?`,
                [message.author.id],
                function (err) {
                  if (err) return console.error(err.message);
                  message.channel.send(
                    "You messed up the skinning, cutting yourself. You take 25 damage and lose 10 exp."
                  );
                  handleLevelUp(message.author.id);
                }
              );
            } else {
              message.channel.send(
                "You tried to skin it, but the pelt was already ruined."
              );
            }
          }
        );
      }
    );
  }
}

module.exports = skin;
