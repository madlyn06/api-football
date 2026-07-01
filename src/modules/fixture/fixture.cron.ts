import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

import { FixtureService } from "./fixture.service";

@Injectable()
export class FixtureCron {
  private readonly logger = new Logger(FixtureCron.name);

  constructor(private readonly fixtureService: FixtureService) {}

  @Cron("0 0 3 * * *", {
    name: "crawl-fixtures",
    timeZone: "Asia/Ho_Chi_Minh",
  })
  async handleCrawlFixtures() {
    this.logger.log("Start crawling fixtures...");

    try {
      const { total, file } = await this.fixtureService.crawlFixtures();
      this.logger.log(`Crawled ${total} fixtures, saved to ${file}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Crawl fixtures failed: ${message}`);
    }
  }
}
