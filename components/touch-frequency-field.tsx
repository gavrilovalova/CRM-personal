"use client";

import { useState } from "react";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  NO_TOUCH_FREQUENCY,
  NO_TOUCH_FREQUENCY_LABEL,
  TOUCH_FREQUENCIES,
  TOUCH_FREQUENCY_LABELS,
} from "@/lib/touch-frequency";

export function TouchFrequencyField({
  id,
  defaultValue,
  error,
}: {
  id: string;
  defaultValue?: string;
  error?: string;
}) {
  // Controlled, so React's form reset after a failed save does not drop the choice
  const [value, setValue] = useState(defaultValue || NO_TOUCH_FREQUENCY);
  const errorId = `${id}-error`;

  return (
    <div className="grid content-start gap-1.5">
      <Label htmlFor={id}>Как часто общаться</Label>
      <Select name="touchFrequency" value={value} onValueChange={setValue}>
        <SelectTrigger
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_TOUCH_FREQUENCY}>{NO_TOUCH_FREQUENCY_LABEL}</SelectItem>
          {TOUCH_FREQUENCIES.map((frequency) => (
            <SelectItem key={frequency} value={frequency}>
              {TOUCH_FREQUENCY_LABELS[frequency]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
