'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

const dataGridVariants = cva(
  [
    'relative overflow-hidden',
    'bg-slate-950',
    'border rounded-lg',
    'font-mono text-sm',
  ],
  {
    variants: {
      variant: {
        default: 'border-white/[0.08]',
        minimal: 'border-white/[0.08]',
        slate: 'border-slate-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface DataGridColumn<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

export interface DataGridProps<T>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof dataGridVariants> {
  columns: DataGridColumn<T>[];
  data: T[];
  onRowClick?: (row: T, index: number) => void;
  emptyMessage?: string;
  loading?: boolean;
  striped?: boolean;
  hoverable?: boolean;
}

interface VariantColors {
  header: string;
  border: string;
  hover: string;
  stripe: string;
  row: string;
}

function LoadingRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </div>
      </td>
    </tr>
  );
}

function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center text-slate-400">
        {message}
      </td>
    </tr>
  );
}

interface DataRowsProps<T> {
  data: T[];
  columns: DataGridColumn<T>[];
  colors: VariantColors;
  striped?: boolean;
  hoverable?: boolean;
  onRowClick?: (row: T, index: number) => void;
  getValue: (row: T, key: keyof T | string) => unknown;
}

function DataRows<T>({
  data,
  columns,
  colors,
  striped,
  hoverable,
  onRowClick,
  getValue,
}: DataRowsProps<T>) {
  return (
    <>
      {data.map((row, rowIdx) => (
        <tr
          key={rowIdx}
          className={cn(
            'border-b last:border-b-0 transition-colors',
            colors.border,
            colors.row,
            striped && rowIdx % 2 === 1 && colors.stripe,
            hoverable && colors.hover,
            onRowClick && 'cursor-pointer'
          )}
          onClick={() => onRowClick?.(row, rowIdx)}
        >
          {columns.map((column) => (
            <td
              key={String(column.key)}
              className={cn(
                'px-4 py-3 text-slate-200',
                column.align === 'center' && 'text-center',
                column.align === 'right' && 'text-right'
              )}
            >
              {column.render
                ? column.render(getValue(row, column.key), row, rowIdx)
                : String(getValue(row, column.key) ?? '-')}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function DataGridInner<T extends Record<string, unknown>>(
  {
    className,
    variant,
    columns,
    data,
    onRowClick,
    emptyMessage = 'No data available',
    loading = false,
    striped = true,
    hoverable = true,
    ...props
  }: DataGridProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const variantColors: Record<string, VariantColors> = {
    default: {
      header: 'bg-slate-900 text-slate-400',
      border: 'border-white/[0.08]',
      hover: 'hover:bg-slate-800',
      stripe: 'bg-slate-900/50',
      row: 'bg-slate-900/50',
    },
    minimal: {
      header: 'bg-slate-900 text-slate-400',
      border: 'border-white/[0.08]',
      hover: 'hover:bg-slate-800',
      stripe: 'bg-slate-900/50',
      row: 'bg-slate-900/50',
    },
    slate: {
      header: 'bg-slate-900 text-slate-400',
      border: 'border-slate-700',
      hover: 'hover:bg-slate-800',
      stripe: 'bg-slate-900/50',
      row: 'bg-slate-900/50',
    },
  };

  const colors = variantColors[variant || 'default'];

  const getValue = (row: T, key: keyof T | string): unknown => {
    if (typeof key === 'string' && key.includes('.')) {
      const keys = key.split('.');
      let value: unknown = row;
      for (const k of keys) {
        value = (value as Record<string, unknown>)?.[k];
      }
      return value;
    }
    return row[key as keyof T];
  };

  const renderBody = () => {
    if (loading) {
      return <LoadingRow colSpan={columns.length} />;
    }
    if (data.length === 0) {
      return <EmptyRow colSpan={columns.length} message={emptyMessage} />;
    }
    return (
      <DataRows
        data={data}
        columns={columns}
        colors={colors}
        striped={striped}
        hoverable={hoverable}
        onRowClick={onRowClick}
        getValue={getValue}
      />
    );
  };

  return (
    <div
      ref={ref}
      className={cn(dataGridVariants({ variant }), className)}
      {...props}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={cn('border-b', colors.border, colors.header)}>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'px-4 py-3 text-xs font-medium uppercase tracking-wider',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    !column.align && 'text-left'
                  )}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{renderBody()}</tbody>
        </table>
      </div>
    </div>
  );
}

const DataGrid = React.forwardRef(DataGridInner) as <
  T extends Record<string, unknown>,
>(
  props: DataGridProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement;

export interface DataCellProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  value: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const DataCell = React.forwardRef<HTMLDivElement, DataCellProps>(
  ({ className, label, value, variant = 'default', ...props }, ref) => {
    const variantStyles = {
      default: 'text-slate-200',
      success: 'text-teal-400',
      warning: 'text-yellow-400',
      danger: 'text-red-400',
      info: 'text-teal-400',
    };

    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-0.5', className)}
        {...props}
      >
        {label && (
          <span className="text-[10px] uppercase tracking-wider text-slate-400">
            {label}
          </span>
        )}
        <span className={cn('font-mono', variantStyles[variant])}>{value}</span>
      </div>
    );
  }
);
DataCell.displayName = 'DataCell';

export { DataCell, DataGrid, dataGridVariants };
