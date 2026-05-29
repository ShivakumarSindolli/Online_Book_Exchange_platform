import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StarRating({ rating = 0, onRating, readOnly = false, hoverRating = 0, onHover }) {
  const stars = [1, 2, 3, 4, 5];
  const activeRating = hoverRating || rating;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
      {stars.map((starValue) => {
        const isFilled = activeRating >= starValue;
        return (
          <motion.div
            key={starValue}
            whileHover={!readOnly ? { scale: 1.25 } : {}}
            whileTap={!readOnly ? { scale: 0.9 } : {}}
            onClick={() => !readOnly && onRating && onRating(starValue)}
            onMouseEnter={() => !readOnly && onHover && onHover(starValue)}
            onMouseLeave={() => !readOnly && onHover && onHover(0)}
            style={{
              cursor: readOnly ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isFilled ? '#fbbf24' : 'rgba(255,255,255,0.12)',
              transition: 'color 0.15s ease',
            }}
          >
            <Star
              size={readOnly ? 14 : 28}
              fill={isFilled ? '#fbbf24' : 'none'}
              strokeWidth={isFilled ? 0 : 2}
              style={{
                stroke: isFilled ? 'none' : 'currentColor',
              }}
            />
          </motion.div>
        );
      })}
      {readOnly && rating > 0 && (
        <span style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          color: 'var(--text-3)',
          marginLeft: '0.4rem',
        }}>
          ({Number(rating).toFixed(1)})
        </span>
      )}
    </div>
  );
}