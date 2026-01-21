// src/api/cricApi.js
import axios from 'axios';

const BASE = 'https://cricbuzz-cricket.p.rapidapi.com';

const RAPIDAPI_KEY = import.meta.env.VITE_RAPID_API_KEY; //to get this go to RapidAPI and Sign in then go to API hub. 
//then https://rapidapi.com/cricketapilive/api/cricbuzz-cricket GO TO THIS WEBSITE AND COPY AND PASTE THE KEY HERE
const RAPIDAPI_HOST = import.meta.env.VITE_RAPID_API_HOST;

const api = axios.create({
  baseURL: BASE,
  headers: {
    'x-rapidapi-key': RAPIDAPI_KEY,
    'x-rapidapi-host': RAPIDAPI_HOST,
  },
  timeout: 20000,
});

async function safeGet(path, opts = {}) {
  try {
    const resp = await api.get(path, opts);
    console.log('[cricApi] GET', path, 'status', resp.status);
    // useful debug: keep the full response for inspection
    return { data: resp.data, rawResponse: resp };
  } catch (err) {
    console.error('[cricApi] GET error', path, err?.response?.status, err?.message);
    // rethrow with helpful payload
    const error = new Error(err?.response?.data?.message || err?.message || 'Network error');
    error.status = err?.response?.status;
    error.response = err?.response?.data;
    throw error;
  }
}

// Matches
export async function getLiveMatches() {
  const { data, rawResponse } = await safeGet('/matches/v1/live');
  return { data, rawResponse };
}
export async function getUpcomingMatches() {
  const { data, rawResponse } = await safeGet('/matches/v1/upcoming');
  return { data, rawResponse };
}
export async function getRecentMatches() {
  const { data, rawResponse } = await safeGet('/matches/v1/recent');
  return { data, rawResponse };
}

// Match center / scorecards
export async function getMatchCenter(matchId) {
  if (!matchId) throw new Error('matchId required');
  const { data, rawResponse } = await safeGet(`/mcenter/v1/${matchId}`);
  return { data, rawResponse };
}
export async function getScard(matchId) {
  if (!matchId) throw new Error('matchId required');
  const { data, rawResponse } = await safeGet(`/mcenter/v1/${matchId}/scard`);
  return { data, rawResponse };
}
export async function getHscard(matchId) {
  if (!matchId) throw new Error('matchId required');
  const { data, rawResponse } = await safeGet(`/mcenter/v1/${matchId}/hscard`);
  return { data, rawResponse };
}

// Team and misc
export async function getTeamForMatch(matchId, teamId) {
  if (!matchId || !teamId) throw new Error('matchId and teamId required');
  const { data, rawResponse } = await safeGet(`/mcenter/v1/${matchId}/team/${teamId}`);
  return { data, rawResponse };
}
export async function getInternationalTeams() {
  const { data, rawResponse } = await safeGet('/teams/v1/international');
  return { data, rawResponse };
}
export async function getTeamStats(teamId, statsType = 'mostRuns') {
  if (!teamId) throw new Error('teamId required');
  const { data, rawResponse } = await safeGet(`/stats/v1/team/${teamId}`, { params: { statsType } });
  return { data, rawResponse };
}

export default {
  getLiveMatches,
  getUpcomingMatches,
  getRecentMatches,
  getMatchCenter,
  getScard,
  getHscard,
  getTeamForMatch,
  getInternationalTeams,
  getTeamStats,
};
