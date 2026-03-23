import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native'

type Props = TouchableOpacityProps & {
  title: string
}

export function Button({ title, ...rest }: Props) {
  return (
    <TouchableOpacity
      className="mt-3 w-full items-center rounded-2xl bg-violet-700 px-4 py-4"
      activeOpacity={0.8}
      {...rest}
    >
      <Text className="text-base font-bold text-white">{title}</Text>
    </TouchableOpacity>
  )
}
