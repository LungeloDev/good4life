export interface Debt {
    id: string;
    name: string;
    balance: number;
    monthlyPayment: number;
}

export type DebtDraft = Omit<Debt, 'id'>;