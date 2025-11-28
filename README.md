# 📱 Pokédex Mobile (React Native)

Aplicativo desenvolvido em **React Native** que consome a **PokéAPI** e exibe uma lista de Pokémons com paginação, filtros, busca inteligente, exibição de detalhes, skeletons e tratamento de conectividade.

---

## 🗂 Estrutura da Aplicação

```
app
├── detalhes
│   └── [id].tsx                # Tela de detalhes do Pokémon
├── index.tsx                   # Tela principal (Home)
├── _layout.tsx                 # Layout padrão (caso esteja usando Expo Router)
└── src
    ├── api
    │   └── api.ts              # Funções de requisição: lista, filtro por tipo, buscas
    ├── components
    │   ├── BarraBusca.tsx
    │   ├── CardPokemon.tsx
    │   ├── FiltroTipos.tsx
    │   ├── Loading.tsx
    │   └── SkeletonCard.tsx
    ├── hooks
    │   ├── useBusca.ts         # Hook de busca inteligente (>= 3 letras)
    │   ├── useConectividade.ts # Detecta status online/offline
    │   └── usePaginacao.ts     # Lógica de paginação
    ├── services
    │   └── apiPokemon.ts       # Serviço central de comunicação + cache
    ├── styles
    │   ├── CardPokemon.styles.ts
    │   ├── Detalhes.styles.ts
    │   └── tiposCores.ts       # Mapa de cores para tipos do Pokémon
    └── utils
        └── http.ts             # Requisição com timeout, abort, retry e cache
```

---

## ⚡ Funcionalidades

### ✔ Listagem de Pokémons  
Com paginação (20 por página) + carregamento incremental.

### ✔ Busca inteligente  
- Ativa apenas com **3 ou mais letras**  
- Cancelamento automático ao digitar  
- AbortController para evitar buscas duplicadas  
- Resultado em tempo real

### ✔ Filtro por tipo  
- Exibe lista filtrada por tipo (fire, water, grass etc.)  
- Reseta quando limpa o filtro  

### ✔ Detalhes do Pokémon  
- Nome  
- ID  
- Tipos  
- Imagem HD (official artwork)

### ✔ Skeletons  
Carregamento suave ao entrar ou mudar de página.

### ✔ Tratamento de conexão  
- Detecta quando o usuário está **offline**  
- Mostra aviso e tenta usar dados em cache

### ✔ Cache inteligente  
- TTL configurável  
- AsyncStorage + memória  
- Cache para lista e detalhes

---

## 🛠 Tecnologias Utilizadas

- **React Native**
- **TypeScript**
- **Expo (se estiver usando)**
- **React Navigation ou Expo Router**
- **PokéAPI**
- **AsyncStorage**
- **AbortController + timeout**
- **FlatList com paginação infinita**

---

## 🚀 Como executar

### 1. Instalar dependências
```bash
npm install
# ou
yarn install
```

### 2. Executar no dispositivo/emulador
```bash
npx expo start
# ou
npm start
# ou
yarn start
```

### 3. Escanear QR Code ou rodar no emulador Android/iOS
Nenhum localhost é necessário — React Native usa Metro Bundler.

---

## 🔧 Observações importantes

- A Home consome diretamente:
  - `listarPokemons()`
  - `listarPorTipo()`
- A busca usa uma lista pré-carregada para filtrar localmente.
- Os detalhes fazem fetch individual do Pokémon.
- O app limita **5 requisições simultâneas** para evitar travamentos.
- Quando troca o tipo, a lista é resetada e recarregada.

---

## 📚 Referências

- https://pokeapi.co/
- https://reactnative.dev/
- https://reactnavigation.org/
- https://reactnative-async-storage.github.io/async-storage/
