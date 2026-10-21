# Ignite Gym 🏋️

App móvel para os sócios de um ginásio: ver e reservar aulas, conhecer os
treinadores, consultar o equipamento disponível e gerir o perfil. Inclui
front-end móvel e back-end próprio.

## Funcionalidades

- **Conta** — registo, login e escolha de objetivos de treino
- **Aulas** — horário de aulas com as vagas disponíveis, inscrição e cancelamento,
  detalhe de cada aula, lembrete por notificação 1 hora antes e avaliação das
  aulas frequentadas
- **Treinadores** — lista e perfil de cada treinador
- **Equipamento** — catálogo e mapa do equipamento do ginásio
- **Perfil** — editar dados e foto, ver as próximas aulas e o histórico

## Stack

| Parte | Tecnologias |
| --- | --- |
| App móvel | React Native (Expo), TypeScript, React Navigation, Axios |
| Back-end | Node.js, Express, SQLite (better-sqlite3) |
| Autenticação | JWT + palavras-passe com hash (bcrypt) |

## Estrutura

```
ignite-gym-app/
├── App.tsx              # ponto de entrada da app
├── src/
│   ├── screens/         # ecrãs (auth/ e main/)
│   ├── navigation/      # navegação por tabs e stacks
│   ├── context/         # sessão do utilizador e tema
│   ├── services/        # cliente da API e notificações
│   ├── components/      # componentes reutilizáveis
│   └── theme/           # cores, tipografia e espaçamentos
└── backend/
    └── src/
        ├── index.js     # servidor Express
        ├── routes/      # auth, classes, trainers, equipment, profile, reviews
        ├── middleware/  # verificação do token JWT
        └── db/          # esquema e dados iniciais da base de dados
```

## Correr localmente

**1. Back-end** (porta 3000):

```bash
cd backend
npm install
npm start
```

Na primeira execução a base de dados SQLite é criada e preenchida com dados de
exemplo (aulas, treinadores e equipamento).

**2. App** (noutro terminal, na raiz do projeto):

```bash
npm install
npx expo start
```

Abre a app no Expo Go (iOS/Android) ou num emulador. Num telemóvel físico,
altera `API_BASE` em `src/services/api.ts` para o IP do computador na rede local.

## API

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | `/api/auth/register` · `/api/auth/login` | Criar conta / entrar |
| GET | `/api/classes` | Aulas e vagas |
| POST | `/api/classes/enroll` · `/api/classes/cancel` | Reservar / cancelar |
| GET | `/api/classes/my-enrollments` | As minhas reservas |
| GET | `/api/trainers` · `/api/trainers/:id` | Treinadores |
| GET | `/api/equipment` | Equipamento |
| GET · PUT | `/api/profile` | Ver / editar perfil |
| POST | `/api/reviews` | Avaliar uma aula |
