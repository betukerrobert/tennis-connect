import { useState } from 'react';

const StarRating = ({ rating, onRatingChange, readOnly = false, size = 32 }) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleClick = (value) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const stars = [1, 2, 3, 4, 5];

  return (
    <div style={styles.container}>
      {stars.map((star) => {
        const isFilled = star <= (hoveredRating || rating);
        return (
          <span
            key={star}
            style={{
              ...styles.star,
              fontSize: `${size}px`,
              cursor: readOnly ? 'default' : 'pointer',
              color: isFilled ? '#c8ff00' : '#e0e4ea',
            }}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readOnly && setHoveredRating(star)}
            onMouseLeave={() => !readOnly && setHoveredRating(0)}
          >
            {isFilled ? '★' : '☆'}
          </span>
        );
      })}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  star: {
    transition: 'color 0.15s ease',
    userSelect: 'none',
  },
};

export default StarRating;
