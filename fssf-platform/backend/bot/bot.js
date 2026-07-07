// FSSF Discord Bot
// Run with: npm run bot  (i.e. node bot/bot.js)
//
// Responsibilities:
//  1. Role sync: keeps each member's app role/rank in `users`/`ranks` lined up
//     with their Discord roles (via ROLE_MAP_* and RANK_ROLE_IDS in .env).
//  2. Live roster updates: periodically (or on demand) posts/edits an embed
//     in a configured channel showing current online/active roster.
//  3. Slash commands: /roster, /events, /promote (staff only).
require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, REST, Routes, SlashCommandBuilder } = require('discord.js');
const sequelize = require('../src/config/db');
const { User, Rank } = require('../src/models');
const { syncAllMemberRoles } = require('./roleSync');
const { buildRosterEmbed } = require('./rosterEmbed');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
  partials: [Partials.GuildMember],
});

const commands = [
  new SlashCommandBuilder().setName('roster').setDescription('Show the current live FSSF roster'),
  new SlashCommandBuilder().setName('events').setDescription('Show upcoming FSSF operations/events'),
]. map((c) => c.toJSON());

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
  await rest.put(
    Routes.applicationGuildCommands(client.user.id, process.env.DISCORD_GUILD_ID),
    { body: commands }
  );
  console.log('Slash commands registered.');
}

client.once('ready', async () => {
  console.log(`Bot logged in as ${client.user.tag}`);
  await sequelize.authenticate();
  await registerCommands();

  // Kick off periodic role sync + roster embed refresh.
  const intervalMin = Number(process.env.BOT_SYNC_INTERVAL_MINUTES || 10);
  runSyncCycle();
  setInterval(runSyncCycle, intervalMin * 60 * 1000);
});

async function runSyncCycle() {
  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
    await syncAllMemberRoles(guild);
    await refreshRosterEmbed(guild);
    console.log(`[${new Date().toISOString()}] Role sync + roster embed refreshed.`);
  } catch (err) {
    console.error('Sync cycle failed:', err.message);
  }
}

// Posts (or edits, if already posted) a live roster embed in BOT_ROSTER_CHANNEL_ID.
let rosterMessageId = null;
async function refreshRosterEmbed(guild) {
  const channelId = process.env.BOT_ROSTER_CHANNEL_ID;
  if (!channelId) return;

  const channel = await guild.channels.fetch(channelId).catch(() => null);
  if (!channel) return;

  const members = await User.findAll({
    where: { active: true },
    include: [{ model: Rank, as: 'rank' }],
    order: [[{ model: Rank, as: 'rank' }, 'tier', 'DESC']],
  });

  const embed = buildRosterEmbed(members);

  if (rosterMessageId) {
    const msg = await channel.messages.fetch(rosterMessageId).catch(() => null);
    if (msg) return msg.edit({ embeds: [embed] });
  }
  const sent = await channel.send({ embeds: [embed] });
  rosterMessageId = sent.id;
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'roster') {
    const members = await User.findAll({
      where: { active: true },
      include: [{ model: Rank, as: 'rank' }],
      order: [[{ model: Rank, as: 'rank' }, 'tier', 'DESC']],
    });
    await interaction.reply({ embeds: [buildRosterEmbed(members)] });
  }

  if (interaction.commandName === 'events') {
    const { Event } = require('../src/models');
    const { Op } = require('sequelize');
    const events = await Event.findAll({
      where: { eventDate: { [Op.gte]: new Date() } },
      order: [['eventDate', 'ASC']],
      limit: 5,
    });
    const embed = new EmbedBuilder()
      .setTitle('Upcoming FSSF Events')
      .setColor(0x4a5d3a)
      .setDescription(
        events.length
          ? events.map((e) => `**${e.title}** — <t:${Math.floor(new Date(e.eventDate).getTime() / 1000)}:F>`).join('\n')
          : 'No upcoming events scheduled.'
      );
    await interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
