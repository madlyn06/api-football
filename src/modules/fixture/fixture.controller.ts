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

  @Get("leagues")
  @ApiExcludeEndpoint()
  async getLeagues() {
    return this.fixtureService.getLeagues();
  }

  @Get("crawl")
  @ApiExcludeEndpoint()
  async crawlFixtures() {
    return this.fixtureService.crawlFixtures();
  }

  @Post("all")
  @ApiOperation({
    summary: "Get fixtures from local file",
    description:
      "Return fixtures previously crawled and stored in the local fixtures.json file. Supports filtering by fixture ids or a date range, sorting by match date, and pagination. When fixture_ids is provided, date filter and pagination are ignored."
  })
  @HttpCode(HttpStatus.OK)
  async getFixturesFromFile(@Body() query: GetFixturesDto) {
    return this.fixtureService.getFixturesFromFile(query);
  }
}
