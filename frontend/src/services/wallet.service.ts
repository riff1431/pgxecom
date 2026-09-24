import { api } from '@/lib/api';

export interface WalletBalanceResponse {
  userId: string;
  balance: number;
  currency: string;
}

export interface TopUpResponse {
  sessionId: string;
  url: string;
}

export async function getWalletBalance(supabaseToken: string): Promise<WalletBalanceResponse> {
  const response = await api.get('/wallet/balance', {
    params: {
      _t: Date.now(),
    },
    headers: {
      Authorization: `Bearer ${supabaseToken}`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  });
  return response.data?.data || response.data;
}

export async function createTopUpSession(
  supabaseToken: string,
  amount: number,
  returnUrl?: string,
): Promise<TopUpResponse> {
  const response = await api.post(
    '/wallet/topup',
    { amount, returnUrl },
    {
      headers: {
        Authorization: `Bearer ${supabaseToken}`,
      },
    },
  );
  return response.data?.data || response.data;
}
