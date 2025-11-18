import { createHash, randomUUID } from 'crypto';

/**
 * Type representing the payload used to request a new question.
 */
export interface QuestionGenerationRequest {
  type: string;
  difficulty: string;
  language: string;
}

/**
 * Allowed strategies for generating dynamic parameters.
 */
export type ParameterGenerator =
  | {
      strategy: 'range';
      min: number;
      max: number;
      step?: number;
    }
  | {
      strategy: 'list';
      values: unknown[];
    }
  | {
      strategy: 'custom';
      generate: () => unknown;
    };

/**
 * Collection of dynamic parameters for a question template.
 */
export type GeneratorConfig = Record<string, ParameterGenerator>;

/**
 * Minimal template representation used by the service.
 */
export interface QuestionTemplate {
  id: string;
  type: string;
  difficulty: string;
  language: string;
  promptTemplate: string;
  codeTemplate?: string;
  generatorConfig: GeneratorConfig;
  renderCorrectAnswer: (params: Record<string, unknown>) => string;
  renderChoices?: (params: Record<string, unknown>, correctAnswer: string) => string[];
  suggestedTimeLimitSeconds?: number;
}

/**
 * Record that represents a persisted question attempt (generated or completed).
 */
export interface QuestionAttemptRecord {
  questionInstanceId: string;
  userId: string;
  templateId: string;
  uniqueKey: string;
  createdAt: Date;
  status: 'generated' | 'submitted';
}

/**
 * Returned object describing the rendered question.
 */
export interface QuestionInstance {
  questionInstanceId: string;
  templateId: string;
  prompt: string;
  codeSnippet?: string;
  params: Record<string, unknown>;
  correctAnswer: string;
  choices?: string[];
  uniqueKey: string;
  type: string;
  difficulty: string;
  language: string;
  timeLimitSeconds: number;
}

/**
 * Repository contract for retrieving templates.
 */
export interface QuestionTemplateRepository {
  findRandomByCriteria(criteria: QuestionGenerationRequest): Promise<QuestionTemplate | undefined>;
}

/**
 * Repository contract for tracking attempts and enforcing uniqueness per user.
 */
export interface QuestionAttemptRepository {
  hasAttemptWithKey(userId: string, uniqueKey: string): Promise<boolean>;
  createGeneratedAttempt(
    payload: Pick<QuestionAttemptRecord, 'userId' | 'templateId' | 'uniqueKey'>
  ): Promise<QuestionAttemptRecord>;
}

/**
 * Default time limits (in seconds) keyed by type and difficulty. These values can be
 * overridden by a template's `suggestedTimeLimitSeconds` field when present.
 */
const DEFAULT_TIME_LIMITS: Record<string, Record<string, number>> = {
  'code-output': {
    easy: 300,
    medium: 600,
    hard: 900,
  },
  coding: {
    easy: 900,
    medium: 1800,
    hard: 2700,
  },
  'multiple-choice': {
    easy: 180,
    medium: 420,
    hard: 600,
  },
};

/**
 * Helper for producing a consistent unique key for a generated question instance.
 */
const computeUniqueKey = (templateId: string, params: Record<string, unknown>): string =>
  createHash('sha256').update(`${templateId}:${JSON.stringify(params)}`).digest('hex');

/**
 * Renders a string template by replacing `{{token}}` occurrences with values from params.
 */
const renderTemplate = (template: string, params: Record<string, unknown>): string =>
  template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, token: string) => {
    const value = params[token];
    return value !== undefined ? String(value) : '';
  });

/**
 * Generates a single parameter value based on the provided generator configuration.
 */
const generateValueFromConfig = (config: ParameterGenerator): unknown => {
  switch (config.strategy) {
    case 'range': {
      const step = config.step ?? 1;
      const span = Math.floor((config.max - config.min) / step);
      const offset = Math.floor(Math.random() * (span + 1));
      return config.min + offset * step;
    }
    case 'list': {
      const index = Math.floor(Math.random() * config.values.length);
      return config.values[index];
    }
    case 'custom':
      return config.generate();
    default: {
      const exhaustiveCheck: never = config;
      throw new Error(`Unsupported generator strategy: ${exhaustiveCheck}`);
    }
  }
};

/**
 * Generates parameter values for all fields declared in a generator config object.
 */
const generateParams = (generatorConfig: GeneratorConfig): Record<string, unknown> =>
  Object.entries(generatorConfig).reduce<Record<string, unknown>>((acc, [key, config]) => {
    acc[key] = generateValueFromConfig(config);
    return acc;
  }, {});

/**
 * Computes the suggested time limit for a question based on template data and defaults.
 */
const resolveTimeLimit = (template: QuestionTemplate): number => {
  if (template.suggestedTimeLimitSeconds) {
    return template.suggestedTimeLimitSeconds;
  }

  const perType = DEFAULT_TIME_LIMITS[template.type];
  const fallbackPerDifficulty = DEFAULT_TIME_LIMITS['multiple-choice'];

  return perType?.[template.difficulty] ?? fallbackPerDifficulty[template.difficulty] ?? 600;
};

/**
 * Convenience in-memory repository for storing and querying attempts.
 */
export class InMemoryQuestionAttemptRepository implements QuestionAttemptRepository {
  private readonly attemptsByUser = new Map<string, QuestionAttemptRecord[]>();

  async hasAttemptWithKey(userId: string, uniqueKey: string): Promise<boolean> {
    const attempts = this.attemptsByUser.get(userId) ?? [];
    return attempts.some((attempt) => attempt.uniqueKey === uniqueKey);
  }

  async createGeneratedAttempt(
    payload: Pick<QuestionAttemptRecord, 'userId' | 'templateId' | 'uniqueKey'>
  ): Promise<QuestionAttemptRecord> {
    const record: QuestionAttemptRecord = {
      ...payload,
      questionInstanceId: randomUUID(),
      createdAt: new Date(),
      status: 'generated',
    };

    const existing = this.attemptsByUser.get(payload.userId) ?? [];
    existing.push(record);
    this.attemptsByUser.set(payload.userId, existing);

    return record;
  }
}

/**
 * Convenience in-memory repository for storing templates, intended for early development
 * or fallback use when a database has not been wired up yet.
 */
export class InMemoryQuestionTemplateRepository implements QuestionTemplateRepository {
  constructor(private readonly templates: QuestionTemplate[]) {}

  async findRandomByCriteria(criteria: QuestionGenerationRequest): Promise<QuestionTemplate | undefined> {
    const candidates = this.templates.filter(
      (template) =>
        template.type === criteria.type &&
        template.difficulty === criteria.difficulty &&
        template.language === criteria.language
    );

    if (!candidates.length) {
      return undefined;
    }

    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }
}

/**
 * Lightweight sample templates so the generator can be exercised without a database.
 */
const SAMPLE_TEMPLATES: QuestionTemplate[] = [
  {
    id: 'code-output-sum',
    type: 'code-output',
    difficulty: 'easy',
    language: 'javascript',
    promptTemplate: 'What does the following snippet print when executed?',
    codeTemplate: 'const result = {{a}} + {{b}};\nconsole.log(result);',
    generatorConfig: {
      a: { strategy: 'range', min: 1, max: 9 },
      b: { strategy: 'range', min: 1, max: 9 },
    },
    renderCorrectAnswer: (params) => String((params.a as number) + (params.b as number)),
    renderChoices: (params, correctAnswer) => {
      const a = params.a as number;
      const b = params.b as number;
      const distractors = new Set<number>([
        a + b,
        a + b + 1,
        a + b - 1,
        a * b,
        Math.abs(a - b),
      ]);
      const uniqueChoices = Array.from(distractors).map(String);

      // Always include the correct answer and pad with three alternative outputs.
      const alternatives = uniqueChoices.filter((choice) => choice !== correctAnswer);
      const paddedAlternatives = alternatives.length >= 3
        ? shuffle(alternatives).slice(0, 3)
        : shuffle([...alternatives, ...Array(3 - alternatives.length).fill('0')]).slice(0, 3);

      return shuffle([correctAnswer, ...paddedAlternatives]);
    },
    suggestedTimeLimitSeconds: 240,
  },
  {
    id: 'coding-two-sum',
    type: 'coding',
    difficulty: 'medium',
    language: 'javascript',
    promptTemplate:
      'Given an array of integers nums = [{{v1}}, {{v2}}, {{v3}}, {{v4}}] and target = {{target}}, return the indices of the two numbers such that they add up to target.',
    generatorConfig: {
      v1: { strategy: 'range', min: 2, max: 20 },
      v2: { strategy: 'range', min: 2, max: 20 },
      v3: { strategy: 'range', min: 2, max: 20 },
      v4: { strategy: 'range', min: 2, max: 20 },
      target: { strategy: 'list', values: [10, 15, 20, 25, 30] },
    },
    renderCorrectAnswer: (params) =>
      JSON.stringify([
        0,
        params.v1 && params.target
          ? (params.target as number) / 2 > (params.v1 as number)
            ? 1
            : 2
          : 1,
      ]),
    suggestedTimeLimitSeconds: 1200,
  },
];

/**
 * Instances of the in-memory repositories are shared so that uniqueness checks work across
 * multiple invocations when a backing database is not yet present.
 */
const defaultAttemptRepository = new InMemoryQuestionAttemptRepository();
const defaultTemplateRepository = new InMemoryQuestionTemplateRepository(SAMPLE_TEMPLATES);

export interface GenerationDependencies {
  templateRepository?: QuestionTemplateRepository;
  attemptRepository?: QuestionAttemptRepository;
  persistGeneratedAttempt?: boolean;
}

/**
 * Generates a fully-rendered question instance. The function will keep generating new
 * parameter combinations until it finds one that has not been served to the user before
 * (based on the unique key) or until the maximum number of attempts is reached.
 */
export const generateQuestionInstance = async (
  userId: string,
  request: QuestionGenerationRequest,
  dependencies: GenerationDependencies = {}
): Promise<QuestionInstance> => {
  const templateRepository = dependencies.templateRepository ?? defaultTemplateRepository;
  const attemptRepository = dependencies.attemptRepository ?? defaultAttemptRepository;
  const persistGeneratedAttempt = dependencies.persistGeneratedAttempt ?? true;

  const template = await templateRepository.findRandomByCriteria(request);
  if (!template) {
    throw new Error(
      `No question template available for type=${request.type}, difficulty=${request.difficulty}, language=${request.language}`
    );
  }

  const maxTries = 5;
  for (let iteration = 0; iteration < maxTries; iteration += 1) {
    const params = generateParams(template.generatorConfig);
    const prompt = renderTemplate(template.promptTemplate, params);
    const codeSnippet = template.codeTemplate
      ? renderTemplate(template.codeTemplate, params)
      : undefined;
    const correctAnswer = template.renderCorrectAnswer(params);
    const choices = template.renderChoices?.(params, correctAnswer);
    const uniqueKey = computeUniqueKey(template.id, params);

    // Ensure the combination has not been used for this user before generating a placeholder attempt.
    const alreadyUsed = await attemptRepository.hasAttemptWithKey(userId, uniqueKey);
    if (alreadyUsed) {
      continue;
    }

    const timeLimitSeconds = resolveTimeLimit(template);

    const attemptRecord = persistGeneratedAttempt
      ? await attemptRepository.createGeneratedAttempt({ userId, uniqueKey, templateId: template.id })
      : undefined;

    return {
      questionInstanceId: attemptRecord?.questionInstanceId ?? randomUUID(),
      templateId: template.id,
      prompt,
      codeSnippet,
      params,
      correctAnswer,
      choices,
      uniqueKey,
      type: template.type,
      difficulty: template.difficulty,
      language: template.language,
      timeLimitSeconds,
    };
  }

  throw new Error('Failed to generate a unique question instance after several attempts.');
};

/**
 * Simple utility for shuffling arrays to keep choices unpredictable.
 */
const shuffle = <T>(items: T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

