import { ColumnOptions, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export function CreateDateWithTimezone(options?: ColumnOptions) {
  return CreateDateColumn({
    ...options,
    type: 'timestamp with time zone',
  });
}

export function UpdateDateWithTimezone(options?: ColumnOptions) {
  return UpdateDateColumn({
    ...options,
    type: 'timestamp with time zone',
  });
}
