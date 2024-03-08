import { useState } from "react";

const containerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
};

const textStyle = {
  lineHeight: "1",
  margin: "0",
  color: "#faaf00",
};

export default function RatingStars({
  maxRating = 5,
  rating,
  setRating,
  tempRating,
  setTempRating,
}) {
  function handleRating(i) {
    setRating(i + 1);
  }
  function handleHoverEnter(i) {
    setTempRating(i + 1);
  }
  function handleHoverOut() {
    setTempRating(0);
  }
  return (
    <div style={containerStyle}>
      <div style={{ display: "flex" }}>
        {Array.from({ length: maxRating }, (_, i) => (
          <Star
            tempRating={tempRating}
            key={i}
            onRating={() => handleRating(i)}
            onHoveringEnter={() => handleHoverEnter(i)}
            onHoveringOut={() => handleHoverOut()}
            full={tempRating ? tempRating >= i + 1 : rating >= i + 1}
          />
        ))}
      </div>
      <span style={textStyle}>{tempRating || rating || ""}</span>
    </div>
  );
}

const starStyle = {
  width: "28px",
  height: "28px",
  display: "block",
  cursor: "pointer",
};

function Star({ onRating, full, onHoveringEnter, onHoveringOut }) {
  return (
    <span
      style={starStyle}
      role="button"
      onClick={onRating}
      onMouseEnter={onHoveringEnter}
      onMouseLeave={onHoveringOut}
    >
      {full ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="#faaf00"
            stroke="#faaf00"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#faaf00"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="{2}"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </>
      )}
    </span>
  );
}
