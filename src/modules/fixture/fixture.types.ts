// ---------- League ----------

export interface LeagueBasic {
  id: number;
  name: string;
  type: string;
  logo: string;
}

// ---------- Country ----------

export interface LeagueCountry {
  name: string;
  code: string | null;
  flag: string | null;
}

// ---------- Season coverage ----------

export interface SeasonCoverageFixtures {
  events: boolean;
  lineups: boolean;
  statistics_fixtures: boolean;
  statistics_players: boolean;
}

export interface SeasonCoverage {
  fixtures: SeasonCoverageFixtures;
  standings: boolean;
  players: boolean;
  top_scorers: boolean;
  top_assists: boolean;
  top_cards: boolean;
  injuries: boolean;
  predictions: boolean;
  odds: boolean;
}

export interface LeagueSeason {
  year: number;
  start: string;
  end: string;
  current: boolean;
  coverage: SeasonCoverage;
}

// ---------- League item ----------

export interface LeagueItem {
  league: LeagueBasic;
  country: LeagueCountry;
  seasons: LeagueSeason[];
}

// ---------- Raw API response ----------

export interface AllLeagueApiResponse {
  get: string;
  parameters: unknown[];
  errors: unknown[];
  results: number;
  paging: { current: number; total: number };
  response: LeagueItem[];
}

/** Shape returned by /api/all-league route */
export interface AllLeagueResponse {
  results: LeagueItem[];
}

// ---------- Fixture ----------

export interface FixtureVenue {
  id: number | null;
  name: string | null;
  city: string | null;
}

export interface FixtureStatus {
  long: string;
  short: string;
  elapsed: number | null;
  extra: number | null;
}

export interface FixtureInfo {
  id: number;
  referee: string | null;
  timezone: string;
  date: string;
  timestamp: number;
  periods: {
    first: number | null;
    second: number | null;
  };
  venue: FixtureVenue;
  status: FixtureStatus;
}

export interface FixtureLeague {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string | null;
  season: number;
  round: string;
  standings: boolean;
}

export interface FixtureTeam {
  id: number;
  name: string;
  logo: string;
  winner: boolean | null;
}

export interface FixtureTeams {
  home: FixtureTeam;
  away: FixtureTeam;
}

export interface FixtureGoals {
  home: number | null;
  away: number | null;
}

export interface FixtureScoreDetail {
  home: number | null;
  away: number | null;
}

export interface FixtureScore {
  halftime: FixtureScoreDetail;
  fulltime: FixtureScoreDetail;
  extratime: FixtureScoreDetail;
  penalty: FixtureScoreDetail;
}

export interface FixtureItem {
  fixture: FixtureInfo;
  league: FixtureLeague;
  teams: FixtureTeams;
  goals: FixtureGoals;
  score: FixtureScore;
}
