// src/pages/Home.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LiveMatch from '../components/LiveMatch';
import UpcomingMatches from '../components/UpcomingMatches';
import MatchDetail from '../components/MatchDetail';
import Scoreboard from '../components/ScoreBoard';
import Loader from '../components/Loader';
import ball from '../assets/ball.png';
import bat from '../assets/bat.png';
import { getLiveMatches } from '../api/cricApi';
import { homeStyles } from '../assets/dummyStyles';

export default function Home() {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [teamIdInput, setTeamIdInput] = useState('');
  const [teamId, setTeamId] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [liveList, setLiveList] = useState([]);
  const [liveError, setLiveError] = useState(null);

  const stylesInjected = useRef(false);

  // load Google font "Poppins" once
  useEffect(() => {
    const id = 'poppins-google-font';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap';
    document.head.appendChild(link);
  }, []);

  // --- helpers to handle varied API wrapper shapes ---
  const tryExtract = (resp) => {
    if (!resp) return null;
    if (resp.data) return resp.data;
    if (resp.rawResponse && resp.rawResponse.data) return resp.rawResponse.data;
    if (resp.data && resp.data.data) return resp.data.data;
    if (resp.response) return resp.response;
    if (resp.body && typeof resp.body === 'string') {
      try { return JSON.parse(resp.body); } catch { /* ignore */ }
    }
    return resp;
  };

  const flattenLiveMatches = (payload) => {
    if (!payload) return [];

    const out = [];
    if (Array.isArray(payload.matches) && payload.matches.length) out.push(...payload.matches);
    else if (Array.isArray(payload.data) && payload.data.length) out.push(...payload.data);
    else if (Array.isArray(payload)) out.push(...payload);

    if (Array.isArray(payload.typeMatches)) {
      payload.typeMatches.forEach((tm) => {
        const series = tm.seriesMatches || tm.series || [];
        if (Array.isArray(series)) {
          series.forEach((s) => {
            const saw = s.seriesAdWrapper || s;
            if (saw && Array.isArray(saw.matches)) out.push(...saw.matches);
            else if (Array.isArray(s.seriesMatches)) out.push(...s.seriesMatches);
            else if (Array.isArray(s.matches)) out.push(...s.matches);
          });
        }
      });
    }

    if (payload.match) out.push(payload.match);

    const seen = new Set();
    const deduped = [];
    out.forEach((m) => {
      const id = m?.match?.id || m?.matchId || m?.id || m?.unique_id || m?.mid ||
        (m?.matchInfo && m.matchInfo.matchId) || JSON.stringify(m).slice(0, 80);
      if (!seen.has(String(id))) {
        seen.add(String(id));
        deduped.push({ raw: m, id: String(id) });
      }
    });

    return deduped;
  };

  const normalizeMatchId = (id) => {
    if (id === null || id === undefined) return null;
    if (typeof id === 'number') return id;
    const s = String(id);
    const digits = s.match(/\d{2,}/);
    return digits ? digits[0] : s;
  };

  // --- fetch initial live list once (no polling) ---
  const fetchInitialLive = useCallback(async () => {
    setLoadingInitial(true);
    setLiveError(null);
    try {
      const resp = await getLiveMatches();
      const payload = tryExtract(resp);
      const matches = flattenLiveMatches(payload);
      setLiveList(matches);
      if (matches && matches.length > 0) setSelectedMatch(String(matches[0].id));
    } catch (err) {
      console.warn('Auto-select live match failed', err);
      setLiveError(err?.message || 'Failed to load live matches');
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  useEffect(() => { fetchInitialLive(); }, [fetchInitialLive]);

  function onSelectMatch(id) {
    const s = id != null ? String(id) : null;
    setSelectedMatch(s);
    const el = document.getElementById('match-detail');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function viewTeam() {
    if (!teamIdInput) return;
    setTeamId(teamIdInput.trim());
    const el = document.getElementById('team-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // perspective parent for translateZ
  const heroWrapperStyle = {
    perspective: '1100px',
    WebkitPerspective: '1100px',
  };

  const heroBoxStyle = {
    transformStyle: 'preserve-3d',
    WebkitTransformStyle: 'preserve-3d',
  };

  return (
    <div className={homeStyles.root}>
      {/* decorative gradient blobs */}
      <div
        className={homeStyles.blob1}
        style={{ background: homeStyles.blob1Gradient }}
      />
      <div
        className={homeStyles.blob2}
        style={{ background: homeStyles.blob2Gradient }}
      />

      <div className={homeStyles.headerContainer}>
        <Header onSearch={(q) => console.log('search', q)} />
      </div>

      <main className={homeStyles.main}>
        <section className={homeStyles.section}>
          <div className={homeStyles.heroWrapper} style={heroWrapperStyle}>
            <div
              className={homeStyles.heroBox}
              style={heroBoxStyle}
            >
              {/* subtle spotlight */}
              <div aria-hidden className={homeStyles.heroSpotlight} style={{ background: homeStyles.heroSpotlightGradient }} />

              <div className={homeStyles.heroContent}>
                {/* left: heading & CTAs */}
                <div className={homeStyles.heroText}>
                  <h1
                    className={homeStyles.heroTitle}
                    style={{ fontFamily: "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }}
                  >
                    Follow every match. <br /> Real-time scores, classy insights.
                  </h1>

                  <p className={homeStyles.heroSubtitle}>
                    Live scorecards, upcoming fixtures and match analytics — Fast live scores, schedule tracking and compact analytics.
                  </p>

                  <div className={homeStyles.heroButtons}>
                    <button
                      onClick={() => document.getElementById('live')?.scrollIntoView({ behavior: 'smooth' })}
                      className={homeStyles.primaryButton}
                    >
                      View live matches
                    </button>

                    <button
                      onClick={() => document.getElementById('match-detail')?.scrollIntoView({ behavior: 'smooth' })}
                      className={homeStyles.secondaryButton}
                    >
                      Quick details
                    </button>
                  </div>

                  <div className={homeStyles.heroFeatures}>
                    <div className={homeStyles.featureTag}>Live scorecards</div>
                    <div className={homeStyles.featureTag}>Match detail</div>
                    <div className={homeStyles.featureTag}>Team stats</div>
                  </div>
                </div>
              </div>
            </div>

            {/* subtle outer border/shadow */}
            <div className={homeStyles.heroShadow} style={{ boxShadow: '0 8px 30px rgba(14, 30, 50, 0.06)', borderRadius: '24px' }} />

            {/* 3D-style images (bat + ball) - CSS classes control responsive position/size/depth */}
            <img src={bat} alt="bat" className="hero-bat" aria-hidden />
            <img src={ball} alt="ball" className="hero-ball" aria-hidden />
          </div>
        </section>

        {/* top sections: Live + Upcoming */}
        <section className={homeStyles.gridSection}>
          <div className={homeStyles.mainContent}>
            <div id="live" className="space-y-4">
              <div className={homeStyles.sectionHeader}>
                <div className={homeStyles.liveStatus}>
                  <div className={homeStyles.liveCount}>
                    {loadingInitial ? 'Loading…' : `${liveList.length} matches`}
                  </div>
                </div>
              </div>

              {loadingInitial ? (
                <Loader message="Loading live matches…" centered />
              ) : liveError ? (
                <div className="text-sm text-rose-600">{liveError}</div>
              ) : (
                <LiveMatch matches={liveList} onSelect={(id) => onSelectMatch(id)} selectedMatch={selectedMatch} />
              )}
            </div>

            <div id="upcoming">
              <div className={homeStyles.sectionHeader}>
                <h2 className={homeStyles.sectionTitle}>Upcoming Matches</h2>
                <div className={homeStyles.sectionSubtitle}>Plan ahead</div>
              </div>
              <UpcomingMatches onSelect={(id) => onSelectMatch(id)} />
            </div>
          </div>

          {/* Right column: quick score + team preview */}
          <aside className={homeStyles.sidebar}>
            <div className={homeStyles.sidebarSticky}>
              <div className={homeStyles.quickScoreCard}>
                <div className={homeStyles.quickScoreHeader}>
                  <div className={homeStyles.quickScoreTitle}>Quick Score</div>
                  <div className={homeStyles.quickScoreStatus}>Live / Selected</div>
                </div>

                {loadingInitial ? (
                  <Loader message="Loading live summary..." centered />
                ) : !selectedMatch ? (
                  <div className={homeStyles.quickScoreContent}>
                    No match selected. Click any match card to load quick score.
                  </div>
                ) : (
                  <div>
                    <div className={homeStyles.quickScoreContent}>Match: {selectedMatch}</div>
                    <Scoreboard matchId={normalizeMatchId(selectedMatch)} />
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => {
                          const el = document.getElementById('match-detail');
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className={homeStyles.quickScoreButton}
                      >
                        View details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </section>

        {/* details section */}
        <section id="match-detail" className={homeStyles.detailsSection}>
          <div className={homeStyles.detailsCard}>
            <div className={homeStyles.detailsTitle}>Match Details</div>

            {!selectedMatch && (
              <div className={homeStyles.quickScoreContent}>
                No match selected. Click any match card from Live or Upcoming to view details.
              </div>
            )}

            {selectedMatch && (
              <div className={homeStyles.detailsContent}>
                <MatchDetail matchId={normalizeMatchId(selectedMatch)} />
                <div>
                  <div className="text-sm font-medium text-slate-800 mb-3">Scoreboard</div>
                  <Scoreboard matchId={normalizeMatchId(selectedMatch)} />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* team section */}
        <section id="team-section" className={homeStyles.teamSection}>
          {teamId && (
            <div className={homeStyles.teamCard}>
              <div className={homeStyles.teamTitle}>Team Preview: {teamId}</div>
              <div className={homeStyles.quickScoreContent}>
                (Team detail component not included — wire to your team API using teamId.)
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}