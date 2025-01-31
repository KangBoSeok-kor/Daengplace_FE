"use client";

import React from "react";
import styled from "styled-components";
import Image from "next/image";

const PhotoGrid = ({ reviews, onImageClick, placeId }) => {
  return (
    <Grid>
      {reviews.map((review) =>
        review.imageUrls.map((image, index) => (
          <PhotoWrapper
            key={`${review.reviewId}-${index}`}
            onClick={() => onImageClick(review.reviewId, placeId)} 
          >
            <Image
              src={image}
              alt={`리뷰 이미지 ${review.reviewId}-${index}`}
              width={300}
              height={300}
              style={{ borderRadius: "10px", objectFit: "cover" }}
              priority
            />
        </PhotoWrapper>
      ))
    )}
    </Grid>
  );
};

export default PhotoGrid;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const PhotoWrapper = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
    transform: scale(1.02);
    transition: all 0.2s ease-in-out;
  }
`;
