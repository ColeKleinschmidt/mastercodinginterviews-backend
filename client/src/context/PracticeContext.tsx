import React, { createContext, useContext, useMemo, useState } from 'react';

export type QuestionType = 'Coding' | 'Code Output';
export type Difficulty = 'Intern' | 'Entry' | 'Mid' | 'Senior' | 'Expert';
export type Language = 'JS' | 'Python' | 'Java' | 'C++' | 'SQL';

export type PracticeFilters = {
  questionType: QuestionType;
  difficulty: Difficulty;
  language: Language;
};

const defaultFilters: PracticeFilters = {
  questionType: 'Coding',
  difficulty: 'Intern',
  language: 'JS',
};

type PracticeContextValue = {
  filters: PracticeFilters;
  setFilters: React.Dispatch<React.SetStateAction<PracticeFilters>>;
};

const PracticeContext = createContext<PracticeContextValue | null>(null);

export const PracticeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<PracticeFilters>(defaultFilters);

  const value = useMemo(() => ({ filters, setFilters }), [filters]);

  return <PracticeContext.Provider value={value}>{children}</PracticeContext.Provider>;
};

export function usePractice() {
  const context = useContext(PracticeContext);

  if (!context) {
    throw new Error('usePractice must be used within a PracticeProvider');
  }

  return context;
}
