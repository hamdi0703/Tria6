
import { useReviewContext } from '../context/ReviewContext';

export const useReviews = (movieId: number) => {
  const { getReview } = useReviewContext();

  // Sadece context'ten gelen veriyi okur. 
  // Ekleme/Silme işlemleri artık React Query mutation'ları (useReviewQueries.ts) üzerinden yapılmaktadır.
  const review = getReview(movieId) || null;

  return { review };
};
