import { promises as fs } from "node:fs";
import { join } from "node:path";

import { BadRequestException, Injectable, Logger } from "@nestjs/common";

import { HttpService } from "src/integrations/http";

import { GetFixturesDto, SortOrder } from "./dto/get-fixtures.dto";
import type {
  BaseballGameItem,
  BaseballLeagueItem,
  BasketballGameItem,
  BasketballLeagueItem,
  FixtureItem,
  LeagueItem
} from "./fixture.types";

const LEAGUES_URL = "https://v3.football.api-sports.io/leagues";
const GET_ALL_BASSBALL_LEAGUES_URL =
  "https://v1.baseball.api-sports.io/leagues";
const GET_BASSBALL_GAMES_URL = "https://v1.baseball.api-sports.io/teams";
const GET_BASKETBALL_GAMES_URL = "https://v1.basketball.api-sports.io/games";
const FIXTURES_URL = "https://v3.football.api-sports.io/fixtures";
const API_KEY = "8eaa5cf1ebb3554533dfa0fccf499909";
const PUBLIC_DIR = join(process.cwd(), "public");
const OUTPUT_FILE = join(PUBLIC_DIR, "fixtures.json");
const BASKETBALL_OUTPUT_FILE = join(PUBLIC_DIR, "basketball-fixtures.json");
const BASSBALL_OUTPUT_FILE = join(PUBLIC_DIR, "bassball-fixture.json");

@Injectable()
export class FixtureService {
  private readonly logger = new Logger(FixtureService.name);

  constructor(private readonly httpService: HttpService) {}

  async getLeagues() {
    const { data } = await this.httpService.get<{ response: LeagueItem[] }>(
      LEAGUES_URL,
      {
        headers: {
          "x-apisports-key": API_KEY,
          Accept: "application/json"
        }
      }
    );

    const now = new Date();
    const currentYear = now.getFullYear();

    const results = (data?.response ?? []).filter((item) => {
      const season = item.seasons.find((s) => s.year === currentYear);
      if (!season) return false;
      return new Date(season.start) <= now && new Date(season.end) >= now;
    });

    return { results };
  }

  async crawlFixtures() {
    const { results } = await this.getLeagues();

    const now = new Date();
    const currentYear = now.getFullYear();
    const today = now.toISOString().slice(0, 10);
    const allFixtures: FixtureItem[] = [];

    for (const item of results) {
      const season = item.seasons.find((s) => s.year === currentYear);
      if (!season) continue;

      try {
        const { data } = await this.httpService.get<{
          response: FixtureItem[];
        }>(FIXTURES_URL, {
          headers: {
            "x-apisports-key": API_KEY,
            Accept: "application/json"
          },
          params: {
            from: today,
            to: season.end,
            season: season.year,
            league: item.league.id
          }
        });

        allFixtures.push(...(data?.response ?? []));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        this.logger.warn(
          `Failed to fetch fixtures for league ${item.league.id}: ${message}`
        );
      }
    }

    await fs.mkdir(PUBLIC_DIR, { recursive: true });
    await fs.writeFile(
      OUTPUT_FILE,
      JSON.stringify(allFixtures, null, 2),
      "utf-8"
    );

    return { total: allFixtures.length, file: OUTPUT_FILE };
  }

  async getFixturesFromFile(query: GetFixturesDto) {
    const { fixture_ids, fromDate, toDate, sort, page, pageSize } = query;

    const file = await fs.readFile(OUTPUT_FILE, "utf-8");
    let fixtures = JSON.parse(file) as FixtureItem[];

    if (fixture_ids?.length) {
      const ids = new Set(fixture_ids);
      const data = fixtures.filter((item) => ids.has(item.fixture.id));
      return {
        data,
        pagination: {
          page: 1,
          pageSize: data.length,
          totalPages: 1,
          total: data.length
        }
      };
    }

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      throw new BadRequestException("fromDate must not be after toDate");
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const from = fromDate
      ? Math.max(new Date(fromDate).getTime(), startOfToday.getTime())
      : startOfToday.getTime();

    fixtures = fixtures.filter(
      (item) => new Date(item.fixture.date).getTime() >= from
    );

    if (toDate) {
      const to = new Date(toDate).getTime();
      fixtures = fixtures.filter(
        (item) => new Date(item.fixture.date).getTime() <= to
      );
    }

    fixtures.sort((a, b) => {
      const diff =
        new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime();
      return sort === SortOrder.DESC ? -diff : diff;
    });

    const total = fixtures.length;
    const totalPages = Math.ceil(total / pageSize);
    const data = fixtures.slice((page - 1) * pageSize, page * pageSize);

    return {
      data,
      pagination: {
        page,
        pageSize,
        totalPages,
        total
      }
    };
  }

  async getLeaguesBassball() {
    const { data } = await this.httpService.get<{
      response: BaseballLeagueItem[];
    }>(GET_ALL_BASSBALL_LEAGUES_URL, {
      headers: {
        "x-apisports-key": API_KEY,
        Accept: "application/json"
      }
    });

    const now = new Date();
    const currentYear = now.getFullYear();

    const results = (data?.response ?? []).filter((item) => {
      const season = item.seasons.find((s) => s.season === currentYear);
      if (!season) return false;
      return new Date(season.start) <= now && new Date(season.end) >= now;
    });

    return { results };
  }

  async crawlBassballFixtures() {
    const { results } = await this.getLeaguesBassball();

    const now = new Date();
    const currentYear = now.getFullYear();
    const allGames: BaseballGameItem[] = [];

    for (const item of results) {
      const season = item.seasons.find((s) => s.season === currentYear);
      if (!season) continue;

      try {
        const { data } = await this.httpService.get<{
          response: BaseballGameItem[];
        }>(GET_BASSBALL_GAMES_URL, {
          headers: {
            "x-apisports-key": API_KEY,
            Accept: "application/json"
          },
          params: {
            league: item.id,
            season: season.season
          }
        });

        allGames.push(...(data?.response ?? []));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        this.logger.warn(
          `Failed to fetch games for league ${item.id}: ${message}`
        );
      }
    }

    await fs.mkdir(PUBLIC_DIR, { recursive: true });
    await fs.writeFile(
      BASSBALL_OUTPUT_FILE,
      JSON.stringify(allGames, null, 2),
      "utf-8"
    );

    return { total: allGames.length, file: BASSBALL_OUTPUT_FILE };
  }

  async getBassballFixturesFromFile(query: GetFixturesDto) {
    const { fixture_ids, fromDate, toDate, sort, page, pageSize } = query;

    const file = await fs.readFile(BASSBALL_OUTPUT_FILE, "utf-8");
    let fixtures = JSON.parse(file) as BaseballGameItem[];

    if (fixture_ids?.length) {
      const ids = new Set(fixture_ids);
      const data = fixtures.filter((item) => ids.has(item.id));
      return {
        data,
        pagination: {
          page: 1,
          pageSize: data.length,
          totalPages: 1,
          total: data.length
        }
      };
    }

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      throw new BadRequestException("fromDate must not be after toDate");
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const from = fromDate
      ? Math.max(new Date(fromDate).getTime(), startOfToday.getTime())
      : startOfToday.getTime();

    fixtures = fixtures.filter((item) => new Date(item.date).getTime() >= from);

    if (toDate) {
      const to = new Date(toDate).getTime();
      fixtures = fixtures.filter((item) => new Date(item.date).getTime() <= to);
    }

    fixtures.sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sort === SortOrder.DESC ? -diff : diff;
    });

    const total = fixtures.length;
    const totalPages = Math.ceil(total / pageSize);
    const data = fixtures.slice((page - 1) * pageSize, page * pageSize);

    return {
      data,
      pagination: {
        page,
        pageSize,
        totalPages,
        total
      }
    };
  }

  async getBasketballLeagues() {
    const { data } = await this.httpService.get<{
      response: BasketballLeagueItem[];
    }>("https://v1.basketball.api-sports.io/leagues", {
      headers: {
        "x-apisports-key": API_KEY,
        Accept: "application/json"
      }
    });

    const now = new Date();

    const results = (data?.response ?? []).filter((item) => {
      const season = item.seasons.find(
        (s) => new Date(s.start) <= now && new Date(s.end) >= now
      );
      return Boolean(season);
    });

    return { results };
  }

  async crawlBasketballFixtures() {
    const { results } = await this.getBasketballLeagues();

    const now = new Date();
    const allGames: BasketballGameItem[] = [];

    for (const item of results) {
      const season = item.seasons.find(
        (s) => new Date(s.start) <= now && new Date(s.end) >= now
      );
      if (!season) continue;

      try {
        const { data } = await this.httpService.get<{
          response: BasketballGameItem[];
        }>(GET_BASKETBALL_GAMES_URL, {
          headers: {
            "x-apisports-key": API_KEY,
            Accept: "application/json"
          },
          params: {
            league: item.id,
            season: season.season
          }
        });

        allGames.push(...(data?.response ?? []));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        this.logger.warn(
          `Failed to fetch games for league ${item.id}: ${message}`
        );
      }
    }

    await fs.mkdir(PUBLIC_DIR, { recursive: true });
    await fs.writeFile(
      BASKETBALL_OUTPUT_FILE,
      JSON.stringify(allGames, null, 2),
      "utf-8"
    );

    return { total: allGames.length, file: BASKETBALL_OUTPUT_FILE };
  }

  async getBasketballFixturesFromFile(query: GetFixturesDto) {
    const { fixture_ids, fromDate, toDate, sort, page, pageSize } = query;

    const file = await fs.readFile(BASKETBALL_OUTPUT_FILE, "utf-8");
    let fixtures = JSON.parse(file) as BasketballGameItem[];

    if (fixture_ids?.length) {
      const ids = new Set(fixture_ids);
      const data = fixtures.filter((item) => ids.has(item.id));
      return {
        data,
        pagination: {
          page: 1,
          pageSize: data.length,
          totalPages: 1,
          total: data.length
        }
      };
    }

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      throw new BadRequestException("fromDate must not be after toDate");
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const from = fromDate
      ? Math.max(new Date(fromDate).getTime(), startOfToday.getTime())
      : startOfToday.getTime();

    fixtures = fixtures.filter((item) => new Date(item.date).getTime() >= from);

    if (toDate) {
      const to = new Date(toDate).getTime();
      fixtures = fixtures.filter((item) => new Date(item.date).getTime() <= to);
    }

    fixtures.sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sort === SortOrder.DESC ? -diff : diff;
    });

    const total = fixtures.length;
    const totalPages = Math.ceil(total / pageSize);
    const data = fixtures.slice((page - 1) * pageSize, page * pageSize);

    return {
      data,
      pagination: {
        page,
        pageSize,
        totalPages,
        total
      }
    };
  }
}
