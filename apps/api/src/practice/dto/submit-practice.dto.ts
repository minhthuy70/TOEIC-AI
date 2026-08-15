import {
  IsArray,
  IsInt,
  IsNotEmpty,
  Min,
  ValidateNested,
} from "class-validator";

import { Type } from "class-transformer";

export class PracticeAnswerDto {
  @IsInt()
  @Min(1)
  questionId: number;

  @IsInt()
  @Min(1)
  optionId: number;
}

export class SubmitPracticeDto {
  @IsInt()
  @Min(1)
  sessionId: number;

  @IsArray()
  @ValidateNested({
    each: true,
  })
  @Type(() => PracticeAnswerDto)
  answers: PracticeAnswerDto[];
}