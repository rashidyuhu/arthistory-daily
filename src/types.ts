export interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: string;
  imageUrl: string;
  imageWidth?: number;
  imageHeight?: number;
  medium: string;
  culture: string;
  period: string;
  creditLine: string;
  source: string;
  imageDescription?: string;
  classification?: string;
  artistDisplayDate?: string;
}

export type ArtworksResponse = Artwork[];
