import { Transform } from 'class-transformer';

export const Trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export function normalizePhone(value: string): string {
  return value.trim().replace(/^\+84/, '0');
}

export const Phone = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? normalizePhone(value) : value,
  );
