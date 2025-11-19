import mongoose, { Schema, Document } from 'mongoose';

export type QuestionType = 'coding' | 'code-output';
export type QuestionDifficulty = 'intern' | 'entry' | 'mid' | 'senior' | 'expert';
export type QuestionLanguage = 'javascript' | 'python' | 'java' | 'cpp' | 'sql';

export interface QuestionTemplate extends Document {
  type: QuestionType;
  difficulty: QuestionDifficulty;
  language: QuestionLanguage;
  title: string;
  basePrompt: string;
  codeTemplate: string;
  topics: string[];
  generatorConfig: Record<string, unknown>;
}

const QuestionTemplateSchema = new Schema<QuestionTemplate>({
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
  title: { type: String, required: true },
  basePrompt: { type: String, required: true },
  codeTemplate: { type: String, required: true },
  topics: { type: [String], required: true },
  generatorConfig: { type: Schema.Types.Mixed, required: true },
}, {
  timestamps: true,
});

export default mongoose.model<QuestionTemplate>('QuestionTemplate', QuestionTemplateSchema);
