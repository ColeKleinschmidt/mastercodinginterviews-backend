import mongoose, { Document, Schema } from 'mongoose';
import { QuestionDifficulty, QuestionLanguage, QuestionType } from './QuestionTemplate.js';

export type QuestionResult = 'correct' | 'incorrect' | 'timeout' | 'skipped';

export interface QuestionData {
  renderedPrompt: string;
  snippet?: string;
  options?: string[];
  expectedAnswer: unknown;
}

export interface QuestionAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;
  uniqueKey: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  language: QuestionLanguage;
  questionData: QuestionData;
  result: QuestionResult;
  userAnswer?: unknown;
  timeTakenSeconds: number;
  createdAt: Date;
}

const QuestionDataSchema = new Schema<QuestionData>(
  {
    renderedPrompt: { type: String, required: true },
    snippet: { type: String },
    options: { type: [String] },
    expectedAnswer: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const QuestionAttemptSchema = new Schema<QuestionAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    templateId: { type: Schema.Types.ObjectId, required: true, ref: 'QuestionTemplate' },
    uniqueKey: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ['coding', 'code-output'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['intern', 'entry', 'mid', 'senior', 'expert'],
      required: true,
    },
    language: {
      type: String,
      enum: ['javascript', 'python', 'java', 'cpp', 'sql'],
      required: true,
    },
    questionData: { type: QuestionDataSchema, required: true },
    result: {
      type: String,
      enum: ['correct', 'incorrect', 'timeout', 'skipped'],
      required: true,
    },
    userAnswer: { type: Schema.Types.Mixed },
    timeTakenSeconds: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.model<QuestionAttempt>('QuestionAttempt', QuestionAttemptSchema);
