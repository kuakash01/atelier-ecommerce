'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import store from '../../redux/store';
import { setMobileOpen } from '../../redux/themeSlice';
import { useAppDispatch } from '../../redux/hooks';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ProviderProps {
  children: React.ReactNode;
}

function WindowResizeListener({ children }: ProviderProps) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleResize = () => {
      dispatch(setMobileOpen(window.innerWidth < 1000));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  return <>{children}</>;
}

export default function ReduxProvider({ children }: ProviderProps) {
  return (
    <Provider store={store}>
      <WindowResizeListener>
        <ToastContainer
          position="bottom-center"
          autoClose={3500}
          hideProgressBar={true}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        {children}
      </WindowResizeListener>
    </Provider>
  );
}
