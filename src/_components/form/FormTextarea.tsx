import { Textarea } from '@/_components/ui/textarea'
import { Label } from '@/_components/ui/label'
import { cn } from '@/lib/utils'
import { UseFormRegister, FieldError } from 'react-hook-form'

interface FormTextareaProps {
  label: string
  name: string
  placeholder?: string
  register: UseFormRegister<any>
  error?: FieldError
  required?: boolean
  disabled?: boolean
  rows?: number
  className?: string
  description?: string
  maxLength?: number
}

export function FormTextarea({
  label,
  name,
  placeholder,
  register,
  error,
  required = false,
  disabled = false,
  rows = 4,
  className,
  description,
  maxLength,
}: FormTextareaProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Textarea
        id={name}
        placeholder={placeholder}
        {...register(name)}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={cn(
          error &&
            'border-destructive focus-visible:ring-destructive',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : undefined}
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
