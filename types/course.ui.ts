import { CourseItemType, CourseLevel } from "@prisma/client";

export type CourseUI = {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: CourseLevel;
  duration: number;
  thumbnailUrl: string;
  avgRating: number;
  reviewCount: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  isFavorite: boolean;
};

export type CourseDetailUI = CourseUI & {
  updatedAt: Date;
  items: {
    id: string;
    slug: string;
    type: CourseItemType;
    title: string;
    position: number;
    completed: boolean;
  }[];
  enrollmentCount: number;
  userRating?: number;
};
