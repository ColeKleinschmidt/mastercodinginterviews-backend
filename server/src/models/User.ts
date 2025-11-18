import { Schema, model, Document } from 'mongoose';

export interface DifficultyStats {
  attempts: number;
  correct: number;
}

export interface UserStats {
  attempts: number;
  correct: number;
  byDifficulty: Record<string, DifficultyStats>;
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  displayName?: string;
  createdAt: Date;
  stats: UserStats;
}

const DifficultyStatsSchema = new Schema<DifficultyStats>(
  {
    attempts: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  displayName: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
  stats: {
    attempts: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    byDifficulty: { type: Map, of: DifficultyStatsSchema, default: {} },
  },
});

export const User = model<IUser>('User', UserSchema);

export default User;
