"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getWalletBalance } from '@/services/wallet.service';
import { getCookie, COOKIE_KEYS } from '@/lib/cookie-client';
import { useAuth } from '@/providers/AuthProvider';
import type { User } from '@supabase/supabase-js';

interface WalletContextType {
  balance: number;
  currency: string;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  refresh: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const { user: appUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('EUR');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync auth state with Supabase session or cookie fallback
  useEffect(() => {
    const cookieSbToken = getCookie(COOKIE_KEYS.SUPABASE_TOKEN);
    if (cookieSbToken) {
      setToken(cookieSbToken);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setToken(session.access_token);
      } else if (cookieSbToken && appUser) {
        setToken(cookieSbToken);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setToken(session.access_token);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, appUser]);

  const refresh = useCallback(async () => {
    const activeToken = getCookie(COOKIE_KEYS.SUPABASE_TOKEN) || token || getCookie(COOKIE_KEYS.TOKEN);

    if (!activeToken && !appUser) {
      setBalance(0);
      setIsLoading(false);
      return;
    }

    try {
      if (activeToken) {
        const data = await getWalletBalance(activeToken);
        setBalance(data.balance ?? 0);
        setCurrency(data.currency || 'EUR');
      } else if (appUser) {
        // Direct read from Supabase if token refresh in progress
        const { data: wallet } = await supabase
          .from('wallets')
          .select('balance, currency')
          .eq('user_id', appUser.id)
          .maybeSingle();

        if (wallet) {
          setBalance(Number(wallet.balance ?? 0));
          setCurrency(wallet.currency || 'EUR');
        }
      }
    } catch (err) {
      console.warn('Failed to fetch wallet balance:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, appUser, supabase]);

  useEffect(() => {
    refresh();

    // Auto-polling interval every 15 seconds to ensure wallet balance is consistently fresh
    const intervalId = setInterval(() => {
      refresh();
    }, 15000);

    return () => {
      clearInterval(intervalId);
    };
  }, [refresh]);

  // Subscribe to Supabase Realtime postgres_changes on the `wallets` table for instant push updates
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('wallet_balance_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallets',
        },
        (payload: any) => {
          // If the change belongs to the active user (or on any wallet change), refresh balance immediately
          const changedUserId = payload.new?.user_id || payload.old?.user_id;
          if (!changedUserId || changedUserId === user?.id || changedUserId === appUser?.id) {
            refresh();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user?.id, appUser?.id, refresh]);

  return (
    <WalletContext.Provider
      value={{
        balance,
        currency,
        isLoading,
        user,
        token,
        refresh,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
