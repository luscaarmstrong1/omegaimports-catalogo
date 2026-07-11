export type ProductStatus = "published" | "hidden" | "pending-review";

export type ImageStatus = "verified" | "missing" | "mismatch" | "pending-review";

export type ReviewStatus = "approved" | "blocked" | "pending-review";

export type ProductCondition = "novo" | "usado" | "recondicionado" | "não-confirmado";

export type PackageType = "unit" | "kit" | "unknown";

export type ProductSourceName =
  | "mercadolivre-api"
  | "seller-dashboard-html"
  | "public-listing"
  | "manufacturer-doc"
  | "mercadolivre-xlsx"
  | "manual-review"
  | "legacy-comparison";

export type FieldConfidence = "high" | "medium" | "low";

export type FieldProvenance<T> = {
  value: T;
  source: ProductSourceName;
  sourceRef: string;
  fetchedAt: string;
  confidence: FieldConfidence;
  reviewStatus: ReviewStatus;
};

export type ProductAttribute = {
  id?: string;
  name: string;
  value: string;
  source?: ProductSourceName;
};

export type ProductSpecification = {
  label: string;
  value: string;
  source?: ProductSourceName;
  confidence?: FieldConfidence;
};

export type ProductPicture = {
  url: string;
  secureUrl?: string;
  width?: number;
  height?: number;
  sha256?: string;
  status: ImageStatus;
};

export type ProductDataSource = {
  mode: "api" | "dashboard" | "xlsx" | "offline";
  primary: ProductSourceName;
  fetchedAt: string;
  fields: {
    title: FieldProvenance<string>;
    status: FieldProvenance<ProductStatus>;
    condition: FieldProvenance<ProductCondition>;
    quantity: FieldProvenance<number>;
    price: FieldProvenance<number | null>;
    permalink: FieldProvenance<string>;
    image: FieldProvenance<string | null>;
  };
};

export type Product = {
  id: string;
  mlbId: string;
  userProductId: string | null;
  familyId: string | null;
  title: string;
  normalizedTitle: string;
  shortTitle: string;
  slug: string;
  status: ProductStatus;
  active: boolean;
  condition: ProductCondition;
  categoryId: string | null;
  marketplaceCategory: string | null;
  internalCategory: string;
  internalCategorySlug: string;
  internalSubcategory: string | null;
  brand: string | null;
  model: string | null;
  quantity: number;
  packageType: PackageType;
  stock: number | null;
  price: number | null;
  originalPrice: number | null;
  currency: "BRL";
  priceLastVerifiedAt: string | null;
  permalink: string;
  thumbnail: string | null;
  pictures: ProductPicture[];
  imageStatus: ImageStatus;
  imageVerifiedAt: string | null;
  image: string;
  gallery: string[];
  description: string;
  shortDescription: string;
  technicalSummary: string;
  attributes: ProductAttribute[];
  specifications: ProductSpecification[];
  applications: string[];
  includedItems: string[];
  warnings: string[];
  compatibility: string[];
  relatedProducts: string[];
  featured: boolean;
  bestSeller: boolean;
  source: ProductDataSource;
  fetchedAt: string;
  lastReviewedAt: string | null;
  reviewStatus: ReviewStatus;
  blockingIssues: string[];
  searchTerms: string[];
};
