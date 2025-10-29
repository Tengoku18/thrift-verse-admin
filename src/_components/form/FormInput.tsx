import { Input } from '@/_components/ui/input'
import { Label } from '@/_components/ui/label'
import { cn } from '@/lib/utils'
import { UseFormRegister } from 'react-hook-form'

interface FormInputProps {
  label: string
  name: string
  type?: string
  step?: string
  placeholder?: string
  register: UseFormRegister<any>
  error?: { message?: string }
  required?: boolean
  disabled?: boolean
  className?: string
  description?: string
}

export function FormInput({
  label,
  name,
  type = 'text',
  step,
  placeholder,
  register,
  error,
  required = false,
  disabled = false,
  className,
  description,
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </Label>
      <Input
        id={name}
        type={type}
        step={step}
        placeholder={placeholder}
        {...register(name)}
        disabled={disabled}
        className={cn(
          error &&
            'border-red-500 focus:ring-red-500',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {description && !error && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
      {error && (
        <p id={`${name}-error`} className="text-sm text-red-600">
          {error.message}
        </p>
      )}
    </div>
  )
}
