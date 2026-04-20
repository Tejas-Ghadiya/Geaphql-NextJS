'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { LOGIN, LOGOUT, REGISTER } from '@/graphql/mutations';
import { GET_ME } from '@/graphql/queries';
import { User } from '@/types';
import Cookies from 'js-cookie';
import { fetchCsrfCookie } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirm_password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loginMutation] = useMutation(LOGIN);
  const [registerMutation] = useMutation(REGISTER);
  const [logoutMutation] = useMutation(LOGOUT);
  const { data, loading, refetch } = useQuery(GET_ME, {
    skip: typeof window !== 'undefined' && !Cookies.get('access_token') && !localStorage.getItem('access_token'),
  });

  useEffect(() => {
    if (data?.me) {
      setUser(data.me);
    }
  }, [data]);

  const ensureCsrfCookie = async () => {
    if (!Cookies.get('XSRF-TOKEN')) {
      await fetchCsrfCookie();
    }
  };

  const login = async (email: string, password: string) => {
    await ensureCsrfCookie();
    
    const { data } = await loginMutation({
      variables: {
        input: { email, password },
      },
      context: {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      },
    });
    
    if (data?.Login?.access_token) {
      const token = data.Login.access_token;
      localStorage.setItem('access_token', token);
      Cookies.set('access_token', token, { expires: 7, sameSite: 'lax', secure: false });
      setUser(data.Login.user);
      await refetch();
    }
  };

  const register = async (name: string, email: string, password: string, confirm_password: string) => {
    await ensureCsrfCookie();
    
    const { data } = await registerMutation({
      variables: {
        input: { name, email, password, confirm_password },
      },
      context: {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      },
    });
    
    if (data?.Register?.access_token) {
      const token = data.Register.access_token;
      localStorage.setItem('access_token', token);
      Cookies.set('access_token', token, { expires: 7, sameSite: 'lax', secure: false });
      setUser(data.Register.user);
      await refetch();
    }
  };

  const logout = async () => {
    try {
      await ensureCsrfCookie();
      await logoutMutation();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      Cookies.remove('access_token');
      Cookies.remove('XSRF-TOKEN');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}