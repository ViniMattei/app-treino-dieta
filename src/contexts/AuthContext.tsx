import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useContext, useEffect, useState } from 'react'

import * as authService from '@/src/services/authService'
import { DadosCadastro, Objetivo, Usuario } from '@/src/services/authService'

const TOKEN_KEY = '@app-treino-dieta:token'

type AuthContextValue = {
  usuario: Usuario | null
  token: string | null
  carregando: boolean
  entrar: (email: string, senha: string) => Promise<void>
  cadastrar: (dados: DadosCadastro) => Promise<void>
  definirObjetivo: (objetivo: Objetivo) => Promise<void>
  atualizarUsuario: () => Promise<void>
  sair: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    restaurarSessao()
  }, [])

  async function restaurarSessao() {
    const tokenSalvo = await AsyncStorage.getItem(TOKEN_KEY)

    if (tokenSalvo) {
      try {
        const { usuario } = await authService.buscarUsuarioLogado(tokenSalvo)
        setToken(tokenSalvo)
        setUsuario(usuario)
      } catch {
        await AsyncStorage.removeItem(TOKEN_KEY)
      }
    }

    setCarregando(false)
  }

  async function persistirSessao(novoToken: string, novoUsuario: Usuario) {
    await AsyncStorage.setItem(TOKEN_KEY, novoToken)
    setToken(novoToken)
    setUsuario(novoUsuario)
  }

  async function entrar(email: string, senha: string) {
    const { usuario, token } = await authService.login(email, senha)
    await persistirSessao(token, usuario)
  }

  async function cadastrar(dados: DadosCadastro) {
    const { usuario, token } = await authService.cadastrar(dados)
    await persistirSessao(token, usuario)
  }

  async function definirObjetivo(objetivo: Objetivo) {
    if (!token) return
    const { usuario } = await authService.definirObjetivo(objetivo, token)
    setUsuario(usuario)
  }

  async function atualizarUsuario() {
    if (!token) return
    const { usuario } = await authService.buscarUsuarioLogado(token)
    setUsuario(usuario)
  }

  async function sair() {
    await AsyncStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        carregando,
        entrar,
        cadastrar,
        definirObjetivo,
        atualizarUsuario,
        sair,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
