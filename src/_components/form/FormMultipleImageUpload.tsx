'use client'

import { Controller, Control, FieldValues, Path } from 'react-hook-form'
import { MultipleImageUpload, MultipleImageUploadProps } from '@/_components/common/MultipleImageUpload'

type FormMultipleImageUploadProps<T extends FieldValues> = {
  name: Path<T>
  control: Control<T>
} & Omit<MultipleImageUploadProps, 'value' | 'onChange' | 'error'>

export function FormMultipleImageUpload<T extends FieldValues>({
  name,
  control,
  ...imageUploadProps
}: FormMultipleImageUploadProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <MultipleImageUpload
          {...imageUploadProps}
          value={field.value || []}
          onChange={field.onChange}
          error={fieldState.error?.message}
        />
      )}
    />
  )
}
