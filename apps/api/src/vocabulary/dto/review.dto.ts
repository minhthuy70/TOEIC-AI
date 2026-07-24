import { IsInt } from 'class-validator';

export class ReviewDto {
    @IsInt()
    userId: number;

    @IsInt()
    vocabularyId: number;
}