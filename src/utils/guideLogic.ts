export interface BlogArticle {
  id: string;
  category: 'Vie des Clubs' | 'Réussite & Stages' | 'Événements UIZ' | 'Mobilité & Erasmus+';
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}

export interface TimelineEvent {
  id: string;
  title: string;
  dateBadge: string;
  category: 'phare' | 'local' | 'civisme';
  description: string;
  highlight?: string;
}

export function filterBlogArticles<T extends { category: string; title: string; excerpt: string }>(
  articles: T[],
  selectedCategory: string,
  searchQuery = ''
): T[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  return articles.filter((article) => {
    const matchesCategory =
      selectedCategory === 'Tous' || article.category === selectedCategory;
    const matchesSearch =
      !normalizedQuery ||
      article.title.toLowerCase().includes(normalizedQuery) ||
      article.excerpt.toLowerCase().includes(normalizedQuery) ||
      article.category.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesSearch;
  });
}

export function calculateStepperProgress(currentStep: number, totalSteps = 7): number {
  if (totalSteps <= 1) return 100;
  const clamped = Math.max(1, Math.min(totalSteps, currentStep));
  return Math.round((clamped / totalSteps) * 100);
}

export function searchGuideItems<
  T extends { title: string; description: string; section: string; tags?: string[] }
>(items: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return items.filter((item) => {
    const inTitle = item.title.toLowerCase().includes(q);
    const inDesc = item.description.toLowerCase().includes(q);
    const inSection = item.section.toLowerCase().includes(q);
    const inTags = item.tags ? item.tags.some((t) => t.toLowerCase().includes(q)) : false;
    return inTitle || inDesc || inSection || inTags;
  });
}

export function getNextCarouselIndex(currentIndex: number, step: number, totalItems: number): number {
  if (totalItems <= 0) return 0;
  return ((currentIndex + step) % totalItems + totalItems) % totalItems;
}

export function getFormationPdfPath(formationId: string): string {
  const pdfMap: Record<string, string> = {
    gemd: '/assets/aistudio/GEMD_4243125d.pdf',
    mge: '/assets/aistudio/MGE_3b29ff21.pdf',
    endeb: '/assets/aistudio/ENDEB_d265f5e0.pdf',
    mci: '/assets/aistudio/MCI_580fbc3e.pdf'
  };
  return pdfMap[formationId.toLowerCase()] || pdfMap.gemd;
}

