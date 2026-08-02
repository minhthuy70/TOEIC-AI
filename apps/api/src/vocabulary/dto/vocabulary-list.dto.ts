export class VocabularyItemDto {
  id: number;

  english: string;

  vietnamese: string;

  type: string | null;

  pronounce: string | null;

  topic: string;

  stage: number;

  imageUrl: string | null;

  audioUrl: string | null;
}

export class VocabularyListDto {
  success: boolean;

  total: number;

  page: number;

  limit: number;

  totalPages: number;

  items: VocabularyItemDto[];
}