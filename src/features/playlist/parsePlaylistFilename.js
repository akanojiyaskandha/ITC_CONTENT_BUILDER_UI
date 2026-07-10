const DATE_TOKEN_RE = /[\s_-]*\d{2}[-_][A-Za-z]{3,9}[-_]\d{2,4}(?:\D.*)?$/;

export function parsePlaylistFilename(name) {
  const stem = name.replace(/\.xlsx$/i, "");
  const channelName = stem.replace(DATE_TOKEN_RE, "").trim();
  return { channelName: channelName || stem };
}

// Mirrors backend/src/utils/contingencyHelper.js#isContingencyFile — contingency
// playlists are routed to a different backend job entirely and never have an air file.
export function isContingencyFile(name) {
  return /contingency/i.test(name);
}
