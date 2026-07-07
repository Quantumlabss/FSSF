const axios = require('axios');

const DISCORD_API = 'https://discord.com/api/v10';

// Exchange an OAuth2 "code" for an access token.
async function exchangeCode(code) {
  const body = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
  });

  const { data } = await axios.post(`${DISCORD_API}/oauth2/token`, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return data; // { access_token, token_type, expires_in, refresh_token, scope }
}

// Get the logged-in user's basic Discord profile.
async function getDiscordUser(accessToken) {
  const { data } = await axios.get(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data; // { id, username, discriminator, avatar, email, ... }
}

// Get the user's member object (incl. roles) within the unit's guild.
// Requires the "guilds.members.read" scope on the OAuth2 grant.
async function getGuildMember(accessToken) {
  const { data } = await axios.get(
    `${DISCORD_API}/users/@me/guilds/${process.env.DISCORD_GUILD_ID}/member`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return data; // { roles: [...], nick, ... }
}

function avatarUrl(discordUser) {
  if (!discordUser.avatar) {
    const fallback = Number(discordUser.discriminator || '0') % 5;
    return `https://cdn.discordapp.com/embed/avatars/${fallback}.png`;
  }
  return `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`;
}

// Translate a Discord member's role ID list into our internal app role,
// using the ROLE_MAP_* env vars (highest privilege wins).
function mapDiscordRolesToAppRole(discordRoleIds = []) {
  const ids = new Set(discordRoleIds);
  if (process.env.ROLE_MAP_ADMIN && ids.has(process.env.ROLE_MAP_ADMIN)) return 'admin';
  if (process.env.ROLE_MAP_OFFICER && ids.has(process.env.ROLE_MAP_OFFICER)) return 'officer';
  if (process.env.ROLE_MAP_NCO && ids.has(process.env.ROLE_MAP_NCO)) return 'nco';
  if (process.env.ROLE_MAP_MEMBER && ids.has(process.env.ROLE_MAP_MEMBER)) return 'member';
  return 'recruit';
}

// Translate a Discord member's role ID list into a rank name, based on
// RANK_ROLE_IDS="roleId:Name,roleId:Name" (highest tier listed wins - last match).
function mapDiscordRolesToRankName(discordRoleIds = []) {
  const pairs = (process.env.RANK_ROLE_IDS || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => p.split(':'));

  const ids = new Set(discordRoleIds);
  let match = null;
  for (const [roleId, rankName] of pairs) {
    if (ids.has(roleId)) match = rankName;
  }
  return match;
}

module.exports = {
  exchangeCode,
  getDiscordUser,
  getGuildMember,
  avatarUrl,
  mapDiscordRolesToAppRole,
  mapDiscordRolesToRankName,
};
