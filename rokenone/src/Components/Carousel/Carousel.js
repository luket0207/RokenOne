import React, { useState } from 'react';
import './Carousel.scss';  // Ensure your styles are applied

const Carousel = ({ children, slidesPerPage = 2 }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false); // Track animation state
  const [direction, setDirection] = useState(null); // Track slide direction: 'up' or 'down'

  // Calculate total pages based on the number of slides per page
  const totalPages = Math.ceil(children.length / slidesPerPage);

  // Function to go to the next page
  const nextPage = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection('up');  // Slide up when moving forward
    setTimeout(() => {
      setCurrentPage((prevPage) => (prevPage + 1) % totalPages); // Loop back to the start
      setDirection('down'); // Slide down after changing the page
    }, 300); // Match this delay with the CSS transition time
  };

  // Function to go to the previous page
  const prevPage = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection('up');  // Slide down when moving backward
    setTimeout(() => {
      setCurrentPage((prevPage) => (prevPage - 1 + totalPages) % totalPages); // Loop back to the end
      setDirection('up'); // Slide up after changing the page
    }, 300); // Match this delay with the CSS transition time
  };

  // Slice the children into pages based on slidesPerPage
  const currentItems = children.slice(currentPage * slidesPerPage, (currentPage + 1) * slidesPerPage);

  return (
    <div className="carousel-container">
      <button className="carousel-arrow left" onClick={prevPage}>
        &lt;
      </button>
      <div className="carousel-content">
        <div
          className={`carousel-items ${isAnimating ? direction : ''}`}
          onTransitionEnd={() => setIsAnimating(false)} // Reset animation state after transition ends
        >
          {currentItems}
        </div>
      </div>
      <button className="carousel-arrow right" onClick={nextPage}>
        &gt;
      </button>

      {/* Dots Pagination */}
      <div className="dots-pagination">
        {Array.from({ length: totalPages }).map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentPage ? 'active' : ''}`}
            onClick={() => setCurrentPage(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
