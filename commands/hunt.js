function resetToLevel1(userId, db, client) {
  const defaultHealth = 50;
  const defaultStrength = 10;
  const defaultFish = 0;
  const defaultMeat = 0;
  const defaultStealth = 0;
  const defaultWood = 0;
  const defaultWheat = 0;
  const defaultBread = 0;
  const defaultStone = 0;
  const defaultSkin = 0;

  db.run(
    `UPDATE users SET level = 1, exp = 0, health = ?, strength = ?, fish = ?, meat = ?, stealth = ?, wood = ?, wheat = ?, bread = ?, stone = ?, skin = ? WHERE id = ?`,
    [
      defaultHealth,
      defaultStrength,
      defaultFish,
      defaultMeat,
      defaultStealth,
      defaultWood,
      defaultWheat,
      defaultBread,
      defaultStone,
      defaultSkin,
      userId,
    ],
    (err) => {
      if (err) return console.error(err.message);

      const user = client.users.cache.get(userId);
      if (user) {
        user.send(`You died. Time to start over.`);
      }
    }
  );
}

function hunt(message, command, db, handleLevelUp) {
  if (command === "hunt") {
    db.get(
      `SELECT * FROM users WHERE id = ?`,
      [message.author.id],
      (err, row) => {
        if (err) return console.error(err.message);

        if (!row) {
          return message.channel.send(
            "You are not registered. Use !register to signup."
          );
        }

        const huntRabbit = Math.random() < 0.25;
        const getAttacked = Math.random() < 0.1;

        if (huntRabbit) {
          db.run(
            `UPDATE users SET meat = meat + 1, exp = exp + 25 WHERE id = ?`,
            [message.author.id],
            function (err) {
              if (err) return console.error(err.message);
              message.channel.send(
                "You hunt down a rabbit, gaining 1 meat and 25 exp!"
              );
            }
          );
        } else if (getAttacked) {
          db.run(
            `UPDATE users SET health = health - 50, exp = exp - 10 WHERE id = ?`,
            [message.author.id],
            function (err) {
              if (err) return console.error(err.message);

              db.get(
                `SELECT health FROM users WHERE id = ?`,
                [message.author.id],
                (err, row) => {
                  if (err) return console.error(err.message);

                  if (row.health <= 0) {
                    message.channel.send("LOL imagine dying to a fox");
                    resetToLevel1(message.author.id, db, message.client);
                  } else {
                    message.channel.send(
                      "You got attacked by a fox taking 50 damage and losing 10 exp!"
                    );
                  }

                  handleLevelUp(message.author.id);
                }
              );
            }
          );
        } else {
          message.channel.send("You return with nothing");
        }
      }
    );
  }
}

module.exports = hunt;
