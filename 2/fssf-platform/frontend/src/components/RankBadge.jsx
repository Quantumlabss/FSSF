export default function RankBadge({ rank }) {
  if (!rank) return <span className="fssf-rank-badge">UNRANKED</span>;
  return <span className="fssf-rank-badge">{rank.abbreviation || rank.name}</span>;
}
