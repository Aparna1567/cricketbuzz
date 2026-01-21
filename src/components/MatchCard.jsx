// src/components/MatchCard.jsx
import React from 'react';
import { flagForTeamName } from '../components/Flag';
import { matchCardStyles } from '../assets/dummyStyles';

/**
 * MatchCard.jsx
 *
 * Props:
 *  - match: { id, teamA: {name, score}, teamB: {name, score}, status, venue, time }
 *  - onClick(id)
 */
export default function MatchCard({ match = {}, onClick }) {
  const {
    id = 'm1',
    teamA = { name: 'Team A', score: '' },
    teamB = { name: 'Team B', score: '' },
    status = '',
    venue = '',
    time = '',
  } = match;

  const flagA = flagForTeamName(teamA?.name || '');
  const flagB = flagForTeamName(teamB?.name || '');

  // Dynamic status color
  const statusColorClass = status?.toLowerCase().includes('live') 
    ? matchCardStyles.statusLive 
    : matchCardStyles.statusDefault;

  return (
    <article
      onClick={() => onClick && onClick(id)}
      className={matchCardStyles.card}
      role="button"
      aria-pressed="false"
    >
      <div className={matchCardStyles.header}>
        <div className={matchCardStyles.venue}>{venue || '—'}</div>
        <div className={matchCardStyles.time}>{time || ''}</div>
      </div>

      <div className={matchCardStyles.content}>
        <div className={matchCardStyles.teamsContainer}>
          <div className={matchCardStyles.teamsWrapper}>
            <div className={matchCardStyles.teamContainer}>
              <div className={matchCardStyles.teamInfo}>
                <div className={matchCardStyles.flagContainer}>
                  {flagA.src ? (
                    <img src={flagA.src} alt={flagA.label} className={matchCardStyles.flagImage} />
                  ) : flagA.emoji ? (
                    <div className={matchCardStyles.flagEmoji}>{flagA.emoji}</div>
                  ) : (
                    <div className={matchCardStyles.flagInitials}>{flagA.initials || 'T'}</div>
                  )}
                </div>
                <div className={matchCardStyles.teamName}>{teamA.name}</div>
              </div>
              <div className={matchCardStyles.teamScore}>{teamA.score || ''}</div>
            </div>

            <div className={matchCardStyles.vs}>vs</div>

            <div className={matchCardStyles.teamContainer}>
              <div className={matchCardStyles.teamInfo}>
                <div className={matchCardStyles.flagContainer}>
                  {flagB.src ? (
                    <img src={flagB.src} alt={flagB.label} className={matchCardStyles.flagImage} />
                  ) : flagB.emoji ? (
                    <div className={matchCardStyles.flagEmoji}>{flagB.emoji}</div>
                  ) : (
                    <div className={matchCardStyles.flagInitials}>{flagB.initials || 'T'}</div>
                  )}
                </div>
                <div className={matchCardStyles.teamName}>{teamB.name}</div>
              </div>
              <div className={matchCardStyles.teamScore}>{teamB.score || ''}</div>
            </div>
          </div>

          <div className={matchCardStyles.statusContainer}>
            <div className={`${matchCardStyles.status} ${statusColorClass}`}>
              {status || 'Status'}
            </div>
            <div className={matchCardStyles.matchId}>#Match {id}</div>
          </div>
        </div>

        <div className={matchCardStyles.scorecard}>Scorecard & commentary</div>
      </div>

      <div className={matchCardStyles.footer}>
        <div>Details</div>
        <div className={matchCardStyles.details}>Updated a few seconds ago</div>
      </div>
    </article>
  );
}