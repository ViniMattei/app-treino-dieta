import '../global.css'
import { ActivityIndicator, View } from 'react-native'
import { Stack } from 'expo-router'

import { AuthProvider, useAuth } from '@/src/contexts/AuthContext'

function Gate({ children }: { children: React.ReactNode }) {
  const { carregando } = useAuth()

  if (carregando) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-950">
        <ActivityIndicator color="#8b5cf6" />
      </View>
    )
  }

  return <>{children}</>
}

export default function Layout() {
  return (
    <AuthProvider>
      <Gate>
        <Stack screenOptions={{ headerShown: false }} />
      </Gate>
    </AuthProvider>
  )
}
