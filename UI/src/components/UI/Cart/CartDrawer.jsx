import { useCart } from '../../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './CartDrawer.css';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faCartShopping,
  faBook,
  faBookOpen,
  faMoneyBill,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";

const CartDrawer = ({ open, onClose }) => {
  const { items, removeItem, total } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {open && <div className="cart-overlay" onClick={onClose} />}

      <div className={`cart-drawer ${open ? 'cart-drawer--open' : ''}`}>
        
        {/* Header */}
        <div className="cart-drawer__header">
          <h3>Your Cart ({items.length})</h3>
          <button className="cart-drawer__close" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Body */}
        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <span className="cart-empty__icon">
                <FontAwesomeIcon icon={faCartShopping} size="2x" />
              </span>
              <p>Your cart is empty</p>
              <button
                className="cart-browse-btn"
                onClick={() => {
                  onClose();
                  navigate('/courses');
                }}
              >
                Browse Courses
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={`${item.type}-${item.id}`} className="cart-item">
                
                {/* Thumbnail */}
                <div className="cart-item__thumb">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.title} />
                  ) : (
                    <span>
                      <FontAwesomeIcon
                        icon={
                          item.type === 'course'
                            ? faBookOpen
                            : item.type === 'book'
                            ? faBook
                            : faMoneyBill
                        }
                      />
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="cart-item__info">
                  <p className="cart-item__title">{item.title}</p>
                  <span className="cart-item__type">{item.type}</span>
                </div>

                {/* Right */}
                <div className="cart-item__right">
                  <span className="cart-item__price">
                    ₹{Number(item.price).toFixed(2)}
                  </span>

                  <button
                    className="cart-item__remove"
                    onClick={() => removeItem(item.id, item.type)}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-total">
              <span>Total</span>
              <span className="cart-total__amount">
                ₹{total.toFixed(2)}
              </span>
            </div>

            <button className="cart-checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout{" "}
              <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: "6px" }} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;