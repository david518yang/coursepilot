/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        // Redirect /courses/[courseId]/notes with no note ID
        source: '/courses/:courseId/notes',
        destination: '/courses/:courseId',
        permanent: false,
      },
      {
        // Redirect /courses/[courseId]/quizzes with no quiz ID
        source: '/courses/:courseId/quizzes',
        destination: '/courses/:courseId',
        permanent: false,
      },
      {
        // Redirect /courses/[courseId]/flashcards with no flashcard ID
        source: '/courses/:courseId/flashcards',
        destination: '/courses/:courseId',
        permanent: false,
      },
      // Optional: Handle trailing slashes as well
      {
        source: '/courses/:courseId/notes/',
        destination: '/courses/:courseId',
        permanent: false,
      },
      {
        source: '/courses/:courseId/quizzes/',
        destination: '/courses/:courseId',
        permanent: false,
      },
      {
        source: '/courses/:courseId/flashcards/',
        destination: '/courses/:courseId',
        permanent: false,
      }
    ];
  }
};

export default nextConfig;
