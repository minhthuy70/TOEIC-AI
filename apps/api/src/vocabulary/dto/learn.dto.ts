import { IsInt } from "class-validator";

export class LearnDto {
  userId?: number;

  @IsInt()
  vocabularyId: number;
}