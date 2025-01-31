import React, {useState, useEffect} from "react";
import styled from "styled-components";
import Image from "next/image";
import Hr2 from "@/components/place/Hr2/Hr2";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  fetchUserProfile,
  toggleReviewLike,
  deleteReview,
} from "@/apis/review/reviewApi";
import ConfirmModal from "@/components/common/ConfirmModal/ConfirmModal";

const ReviewList = ({ reviews, setReviews }) => {
    const router = useRouter();
    const [likedReviews, setLikedReviews] = useState({});
    const [likeCounts, setLikeCounts] = useState({});
    const [dropdownStates, setDropdownStates] = useState({});
    const [currentUserNickname, setCurrentUserNickname] = useState("");
    const [profile, setProfile] = useState("");
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedReviewId, setSelectedReviewId] = useState(null);

    useEffect(() => {
      const loadUserProfile = async () => {
        try {
          const profiledata = await fetchUserProfile();
          setCurrentUserNickname(profiledata.nickname);
          setProfile(profiledata);
        } catch (error) {
          console.error("Failed to load user profile:", error.message);
        }
      };
      loadUserProfile();
    }, []);

    const NativeDate = global.Date;

    const formatDate = (dateString) => {
      const date = new NativeDate(dateString); 
      if (isNaN(date)) {
        return "Invalid date";
      }
      const kstOffset = 9 * 60 * 60 * 1000; 
      const localDate = new NativeDate(date.getTime() + kstOffset);
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, "0");
      const day = String(localDate.getDate()).padStart(2, "0");
      return `${year}.${month}.${day}`;
    };
    const handleCardClick = (reviewId, placeId) => {
        router.push(`/reviews/ReviewDetail?reviewId=${reviewId}&placeId=${placeId}`)
    }
    
    const handleLikeToggle = async (placeId, reviewId, isLiked, event) => {
    event.stopPropagation();
    try {
      await toggleReviewLike(placeId, reviewId, isLiked);
      setReviews((prev) =>
        prev.map((review) =>
          review.reviewId === reviewId
            ? {
                ...review,
                liked: !review.liked,
                likeCount: isLiked
                  ? review.likeCount - 1
                  : review.likeCount + 1,
              }
            : review
        )
      );
    } catch (error) {
      console.error("Failed to toggle like:", error.message);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    setSelectedReviewId(reviewId);
    setIsConfirmModalOpen(true);
  };
    
    
    const toggleDropdown = (id, event) => {
      event.stopPropagation();
      setDropdownStates((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    };
    const handleEditClick = (reviewId, placeId, event) => {
      event.stopPropagation();
      router.push(`/reviews/reviewsInput?reviewId=${reviewId}&placeId=${placeId}`);
    };

  return (
    <ReviewListContainer>
      <Title>리뷰 ({reviews.length})</Title>
      <Hr2/> 
      {reviews.map((review) => (
        <ReviewCard
        key={review.reviewId}
        onClick={() => handleCardClick(review.reviewId, review.placeId)}
        >
          <CardHeader>
            <AuthorWrapper>
              <AvatarWrapper>
                <Image
                  src={review.memberProfileImage || "/assets/profile/default_profile.svg"}
                  alt="사용자 프로필"
                  width={40}
                  height={40}
                  style={{borderRadius: "50%"}}
                />
              </AvatarWrapper>

              <AuthorInfoWrapper>
                <AuthorInfo>
                  <Author>{review.memberNickname}</Author>
                  <span style={{ marginBottom: "20px" }}>|</span>
                  <Date>{formatDate(review.createdAt)}</Date>
                </AuthorInfo>
                <RatingContainer>
                  <Rating>
                    {Array.from({ length: Math.round(review.rating) }).map((_, i) => (
                      <span style={{marginRight:"-5px"}}key={i}>⭐</span>
                    ))}
                  </Rating>
                </RatingContainer>
              </AuthorInfoWrapper>
            </AuthorWrapper>

            <ButtonWrapper>
            
              <LikeButton
                onClick={(event) => handleLikeToggle(review.placeId, review.reviewId, review.liked, event)}
              >
                {review.liked ? (
                  <FavoriteIcon style={{ color: "red" }} />
                ) : (
                  <FavoriteBorderIcon style={{ color: "#ccc" }} />
                )}
              </LikeButton>
              {currentUserNickname === review.memberNickname && (
                <>
                  <IconButton
                    onClick={(event) => toggleDropdown(review.reviewId, event)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  {dropdownStates[review.reviewId] && (
                    <Menu>
                      <MenuItem
                        onClick={(e) => handleEditClick(review.reviewId, review.placeId, e)}
                      >
                        수정
                      </MenuItem>
                      <MenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteReview(review.reviewId);
                        }}
                      >
                        삭제
                      </MenuItem>
                    </Menu>
                  )}
                </>
                )}
              </ButtonWrapper>

            
          </CardHeader>
            
          <CardContent>
            <Text>{review.content}</Text>
            <ImagesWrapper>
            {review.imageUrls &&
              review.imageUrls.map((url, index) => (
                <ImageWrapper key={index}>
                  <Image
                    src={url || "/assets/image.png"}
                    alt={`리뷰 이미지 ${index}`}
                    width={100}
                    height={100}
                    objectFit="cover"
                    style={{ borderRadius: "10px" }}
                    priority
                  />
                </ImageWrapper>
              ))}
          </ImagesWrapper>
          </CardContent>
          <Hr2/>
        </ReviewCard>
      ))}
      {isConfirmModalOpen && (
        <ConfirmModal
          title="리뷰 삭제"
          message="정말로 삭제하시겠습니까?"
          confirmText="확인"
          onClose={async () => {
            try {
              await deleteReview(selectedReviewId);
              setReviews((prev) =>
                prev.filter((review) => review.reviewId !== selectedReviewId)
              );
              setIsConfirmModalOpen(false);
            } catch (error) {
              console.error("리뷰 삭제 실패:", error.message);
            }
          }}
        />
      )}
    </ReviewListContainer>
  );
};

export default ReviewList;

const ReviewListContainer = styled.div`
  margin-bottom: 20px;
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
  margin-left: 10px;
  padding: 20px 20px;
  margin-right: 10px;
  background-color: white;
`;
const Title = styled.h3`
  margin-bottom: -10px;
`
const ReviewCard = styled.div`
  margin-bottom: 10px;
  padding-bottom: 5px;
  margin-top: 15px;
  cursor: pointer;
`;
const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
  margin-bottom: 8px;
  margin-top: -5px;
  width: 100%;
`;    
const AvatarWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 8px;
  flex-shrink: 0;
`;
const RatingContainer = styled.div`
  margin-left: 5px;
  display: flex;
`
const Author = styled.span`
  font-weight: bold;
  margin-left: 8px;
  margin-right: 4px;
  margin-bottom: 20px;
  font-size: 14px;
  white-space: nowrap;
`;

const Date = styled.span`
  font-size: 15px;
  margin-bottom: 17px;
  margin-left: 4px;
`;

const CardContent = styled.div``;

const Rating = styled.div`
  font-size: 14px;
  text-align: start;
`;

const Text = styled.p`
  margin: 8px 0;
`;

const ImageWrapper = styled.div`
  width: 100px;
  height: 100px;
  position: relative; 
  border-radius: 10px;
  overflow: hidden;
`;

const ButtonWrapper = styled.div`
  display: flex;
`;

const AuthorWrapper = styled.div`
  display: flex;
  align-items: flex-start;
`;

const AuthorInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const AuthorInfo = styled.div`

`;

const LikeButton = styled.div`
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3px;
  padding-left: 15px;
  &:hover svg {
    transform: scale(1.2);
  }
`;
const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  transform: translateX(10px) translateY(-2.7px);
  svg {
    color: #ABABAB; 
    transition: transform 0.2s ease, color 0.2s ease;
  }
  &:hover svg {
    transform: scale(1.2);
  }
`;
const Menu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 100px;
  z-index: 1000;
  overflow: hidden;
`;

const MenuItem = styled.div`
  padding: 8px 12px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  text-align: center;

  &:hover {
    background-color: #f4f4f4;
  }
`;

const ImagesWrapper = styled.div`
  display: flex;
  gap: 8px; /* 이미지 간 간격 */
  flex-wrap: wrap; 
  margin-top: 8px;
`;