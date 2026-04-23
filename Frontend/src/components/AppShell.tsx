import { Outlet } from 'react-router-dom';
import { NavigationLoader } from './NavigationLoader';

export const AppShell = () => {
  return (
    <>
      <NavigationLoader />
      <Outlet />
    </>
  );
};
