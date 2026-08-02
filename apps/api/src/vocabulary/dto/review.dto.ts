import { IsInt } from "class-validator";

export class ReviewDto {
  userId?: number;

  @IsInt()
  vocabularyId: number;
}