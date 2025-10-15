const spells = require("../spells.json");

function getDefaultHealthForLevel(level) {
  return 50 * level;
}

function getDefaultManaForLevel(magicLevel) {
  return 150 * magicLevel;
}

function profile(message, command, db) {
  if (command === "profile") {
    db.get(
      `SELECT * FROM users WHERE id = ?`,
      [message.author.id],
      (err, row) => {
        if (err) {
          console.error(err.message);
          return message.channel.send(
            "There was an error loading your profile."
          );
        }

        if (!row) {
          return message.channel.send(
            "You are not registered. Use !register to sign up."
          );
        }

        const magicLevel = row.magic_level || 0;
        const maxHealth = getDefaultHealthForLevel(row.level);
        const maxMana = getDefaultManaForLevel(magicLevel);

        // Separate unlocked and locked spells
        const unlockedSpells = spells.filter(
          (spell) => spell.levelRequirement <= magicLevel
        );

        const lockedSpells = spells.filter(
          (spell) => spell.levelRequirement > magicLevel
        );

        const unlockedList =
          unlockedSpells.length > 0
            ? unlockedSpells
                .map(
                  (spell) =>
                    `**${spell.name}** (Damage: ${spell.damage}, Mana: ${spell.manaCost}) - ${spell.description}`
                )
                .join("\n")
            : "None";

        const lockedList =
          lockedSpells.length > 0
            ? lockedSpells
                .map(
                  (spell) =>
                    `**${spell.name}** (Requires Magic Level: ${spell.levelRequirement})`
                )
                .join("\n")
            : "None";

        message.channel.send(
          `Profile of ${row.username}:\n` +
            `Level: ${row.level}\n` +
            `EXP: ${row.exp}\n` +
            `Gold: ${row.gold}\n` +
            `Wood: ${row.wood}\n` +
            `Stone: ${row.stone}\n` +
            `Fish: ${row.fish}\n` +
            `Strength: ${row.strength}\n` +
            `Magic Level: ${magicLevel}\n` +
            `Mana: ${row.mana}/${maxMana}\n` +
            `Magic EXP: ${row.magic_exp}\n` +
            `Health: ${row.health}/${maxHealth}\n` +
            `Stealth: ${row.stealth}\n` +
            `Meat: ${row.meat}\n` +
            `Wheat: ${row.wheat}\n` +
            `Bread: ${row.bread}\n` +
            `Skin: ${row.skin}\n` +
            `Deaths: ${row.death}\n` +
            `PvP: ${row.pvp}\n` +
            `Dungeon: ${row.dungeon}\n\n` +
            `**Unlocked Spells:**\n${unlockedList}\n\n` +
            `**Locked Spells:**\n${lockedList}`
        );
      }
    );
  }
}

module.exports = profile;
