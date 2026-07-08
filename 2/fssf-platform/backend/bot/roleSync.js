// Two-way-ish role sync helper.
// Source of truth for PERMISSIONS (recruit/member/nco/officer/admin) is Discord roles.
// Source of truth for RANK (Private, Corporal, Sergeant...) is also Discord roles,
// but promotions issued from the website push the *new* Discord role onto the member
// via applyPromotionToDiscord() so both systems stay in lockstep.
const { User, Rank } = require('../src/models');

function mapAppRole(discordRoleIds) {
  const ids = new Set(discordRoleIds);
  if (process.env.ROLE_MAP_ADMIN && ids.has(process.env.ROLE_MAP_ADMIN)) return 'admin';
  if (process.env.ROLE_MAP_OFFICER && ids.has(process.env.ROLE_MAP_OFFICER)) return 'officer';
  if (process.env.ROLE_MAP_NCO && ids.has(process.env.ROLE_MAP_NCO)) return 'nco';
  if (process.env.ROLE_MAP_MEMBER && ids.has(process.env.ROLE_MAP_MEMBER)) return 'member';
  return 'recruit';
}

function mapRankName(discordRoleIds) {
  const pairs = (process.env.RANK_ROLE_IDS || '')
    .split(',').map((p) => p.trim()).filter(Boolean).map((p) => p.split(':'));
  const ids = new Set(discordRoleIds);
  let match = null;
  for (const [roleId, rankName] of pairs) if (ids.has(roleId)) match = rankName;
  return match;
}

// Walks every guild member and reconciles their DB row's role/rank
// with whatever Discord roles they currently hold.
async function syncAllMemberRoles(guild) {
  const members = await guild.members.fetch();
  const ranks = await Rank.findAll();
  const rankByName = Object.fromEntries(ranks.map((r) => [r.name, r]));

  for (const member of members.values()) {
    if (member.user.bot) continue;
    const roleIds = [...member.roles.cache.keys()];
    const appRole = mapAppRole(roleIds);
    const rankName = mapRankName(roleIds);

    const [user] = await User.findOrCreate({
      where: { discordId: member.id },
      defaults: {
        username: member.user.username,
        avatarUrl: member.user.displayAvatarURL(),
        role: appRole,
        rankId: rankName && rankByName[rankName] ? rankByName[rankName].id : null,
      },
    });

    user.username = member.user.username;
    user.role = appRole;
    if (rankName && rankByName[rankName]) user.rankId = rankByName[rankName].id;
    await user.save();
  }
}

// Called after a promotion is issued on the website (see routes/promotions.js)
// to move the member's Discord role forward to match their new in-app rank.
async function applyPromotionToDiscord(guild, discordId, newRankName) {
  const member = await guild.members.fetch(discordId).catch(() => null);
  if (!member) return;

  const pairs = (process.env.RANK_ROLE_IDS || '')
    .split(',').map((p) => p.trim()).filter(Boolean).map((p) => p.split(':'));

  const targetPair = pairs.find(([, name]) => name === newRankName);
  if (!targetPair) return;
  const [targetRoleId] = targetPair;

  // Remove any other rank roles, then add the new one.
  const allRankRoleIds = pairs.map(([id]) => id);
  await member.roles.remove(allRankRoleIds.filter((id) => member.roles.cache.has(id)));
  await member.roles.add(targetRoleId);
}

module.exports = { syncAllMemberRoles, applyPromotionToDiscord, mapAppRole, mapRankName };
