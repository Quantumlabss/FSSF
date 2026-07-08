// FSSF Discord Bot
//
// This module exports startBot(), which server.js calls automatically on
// boot (see ENABLE_BOT in .env) so `npm run dev` / `npm start` runs the API
// and the bot together in one process. It can still be run standalone with
// `node bot/bot.js` if you'd rather keep them separate.
//
// Responsibilities:
//  1. Role sync: keeps each member's app role/rank in `users`/`ranks` lined up
//     with their Discord roles (via ROLE_MAP_* and RANK_ROLE_IDS in .env).
//  2. Live roster updates: periodically posts/edits an embed in a configured
//     channel showing the current active roster.
//  3. Slash commands: /roster, /events.
const { Client, GatewayIntentBits, Partials, EmbedBuilder, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { User, Rank, Event } = require('../src/models');
const { Op } = require('sequelize');
const { syncAllMemberRoles } = require('./roleSync');
const { buildRosterEmbed } = require('./rosterEmbed');

let client = null;
let started = false;
let rosterMessageId = null;

const commands = [
  new SlashCommandBuilder().setName('roster').setDescription('Show the current live FSSF roster'),
  new SlashCommandBuilder().setName('events').setDescription('Show upcoming FSSF operations/events'),
].map((c) => c.toJSON());

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
  await rest.put(
    Routes.applicationGuildCommands(client.user.id, process.env.DISCORD_GUILD_ID),
    { body: commands }
  );
  console.log('[bot] Slash commands registered.');
}

async function runSyncCycle() {
  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
    await syncAllMemberRoles(guild);
    await refreshRosterEmbed(guild);
    console.log(`[bot] [${new Date().toISOString()}] Role sync + roster embed refreshed.`);
  } catch (err) {
    console.error('[bot] Sync cycle failed:', err.message);
  }
}

// Posts (or edits, if already posted) a live roster embed in BOT_ROSTER_CHANNEL_ID.
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

async function handleInteraction(interaction) {
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
}

// Call this once, after the DB connection is up. Safe to call even if
// DISCORD_BOT_TOKEN isn't set — it just logs a notice and skips.
async function startBot() {
  if (started) return client;
  if (!process.env.DISCORD_BOT_TOKEN || !process.env.DISCORD_GUILD_ID) {
    console.log('[bot] DISCORD_BOT_TOKEN or DISCORD_GUILD_ID not set — skipping bot startup.');
    return null;
  }

  started = true;
  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
    ],
    partials: [Partials.GuildMember],
  });

  client.once('ready', async () => {
    console.log(`[bot] Logged in as ${client.user.tag}`);
    try {
      await registerCommands();
    } catch (err) {
      console.error('[bot] Failed to register slash commands:', err.message);
    }

    const intervalMin = Number(process.env.BOT_SYNC_INTERVAL_MINUTES || 10);
    runSyncCycle();
    setInterval(runSyncCycle, intervalMin * 60 * 1000);
  });

  client.on('interactionCreate', (interaction) => {
    handleInteraction(interaction).catch((err) => console.error('[bot] Interaction error:', err));
  });

  client.on('error', (err) => console.error('[bot] Client error:', err.message));

  try {
    await client.login(process.env.DISCORD_BOT_TOKEN);
  } catch (err) {
    console.error('[bot] Login failed:', err.message);
    started = false;
    client = null;
  }

  return client;
}

module.exports = { startBot, getClient: () => client };

// Still runnable standalone: `node bot/bot.js`
if (require.main === module) {
  require('dotenv').config();
  const sequelize = require('../src/config/db');
  sequelize.authenticate()
    .then(() => startBot())
    .catch((err) => {
      console.error('[bot] Could not connect to database:', err.message);
      process.exit(1);
    });
}
