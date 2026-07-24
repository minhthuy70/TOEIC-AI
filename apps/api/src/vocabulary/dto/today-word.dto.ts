export class TodayWordDto {
    id: number;
    english: string;
    vietnamese: string;
    pronounce?: string;
    type?: string;
    topic: string;
    explain?: string;
    example?: string;
    exampleVietnamese?: string;
    imageUrl?: string;
    audioUrl?: string;

    isReview: boolean;
}