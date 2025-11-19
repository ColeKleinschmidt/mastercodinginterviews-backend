import React from 'react';
import { Difficulty, Language, QuestionType, usePractice } from '../context/PracticeContext';

type PracticeProps = {
  onStart: () => void;
};

const questionTypes: readonly QuestionType[] = ['Coding', 'Code Output'];
const difficulties: readonly Difficulty[] = ['Intern', 'Entry', 'Mid', 'Senior', 'Expert'];
const languages: readonly Language[] = ['JS', 'Python', 'Java', 'C++', 'SQL'];

function FilterGroup<T extends string>({
  title,
  options,
  activeValue,
  onSelect,
}: {
  title: string;
  options: readonly T[];
  activeValue: T;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="filter-group">
      <h3>{title}</h3>
      <div className="pill-row">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`pill ${activeValue === option ? 'pill-active' : ''}`}
            onClick={() => onSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Practice({ onStart }: PracticeProps) {
  const { filters, setFilters } = usePractice();

  return (
    <div className="practice-layout">
      <aside className="filters-panel">
        <div className="panel-header">
          <h2>Filters</h2>
          <p className="panel-subtitle">Tune your session to target the right practice set.</p>
        </div>
        <FilterGroup<QuestionType>
          title="Question type"
          options={questionTypes}
          activeValue={filters.questionType}
          onSelect={(questionType) => setFilters((prev) => ({ ...prev, questionType }))}
        />
        <FilterGroup<Difficulty>
          title="Difficulty"
          options={difficulties}
          activeValue={filters.difficulty}
          onSelect={(difficulty) => setFilters((prev) => ({ ...prev, difficulty }))}
        />
        <FilterGroup<Language>
          title="Language"
          options={languages}
          activeValue={filters.language}
          onSelect={(language) => setFilters((prev) => ({ ...prev, language }))}
        />
      </aside>

      <section className="practice-content">
        <div className="content-card">
          <p className="eyebrow">Practice session</p>
          <h1>Targeted interview drills</h1>
          <p className="lead">
            Choose your filters, then start a session to jump straight into tailored interview scenarios.
          </p>

          <div className="selected-list">
            <div>
              <p className="label">Question type</p>
              <p className="value">{filters.questionType}</p>
            </div>
            <div>
              <p className="label">Difficulty</p>
              <p className="value">{filters.difficulty}</p>
            </div>
            <div>
              <p className="label">Language</p>
              <p className="value">{filters.language}</p>
            </div>
          </div>

          <div className="actions-row">
            <button type="button" className="primary" onClick={onStart}>
              Start Session
            </button>
            <p className="helper">Your last selections are saved while you stay on the site.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
