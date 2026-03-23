import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ImageBackground,
} from 'react-native'
import { router } from 'expo-router'

import { Input } from '@/src/components/Input'
import { Button } from '@/src/components/Button'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleLogin() {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha email e senha')
      return
    }

    router.push('/home')
  }

  return (
    <ImageBackground
      source={require('../assets/image/bg-login.jpg')}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 bg-black/70 px-6 justify-center">
        <View className="mb-10 items-center">
          <Text className="text-4xl font-bold text-white">Bem-vindo</Text>
          <Text className="mt-2 text-base text-zinc-300">
            Entre na sua conta e evolua todos os dias.
          </Text>
        </View>

        <View className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5">
          <Input
            placeholder="Digite seu email"
            value={email}
            onChangeText={setEmail}
          />

          <Input
            placeholder="Digite sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button title="Entrar" onPress={handleLogin} />

          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text className="mt-6 text-center text-base font-medium text-violet-400">
              Criar conta
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  )
}
