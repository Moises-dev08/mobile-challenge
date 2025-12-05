export type PlatformFilter = 'android' | 'ios';

export type CategoryFilter = 
  | 'web' 
  | 'mobile' 
  | 'backend' 
  | 'frontend' 
  | 'devops' 
  | 'ai' 
  | 'security' 
  | 'database';

export type KeywordMatchMode = 'any' | 'all';

export interface NotificationSettings {
  notificationsEnabled: boolean;
  platformFilters: Set<PlatformFilter>;
  categoryFilters: Set<CategoryFilter>;
  customKeywords: string[];
  keywordMatchMode: KeywordMatchMode;
  minScore: number;
  allowedDomains: string[];
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  lastBackgroundFetch: number;
}

export interface NotificationData {
  articleId: string;
  articleUrl: string;
  articleTitle: string;
}

// For persistence - converting Sets to arrays
export interface NotificationSettingsPersisted {
  notificationsEnabled: boolean;
  platformFilters: PlatformFilter[];
  categoryFilters: CategoryFilter[];
  customKeywords: string[];
  keywordMatchMode: KeywordMatchMode;
  minScore: number;
  allowedDomains: string[];
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  lastBackgroundFetch: number;
}
