# 🎓 UIDENTIDADE

Loja virtual de camisas universitárias personalizadas. As peças são fabricadas
sob encomenda: o cliente faz o pedido no site e paga via Pix pelo WhatsApp da
loja.

## 🚧 Status do projeto

- [x] Em construção

---

## ✨ Funcionalidades

**Cliente**
- Catálogo com busca, filtro por categoria e ordenação
- Página própria de cada produto (`/produto/:id`), com link para compartilhar
- Carrinho salvo no navegador (visitante) ou na conta (logado), com preços
  conferidos no Firestore ao abrir
- Cadastro, login e recuperação de senha
- Checkout com endereço (preenchimento automático pelo CEP via ViaCEP)
- Envio do pedido para o WhatsApp da loja para pagamento via Pix
- Histórico de pedidos com status, e cancelamento enquanto estiver pendente

**Admin** (`/admin`)
- Pedidos: filtro por status, busca, mudança de status e alerta quando o
  valor do pedido não confere com o catálogo
- Produtos: cadastrar, editar e excluir

### Status de um pedido

`pendente` (aguardando pagamento) → `pago` → `enviado` → `entregue`
(ou `cancelado`). O cliente só pode cancelar enquanto estiver `pendente`; os
demais status são alterados pelo admin.

---

## 🛠️ Stack

**Frontend**
- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand) (estado do carrinho)
- [Sonner](https://sonner.emilkowal.ski/) (notificações)
- [Lucide](https://lucide.dev/) (ícones)

**Backend**
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

---

## ▶️ Como rodar o projeto

Requisitos: **Node.js 22 ou superior**.

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie o arquivo `.env` a partir do modelo e preencha com os dados do app web
   (Firebase Console → Configurações do projeto → Seus apps):
   ```bash
   cp .env.example .env
   ```
3. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

> Sempre que alguém do grupo adicionar ou remover uma biblioteca, rode
> `npm install` de novo depois do `git pull`. Pare o `npm run dev` antes,
> principalmente no Windows.

### Scripts

| Comando                | O que faz                                         |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Servidor de desenvolvimento                       |
| `npm run build`        | Gera a versão de produção em `dist/`              |
| `npm run preview`      | Serve o `dist/` localmente                        |
| `npm run lint`         | Verifica o código com oxlint                      |
| `npm run deploy:rules` | Publica o `firestore.rules` no Firebase           |
| `node seed.js`         | Cadastra produtos de exemplo (veja abaixo)        |

---

## ⚙️ Configuração

### WhatsApp da loja

O número que recebe os pedidos fica em `src/config/loja.js`
(`WHATSAPP_NUMERO`, só dígitos com 55 e DDD, ex.: `5511999999999`). Sem ele,
o botão de pagar pelo WhatsApp não aparece.

### Criar um admin

Pelo script (precisa do `serviceAccountKey.json`, veja "Produtos de exemplo"):

```bash
node criar-admin.js email@exemplo.com            # torna admin
node criar-admin.js --remover email@exemplo.com  # remove
node criar-admin.js --listar                     # lista e confere os admins
```

Ou manualmente:

1. No Firebase Console → Authentication, copie o **UID** da conta.
2. No Firestore, crie a coleção `admins` com um documento cujo ID seja esse
   UID (o conteúdo pode ser só `nome: "..."`).
3. Saia e entre de novo no site: o link **Admin** aparece no menu.

Os documentos de `admins` não podem ser criados pelo site, só pelo console
ou pelo Admin SDK.

### Regras de segurança do Firestore

As regras ficam em `firestore.rules` e são a proteção real dos dados (quem lê
e grava o quê). Depois de alterar o arquivo:

```bash
npx firebase login      # uma vez por máquina
npm run deploy:rules
```

### Produtos de exemplo (seed)

```bash
node seed.js
```

Precisa do `serviceAccountKey.json` na raiz (Firebase Console → Configurações
do projeto → Contas de serviço → Gerar nova chave privada). **Nunca faça
commit desse arquivo** (ele já está no `.gitignore`). O script grava no
projeto real; os produtos usam IDs `exemplo-...`, então rodar de novo não
cria duplicados.

---

## 🚀 Deploy

O deploy no Firebase Hosting é automático pelo GitHub Actions:

- **Pull request** → gera um link de prévia
- **Merge na `main`** → publica o site

O build usa as variáveis do Firebase guardadas em **GitHub → Settings →
Secrets and variables → Actions** (`VITE_FIREBASE_API_KEY`,
`VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
`VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`,
`VITE_FIREBASE_APP_ID`), com os mesmos valores do `.env`.

As regras do Firestore **não** são publicadas pelo GitHub Actions; use
`npm run deploy:rules`.

---

## 📁 Estrutura

```
src/
├── components/
│   ├── layout/        # Header
│   └── routes/        # ProtectedRoute, AdminRoute, GuestRoute
├── config/            # Dados da loja (WhatsApp)
├── context/           # AuthContext (usuário logado e se é admin)
├── hooks/             # Sincronização e atualização do carrinho
├── lib/               # Inicialização do Firebase
├── pages/
│   ├── admin/         # Painel admin (pedidos e produtos)
│   ├── auth/          # Login, cadastro, recuperar senha
│   ├── catalog/       # Catálogo, card e página do produto
│   ├── errors/        # Página 404
│   ├── orders/        # Carrinho, checkout, histórico de pedidos
│   └── profile/       # Minha conta
├── routes/            # Rotas do app
├── services/          # Acesso ao Firestore (produtos, pedidos, usuário, WhatsApp)
└── store/             # Estado do carrinho (Zustand)
```
