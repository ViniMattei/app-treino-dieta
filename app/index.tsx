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
import { useAuth } from '@/src/contexts/AuthContext'
import { ApiError } from '@/src/services/api'

export default function Login() {
  const { entrar } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha email e senha')
      return
    }

    setEnviando(true)
    try {
      await entrar(email, password)
      router.replace('/home')
    } catch (error) {
      const mensagem =
        error instanceof ApiError ? error.message : 'Não foi possível entrar'
      Alert.alert('Erro', mensagem)
    } finally {
      setEnviando(false)
    }
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
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            placeholder="Digite sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title={enviando ? 'Entrando...' : 'Entrar'}
            onPress={handleLogin}
            disabled={enviando}
          />

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
