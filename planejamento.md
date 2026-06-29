# Planejamento – App Treino e Dieta

## Regras de Negócio

As regras de negócio definem as políticas, restrições e comportamentos que o sistema deve respeitar para garantir o correto funcionamento da aplicação. Abaixo estão listadas as principais regras identificadas para o aplicativo.

### RN01 – Cadastro de Usuário
Todo usuário deve realizar cadastro informando nome completo, e-mail, senha, data de nascimento, sexo, peso atual e altura. O e-mail deve ser único no sistema e a senha deve conter no mínimo 8 caracteres.

### RN02 – Perfil e Objetivo do Usuário
Após o cadastro, o usuário deve definir seu objetivo principal: perda de peso, ganho de massa muscular ou manutenção do peso. Com base nesse objetivo, o sistema poderá sugerir planos de treino e dieta compatíveis.

### RN03 – Criação de Plano de Treino
Cada plano de treino deve estar vinculado a um único usuário. O usuário pode criar múltiplos planos, mas apenas um pode estar ativo por vez. Um plano deve conter pelo menos um exercício para ser salvo.

### RN04 – Registro de Exercícios
Cada exercício cadastrado deve conter nome, grupo muscular, número de séries e repetições (ou tempo de duração). O sistema deve disponibilizar uma biblioteca de exercícios pré-cadastrados que o usuário pode adicionar ao seu plano.

### RN05 – Planejamento de Dieta
O usuário pode criar planos alimentares diários, especificando refeições (café da manhã, almoço, jantar e lanches) e os alimentos de cada refeição com suas respectivas quantidades em gramas ou mililitros.

### RN06 – Cálculo Calórico
O sistema deve calcular automaticamente o total de calorias consumidas com base nos alimentos registrados na dieta, utilizando uma base de dados nutricional. A meta calórica diária é calculada com base no peso, altura, idade, sexo e objetivo do usuário.

### RN07 – Registro de Progresso
O usuário pode registrar seu peso periodicamente. O sistema deve armazenar o histórico de pesagens e exibir gráfico de evolução. Não é permitido registrar mais de um peso por dia.

### RN08 – Notificações
O sistema pode enviar notificações de lembrete para treinos e refeições, desde que o usuário habilite essa funcionalidade nas configurações do aplicativo.

### RN09 – Segurança e Autenticação
O acesso ao sistema requer autenticação via e-mail e senha. A sessão do usuário deve expirar após 30 dias de inatividade, exigindo novo login. Os dados sensíveis devem ser armazenados de forma criptografada.

### RN10 – Exclusão de Conta
O usuário pode solicitar a exclusão de sua conta. Todos os dados pessoais associados serão permanentemente removidos do sistema após confirmação, em conformidade com a LGPD.

## Requisitos Funcionais

Os requisitos funcionais descrevem as funcionalidades que o sistema deve oferecer ao usuário.

| ID | Descrição | Tipo | Prioridade |
|---|---|---|---|
| RF01 | O sistema deve permitir que o usuário realize cadastro informando dados pessoais e de saúde. | Funcional | Alta |
| RF02 | O sistema deve permitir login com e-mail e senha. | Funcional | Alta |
| RF03 | O sistema deve permitir que o usuário defina seu objetivo (perda de peso, ganho muscular, manutenção). | Funcional | Alta |
| RF04 | O sistema deve permitir a criação e edição de planos de treino personalizados. | Funcional | Alta |
| RF05 | O sistema deve disponibilizar uma biblioteca de exercícios pré-cadastrados com descrição e grupo muscular. | Funcional | Alta |
| RF06 | O sistema deve permitir o registro e acompanhamento de planos alimentares diários. | Funcional | Alta |
| RF07 | O sistema deve calcular automaticamente as calorias totais da dieta registrada. | Funcional | Alta |
| RF08 | O sistema deve permitir o registro periódico de peso e exibir gráfico de evolução. | Funcional | Média |
| RF09 | O sistema deve permitir marcar treinos como concluídos e registrar o histórico de treinos. | Funcional | Média |
| RF10 | O sistema deve enviar notificações de lembrete para treinos e refeições. | Funcional | Baixa |
| RF11 | O sistema deve permitir que o usuário visualize um dashboard com resumo diário (calorias, treino do dia). | Funcional | Média |
| RF12 | O sistema deve permitir a exclusão de conta e remoção dos dados do usuário. | Funcional | Média |

## Requisitos Não Funcionais

Os requisitos não funcionais descrevem características de qualidade e restrições técnicas do sistema.

| ID | Descrição | Tipo | Prioridade |
|---|---|---|---|
| RNF01 | O aplicativo deve ser compatível com dispositivos Android (versão 8.0 ou superior). | Compatibilidade | Alta |
| RNF02 | As telas do aplicativo devem carregar em no máximo 3 segundos em conexão 4G. | Desempenho | Alta |
| RNF03 | As senhas dos usuários devem ser armazenadas utilizando criptografia (hash). | Segurança | Alta |
| RNF04 | A interface deve ser intuitiva e acessível, seguindo diretrizes de usabilidade mobile. | Usabilidade | Alta |
| RNF05 | O sistema deve estar em conformidade com a Lei Geral de Proteção de Dados (LGPD). | Legal | Alta |
| RNF06 | O banco de dados deve suportar armazenamento local offline para consulta sem internet. | Disponibilidade | Média |

## Arquitetura do Software

### Linguagem de Programação

O projeto será desenvolvido utilizando React Native, framework JavaScript de código aberto mantido pela Meta. A escolha se justifica pela possibilidade de desenvolvimento multiplataforma (Android e iOS) a partir de uma única base de código, reduzindo tempo e custo de desenvolvimento.

O React Native utiliza componentes nativos reais, garantindo desempenho próximo ao de aplicações nativas. Além disso, possui ampla comunidade, vasta documentação e grande ecossistema de bibliotecas, o que facilita o desenvolvimento de funcionalidades como navegação, gráficos e notificações push.

A linguagem JavaScript/TypeScript, utilizada em conjunto com React Native, é amplamente conhecida e permite reaproveitamento de conhecimentos prévios do desenvolvedor, agilizando a curva de aprendizado do projeto.

### Backend e Banco de Dados

O projeto adota uma arquitetura cliente-servidor: o app React Native consome uma API REST própria, desenvolvida em Node.js + Express + TypeScript, mantida na pasta `/server` do mesmo repositório. Essa separação mantém as regras de negócio, validações e acesso ao banco isolados do código de interface, facilitando manutenção e testes.

O banco de dados é o SQLite, agora rodando no servidor (via `better-sqlite3`) em vez de embutido no dispositivo do usuário. A escolha do SQLite se mantém pela simplicidade de não exigir um servidor de banco externo, adequado ao porte do projeto; a migração para PostgreSQL é possível futuramente sem alterar a camada de API.

A autenticação é feita via token JWT: o servidor emite um token no login/cadastro, que o app armazena e envia nas requisições seguintes para identificar o usuário (RN09).

### Sistema Operacional

O aplicativo será desenvolvido prioritariamente para o sistema operacional Android, compatível com a versão 8.0 (Oreo) ou superior, que representa a maior parcela de usuários de smartphones no Brasil.

O ambiente de desenvolvimento será configurado no sistema operacional Windows 10/11 ou Ubuntu Linux, utilizando o Expo CLI como ferramenta de build e execução, dispensando a necessidade de configuração completa do Android Studio para prototipação.

O emulador Android do Android Studio será utilizado para testes durante o desenvolvimento, além de dispositivos físicos Android para validação do protótipo.

### Visão Geral da Arquitetura

A arquitetura é dividida em dois projetos dentro do mesmo repositório:

- **`/app` e `/src` (frontend)**: aplicativo React Native/Expo, responsável apenas pela interface (telas, componentes) e pelo consumo da API via uma camada de serviços (`src/services`). Estados de sessão e do usuário logado ficam num `AuthContext`.
- **`/server` (backend)**: API REST em Node.js + Express + TypeScript, organizada em rotas, repositórios (acesso ao SQLite) e utilitários (hash de senha, emissão de JWT). Concentra toda a regra de negócio e validação dos dados.

A navegação entre telas no app será gerenciada pela biblioteca React Navigation (via Expo Router), utilizando navegação em pilha (Stack Navigator) e abas inferiores (Bottom Tab Navigator) para uma experiência de uso fluida e intuitiva.

## Modelo de Dados

Abaixo estão as principais entidades do sistema, derivadas das regras de negócio (RN01–RN10), com seus atributos e relacionamentos.

### Entidades

**Usuario**
| Campo | Tipo | Observação |
|---|---|---|
| id | PK | |
| nome_completo | texto | |
| email | texto | único |
| senha_hash | texto | armazenada criptografada (RN09) |
| data_nascimento | data | |
| sexo | texto | |
| peso_atual | número | |
| altura | número | |
| objetivo | enum | perda_peso \| ganho_massa \| manutencao (RN02) |
| created_at | data | |

**PlanoTreino**
| Campo | Tipo | Observação |
|---|---|---|
| id | PK | |
| usuario_id | FK → Usuario | |
| nome | texto | |
| ativo | booleano | apenas um ativo por usuário (RN03) |
| created_at | data | |

**Exercicio**
| Campo | Tipo | Observação |
|---|---|---|
| id | PK | |
| nome | texto | |
| grupo_muscular | texto | |
| descricao | texto | biblioteca pré-cadastrada (RN04) |

**PlanoTreinoExercicio** (associativa N:N entre PlanoTreino e Exercicio)
| Campo | Tipo | Observação |
|---|---|---|
| id | PK | |
| plano_treino_id | FK → PlanoTreino | |
| exercicio_id | FK → Exercicio | |
| series | número | |
| repeticoes | número | ou duração, se aplicável |
| duracao | número | opcional, em segundos |

**PlanoAlimentar**
| Campo | Tipo | Observação |
|---|---|---|
| id | PK | |
| usuario_id | FK → Usuario | |
| data | data | |

**Refeicao**
| Campo | Tipo | Observação |
|---|---|---|
| id | PK | |
| plano_alimentar_id | FK → PlanoAlimentar | |
| tipo | enum | café_da_manhã \| almoço \| jantar \| lanche (RN05) |

**Alimento**
| Campo | Tipo | Observação |
|---|---|---|
| id | PK | |
| nome | texto | |
| calorias_por_100g | número | base nutricional (RN06) |
| proteinas | número | |
| carboidratos | número | |
| gorduras | número | |

**RefeicaoAlimento** (associativa N:N entre Refeicao e Alimento)
| Campo | Tipo | Observação |
|---|---|---|
| id | PK | |
| refeicao_id | FK → Refeicao | |
| alimento_id | FK → Alimento | |
| quantidade | número | em gramas ou mililitros |

**RegistroPeso**
| Campo | Tipo | Observação |
|---|---|---|
| id | PK | |
| usuario_id | FK → Usuario | |
| peso | número | |
| data | data | único por usuário/dia (RN07) |

**ConfiguracaoNotificacao**
| Campo | Tipo | Observação |
|---|---|---|
| id | PK | |
| usuario_id | FK → Usuario | relação 1:1 |
| notificar_treino | booleano | (RN08) |
| notificar_refeicao | booleano | (RN08) |

### Relacionamentos

- Usuario 1—N PlanoTreino
- Usuario 1—N PlanoAlimentar
- Usuario 1—N RegistroPeso
- Usuario 1—1 ConfiguracaoNotificacao
- PlanoTreino N—N Exercicio (via PlanoTreinoExercicio)
- PlanoAlimentar 1—N Refeicao
- Refeicao N—N Alimento (via RefeicaoAlimento)

## Estrutura de Telas

A navegação é dividida em dois grandes fluxos: **Autenticação** (pilha) e **Aplicativo principal** (abas inferiores), conforme descrito na Arquitetura do Software.

### Fluxo de Autenticação (Stack Navigator)

- **Login** (RF02)
- **Cadastro** (RF01)
- **Definição de Objetivo** — exibida após o primeiro cadastro (RF03, RN02)

### Aplicativo Principal (Bottom Tab Navigator)

- **Home / Dashboard** (RF11) — resumo diário: calorias consumidas vs. meta, treino do dia
  - acesso rápido a Treinos e Dieta
- **Treinos**
  - Lista de Planos de Treino (RF04)
  - Detalhe do Plano de Treino — exercícios, séries, repetições
  - Biblioteca de Exercícios (RF05)
  - Histórico de Treinos Concluídos (RF09)
- **Dieta**
  - Plano Alimentar do Dia (RF06) — refeições e alimentos
  - Adicionar Alimento à Refeição
  - Resumo Calórico do Dia (RF07)
- **Progresso**
  - Registro de Peso (RF08)
  - Gráfico de Evolução de Peso (RF08)
- **Configurações**
  - Preferências de Notificação (RF10)
  - Editar Perfil
  - Exclusão de Conta (RF12)
