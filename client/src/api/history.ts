export interface AccuracySegment {
  label: string;
  accuracy: number;
}

export interface HistorySummary {
  totalAttempts: number;
  accuracyPerDifficulty: AccuracySegment[];
  accuracyByType: AccuracySegment[];
  isDemoData?: boolean;
}

export interface Attempt {
  id: string;
  title: string;
  difficulty: string;
  type: string;
  status?: string;
  createdAt?: string;
}

const demoSummary: HistorySummary = {
  totalAttempts: 128,
  accuracyPerDifficulty: [
    { label: 'Easy', accuracy: 92 },
    { label: 'Medium', accuracy: 78 },
    { label: 'Hard', accuracy: 64 },
  ],
  accuracyByType: [
    { label: 'Arrays', accuracy: 86 },
    { label: 'Graphs', accuracy: 71 },
    { label: 'Dynamic Programming', accuracy: 68 },
  ],
  isDemoData: true,
};

const demoAttempts: Attempt[] = [
  {
    id: 'demo-1',
    title: 'Two Sum',
    difficulty: 'Easy',
    type: 'Arrays',
    status: 'Correct',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    type: 'Trees',
    status: 'Correct',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'demo-3',
    title: 'Merge Intervals',
    difficulty: 'Medium',
    type: 'Intervals',
    status: 'Partial',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
  },
  {
    id: 'demo-4',
    title: 'Word Ladder',
    difficulty: 'Hard',
    type: 'Graphs',
    status: 'Incorrect',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'demo-5',
    title: 'Coin Change',
    difficulty: 'Medium',
    type: 'Dynamic Programming',
    status: 'Correct',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

const normalizeSegments = (
  value: unknown,
  fallback: AccuracySegment[] = [],
): AccuracySegment[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => ({
        label:
          (entry as { label?: string; difficulty?: string; name?: string }).label ??
          (entry as { difficulty?: string }).difficulty ??
          (entry as { name?: string }).name ??
          'Unknown',
        accuracy: Math.round(
          Number((entry as { accuracy?: number; value?: number }).accuracy ?? (entry as { value?: number }).value ?? 0),
        ),
      }))
      .filter((segment) => Boolean(segment.label));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, number>).map(([label, accuracy]) => ({
      label,
      accuracy: Math.round(Number(accuracy)),
    }));
  }

  return fallback;
};

const buildSummaryFromPayload = (payload: any): HistorySummary => {
  if (!payload) return demoSummary;

  const summaryPayload = payload.summary ?? payload.stats ?? payload;
  const totalAttempts =
    summaryPayload.totalAttempts ?? summaryPayload.attemptsCount ?? summaryPayload.total ?? demoSummary.totalAttempts;

  const accuracyPerDifficulty = normalizeSegments(
    summaryPayload.accuracyPerDifficulty ?? summaryPayload.accuracyByDifficulty,
    demoSummary.accuracyPerDifficulty,
  );

  const accuracyByType = normalizeSegments(summaryPayload.accuracyByType, demoSummary.accuracyByType);

  return {
    totalAttempts,
    accuracyPerDifficulty,
    accuracyByType,
    isDemoData: false,
  };
};

export const fetchHistorySummary = async (): Promise<HistorySummary> => {
  try {
    const response = await fetch('/api/history/summary');
    if (response.ok) {
      const payload = await response.json();
      return buildSummaryFromPayload(payload);
    }

    const fallbackResponse = await fetch('/api/auth/me');
    if (fallbackResponse.ok) {
      const payload = await fallbackResponse.json();
      return buildSummaryFromPayload(payload);
    }
  } catch (error) {
    console.warn('Unable to fetch history summary, showing demo data instead.', error);
  }

  return demoSummary;
};

export const fetchRecentAttempts = async (limit = 10): Promise<Attempt[]> => {
  try {
    const response = await fetch(`/api/history?limit=${limit}`);
    if (response.ok) {
      const payload = await response.json();
      const attempts = Array.isArray(payload?.attempts) ? payload.attempts : payload;
      if (Array.isArray(attempts)) {
        return attempts.slice(0, limit).map((attempt) => ({
          id: (attempt as { id?: string; _id?: string }).id ?? (attempt as { _id?: string })._id ?? crypto.randomUUID(),
          title: (attempt as { title?: string; question?: string }).title ?? (attempt as { question?: string }).question ?? 'Untitled question',
          difficulty: (attempt as { difficulty?: string }).difficulty ?? 'Unknown',
          type: (attempt as { type?: string; category?: string }).type ?? (attempt as { category?: string }).category ?? 'General',
          status: (attempt as { status?: string; result?: string }).status ?? (attempt as { result?: string }).result,
          createdAt: (attempt as { createdAt?: string; timestamp?: string }).createdAt ?? (attempt as { timestamp?: string }).timestamp,
        }));
      }
    }
  } catch (error) {
    console.warn('Unable to fetch recent attempts, showing demo attempts instead.', error);
  }

  return demoAttempts.slice(0, limit);
};
