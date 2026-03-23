import { ReactNode } from 'react'
import { View, Text } from 'react-native'

type Props = {
  title: string
  children: ReactNode
}

export function Card({ title, children }: Props) {
  return (
    <View className="mb-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
      <Text className="mb-3 text-lg font-bold text-white">{title}</Text>
      {children}
    </View>
  )
}
