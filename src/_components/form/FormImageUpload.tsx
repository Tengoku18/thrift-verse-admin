'use client'

import { Controller, Control, FieldValues, Path } from 'react-hook-form'
import { ImageUpload, ImageUploadProps } from '@/_components/common/ImageUpload'

type FormImageUploadProps<T extends FieldValues> = {
  name: Path<T>
  control: Control<T>
} & Omit<ImageUploadProps, 'value' | 'onChange' | 'error'>

export function FormImageUpload<T extends FieldValues>({
  name,
  control,
  ...imageUploadProps
}: FormImageUploadProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <ImageUpload
          {...imageUploadProps}
          value={field.value}
          onChange={field.onChange}
          error={fieldState.error?.message}
        />
      )}
    />
  )
}
