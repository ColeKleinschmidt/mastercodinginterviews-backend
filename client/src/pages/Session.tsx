import React from 'react';
import { usePractice } from '../context/PracticeContext';

type SessionProps = {
  onBackToFilters: () => void;
};

export default function Session({ onBackToFilters }: SessionProps) {
  const { filters } = usePractice();

  return (
    <div className="session-card">
      <p className="eyebrow">Session summary</p>
      <h1>Your practice session is ready</h1>
      <p className="lead">We saved your filters so you can jump right back in.</p>

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
        <button type="button" className="secondary" onClick={onBackToFilters}>
          Adjust filters
        </button>
        <button type="button" className="primary" disabled>
          Begin practice
        </button>
      </div>
    </div>
  );
}
