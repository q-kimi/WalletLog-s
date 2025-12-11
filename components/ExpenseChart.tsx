'use client'

import { Expense, categories } from '@/types'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { useCurrency } from './CurrencyProvider'
import { useLanguage } from './LanguageProvider'

interface ExpenseChartProps {
  expenses: Expense[]
}

const COLORS = [
  'hsl(var(--primary))',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#ef4444',
  '#10b981',
  '#3b82f6',
  '#6b7280',
]

export default function ExpenseChart({ expenses }: ExpenseChartProps) {
  const { formatAmount } = useCurrency()
  const { t } = useLanguage()
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount
    return acc
  }, {} as Record<string, number>)

  const data = Object.entries(categoryTotals).map(([category, value]) => ({
    name: t(`category.${category}`),
    value: parseFloat(value.toFixed(2)),
    icon: categories[category as keyof typeof categories].icon,
  }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        {t('dashboard.noExpenses')}
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => formatAmount(value)}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--card-foreground))',
          }}
          itemStyle={{
            color: 'hsl(var(--card-foreground))',
          }}
          labelStyle={{
            color: 'hsl(var(--card-foreground))',
          }}
        />
        <Legend 
          wrapperStyle={{
            color: 'hsl(var(--card-foreground))',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
