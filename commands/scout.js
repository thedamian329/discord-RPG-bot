function scout(message, db, command, client) {
  const targetId =
    message.mentions.users.first()?.id ||
    message.content.split(" ")[1]?.replace(/[^0-9]/g, "");

  if (!targetId) {
    return message.channel.send(
      "Please mention a player to scout! Example: `!scout @username`"
    );
  }

  if (message.author.id === targetId) {
    return message.channel.send("You cannot scout yourself!");
  }

  db.get(`SELECT * FROM users WHERE id = ?`, [targetId], (err, target) => {
    if (err) {
      console.error(err.message);
      return message.channel.send("Database error.");
    }
    if (!target) {
      return message.channel.send("Target not found.");
    }

    db.get(
      `SELECT * FROM users WHERE id = ?`,
      [message.author.id],
      (err, scout) => {
        if (err) {
          console.error(err.message);
          return message.channel.send("Database error.");
        }
        if (!scout) {
          return message.channel.send(
            "You are not registered. Use `!register` to sign up."
          );
        }

        const successChance = Math.min(
          90,
          Math.max(30, 20 + scout.sneak - target.stealth)
        );

        if (Math.random() * 100 > successChance) {
          return message.channel.send(
            `Your scouting attempt failed! ${
              message.mentions.users.first()?.username || "The target"
            } noticed you.`
          );
        }

        let info = `🔍 You successfully scouted **${
          message.mentions.users.first()?.username || "the target"
        }** and found:\n`;

        if (scout.sneak >= 0)
          info += `- **Level:** ${target.level}\n- **Gold:** ${target.gold}\n`;
        if (scout.sneak >= 25)
          info += `- **Health:** ${target.health}\n- **PvP Wins:** ${target.PvP}\n`;
        if (scout.sneak >= 100)
          info += `- **Inventory:** Fish: ${target.fish}, Meat: ${target.meat}, Wood: ${target.wood}\n`;
        if (scout.sneak >= 150)
          info += `- **Full Stats:** Strength: ${target.strength}, Stealth: ${target.stealth}, Deaths: ${target.death}\n`;

        return message.channel.send(info);
      }
    );
  });
}

module.exports = scout;
