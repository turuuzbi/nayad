// Fictional data for the hero mock-up. Due dates are relative ("days from today") so the
// mock-up never shows a stale or impossible date, and every total is derived from the rows
// so the numbers on screen always add up.

import { sumMNT } from "./money.ts";

export type DemoDebt = {
  customer: string;
  amount: number; // whole tugriks
  dueInDays: number; // negative = overdue
};

export const DEMO_DEBTS: readonly DemoDebt[] = [
  { customer: "Хүслэн хүнс", amount: 1_250_000, dueInDays: -5 },
  { customer: "Сарнай салон", amount: 480_000, dueInDays: 0 },
  { customer: "Бат-Эрдэнэ", amount: 870_000, dueInDays: 3 },
  { customer: "Мөнх-Од авто", amount: 880_000, dueInDays: 18 },
];

export type DueStatus = "overdue" | "today" | "soon" | "later";

export function dueStatus(dueInDays: number): DueStatus {
  if (dueInDays < 0) return "overdue";
  if (dueInDays === 0) return "today";
  if (dueInDays <= 7) return "soon";
  return "later";
}

export function dueLabel(dueInDays: number): string {
  if (dueInDays < 0) return `${-dueInDays} хоног хэтэрсэн`;
  if (dueInDays === 0) return "Өнөөдөр";
  return `${dueInDays} хоногийн дараа`;
}

export function summarize(debts: readonly DemoDebt[]) {
  return {
    customers: debts.length,
    total: sumMNT(debts.map((d) => d.amount)),
    overdue: sumMNT(debts.filter((d) => d.dueInDays < 0).map((d) => d.amount)),
    dueThisWeek: sumMNT(debts.filter((d) => d.dueInDays >= 0 && d.dueInDays <= 7).map((d) => d.amount)),
  };
}
