import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post
} from "@nestjs/common";
import { ApiExcludeEndpoint, ApiOperation } from "@nestjs/swagger";
import { FixtureService } from "./fixture.service";
import { GetFixturesDto } from "./dto/get-fixtures.dto";

@Controller("fixture")
export class FixtureController {
  constructor(private readonly fixtureService: FixtureService) {}

  @Get("health")
  async health() {
    return { status: "ok" };
  }

  @Get("crawl")
  @ApiExcludeEndpoint()
  async crawlFixtures() {
    return this.fixtureService.crawlFixtures();
  }

  @Post("football")
  @ApiOperation({
    summary: "Get fixtures from local file",
    description:
      "Return fixtures previously crawled and stored in the local fixtures.json file. Supports filtering by fixture ids or a date range, sorting by match date, and pagination. When fixture_ids is provided, date filter and pagination are ignored."
  })
  @HttpCode(HttpStatus.OK)
  async getFixturesFromFile(@Body() query: GetFixturesDto) {
    return this.fixtureService.getFixturesFromFile(query);
  }

  @Get("crawl-basketball")
  @ApiExcludeEndpoint()
  async crawlBasketballFixtures() {
    return this.fixtureService.crawlBasketballFixtures();
  }

  @Post("basketball")
  @ApiOperation({
    summary: "Get basketball fixtures from local file",
    description:
      "Return basketball fixtures previously crawled and stored in the local basketball_fixtures.json file. Supports filtering by fixture ids or a date range, sorting by match date, and pagination. When fixture_ids is provided, date filter and pagination are ignored."
  })
  @HttpCode(HttpStatus.OK)
  async getBasketballFixturesFromFile(@Body() query: GetFixturesDto) {
    return this.fixtureService.getBasketballFixturesFromFile(query);
  }

  @ApiExcludeEndpoint()
  @Get("crawl-bassball")
  async crawlBassballFixtures() {
    return this.fixtureService.crawlBassballFixtures();
  }

  @Post("bassball-leagues")
  @ApiOperation({
    summary: "Get bassball leagues",
    description:
      "Return bassball leagues previously crawled and stored in the local bassball_leagues.json file."
  })
  async getBassballLeagues(@Body() query: GetFixturesDto) {
    return this.fixtureService.getBassballFixturesFromFile(query);
  }
}
