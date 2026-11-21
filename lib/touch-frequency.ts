import type { touchFrequency } from "@/db/schema";

export type TouchFrequency = (typeof touchFrequency.enumValues)[number];

// Form value for "not set": Radix Select does not accept an empty value
export const NO_TOUCH_FREQUENCY = "none";

export const TOUCH_FREQUENCIES = ["week", "month", "quarter", "year"] as const satisfies readonly TouchFrequency[];

export const TOUCH_FREQUENCY_LABELS: Record<TouchFrequency, string> = {
  week: "Раз в неделю",
  month: "Раз в месяц",
  quarter: "Раз в квартал",
  year: "Раз в год",
};

export const NO_TOUCH_FREQUENCY_LABEL = "Не задано";

/** How many full days may pass since the last contact before it is time to reconnect. */
export const TOUCH_FREQUENCY_DAYS: Record<TouchFrequency, number> = {
  week: 7,
  month: 30,
  quarter: 90,
  year: 365,
};
