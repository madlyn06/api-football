import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
} from "class-validator";

import { PaginationQueryDto } from "src/common/dto/pagination.dto";

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export class GetFixturesDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    type: [Number],
    example: [1, 2, 3, 4, 5],
    description:
      "Get fixtures by these ids. When provided, date filter and pagination are ignored",
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @IsOptional()
  fixture_ids?: number[];

  @ApiPropertyOptional({
    type: String,
    example: "2026-01-01",
    description:
      "Filter fixtures with match date greater than or equal to this",
  })
  @IsISO8601()
  @IsOptional()
  fromDate?: string;

  @ApiPropertyOptional({
    type: String,
    example: "2026-12-31",
    description: "Filter fixtures with match date less than or equal to this",
  })
  @IsISO8601()
  @IsOptional()
  toDate?: string;

  @ApiPropertyOptional({
    enum: SortOrder,
    default: SortOrder.ASC,
    description: "Sort fixtures by match date",
  })
  @IsEnum(SortOrder)
  @IsOptional()
  sort: SortOrder = SortOrder.ASC;
}
