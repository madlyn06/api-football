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

// ---------- Baseball League ----------

export interface BaseballCountry {
  id: number;
  name: string;
  code: string | null;
  flag: string | null;
}

export interface BaseballSeason {
  season: number;
  current: boolean;
  start: string;
  end: string;
}

export interface BaseballLeagueItem {
  id: number;
  name: string;
  type: string;
  logo: string;
  country: BaseballCountry;
  seasons: BaseballSeason[];
}

export interface BaseballLeagueApiResponse {
  get: string;
  parameters: unknown[];
  errors: unknown[];
  results: number;
  response: BaseballLeagueItem[];
}

// ---------- Baseball Game (Fixture) ----------

export interface BaseballGameStatus {
  long: string;
  short: string;
}

export interface BaseballGameLeague {
  id: number;
  name: string;
  type: string;
  logo: string;
  season: number;
}

export interface BaseballGameTeam {
  id: number;
  name: string;
  logo: string;
}

export interface BaseballGameTeams {
  home: BaseballGameTeam;
  away: BaseballGameTeam;
}

export interface BaseballGameInnings {
  1: number | null;
  2: number | null;
  3: number | null;
  4: number | null;
  5: number | null;
  6: number | null;
  7: number | null;
  8: number | null;
  9: number | null;
  extra: number | null;
}

export interface BaseballGameScoreDetail {
  hits: number | null;
  errors: number | null;
  innings: BaseballGameInnings;
  total: number | null;
}

export interface BaseballGameScores {
  home: BaseballGameScoreDetail;
  away: BaseballGameScoreDetail;
}

export interface BaseballGameItem {
  id: number;
  date: string;
  time: string;
  timestamp: number;
  timezone: string;
  week: string | null;
  status: BaseballGameStatus;
  country: BaseballCountry;
  league: BaseballGameLeague;
  teams: BaseballGameTeams;
  scores: BaseballGameScores;
}

export interface BaseballGameApiResponse {
  get: string;
  parameters: Record<string, string>;
  errors: unknown[];
  results: number;
  response: BaseballGameItem[];
}

// ---------- Basketball League ----------

export interface BasketballSeasonCoverageGamesStatistics {
  teams: boolean;
  players: boolean;
}

export interface BasketballSeasonCoverage {
  games: {
    statistics: BasketballSeasonCoverageGamesStatistics;
  };
  standings: boolean;
  players: boolean;
  odds: boolean;
}

export interface BasketballSeason {
  season: string;
  start: string;
  end: string;
  coverage: BasketballSeasonCoverage;
}

export interface BasketballLeagueItem {
  id: number;
  name: string;
  type: string;
  logo: string;
  country: BaseballCountry;
  seasons: BasketballSeason[];
}

export interface BasketballLeagueApiResponse {
  get: string;
  parameters: Record<string, string>;
  errors: unknown[];
  results: number;
  response: BasketballLeagueItem[];
}

// ---------- Basketball Game (Fixture) ----------

export interface BasketballGameStatus {
  long: string;
  short: string;
  timer: string | null;
}

export interface BasketballGameLeague {
  id: number;
  name: string;
  type: string;
  season: number | string;
  logo: string;
}

export interface BasketballGameTeam {
  id: number;
  name: string;
  logo: string;
}

export interface BasketballGameTeams {
  home: BasketballGameTeam;
  away: BasketballGameTeam;
}

export interface BasketballGameScoreDetail {
  quarter_1: number | null;
  quarter_2: number | null;
  quarter_3: number | null;
  quarter_4: number | null;
  over_time: number | null;
  total: number | null;
}

export interface BasketballGameScores {
  home: BasketballGameScoreDetail;
  away: BasketballGameScoreDetail;
}

export interface BasketballGameItem {
  id: number;
  date: string;
  time: string;
  timestamp: number;
  timezone: string;
  stage: string | null;
  week: string | null;
  venue: string | null;
  status: BasketballGameStatus;
  league: BasketballGameLeague;
  country: BaseballCountry;
  teams: BasketballGameTeams;
  scores: BasketballGameScores;
}

export interface BasketballGameApiResponse {
  get: string;
  parameters: Record<string, string>;
  errors: unknown[];
  results: number;
  response: BasketballGameItem[];
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
