import { useState } from 'react';
import './Base.css';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faStar,
  faStarHalfAlt,
  faChevronLeft,
  faChevronRight,
  faCircleExclamation
} from "@fortawesome/free-solid-svg-icons";

/*  Input  */
export const Input = ({
  label, type = 'text', value, onChange, placeholder,
  icon, error, name, required, className = '', ...rest
}) => {
  const [show, setShow] = useState(false);
  const inputType = type === 'password' ? (show ? 'text' : 'password') : type;

  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label">{label}</label>}

      <div className={`input-wrapper ${error ? 'input-wrapper--error' : ''}`}>
        {icon && <span className="input-icon">{icon}</span>}

        <input
          className="input-field"
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          name={name}
          required={required}
          {...rest}
        />

        {type === 'password' && (
          <button
            type="button"
            className="input-eye"
            onClick={() => setShow(s => !s)}
          >
            <FontAwesomeIcon icon={show ? faEyeSlash : faEye} />
          </button>
        )}
      </div>

      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

/*  Stars  */
export const Stars = ({ rating = 0, count, size = 14 }) => {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <span className="stars-wrap" style={{ fontSize: size }}>
      {[...Array(full)].map((_, i) => (
        <FontAwesomeIcon key={`f-${i}`} icon={faStar} />
      ))}

      {half && <FontAwesomeIcon icon={faStarHalfAlt} />}

      {[...Array(empty)].map((_, i) => (
        <FontAwesomeIcon key={`e-${i}`} icon={faStar} className="star-empty" />
      ))}

      {count != null && (
        <span className="stars-count">({count})</span>
      )}
    </span>
  );
};

/*  Badge  */
export const Badge = ({ children, variant = 'primary', className = '' }) => (
  <span className={`badge badge--${variant} ${className}`}>
    {children}
  </span>
);

/*  Spinner  */
export const Spinner = ({ size = 40, color = 'var(--primary)' }) => (
  <div className="spinner-wrap">
    <div
      className="spinner"
      style={{
        width: size,
        height: size,
        borderTopColor: color
      }}
    />
  </div>
);

/*  Modal  */
export const Modal = ({ open, onClose, children, className = '' }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-box ${className}`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

/*  Pagination  */
export const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="page-btn"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>

      <span className="page-info">
        Page <strong>{page}</strong> of {totalPages}
      </span>

      <button
        className="page-btn"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  );
};

/*  Tab group  */
export const Tabs = ({ tabs, active, onChange }) => (
  <div className="tabs-wrap">
    {tabs.map(tab => (
      <button
        key={tab.value}
        className={`tab-btn ${active === tab.value ? 'tab-btn--active' : ''}`}
        onClick={() => onChange(tab.value)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

/*  Alert  */
export const Alert = ({ type = 'error', message }) => {
  if (!message) return null;

  return (
    <div className={`alert alert--${type}`}>
      <FontAwesomeIcon icon={faCircleExclamation} />
      <span style={{ marginLeft: '6px' }}>{message}</span>
    </div>
  );
};