import { promises as fs } from "node:fs";
import { join } from "node:path";

import { BadRequestException, Injectable, Logger } from "@nestjs/common";

import { HttpService } from "src/integrations/http";

import { GetFixturesDto, SortOrder } from "./dto/get-fixtures.dto";
import type { FixtureItem, LeagueItem } from "./fixture.types";

const LEAGUES_URL = "https://v3.football.api-sports.io/leagues";
const FIXTURES_URL = "https://v3.football.api-sports.io/fixtures";
const API_KEY = "8eaa5cf1ebb3554533dfa0fccf499909";
const OUTPUT_FILE = join(process.cwd(), "fixtures.json");

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
          Accept: "application/json",
        },
      },
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
            Accept: "application/json",
          },
          params: {
            from: today,
            to: season.end,
            season: season.year,
            league: item.league.id,
          },
        });

        allFixtures.push(...(data?.response ?? []));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        this.logger.warn(
          `Failed to fetch fixtures for league ${item.league.id}: ${message}`,
        );
      }
    }

    await fs.writeFile(
      OUTPUT_FILE,
      JSON.stringify(allFixtures, null, 2),
      "utf-8",
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
          total: data.length,
        },
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
      (item) => new Date(item.fixture.date).getTime() >= from,
    );

    if (toDate) {
      const to = new Date(toDate).getTime();
      fixtures = fixtures.filter(
        (item) => new Date(item.fixture.date).getTime() <= to,
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
        total,
      },
    };
  }
}
