import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class StartExerciseDto {
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsNumber()
  stage?: number;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @IsNumber()
  questionCount?: number;

  @IsOptional()
  isTimed?: boolean;
}

export class ExerciseAnswerItemDto {
  @IsNumber()
  questionId: number;

  @IsNumber()
  optionId: number;
}

export class SubmitExerciseDto {
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseAnswerItemDto)
  answers: ExerciseAnswerItemDto[];

  @IsOptional()
  @IsNumber()
  durationSeconds?: number;
}
