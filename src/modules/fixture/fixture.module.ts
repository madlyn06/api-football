import { Module } from "@nestjs/common";

import { HttpModule } from "src/integrations/http";

import { FixtureController } from "./fixture.controller";
import { FixtureCron } from "./fixture.cron";
import { FixtureService } from "./fixture.service";

@Module({
  imports: [HttpModule],
  controllers: [FixtureController],
  providers: [FixtureService, FixtureCron],
  exports: [FixtureService],
})
export class FixtureModule {}
