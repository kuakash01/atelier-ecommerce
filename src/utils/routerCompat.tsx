'use client';

import React, { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import NextLink from 'next/link';
import { useRouter, usePathname, useSearchParams as useNextSearchParams, useParams as useNextParams } from 'next/navigation';

// Outlet context for nested layout support
export const OutletContext = createContext<React.ReactNode | null>(null);

export const Outlet = () => {
  const children = useContext(OutletContext);
  return <>{children || null}</>;
};

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: string;
  href?: string;
  children?: React.ReactNode;
}

// Next.js adapter for Link component (supports `to` prop)
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, href, children, ...props },
  ref
) {
  const target = href || to || '#';
  return (
    <NextLink ref={ref} href={target} {...props}>
      {children}
    </NextLink>
  );
});

export interface NavLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'className'> {
  to?: string;
  href?: string;
  className?: string | ((props: { isActive: boolean }) => string);
  children?: React.ReactNode;
}

// NavLink supporting className callback
export const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink(
  { to, href, className, children, ...props },
  ref
) {
  const pathname = usePathname();
  const target = href || to || '#';
  const isActive = Boolean(pathname === target || (target !== '/' && pathname && pathname.startsWith(target)));
  const resolvedClassName = typeof className === 'function' ? className({ isActive }) : className;

  return (
    <NextLink ref={ref} href={target} className={resolvedClassName} {...props}>
      {children}
    </NextLink>
  );
});

let globalRouterState: any = null;

// useNavigate hook mapping to Next.js useRouter
export function useNavigate() {
  const router = useRouter();

  return useCallback((to: string | number, options?: { replace?: boolean; state?: any }) => {
    if (typeof to === 'number') {
      if (to === -1) {
        router.back();
      } else if (to === 1) {
        router.forward();
      }
      return;
    }

    if (options && options.state !== undefined) {
      globalRouterState = options.state;
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('__router_compat_state', JSON.stringify(options.state));
        } catch {}
      }
    }

    if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [router]);
}

// useLocation hook mapping to Next.js usePathname and useSearchParams
export function useLocation() {
  const pathname = usePathname() || '/';
  const rawSearchParams = useNextSearchParams();
  const searchString = rawSearchParams ? rawSearchParams.toString() : '';
  const search = searchString ? `?${searchString}` : '';

  const state = useMemo(() => {
    if (globalRouterState !== null) return globalRouterState;
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('__router_compat_state');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return null;
  }, [pathname, searchString]);

  return useMemo(() => ({
    pathname,
    search,
    hash: typeof window !== 'undefined' ? window.location.hash : '',
    state,
    key: pathname + search,
  }), [pathname, search, state]);
}

// useParams hook
export function useParams<T extends Record<string, string | string[]> = Record<string, string>>() {
  const params = useNextParams();
  return (params || {}) as T;
}

// useSearchParams hook (stable memoized URLSearchParams instance)
export function useSearchParams(): [URLSearchParams, (newParams: Record<string, string> | URLSearchParams, options?: { replace?: boolean }) => void] {
  const rawSearchParams = useNextSearchParams();
  const searchString = rawSearchParams ? rawSearchParams.toString() : '';
  const router = useRouter();
  const pathname = usePathname();

  const searchParams = useMemo(() => new URLSearchParams(searchString), [searchString]);

  const setSearchParams = useCallback((newParams: Record<string, string> | URLSearchParams, options?: { replace?: boolean }) => {
    const params = new URLSearchParams(newParams as any);
    const queryString = params.toString();
    const base = pathname || '/';
    const target = queryString ? `${base}?${queryString}` : base;
    if (options?.replace) {
      router.replace(target);
    } else {
      router.push(target);
    }
  }, [pathname, router]);

  return [searchParams, setSearchParams];
}

// Navigate component for declarative redirects
export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!to) return;
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [to, replace, router]);

  return null;
}

// Loader Context for data loaders
export const LoaderContext = createContext<{ data: any; revalidate: () => void }>({ data: null, revalidate: () => {} });

export function LoaderProvider({ data, revalidate, children }: { data: any; revalidate: () => void; children: React.ReactNode }) {
  return (
    <LoaderContext.Provider value={{ data, revalidate }}>
      {children}
    </LoaderContext.Provider>
  );
}

export function useLoaderData<T = any>(): T {
  const ctx = useContext(LoaderContext);
  return ctx?.data;
}

export function useRevalidator() {
  const ctx = useContext(LoaderContext);
  return {
    revalidate: ctx?.revalidate || (() => {}),
    state: 'idle',
  };
}

const routerCompat = {
  Link,
  NavLink,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
  Navigate,
  Outlet,
  LoaderContext,
  LoaderProvider,
  useLoaderData,
  useRevalidator,
};

export default routerCompat;
