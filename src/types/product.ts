export type ImageStatus = "verified" | "needs-review" | "missing";

export type ProductStatus = "published" | "needs-review" | "hidden";

export type Product = {
  id: string;
  mlbId: string;
  slug: string;
  title: string;
  shortTitle: string;
  family: string;
  category: string;
  categorySlug: string;
  categoryDescription: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  condition: "novo" | "usado";
  packageType: "unit" | "kit";
  quantity: number;
  price?: number;
  priceLastVerifiedAt?: string;
  currency: "BRL";
  status: ProductStatus;
  featured: boolean;
  marketplaceUrl: string;
  linkStatus?: "confirmed" | "derivedFromExport" | "storeFallback";
  image: string;
  gallery: string[];
  imageStatus: ImageStatus;
  imageNotes?: string;
  shortDescription: string;
  fullDescription: string;
  technicalHighlights: string[];
  specifications: {
    label: string;
    value: string;
  }[];
  applications: string[];
  compatibility?: string[];
  includedItems: string[];
  warnings?: string[];
  searchTerms: string[];
  lastVerifiedAt?: string;
};
