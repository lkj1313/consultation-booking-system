import { createBrowserRouter } from 'react-router-dom';
import { PublicLayout, RootRedirect } from '@/app/layouts';
import { BookingPage } from '@/pages/booking-page';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/booking',
        element: <BookingPage />,
      },
    ],
  },
]);
