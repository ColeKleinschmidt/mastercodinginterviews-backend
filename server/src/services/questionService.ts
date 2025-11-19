import crypto from 'crypto';

export type QuestionType = 'coding' | 'code-output';

export interface QuestionConfig {
  type: QuestionType;
  difficulty?: string;
  language?: string;
}

export interface QuestionInstance {
  id: string;
  type: QuestionType;
  question: string;
  correctAnswer: string;
  explanation: string;
  language?: string;
  difficulty?: string;
  options?: string[];
  userId: string;
  createdAt: Date;
}

export interface QuestionAttempt {
  id: string;
  questionInstanceId: string;
  userId: string;
  question: string;
  userAnswer?: string;
  correctAnswer: string;
  correct: boolean | null;
  explanation: string;
  timeTakenSeconds?: number;
  type: QuestionType;
  language?: string;
  difficulty?: string;
  options?: string[];
  createdAt: Date;
  submittedAt?: Date;
}

export interface AccuracySegment {
  label: string;
  accuracy: number;
}

export interface UserSummary {
  totalAttempts: number;
  accuracyPerDifficulty: AccuracySegment[];
  accuracyByType: AccuracySegment[];
}

const questionInstances = new Map<string, QuestionInstance>();
const questionAttempts = new Map<string, QuestionAttempt>();

const generateOptions = () => [
  'Option A',
  'Option B',
  'Option C',
  'Option D',
];

export const generateQuestionInstance = (
  config: QuestionConfig,
  userId: string,
): { questionInstanceId: string; question: Omit<QuestionInstance, 'id' | 'correctAnswer' | 'explanation' | 'userId' | 'createdAt'> } => {
  const id = crypto.randomUUID();
  const options = config.type === 'code-output' ? generateOptions() : undefined;
  const questionText = `Sample ${config.type} question${config.language ? ` in ${config.language}` : ''}${config.difficulty ? ` (${config.difficulty})` : ''}`;
  const correctAnswer = options ? options[0] : 'Example solution';
  const explanation = 'This is a placeholder explanation for the generated question.';

  const instance: QuestionInstance = {
    id,
    type: config.type,
    language: config.language,
    difficulty: config.difficulty,
    question: questionText,
    correctAnswer,
    explanation,
    options,
    userId,
    createdAt: new Date(),
  };

  questionInstances.set(id, instance);

  return {
    questionInstanceId: id,
    question: {
      type: instance.type,
      language: instance.language,
      difficulty: instance.difficulty,
      question: instance.question,
      options: instance.options,
    },
  };
};

export const submitAttempt = (
  userId: string,
  payload: { questionInstanceId: string; userAnswer: string; timeTakenSeconds?: number },
) => {
  const instance = questionInstances.get(payload.questionInstanceId);

  if (!instance || instance.userId !== userId) {
    return null;
  }

  const normalizedUserAnswer = payload.userAnswer?.trim();
  const normalizedCorrectAnswer = instance.correctAnswer.trim();

  const correct = normalizedUserAnswer === normalizedCorrectAnswer;

  const attemptId = crypto.randomUUID();
  const attempt: QuestionAttempt = {
    id: attemptId,
    questionInstanceId: instance.id,
    userId,
    question: instance.question,
    correctAnswer: instance.correctAnswer,
    explanation: instance.explanation,
    userAnswer: payload.userAnswer,
    correct,
    timeTakenSeconds: payload.timeTakenSeconds,
    type: instance.type,
    language: instance.language,
    difficulty: instance.difficulty,
    options: instance.options,
    createdAt: instance.createdAt,
    submittedAt: new Date(),
  };

  questionAttempts.set(attemptId, attempt);

  return attempt;
};

export const getUserAttempts = (userId: string) => {
  return Array.from(questionAttempts.values())
    .filter((attempt) => attempt.userId === userId)
    .sort((a, b) => (b.submittedAt?.getTime() ?? 0) - (a.submittedAt?.getTime() ?? 0));
};

export const getAttemptById = (id: string, userId: string) => {
  const attempt = questionAttempts.get(id);
  if (!attempt || attempt.userId !== userId) {
    return null;
  }
  return attempt;
};

const buildAccuracySegments = (attempts: QuestionAttempt[], key: 'difficulty' | 'type'): AccuracySegment[] => {
  const stats = new Map<string, { correct: number; total: number }>();

  for (const attempt of attempts) {
    const label = (attempt[key] as string | undefined)?.trim() || 'Unknown';
    const bucket = stats.get(label) ?? { correct: 0, total: 0 };
    bucket.total += 1;
    if (attempt.correct) {
      bucket.correct += 1;
    }
    stats.set(label, bucket);
  }

  return Array.from(stats.entries()).map(([label, { correct, total }]) => ({
    label,
    accuracy: total === 0 ? 0 : Math.round((correct / total) * 100),
  }));
};

export const getUserSummary = (userId: string): UserSummary => {
  const attempts = getUserAttempts(userId);

  return {
    totalAttempts: attempts.length,
    accuracyPerDifficulty: buildAccuracySegments(attempts, 'difficulty'),
    accuracyByType: buildAccuracySegments(attempts, 'type'),
  };
};
