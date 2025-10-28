import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/_components/ui/select'
import { Label } from '@/_components/ui/label'
import { cn } from '@/lib/utils'
import { Control, Controller, FieldError } from 'react-hook-form'

interface SelectOption {
  value: string
  label: string
}

interface FormSelectProps {
  label: string
  name: string
  options: SelectOption[]
  placeholder?: string
  control: Control<any>
  error?: FieldError
  required?: boolean
  disabled?: boolean
  className?: string
  description?: string
}

export function FormSelect({
  label,
  name,
  options,
  placeholder = 'Select an option',
  control,
  error,
  required = false,
  disabled = false,
  className,
  description,
}: FormSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn(
                error && 'border-destructive focus:ring-destructive',
                className
              )}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${name}-error` : undefined}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p id={`${name}-error`} className="text-sm text-destructive">
          {error.message}
        </p>
      )}
    </div>
  )
}
