import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { shopAPI } from "../../services/api";
import { Stars, Spinner } from "../../components/Base";
import { useCart } from "../../context/CartContext";
import Button from "../../components/UI/Button/Button";
import "./BookDetail.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faCartShopping,
  faUser,
  faVolumeHigh,
  faChalkboardUser,
  faCirclePlay,
  faCheck
} from "@fortawesome/free-solid-svg-icons";

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);
  const { addItem, isInCart } = useCart();

  useEffect(() => {
    setLoading(true);
    shopAPI
      .getBookById(id)
      .then((res) => {
        setBook(res.data);
        // fetch related books same category
        return shopAPI.getBooks({ category: res.data?.category, limit: 4 });
      })
      .then((res) =>
        setRelated(
          (res.data || []).filter((b) => b.id !== Number(id)).slice(0, 4),
        ),
      )
      .catch(() => setBook(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!book)
    return (
      <div
        className="container"
        style={{ padding: "80px 0", textAlign: "center" }}
      >
        <h2 style={{ color: "var(--text-muted)" }}>Book not found.</h2>
        <Link to="/shop" style={{ color: "var(--primary)", fontWeight: 600 }}>
          ← Back to Shop
        </Link>
      </div>
    );

  const inCart = isInCart(book.id, "book");

  return (
    <div className="book-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb" style={{ padding: "24px 0 0" }}>
          <Link to="/">Home</Link> |<Link to="/shop">Shop</Link> |
          <span className="active">{book.title}</span>
        </div>

        {/* Main layout */}
        <div className="book-detail-layout">
          {/* Cover */}
          <div className="book-detail-cover">
            <div className="book-detail-cover__img">
              {book.cover_image ? (
                <img src={book.cover_image} alt={book.title} />
              ) : (
                <span>📖</span>
              )}
            </div>
            {book.is_new && (
              <span className="book-detail-new-badge">New Arrival</span>
            )}
            
          </div>
          

          {/* Info */}
          <div className="book-detail-info">
            <span className="book-detail-category">{book.category}</span>
            <h1 className="book-detail-title">{book.title}</h1>
            {book.author && (
              <p className="book-detail-author">
                by <strong>{book.author}</strong>
              </p>
            )}

            <div className="book-detail-rating">
              <Stars rating={book.rating || 4.9} size={18} />
              <span className="book-detail-rating__text">
                {book.rating || "4.9"} rating
              </span>
            </div>

            <div className="book-detail-price">
              ${Number(book.price).toFixed(2)}
            </div>

            <div className="book-detail-desc">
              <h3>About this Book</h3>
              <p>
                {book.description ||
                  `"${book.title}" by ${book.author || "the author"} is a comprehensive resource
                  designed to help students excel in ${book.category || "their studies"}.
                  This book covers all essential topics with clear explanations,
                  practice exercises, and real-world examples.`}
              </p>
            </div>

            <div className="book-detail-meta">
              {[
                { label: "Category", value: book.category || "General" },
                { label: "Author", value: book.author || "EduVerse Press" },
                { label: "Rating", value: `${book.rating || 4.9} / 5` },
                { label: "Availability", value: "In Stock" },
              ].map((row) => (
                <div key={row.label} className="book-detail-meta__row">
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </div>
              ))}
            </div>

            <div className="book-detail-actions">
              <Button
                variant="primary"
                size="lg"
                onClick={() =>
                  addItem({
                    id: book.id,
                    type: "book",
                    title: book.title,
                    price: book.price,
                  })
                }
                disabled={inCart}
                style={{ minWidth: 200 }}
              >
                {/* {inCart ? "✓ Added to Cart" : "🛒 Add to Cart"} */}
                {inCart ? (
                  <>
                    <FontAwesomeIcon icon={faCheck} className="check" /> Added
                    to Cart
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCartShopping} className="cart" />{" "}
                    Add to Cart
                  </>
                )}
              </Button>
              {inCart && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/checkout")}
                >
                  Checkout →
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Related books */}
        {related.length > 0 && (
          <div className="book-detail-related">
            <h2>Related Books</h2>
            <div className="book-detail-related__grid">
              {related.map((b) => (
                <div
                  key={b.id}
                  className="book-related-card"
                  onClick={() => navigate(`/shop/books/${b.id}`)}
                >
                  <div className="book-related-card__cover">📖</div>
                  <div className="book-related-card__info">
                    <p className="book-related-card__title">{b.title}</p>
                    <span className="book-related-card__price">${b.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetailPage;
