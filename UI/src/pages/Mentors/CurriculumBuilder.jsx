import { useState, useEffect, useCallback } from "react";
import { mentorDashAPI } from "../../services/mentorDashAPI";

const LANGS = [
  "javascript",
  "jsx",
  "typescript",
  "python",
  "java",
  "csharp",
  "html",
  "css",
  "sql",
  "text",
];

const Toast = ({ message, type, onClose }) => {
  if (!message) return null;
  return (
    <div className={`md-toast md-toast--${type}`}>
      <i
        className={`fa-solid fa-${type === "success" ? "circle-check" : "circle-xmark"}`}
      />
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "var(--md-muted)",
          cursor: "pointer",
          fontSize: 18,
        }}
      >
        ×
      </button>
    </div>
  );
};

const useToast = () => {
  const [toast, setToast] = useState(null);
  const show = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };
  return { toast, show, clear: () => setToast(null) };
};

// Lesson Modal 
const LessonModal = ({
  open,
  lesson,
  chapterId,
  courseId,
  onClose,
  onSaved,
  show,
}) => {
  const [form, setForm] = useState({
    title: "",
    content: "",
    codeExample: "",
    codeLang: "javascript",
    sortOrder: 1,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        lesson
          ? {
              title: lesson.title,
              content: lesson.content || "",
              codeExample: lesson.code_example || "",
              codeLang: lesson.code_lang || "javascript",
              sortOrder: lesson.sort_order || 1,
            }
          : {
              title: "",
              content: "",
              codeExample: "",
              codeLang: "javascript",
              sortOrder: 1,
            },
      );
    }
  }, [open, lesson]);

  const onFC = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.title) {
      show("Lesson title is required", "error");
      return;
    }
    setSaving(true);
    try {
      if (lesson) {
        await mentorDashAPI.updateLesson(courseId, chapterId, lesson.id, form);
        show("Lesson updated");
      } else {
        await mentorDashAPI.createLesson(courseId, chapterId, form);
        show("Lesson created");
      }
      onSaved();
      onClose();
    } catch (err) {
      show(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;
  return (
    <div className="md-modal-overlay" onClick={onClose}>
      <div
        className="md-modal"
        style={{ maxWidth: 680 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md-modal__header">
          <h3 className="md-modal__title">
            <i
              className="fa-solid fa-book-open"
              style={{ marginRight: 8, color: "#A855F7" }}
            />
            {lesson ? "Edit Lesson" : "Add New Lesson"}
          </h3>
          <button className="md-modal__close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="md-modal__body">
          <div className="md-form-group">
            <label className="md-form-label">
              <i className="fa-solid fa-heading" style={{ marginRight: 6 }} />
              Lesson Title *
            </label>
            <input
              className="md-form-input"
              name="title"
              value={form.title}
              onChange={onFC}
              placeholder="e.g. Introduction to Variables"
            />
          </div>
          <div className="md-form-group">
            <label className="md-form-label">
              <i
                className="fa-solid fa-align-left"
                style={{ marginRight: 6 }}
              />
              Content (supports **bold** and `inline code`)
            </label>
            <textarea
              className="md-form-textarea"
              name="content"
              value={form.content}
              onChange={onFC}
              rows={6}
              placeholder="Write the lesson content here. Use **bold** for emphasis and `code` for inline code."
            />
          </div>
          <div className="md-form-group">
            <label className="md-form-label">
              <i className="fa-solid fa-code" style={{ marginRight: 6 }} />
              Code Example
            </label>
            <textarea
              className="md-form-textarea"
              name="codeExample"
              value={form.codeExample}
              onChange={onFC}
              rows={6}
              placeholder="Paste your code example here..."
              style={{ fontFamily: "Courier New, monospace", fontSize: 13 }}
            />
          </div>
          <div className="md-form-grid2">
            <div className="md-form-group">
              <label className="md-form-label">
                <i
                  className="fa-solid fa-file-code"
                  style={{ marginRight: 6 }}
                />
                Code Language
              </label>
              <select
                className="md-form-select"
                name="codeLang"
                value={form.codeLang}
                onChange={onFC}
              >
                {LANGS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="md-form-group">
              <label className="md-form-label">
                <i className="fa-solid fa-sort" style={{ marginRight: 6 }} />
                Sort Order
              </label>
              <input
                className="md-form-input"
                name="sortOrder"
                type="number"
                min="1"
                value={form.sortOrder}
                onChange={onFC}
              />
            </div>
          </div>
        </div>
        <div className="md-modal__footer">
          <button className="md-btn md-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="md-btn md-btn--primary"
            onClick={handleSave}
            disabled={saving}
          >
            <i className="fa-solid fa-floppy-disk" />{" "}
            {saving ? "Saving..." : lesson ? "Save Changes" : "Add Lesson"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Quiz Modal 
const QuizModal = ({
  open,
  quiz,
  chapterId,
  courseId,
  onClose,
  onSaved,
  show,
}) => {
  const [form, setForm] = useState({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correct: "a",
    explanation: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        quiz
          ? {
              question: quiz.question,
              optionA: quiz.option_a,
              optionB: quiz.option_b,
              optionC: quiz.option_c || "",
              optionD: quiz.option_d || "",
              correct: quiz.correct,
              explanation: quiz.explanation || "",
            }
          : {
              question: "",
              optionA: "",
              optionB: "",
              optionC: "",
              optionD: "",
              correct: "a",
              explanation: "",
            },
      );
    }
  }, [open, quiz]);

  const onFC = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.question || !form.optionA || !form.optionB) {
      show("Question, Option A, and Option B are required", "error");
      return;
    }
    setSaving(true);
    try {
      if (quiz) {
        await mentorDashAPI.updateQuiz(courseId, chapterId, quiz.id, form);
        show("Quiz updated");
      } else {
        await mentorDashAPI.createQuiz(courseId, chapterId, form);
        show("Quiz created");
      }
      onSaved();
      onClose();
    } catch (err) {
      show(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;
  return (
    <div className="md-modal-overlay" onClick={onClose}>
      <div className="md-modal" onClick={(e) => e.stopPropagation()}>
        <div className="md-modal__header">
          <h3 className="md-modal__title">
            <i
              className="fa-solid fa-circle-question"
              style={{ marginRight: 8, color: "#F59E0B" }}
            />
            {quiz ? "Edit Quiz Question" : "Add Quiz Question"}
          </h3>
          <button className="md-modal__close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="md-modal__body">
          <div className="md-form-group">
            <label className="md-form-label">
              <i className="fa-solid fa-question" style={{ marginRight: 6 }} />
              Question *
            </label>
            <textarea
              className="md-form-textarea"
              name="question"
              value={form.question}
              onChange={onFC}
              rows={3}
              placeholder="Enter the quiz question..."
            />
          </div>
          <div className="md-form-grid2">
            {[
              ["A", "optionA", "Correct option A *"],
              ["B", "optionB", "Option B *"],
              ["C", "optionC", "Option C (optional)"],
              ["D", "optionD", "Option D (optional)"],
            ].map(([letter, key, ph]) => (
              <div key={key} className="md-form-group">
                <label className="md-form-label">Option {letter}</label>
                <input
                  className="md-form-input"
                  name={key}
                  value={form[key]}
                  onChange={onFC}
                  placeholder={ph}
                />
              </div>
            ))}
          </div>
          <div className="md-form-grid2">
            <div className="md-form-group">
              <label className="md-form-label">
                <i
                  className="fa-solid fa-check-circle"
                  style={{ marginRight: 6, color: "#10B981" }}
                />
                Correct Answer *
              </label>
              <select
                className="md-form-select"
                name="correct"
                value={form.correct}
                onChange={onFC}
              >
                <option value="a">Option A</option>
                <option value="b">Option B</option>
                <option value="c">Option C</option>
                <option value="d">Option D</option>
              </select>
            </div>
            <div className="md-form-group">
              <label className="md-form-label">
                <i
                  className="fa-solid fa-lightbulb"
                  style={{ marginRight: 6, color: "#F59E0B" }}
                />
                Explanation
              </label>
              <input
                className="md-form-input"
                name="explanation"
                value={form.explanation}
                onChange={onFC}
                placeholder="Why is this the correct answer?"
              />
            </div>
          </div>
        </div>
        <div className="md-modal__footer">
          <button className="md-btn md-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="md-btn md-btn--primary"
            onClick={handleSave}
            disabled={saving}
          >
            <i className="fa-solid fa-floppy-disk" />{" "}
            {saving ? "Saving..." : quiz ? "Save Changes" : "Add Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main CurriculumBuilder 
const CurriculumBuilder = ({ courseId, courseTitle }) => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const { toast, show, clear } = useToast();

  // Modals
  const [lessonModal, setLessonModal] = useState({
    open: false,
    lesson: null,
    chapterId: null,
  });
  const [quizModal, setQuizModal] = useState({
    open: false,
    quiz: null,
    chapterId: null,
  });

  // New chapter input
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [addingChapter, setAddingChapter] = useState(false);

  const load = useCallback(() => {
    if (!courseId) return;
    setLoading(true);
    mentorDashAPI
      .getChapters(courseId)
      .then((res) => {
        setChapters(res.data || []);
        // Auto-expand all chapters
        const exp = {};
        (res.data || []).forEach((ch) => {
          exp[ch.id] = true;
        });
        setExpanded(exp);
      })
      .catch(() => setChapters([]))
      .finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddChapter = async () => {
    if (!newChapterTitle.trim()) {
      show("Chapter title is required", "error");
      return;
    }
    setAddingChapter(true);
    try {
      await mentorDashAPI.createChapter(courseId, {
        title: newChapterTitle.trim(),
        sortOrder: chapters.length + 1,
      });
      setNewChapterTitle("");
      show("Chapter added");
      load();
    } catch (err) {
      show(err.message, "error");
    } finally {
      setAddingChapter(false);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm("Delete this chapter and ALL its lessons and quizzes?"))
      return;
    try {
      await mentorDashAPI.deleteChapter(courseId, chapterId);
      show("Chapter deleted");
      load();
    } catch {
      show("Failed to delete", "error");
    }
  };

  const handleDeleteLesson = async (chapterId, lessonId) => {
    if (!window.confirm("Delete this lesson?")) return;
    try {
      await mentorDashAPI.deleteLesson(courseId, chapterId, lessonId);
      show("Lesson deleted");
      load();
    } catch {
      show("Failed to delete lesson", "error");
    }
  };

  const handleDeleteQuiz = async (chapterId, quizId) => {
    if (!window.confirm("Delete this quiz question?")) return;
    try {
      await mentorDashAPI.deleteQuiz(courseId, chapterId, quizId);
      show("Quiz deleted");
      load();
    } catch {
      show("Failed to delete quiz", "error");
    }
  };

  const totalLessons = chapters.reduce(
    (s, ch) => s + (ch.lessons?.length || 0),
    0,
  );
  const totalQuizzes = chapters.reduce(
    (s, ch) => s + (ch.quizzes?.length || 0),
    0,
  );

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} onClose={clear} />

      {/* Lesson + Quiz Modals */}
      <LessonModal
        open={lessonModal.open}
        lesson={lessonModal.lesson}
        chapterId={lessonModal.chapterId}
        courseId={courseId}
        onClose={() =>
          setLessonModal({ open: false, lesson: null, chapterId: null })
        }
        onSaved={load}
        show={show}
      />
      <QuizModal
        open={quizModal.open}
        quiz={quizModal.quiz}
        chapterId={quizModal.chapterId}
        courseId={courseId}
        onClose={() =>
          setQuizModal({ open: false, quiz: null, chapterId: null })
        }
        onSaved={load}
        show={show}
      />

      <div className="md-card">
        {/* Header */}
        <div className="md-card__header">
          <div>
            <div className="md-card__title">
              <i
                className="fa-solid fa-list-check"
                style={{ marginRight: 8, color: "#A855F7" }}
              />
              Curriculum Builder
              {courseTitle && (
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 400,
                    color: "var(--md-muted)",
                    marginLeft: 10,
                  }}
                >
                  — {courseTitle}
                </span>
              )}
            </div>
            <div className="md-card__subtitle">
              {chapters.length} chapters · {totalLessons} lessons ·{" "}
              {totalQuizzes} quizzes
            </div>
          </div>
        </div>

        {/* Stats row */}
        {chapters.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 16,
              marginBottom: 20,
              padding: "14px 16px",
              background: "var(--md-surface2)",
              borderRadius: 8,
              flexWrap: "wrap",
            }}
          >
            {[
              {
                icon: "fa-layer-group",
                label: "Chapters",
                val: chapters.length,
                color: "#A855F7",
              },
              {
                icon: "fa-book-open",
                label: "Lessons",
                val: totalLessons,
                color: "#60A5FA",
              },
              {
                icon: "fa-circle-question",
                label: "Quizzes",
                val: totalQuizzes,
                color: "#F59E0B",
              },
            ].map((s) => (
              <div
                key={s.label}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <i
                  className={`fa-solid ${s.icon}`}
                  style={{ color: s.color, fontSize: 16 }}
                />
                <span style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>
                  {s.val}
                </span>
                <span style={{ fontSize: 12, color: "var(--md-muted)" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Add chapter */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <input
            className="md-form-input"
            placeholder="New chapter title — e.g. Getting Started"
            value={newChapterTitle}
            onChange={(e) => setNewChapterTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddChapter()}
            style={{ flex: 1 }}
          />
          <button
            className="md-btn md-btn--primary"
            onClick={handleAddChapter}
            disabled={addingChapter}
          >
            <i className="fa-solid fa-plus" />{" "}
            {addingChapter ? "Adding..." : "Add Chapter"}
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              color: "var(--md-muted)",
            }}
          >
            <i
              className="fa-solid fa-spinner fa-spin"
              style={{ fontSize: 28 }}
            />
          </div>
        ) : chapters.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 0",
              color: "var(--md-muted)",
            }}
          >
            <i
              className="fa-solid fa-layer-group"
              style={{
                fontSize: 48,
                opacity: 0.3,
                display: "block",
                marginBottom: 16,
              }}
            />
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#fff",
                marginBottom: 8,
              }}
            >
              No chapters yet
            </div>
            <div style={{ fontSize: 13 }}>
              Add your first chapter above to start building the curriculum.
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {chapters.map((ch, ci) => (
              <div
                key={ch.id}
                style={{
                  border: "1px solid var(--md-border)",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                {/* Chapter header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    background: "var(--md-surface2)",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setExpanded((e) => ({ ...e, [ch.id]: !e[ch.id] }))
                  }
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: "var(--md-primary-g)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {ci + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}
                    >
                      {ch.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--md-muted)",
                        marginTop: 2,
                      }}
                    >
                      <i
                        className="fa-solid fa-book-open"
                        style={{ marginRight: 4 }}
                      />
                      {ch.lessons?.length || 0} lessons
                      <span style={{ margin: "0 8px" }}>·</span>
                      <i
                        className="fa-solid fa-circle-question"
                        style={{ marginRight: 4, color: "#F59E0B" }}
                      />
                      {ch.quizzes?.length || 0} quizzes
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", gap: 6 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="md-btn md-btn--ghost md-btn--sm"
                      onClick={() =>
                        setLessonModal({
                          open: true,
                          lesson: null,
                          chapterId: ch.id,
                        })
                      }
                    >
                      <i className="fa-solid fa-plus" /> Lesson
                    </button>
                    <button
                      className="md-btn md-btn--ghost md-btn--sm"
                      onClick={() =>
                        setQuizModal({
                          open: true,
                          quiz: null,
                          chapterId: ch.id,
                        })
                      }
                    >
                      <i className="fa-solid fa-question" /> Quiz
                    </button>
                    <button
                      className="md-btn md-btn--danger md-btn--sm"
                      onClick={() => handleDeleteChapter(ch.id)}
                    >
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                  <i
                    className={`fa-solid fa-chevron-${expanded[ch.id] ? "up" : "down"}`}
                    style={{ color: "var(--md-muted)", fontSize: 12 }}
                  />
                </div>

                {/* Chapter content */}
                {expanded[ch.id] && (
                  <div
                    style={{
                      padding: "12px 16px",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    {/* Lessons */}
                    {ch.lessons?.map((lesson, li) => (
                      <div
                        key={lesson.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 12px",
                          borderRadius: 8,
                          marginBottom: 6,
                          background: "var(--md-surface)",
                          border: "1px solid var(--md-border)",
                        }}
                      >
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 4,
                            background: "rgba(96,165,250,0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <i
                            className="fa-solid fa-play"
                            style={{ color: "#60A5FA", fontSize: 9 }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#fff",
                              fontWeight: 500,
                            }}
                          >
                            {lesson.title}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--md-muted)",
                              marginTop: 2,
                            }}
                          >
                            {lesson.code_lang && (
                              <span
                                className="md-pill md-pill--purple"
                                style={{ fontSize: 10, padding: "1px 6px" }}
                              >
                                {lesson.code_lang}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="md-btn md-btn--ghost md-btn--sm"
                            onClick={() =>
                              setLessonModal({
                                open: true,
                                lesson,
                                chapterId: ch.id,
                              })
                            }
                          >
                            <i className="fa-solid fa-pen" />
                          </button>
                          <button
                            className="md-btn md-btn--danger md-btn--sm"
                            onClick={() => handleDeleteLesson(ch.id, lesson.id)}
                          >
                            <i className="fa-solid fa-trash" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Quizzes */}
                    {ch.quizzes?.map((quiz, qi) => (
                      <div
                        key={quiz.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 12px",
                          borderRadius: 8,
                          marginBottom: 6,
                          background: "rgba(245,158,11,0.06)",
                          border: "1px solid rgba(245,158,11,0.2)",
                        }}
                      >
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 4,
                            background: "rgba(245,158,11,0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <i
                            className="fa-solid fa-circle-question"
                            style={{ color: "#F59E0B", fontSize: 11 }}
                          />
                        </div>
                        <div
                          style={{
                            flex: 1,
                            fontSize: 13,
                            color: "#fff",
                            fontWeight: 500,
                          }}
                        >
                          {quiz.question?.slice(0, 70)}
                          {quiz.question?.length > 70 ? "..." : ""}
                        </div>
                        <span
                          className="md-pill md-pill--warning"
                          style={{ fontSize: 10 }}
                        >
                          Correct: {quiz.correct?.toUpperCase()}
                        </span>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="md-btn md-btn--ghost md-btn--sm"
                            onClick={() =>
                              setQuizModal({
                                open: true,
                                quiz,
                                chapterId: ch.id,
                              })
                            }
                          >
                            <i className="fa-solid fa-pen" />
                          </button>
                          <button
                            className="md-btn md-btn--danger md-btn--sm"
                            onClick={() => handleDeleteQuiz(ch.id, quiz.id)}
                          >
                            <i className="fa-solid fa-trash" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Empty chapter */}
                    {!ch.lessons?.length && !ch.quizzes?.length && (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "20px 0",
                          color: "var(--md-muted)",
                          fontSize: 13,
                        }}
                      >
                        <i
                          className="fa-solid fa-inbox"
                          style={{ marginRight: 8 }}
                        />
                        No content yet. Add lessons or quizzes above.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CurriculumBuilder;
