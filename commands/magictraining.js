function getRequiredMagicExp(level) {
  return 300 * level;
}

function getDefaultManaForMagicLevel(level) {
  return 150 * level;
}

function trainMagic(message, command, db) {
  if (command !== "trainmagic") return;

  const userId = message.author.id;

  db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, row) => {
    if (err) return console.error(err.message);
    if (!row) {
      return message.channel.send(
        "You are not registered. Use !register to signup."
      );
    }

    const currentMagicLevel = row.magic_level || 0;
    const currentMagicExp = row.magic_exp || 0;
    const expGain = Math.floor(Math.random() * 25) + 26;
    let newMagicExp = currentMagicExp + expGain;
    let newMagicLevel = currentMagicLevel;
    const requiredExp = getRequiredMagicExp(currentMagicLevel);

    let leveledUp = false;

    if (newMagicExp >= requiredExp) {
      newMagicExp -= requiredExp;
      newMagicLevel++;
      leveledUp = true;
    }

    const newMana = getDefaultManaForMagicLevel(newMagicLevel);

    // Update database
    db.run(
      `UPDATE users SET magic_level = ?, magic_exp = ?, mana = ? WHERE id = ?`,
      [newMagicLevel, newMagicExp, newMana, userId],
      (err) => {
        if (err) return console.error(err.message);

        if (leveledUp) {
          message.channel.send(
            `✨ You gained ${expGain} Magic EXP and leveled up to **Magic Level ${newMagicLevel}**! Your max mana is now ${newMana}.`
          );
        } else {
          message.channel.send(`✨ You gained ${expGain} Magic EXP!`);
        }
      }
    );
  });
}

module.exports = trainMagic;
