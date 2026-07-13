import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { learnAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../../components/Base";
import "./Learn.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faBookOpen,
  faBars,
  faCheck,
  faCircleCheck,
  faCircleXmark,
  faLock,
} from "@fortawesome/free-solid-svg-icons";

const LearnCoursePage = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLessonId, setActive] = useState(null);
  const [activeLesson, setLesson] = useState(null);
  const [lessonLoading, setLL] = useState(false);
  const [nav, setNav] = useState({});
  const [completedIds, setCompleted] = useState(new Set());
  const [progress, setProgress] = useState(null);
  const [sidebarOpen, setSidebar] = useState(true);
  const [quizState, setQuiz] = useState({});

  useEffect(() => {
    learnAPI
      .getCourse(courseId)
      .then((res) => {
        setData(res.data);
        if (res.data.progress) setProgress(res.data.progress);
        const first = res.data.chapters?.[0]?.lessons?.[0];
        if (first) loadLesson(first.id);
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  const loadLesson = useCallback(
    async (lessonId) => {
      setActive(lessonId);
      setLL(true);
      try {
        const res = await learnAPI.getLesson(courseId, lessonId);
        setLesson(res.data.lesson);
        setNav(res.data.nav);
        if (res.data.completed) setCompleted((p) => new Set([...p, lessonId]));
        window.scrollTo({ top: 0, behavior: "smooth" });
      } finally {
        setLL(false);
      }
    },
    [courseId],
  );

  const handleMarkComplete = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const res = await learnAPI.markComplete(courseId, activeLessonId);
      setCompleted((p) => new Set([...p, activeLessonId]));
      setProgress(res.data.progress);
    } catch {}
  };

  const handleQuiz = (chapterId, questionIdx, selected, correct) => {
    setQuiz((q) => ({
      ...q,
      [`${chapterId}-${questionIdx}`]: {
        answered: true,
        selected,
        correct: selected === correct,
      },
    }));
  };

  const renderContent = (text) => {
    if (!text) return null;

    return text.split("\n\n").map((block, i) => {
      const parseLine = (line) =>
        line.split(/(\*\*[^*]+\*\*|`[^`]+`)/).map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={j}>{part.slice(2, -2)}</strong>;
          }

          if (part.startsWith("`") && part.endsWith("`")) {
            return (
              <code key={j} className="lc-inline-code">
                {part.slice(1, -1)}
              </code>
            );
          }

          return part;
        });

      if (block.startsWith("- ")) {
        const items = block.split("\n").filter((l) => l.startsWith("- "));
        return (
          <ul key={i} className="lc-list">
            {items.map((l, j) => (
              <li key={j}>{parseLine(l.slice(2))}</li>
            ))}
          </ul>
        );
      }

      if (block.startsWith("**") && block.split("\n").length === 1) {
        return (
          <h4 key={i} className="lc-subheading">
            {parseLine(block)}
          </h4>
        );
      }

      return (
        <p key={i} className="lc-para">
          {block.split("\n").map((l, j) => (
            <span key={j}>
              {parseLine(l)}
              {j < block.split("\n").length - 1 && <br />}
            </span>
          ))}
        </p>
      );
    });
  };

  if (loading) return <Spinner />;

  if (!data) {
    return (
      <div
        className="container"
        style={{ padding: "60px 0", textAlign: "center" }}
      >
        Course not found.
      </div>
    );
  }

  const { course, chapters } = data;

  return (
    <div className="learn-page">
      <div className="learn-topbar">
        <div className="learn-topbar__left">
          <button
            className="learn-topbar__menu"
            onClick={() => setSidebar((s) => !s)}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>

          <Link to="/learn" className="learn-topbar__brand">
            EduVerse Learn
          </Link>
        </div>

        <div>
          <span className="learn-topbar__course">{course.title}</span>
        </div>

        <div className="learn-topbar__right">
          <span>
            <strong>Progress:</strong>
          </span>

          {progress && (
            <div className="learn-topbar__progress">
              <div className="learn-progress-bar">
                <div
                  className="learn-progress-fill"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <span>
                <strong>{progress.percent}% complete</strong>
              </span>
            </div>
          )}

          {!user && (
            <Link to="/login" className="learn-topbar__login">
              Sign in to track progress
            </Link>
          )}
        </div>
      </div>

      <div className="learn-layout">
        <aside
          className={`learn-sidebar ${
            sidebarOpen ? "" : "learn-sidebar--closed"
          }`}
        >
          <div className="learn-sidebar__header">
            <h3>Course Content</h3>
            <span className="learn-sidebar__count">
              {chapters.reduce((s, c) => s + (c.lessons?.length || 0), 0)}{" "}
              lessons
            </span>
          </div>

          {chapters.map((ch, ci) => (
            <div key={ch.id} className="learn-chapter">
              <div className="learn-chapter__title">
                <span className="learn-chapter__num">{ci + 1}</span>
                {ch.title}
              </div>

              {ch.lessons?.map((lesson, li) => {
                const done = completedIds.has(lesson.id);

                return (
                  <button
                    key={lesson.id}
                    className={`learn-lesson-btn ${
                      activeLessonId === lesson.id
                        ? "learn-lesson-btn--active"
                        : ""
                    } ${done ? "learn-lesson-btn--done" : ""}`}
                    onClick={() => loadLesson(lesson.id)}
                  >
                    <span className="learn-lesson-btn__icon">
                      {done ? (
                        <FontAwesomeIcon icon={faCheck} />
                      ) : (
                        `${ci + 1}.${li + 1}`
                      )}
                    </span>
                    {lesson.title}
                  </button>
                );
              })}
            </div>
          ))}
        </aside>

        <main className="learn-main">
          {lessonLoading ? (
            <div style={{ padding: 60, textAlign: "center" }}>
              <Spinner />
            </div>
          ) : activeLesson ? (
            <div className="learn-content">
              <div className="lc-header">
                <h1 className="lc-title">{activeLesson.title}</h1>

                {completedIds.has(activeLessonId) && (
                  <span className="lc-done-badge">
                    <FontAwesomeIcon
                      icon={faCheck}
                      style={{ marginRight: "6px" }}
                    />
                    Completed
                  </span>
                )}
              </div>

              <div className="lc-body">
                {renderContent(activeLesson.content)}
              </div>

              {activeLesson.code_example && (
                <div className="lc-code-block">
                  <div className="lc-code-block__header">
                    <span className="lc-code-block__lang">
                      {activeLesson.code_lang || "javascript"}
                    </span>

                    <button
                      className="lc-code-block__copy"
                      onClick={() =>
                        navigator.clipboard.writeText(activeLesson.code_example)
                      }
                    >
                      Copy
                    </button>
                  </div>

                  <pre className="lc-code">
                    <code>{activeLesson.code_example}</code>
                  </pre>
                </div>
              )}

              {(() => {
                const chapter = chapters.find((ch) =>
                  ch.lessons?.some((l) => l.id === activeLessonId),
                );

                const isLast = chapter?.lessons?.at(-1)?.id === activeLessonId;

                if (!isLast || !chapter?.quizzes?.length) return null;

                return chapter.quizzes.map((q, qi) => {
                  const key = `${chapter.id}-${qi}`;
                  const state = quizState[key] || {};
                  const opts = [
                    { key: "a", label: q.option_a },
                    { key: "b", label: q.option_b },
                    { key: "c", label: q.option_c },
                    { key: "d", label: q.option_d },
                  ].filter((o) => o.label);

                  return (
                    <div key={qi} className="lc-quiz">
                      <div className="lc-quiz__header">
                        <span>
                          <FontAwesomeIcon icon={faBookOpen} />
                        </span>
                        Chapter Quiz
                      </div>

                      <p className="lc-quiz__question">{q.question}</p>

                      <div className="lc-quiz__options">
                        {opts.map((opt) => {
                          let cls = "lc-quiz__opt";

                          if (state.answered) {
                            if (opt.key === q.correct) {
                              cls += " lc-quiz__opt--correct";
                            } else if (opt.key === state.selected) {
                              cls += " lc-quiz__opt--wrong";
                            }
                          }

                          return (
                            <button
                              key={opt.key}
                              className={cls}
                              disabled={state.answered}
                              onClick={() =>
                                handleQuiz(chapter.id, qi, opt.key, q.correct)
                              }
                            >
                              <span className="lc-quiz__opt-letter">
                                {opt.key.toUpperCase()}
                              </span>
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>

                      {state.answered && (
                        <div
                          className={`lc-quiz__result ${
                            state.correct
                              ? "lc-quiz__result--correct"
                              : "lc-quiz__result--wrong"
                          }`}
                        >
                          {state.correct ? (
                            <>
                              <FontAwesomeIcon
                                icon={faCircleCheck}
                                style={{ marginRight: "6px" }}
                              />
                              Correct!
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon
                                icon={faCircleXmark}
                                style={{ marginRight: "6px" }}
                              />
                              Incorrect.
                            </>
                          )}{" "}
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}

              <div className="lc-nav-row">
                <button
                  className="lc-nav-btn lc-nav-btn--prev"
                  disabled={!nav.prev}
                  onClick={() => nav.prev && loadLesson(nav.prev.id)}
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  {nav.prev?.title || "Previous"}
                </button>

                {!completedIds.has(activeLessonId) && (
                  <button
                    className="lc-complete-btn"
                    onClick={handleMarkComplete}
                  >
                    {user ? (
                      <>
                        <FontAwesomeIcon
                          icon={faCheck}
                          style={{ marginRight: "6px" }}
                        />
                        Mark as Complete
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon
                          icon={faLock}
                          style={{ marginRight: "6px" }}
                        />
                        Sign in to track progress
                      </>
                    )}
                  </button>
                )}

                <button
                  className="lc-nav-btn lc-nav-btn--next"
                  disabled={!nav.next}
                  onClick={() => nav.next && loadLesson(nav.next.id)}
                >
                  {nav.next?.title || "Next"}
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: 60,
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              Select a lesson from the sidebar to begin.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LearnCoursePage;