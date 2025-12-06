export interface Strategy {
  id: string;
  name: string;
  creator: string;
  username: string;
  followers: string;
  bio: string;
  avatar: string;
  allocation: Record<string, number>;
  return12mo: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  winRate: number;
}

export const strategies: Strategy[] = [
  {
    id: 'safestack',
    name: 'SafeStack',
    creator: 'CryptoSara',
    username: '@cryptosara',
    followers: '2.4k',
    bio: 'Conservative long-term DCA',
    avatar: '👩‍💼',
    allocation: {
      BTC: 50,
      ETH: 30,
      USDC: 20
    },
    return12mo: 42,
    riskLevel: 'Low',
    winRate: 89
  },
  {
    id: 'moonbag',
    name: 'MoonBag',
    creator: 'DeFiDave',
    username: '@defidave',
    followers: '890',
    bio: 'High risk, high reward altcoins',
    avatar: '🚀',
    allocation: {
      SOL: 40,
      AVAX: 30,
      MATIC: 30
    },
    return12mo: 127,
    riskLevel: 'High',
    winRate: 67
  },
  {
    id: 'maxibtc',
    name: 'MaxiBTC',
    creator: 'BitcoinBella',
    username: '@bitcoinbella',
    followers: '5.1k',
    bio: 'Bitcoin maximalist approach',
    avatar: '₿',
    allocation: {
      BTC: 100
    },
    return12mo: 38,
    riskLevel: 'Medium',
    winRate: 82
  }
];

export interface PortfolioData {
  hasStrategy: boolean;
  strategy: {
    id: string;
    name: string;
    creator: string;
    allocation: Record<string, number>;
    weeklyAmount: number;
    weeksCompleted: number;
    totalWeeks: number | null;
    strictMode: boolean;
  } | null;
  portfolio: {
    holdings: Record<string, number>;
    holdingsValue: Record<string, number>;
    holdingsChange: Record<string, number>;
    totalValue: number;
    costBasis: number;
    profitLoss: number;
    profitLossPercent: number;
  };
  nextDCA: string;
  dcaPoolBalance: number;
}

export interface Transaction {
  week: number;
  date: string;
  purchased: Record<string, number>;
  gasSpent: number;
  txHash: string;
}

export const mockPortfolio: PortfolioData = {
  hasStrategy: false,
  strategy: null,
  portfolio: {
    holdings: {},
    holdingsValue: {},
    holdingsChange: {},
    totalValue: 0,
    costBasis: 0,
    profitLoss: 0,
    profitLossPercent: 0
  },
  nextDCA: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  dcaPoolBalance: 0
};

export const mockTransactions: Transaction[] = [];

// Simulated crypto prices
export const cryptoPrices: Record<string, number> = {
  BTC: 97000,
  ETH: 3600,
  USDC: 1,
  SOL: 230,
  AVAX: 45,
  MATIC: 0.55
};
