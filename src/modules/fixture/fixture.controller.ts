import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from "@nestjs/common";
import { FixtureService } from "./fixture.service";
import { GetFixturesDto } from "./dto/get-fixtures.dto";

@Controller("fixture")
export class FixtureController {
  constructor(private readonly fixtureService: FixtureService) {}

  @Get("leagues")
  async getLeagues() {
    return this.fixtureService.getLeagues();
  }

  @Get("crawl")
  async crawlFixtures() {
    return this.fixtureService.crawlFixtures();
  }

  @Post("all")
  @HttpCode(HttpStatus.OK)
  async getFixturesFromFile(@Body() query: GetFixturesDto) {
    return this.fixtureService.getFixturesFromFile(query);
  }
}
