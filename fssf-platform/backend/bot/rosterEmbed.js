const { EmbedBuilder } = require('discord.js');

function buildRosterEmbed(members) {
  const grouped = {};
  for (const m of members) {
    const rankName = m.rank ? m.rank.name : 'Unranked';
    grouped[rankName] = grouped[rankName] || [];
    grouped[rankName].push(m.callsign || m.username);
  }

  const embed = new EmbedBuilder()
    .setTitle('FSSF — Live Roster')
    .setColor(0x4a5d3a)
    .setFooter({ text: `${members.length} active member(s) • auto-updated` })
    .setTimestamp(new Date());

  const entries = Object.entries(grouped);
  if (!entries.length) {
    embed.setDescription('No active members on record.');
  } else {
    for (const [rankName, names] of entries) {
      embed.addFields({ name: rankName, value: names.join('\n').slice(0, 1024), inline: true });
    }
  }
  return embed;
}

module.exports = { buildRosterEmbed };
