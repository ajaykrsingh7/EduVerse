import { Link } from "react-router-dom";
import { Stars } from "../../Base";
import { useCart } from "../../../context/CartContext";
import "./Cards.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faCartShopping,
  faMagnifyingGlass,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

export const CourseCard = ({ course }) => {
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(course.id, "course");

  return (
    <div className="course-card">
      <Link to={`/courses/${course.id}`} className="course-card__thumb-link">
        <div className="course-card__thumb">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} />
          ) : (
            <div className="course-card__thumb-placeholder">
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80"
                alt="Course"
              />
            </div>
          )}
        </div>
      </Link>
      <div className="course-card__body">
        <div className="course-card__meta">
          <Stars rating={course.rating || 4.8} />
          <span className="course-card__price">₹{course.price}</span>
        </div>
        <h3 className="course-card__title">
          <Link to={`/courses/${course.id}`}>{course.title}</Link>
        </h3>
        {course.mentor_name && (
          <p className="course-card__mentor">by {course.mentor_name}</p>
        )}
      </div>

      <button
        className={`course-card__cart-btn ${inCart ? "course-card__cart-btn--added" : ""}`}
        aria-label="Add to cart"
        onClick={() =>
          addItem({
            id: course.id,
            type: "course",
            title: course.title,
            price: course.price,
            thumbnail: course.thumbnail || null,
          })
        }
        disabled={inCart}
        title={inCart ? "Added to cart" : "Add to cart"}
      >
        {inCart ? (
          <>
            <FontAwesomeIcon icon={faCheck} />
            <span>Added</span>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faCartShopping} />
            <span>Add</span>
          </>
        )}
      </button>
    </div>
  );
};

//Book card
export const BookCard = ({ book, layout = "grid" }) => {
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(book.id, "book");

  if (layout === "list")
    return (
      <Link
        to={`/shop/books/${book.id}`}
        className="book-list-item"
        style={{ textDecoration: "none" }}
      >
        <div className="book-list-item__cover">
          <img
            src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80"
            alt={book.title}
          />
        </div>

        <div className="book-list-item__info">
          <div className="book-list-item__title">{book.title}</div>
          <div className="book-list-item__author">by {book.author}</div>
        </div>
      </Link>
    );
  return (
    <div className="book-card">
      <Link to={`/shop/books/${book.id}`} className="book-card__cover">
        {book.cover_image ? (
          <img src={book.cover_image} alt={book.title} />
        ) : (
          <div className="book-card__cover-placeholder">
            <img
              src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80"
              alt="Books"
            />
          </div>
        )}
      </Link>
      <div className="book-card__body">
        <h4 className="book-card__title">
          <Link to={`/shop/books/${book.id}`}>{book.title}</Link>
        </h4>
        <div className="book-card__footer">
          <span className="book-card__price">₹{book.price}</span>
          <Stars rating={book.rating || 4.9} size={12} />
        </div>

        <button
          className={`book-card__cart-btn ${inCart ? "book-card__cart-btn--added" : ""}`}
          aria-label="Add to cart"
          onClick={() =>
            addItem({
              id: book.id,
              type: "book",
              title: book.title,
              price: book.price,
            })
          }
          disabled={inCart}
          title={inCart ? "Added to cart" : "Add to cart"}
        >
          {inCart ? (
            <>
              <FontAwesomeIcon icon={faCheck} />
              <span>Added</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faCartShopping} />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

//Mentor card
export const MentorCard = ({ mentor }) => (
  <div className="mentor-card">
    <div className="mentor-card__photo">
      {mentor.avatar ? (
        <img src={mentor.avatar} alt={mentor.full_name} />
      ) : (
        <div className="mentor-card__photo-placeholder">
          {mentor.full_name?.[0] || "M"}
        </div>
      )}
    </div>
    <div className="mentor-card__info">
      <Link to={`/mentors/${mentor.id}`} className="mentor-card__name">
        {mentor.full_name}
      </Link>
      <p className="mentor-card__title">{mentor.title}</p>
      {mentor.rating > 0 && (
        <div className="mentor-card__rating">
          <Stars
            rating={mentor.rating}
            size={12}
            count={mentor.total_reviews}
          />
        </div>
      )}
    </div>
  </div>
);
