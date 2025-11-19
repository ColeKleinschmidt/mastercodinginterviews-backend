import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type RouterContextValue = {
  location: string;
  navigate: (path: string, options?: { replace?: boolean }) => void;
};

const RouterContext = createContext<RouterContextValue | undefined>(undefined);

const useRouter = () => {
  const value = useContext(RouterContext);
  if (!value) {
    throw new Error('useRouter must be used within a BrowserRouter');
  }
  return value;
};

export const BrowserRouter = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocation] = useState(window.location.pathname);

  useEffect(() => {
    const handlePop = () => setLocation(window.location.pathname);
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const navigate = (path: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }
    setLocation(path);
  };

  const value = useMemo(() => ({ location, navigate }), [location]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
};

type RouteProps = {
  path: string;
  element?: React.ReactNode;
};

export const Route = (_props: RouteProps) => null;

const matchPath = (expected: string, current: string) => {
  if (expected === '*') return true;
  return expected === current;
};

export const Routes = ({ children }: { children: React.ReactNode }) => {
  const { location } = useRouter();
  let element: React.ReactNode = null;

  React.Children.forEach(children as React.ReactNode[], (child) => {
    if (!React.isValidElement(child)) return;
    const { path, element: routeElement } = child.props as RouteProps;
    if (matchPath(path, location) && element === null) {
      element = routeElement ?? child.props.children;
    }
  });

  return <>{element}</>;
};

export const Navigate = ({ to, replace }: { to: string; replace?: boolean }) => {
  const { navigate } = useRouter();
  useEffect(() => {
    navigate(to, { replace });
  }, [navigate, replace, to]);
  return null;
};

export const Link = ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) => {
  const { navigate } = useRouter();
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};

export const useNavigate = () => useRouter().navigate;
export const useLocation = () => ({ pathname: useRouter().location });
