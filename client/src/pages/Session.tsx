import { useCallback, useEffect, useMemo, useState } from 'react';
import '../App.css';

type QuestionType = 'coding' | 'code-output';

type Example = {
  input?: string;
  output?: string;
  explanation?: string;
};

type BaseQuestion = {
  title?: string;
  difficulty?: string;
  language?: string;
  questionType?: QuestionType;
  timeLimitSeconds?: number;
};

type CodingQuestion = BaseQuestion & {
  prompt?: string;
  examples?: Example[];
};

type CodeOutputQuestion = BaseQuestion & {
  codeSnippet?: string;
  options?: string[];
};

type QuestionPayload = CodingQuestion | CodeOutputQuestion;

type NextQuestionResponse = {
  questionInstanceId: string;
  question: QuestionPayload;
};

type SubmissionResult = {
  correct: boolean;
  explanation?: string;
  correctAnswer?: string;
};

type TimerProps = {
  timeLimitSeconds: number;
  isRunning: boolean;
  onExpire: () => void;
};

const Timer = ({ timeLimitSeconds, isRunning, onExpire }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);

  useEffect(() => {
    setTimeLeft(timeLimitSeconds);
  }, [timeLimitSeconds]);

  useEffect(() => {
    if (!isRunning) return;
    if (timeLeft <= 0) return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning, timeLeft, onExpire]);

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="timer">
      <span className="timer-label">Time Remaining</span>
      <div className={`timer-value ${timeLeft === 0 ? 'timer-expired' : ''}`}>
        {minutes}:{seconds}
      </div>
    </div>
  );
};

const readFiltersFromQuery = () => {
  const searchParams = new URLSearchParams(window.location.search);
  return {
    difficulty: searchParams.get('difficulty') ?? '',
    language: searchParams.get('language') ?? '',
    questionType: searchParams.get('type') ?? '',
  };
};

const Session = () => {
  const initialFilters = useMemo(() => readFiltersFromQuery(), []);
  const [questionInstanceId, setQuestionInstanceId] = useState('');
  const [question, setQuestion] = useState<QuestionPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pseudoCode, setPseudoCode] = useState('');
  const [finalAnswer, setFinalAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [timeExpired, setTimeExpired] = useState(false);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(300);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const questionType: QuestionType =
    (question?.questionType as QuestionType) ?? 'coding';
  const codingQuestion = questionType === 'coding' ? (question as CodingQuestion) : null;
  const codeOutputQuestion = questionType === 'code-output' ? (question as CodeOutputQuestion) : null;

  const fetchNextQuestion = useCallback(async () => {
    setLoading(true);
    setError('');
    setQuestion(null);
    setQuestionInstanceId('');
    setSubmissionResult(null);
    setTimeExpired(false);
    setPseudoCode('');
    setFinalAnswer('');
    setSelectedOption('');

    try {
      const params = new URLSearchParams();
      if (initialFilters.difficulty) params.set('difficulty', initialFilters.difficulty);
      if (initialFilters.language) params.set('language', initialFilters.language);
      if (initialFilters.questionType) params.set('type', initialFilters.questionType);
      const url = params.toString()
        ? `/api/questions/next?${params.toString()}`
        : '/api/questions/next';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch the next question');
      }
      const data: NextQuestionResponse = await response.json();
      setQuestion(data.question);
      setQuestionInstanceId(data.questionInstanceId);
      setTimeLimitSeconds(data.question.timeLimitSeconds ?? 300);
      setStartTime(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load question');
    } finally {
      setLoading(false);
    }
  }, [initialFilters.difficulty, initialFilters.language, initialFilters.questionType]);

  useEffect(() => {
    fetchNextQuestion();
  }, [fetchNextQuestion]);

  const composeAnswer = () => {
    if (questionType === 'code-output') {
      return selectedOption;
    }

    const parts = [] as string[];
    if (finalAnswer.trim()) parts.push(`Answer: ${finalAnswer.trim()}`);
    if (pseudoCode.trim()) parts.push(`Pseudo-code:\n${pseudoCode.trim()}`);
    return parts.join('\n\n');
  };

  const handleSubmit = useCallback(
    async (isTimeout = false) => {
      if (!questionInstanceId || !question) return;
      if (isTimeout && submissionResult) return;

      const timeTakenSeconds = startTime
        ? Math.max(0, Math.round((Date.now() - startTime) / 1000))
        : 0;

      const payload = {
        questionInstanceId,
        userAnswer: composeAnswer(),
        timeTakenSeconds,
        timedOut: isTimeout,
      };

      try {
        setSubmitting(true);
        const response = await fetch('/api/questions/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Failed to submit answer');
        }

        const data: SubmissionResult = await response.json();
        setSubmissionResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to submit answer');
      } finally {
        setSubmitting(false);
      }
    },
    [composeAnswer, question, questionInstanceId, startTime, submissionResult]
  );

  const handleTimeout = useCallback(() => {
    if (timeExpired || submissionResult) return;
    setTimeExpired(true);
    handleSubmit(true);
  }, [handleSubmit, submissionResult, timeExpired]);

  const isRunning = Boolean(questionInstanceId && !submissionResult && !timeExpired);
  const submitDisabled =
    submitting ||
    !!submissionResult ||
    timeExpired ||
    (questionType === 'code-output' && !selectedOption);

  const renderExamples = (examples?: Example[]) => {
    if (!examples?.length) return null;

    return (
      <div className="examples">
        <h3>Examples</h3>
        {examples.map((example, index) => (
          <div className="example" key={index}>
            {example.input && (
              <p>
                <strong>Input:</strong> {example.input}
              </p>
            )}
            {example.output && (
              <p>
                <strong>Output:</strong> {example.output}
              </p>
            )}
            {example.explanation && (
              <p>
                <strong>Explanation:</strong> {example.explanation}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="session-page">
      <header className="session-header">
        <div>
          <p className="eyebrow">Task 12 – Session view</p>
          <h1>Interview Practice Session</h1>
          <p className="muted">Stay focused, watch the timer, and submit when you are ready.</p>
        </div>
        <div className="filters">
          {initialFilters.difficulty && <span className="badge">Difficulty: {initialFilters.difficulty}</span>}
          {initialFilters.language && <span className="badge">Language: {initialFilters.language}</span>}
          {initialFilters.questionType && <span className="badge">Type: {initialFilters.questionType}</span>}
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <div className="card">Loading question…</div>}

      {question && (
        <div className="card">
          <div className="question-meta">
            {question.difficulty && <span className="badge difficulty">{question.difficulty}</span>}
            {question.language && <span className="badge language">{question.language}</span>}
            <span className="badge type">{question.questionType ?? 'coding'}</span>
            <Timer timeLimitSeconds={timeLimitSeconds} isRunning={isRunning} onExpire={handleTimeout} />
          </div>

          <div className="question-body">
            <h2>{question.title ?? 'Practice Question'}</h2>
            {questionType === 'coding' && (
              <>
                {codingQuestion?.prompt && <p className="prompt">{codingQuestion.prompt}</p>}
                {renderExamples(codingQuestion?.examples)}
                <div className="input-group">
                  <label htmlFor="pseudoCode">Pseudo-code</label>
                  <textarea
                    id="pseudoCode"
                    value={pseudoCode}
                    onChange={(e) => setPseudoCode(e.target.value)}
                    placeholder="Outline your approach here"
                    rows={8}
                    disabled={!!submissionResult || timeExpired}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="finalAnswer">Final answer / summary</label>
                  <input
                    id="finalAnswer"
                    type="text"
                    value={finalAnswer}
                    onChange={(e) => setFinalAnswer(e.target.value)}
                    placeholder="Summarize your solution"
                    disabled={!!submissionResult || timeExpired}
                  />
                </div>
              </>
            )}

            {questionType === 'code-output' && (
              <>
                {codeOutputQuestion?.codeSnippet && (
                  <pre className="code-snippet">
                    <code>{codeOutputQuestion.codeSnippet}</code>
                  </pre>
                )}
                <div className="options">
                  {codeOutputQuestion?.options?.map((option, index) => (
                    <label key={option} className="option">
                      <input
                        type="radio"
                        name="answer"
                        value={option}
                        checked={selectedOption === option}
                        onChange={() => setSelectedOption(option)}
                        disabled={!!submissionResult || timeExpired}
                      />
                      <span className="option-label">
                        <strong>Option {index + 1}.</strong> {option}
                      </span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="actions">
            <button className="primary" onClick={() => handleSubmit()} disabled={submitDisabled}>
              {submitting ? 'Submitting…' : 'Submit Answer'}
            </button>
            <button className="ghost" onClick={fetchNextQuestion} disabled={loading}>
              Next Question
            </button>
          </div>

          {submissionResult && (
            <div className={`alert ${submissionResult.correct ? 'alert-success' : 'alert-info'}`}>
              <p className="result-label">{submissionResult.correct ? 'Correct!' : 'Review the explanation below.'}</p>
              {submissionResult.explanation && <p>{submissionResult.explanation}</p>}
              {submissionResult.correctAnswer && (
                <p>
                  <strong>Correct answer:</strong> {submissionResult.correctAnswer}
                </p>
              )}
            </div>
          )}

          {timeExpired && !submissionResult && (
            <div className="alert alert-warning">Time is up! Fetching the correct answer…</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Session;
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
