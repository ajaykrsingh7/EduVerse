import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { learnAPI } from '../../services/api';
import { Spinner } from '../../components/Base';
import './Learn.css';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faLaptopCode,
  faFlask,
  faSquareRootAlt,
  faBook,
  faLayerGroup,
  faListCheck,
  faUserGraduate
} from "@fortawesome/free-solid-svg-icons";

const FreeCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    learnAPI.getFreeCourses()
      .then(res => setCourses(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="free-courses-page">
      {/* Hero */}
      <div className="fc-hero">
        <div className="container">
          <div className="fc-hero__content">
            <span className="fc-hero__tag">100% Free</span>
            <h1>Learn at Your Own Pace</h1>
            <p>
              Structured, interactive courses you can read and learn like a textbook —
              with code examples, exercises, and quizzes. No payment required.
            </p>

            <div className="fc-hero__stats">
              <div className="fc-hero__stat">
                <strong>{courses.length}</strong>
                <span>Free Courses</span>
              </div>

              <div className="fc-hero__stat-sep" />

              <div className="fc-hero__stat">
                <strong>
                  {courses.reduce((s, c) => s + (c.lesson_count || 0), 0)}
                </strong>
                <span>Lessons</span>
              </div>

              <div className="fc-hero__stat-sep" />

              <div className="fc-hero__stat">
                <strong>0₹</strong>
                <span>Cost</span>
              </div>
            </div>
          </div>

          <div className="fc-hero__image">
            <img
              src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y291cnNlc3xlbnwwfHwwfHx8MA%3D%3D"
              style={{
                width: "360px",
                height: "200px",
                objectFit: "cover",
                borderRadius: "16px",
              }}
            />
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 48, paddingBottom: 60 }}>
        <h2 className="fc-section-title">Available Free Courses</h2>

        {loading ? <Spinner /> : (
          <div className="fc-grid">
            {courses.map(course => (
              <div key={course.id} className="fc-card">
                <div className="fc-card__header">
                  <div className="fc-card__icon">
                    <FontAwesomeIcon
                      icon={
                        course.category === "Computer"
                          ? faLaptopCode
                          : course.category === "Science"
                          ? faFlask
                          : course.category === "Math"
                          ? faSquareRootAlt
                          : faBook
                      }
                    />
                  </div>

                  <span className="fc-card__badge">
                    {course.category}
                  </span>
                </div>

                <h3 className="fc-card__title">{course.title}</h3>
                <p className="fc-card__desc">{course.description}</p>

                <div className="fc-card__meta">
                  <span>
                    <FontAwesomeIcon icon={faLayerGroup} style={{ marginRight: "6px" }} />
                    {course.chapter_count || 0} chapters
                  </span>

                  <span>
                    <FontAwesomeIcon icon={faListCheck} style={{ marginRight: "6px" }} />
                    {course.lesson_count || 0} lessons
                  </span>

                  <span>
                    <FontAwesomeIcon icon={faUserGraduate} style={{ marginRight: "6px" }} />
                    {course.mentor_name}
                  </span>
                </div>

                <Link to={`/learn/${course.id}`} className="fc-card__btn">
                  Start Learning 
                </Link>
              </div>
            ))}

            {courses.length === 0 && (
              <div
                style={{
                  gridColumn: '1/-1',
                  textAlign: 'center',
                  padding: '60px 0',
                  color: 'var(--text-muted)'
                }}
              >
                No free courses available yet. Check back soon!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FreeCoursesPage;