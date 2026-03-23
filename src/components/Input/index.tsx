import { TextInput, TextInputProps } from 'react-native'

type Props = TextInputProps

export function Input({ ...rest }: Props) {
  return (
    <TextInput
      className="mb-4 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-base text-white"
      placeholderTextColor="#a1a1aa"
      {...rest}
    />
  )
}
