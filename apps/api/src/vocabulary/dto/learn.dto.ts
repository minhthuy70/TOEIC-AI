import { IsInt } from 'class-validator';

export class LearnDto {
    @IsInt()
    userId: number;

    @IsInt()
    vocabularyId: number;
}