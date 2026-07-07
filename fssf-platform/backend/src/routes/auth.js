const express = require('express');
const router = express.Router();
const {
  exchangeCode,
  getDiscordUser,
  getGuildMember,
  avatarUrl,
  mapDiscordRolesToAppRole,
  mapDiscordRolesToRankName,
} = require('../config/discord');
const { User, Rank } = require('../models');
const { signToken } = require('../utils/jwt');
const { requireAuth } = require('../middleware/auth');

// Step 1: redirect the browser to Discord's consent screen.
router.get('/discord', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: 'identify email guilds.members.read',
  });
  res.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
});

// Step 2: Discord redirects back here with a ?code=...
router.get('/discord/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect(`${process.env.CLIENT_URL}/login?error=missing_code`);

  try {
    const tokenData = await exchangeCode(code);
    const discordUser = await getDiscordUser(tokenData.access_token);

    // Pull guild roles (if the bot/guild config is set up) to auto-sync
    // permission level and rank on every login.
    let appRole = 'recruit';
    let rankName = null;
    try {
      const member = await getGuildMember(tokenData.access_token);
      appRole = mapDiscordRolesToAppRole(member.roles);
      rankName = mapDiscordRolesToRankName(member.roles);
    } catch (e) {
      // User might not be in the guild yet - that's fine, they stay 'recruit'.
    }

    let rank = null;
    if (rankName) {
      rank = await Rank.findOne({ where: { name: rankName } });
    }

    const [user] = await User.findOrCreate({
      where: { discordId: discordUser.id },
      defaults: {
        username: discordUser.username,
        discriminator: discordUser.discriminator,
        avatarUrl: avatarUrl(discordUser),
        email: discordUser.email,
        role: appRole,
        rankId: rank ? rank.id : null,
      },
    });

    // Keep profile + role/rank fresh on every login.
    user.username = discordUser.username;
    user.discriminator = discordUser.discriminator;
    user.avatarUrl = avatarUrl(discordUser);
    user.email = discordUser.email || user.email;
    user.role = appRole;
    if (rank) user.rankId = rank.id;
    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user);
    res.cookie('fssf_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${process.env.CLIENT_URL}/auth/callback`);
  } catch (err) {
    console.error('Discord OAuth error:', err.response?.data || err.message);
    res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.post('/logout', (req, res) => {
  res.clearCookie('fssf_token');
  res.json({ success: true });
});

module.exports = router;
