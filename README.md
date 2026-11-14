<div align="center">

# 📦 Gestão de Compras e Estoque (PEPS)

**Controle inteligente de suprimentos, lotes e consumo baseado na metodologia PEPS (Primeiro que Entra, Primeiro que Sai).**

![React](https://shields.io)
![TypeScript](https://shields.io)
![Tailwind CSS](https://shields.io)
![Firebase](https://shields.io)
![Google AI Studio](https://shields.io)

[Sobre o Projeto](#-sobre-o-projeto) •
[Contexto e Desenvolvimento](#-contexto-e-desenvolvimento) •
[Funcionalidades](#-funcionalidades) •
[Como funciona o PEPS](#-como-funciona-o-peps) •
[Tecnologias](#-tecnologias) •
[Como Rodar](#-como-rodar-o-projeto)

</div>

---

## 📖 Sobre o Projeto

Esta aplicação web foi criada para simplificar e automatizar o gerenciamento de compras e o controle de estoque. O grande diferencial do sistema é a rastreabilidade por **lotes** e o cálculo exato de consumo e custo utilizando o método **PEPS (FIFO - First In, First Out)**, evitando desperdícios, perdas por validade e distorções financeiras.

---

## 💡 Contexto e Desenvolvimento

Este projeto nasceu logo após uma capacitação prática sobre as funcionalidades do **Google AI Studio**, servindo como laboratório para explorar o desenvolvimento de software acelerado por Inteligência Artificial (IA Generativa).

* **Papel de Produto & Arquitetura (Humano):** Fui responsável pela concepção da ideia central, definição das regras de negócio (lógica PEPS), desenho do fluxo do usuário (UX), especificação das funcionalidades, testes de validação e depuração/correção de bugs.
* **Implementação de Código (IA):** A maior parte da codificação da interface e da integração lógica foi gerada de forma iterativa por meio de engenharia de prompt no **Google AI Studio**.

---

## ✨ Funcionalidades

- 🛒 **Gestão de Compras:** Registro de entradas de produtos com geração automática de lotes, data de aquisição, validade e custo unitário.
- 📦 **Controle de Estoque por Lotes:** Visualização detalhada de cada lote ativo, histórico de movimentações e saldo remanescente.
- 🔄 **Baixa Automatizada via PEPS:** Ao registrar um consumo ou saída, o sistema deduz automaticamente as quantidades dos lotes mais antigos primeiro.
- 📊 **Dashboard & Indicadores:** Visão geral do valor total em estoque, itens com estoque baixo e alertas de lotes próximos ao vencimento.
- 🔐 **Autenticação e Banco em Tempo Real:** Segurança e sincronização instantânea dos dados na nuvem via Firebase.

---

## ⚙️ Como funciona o PEPS na prática?

A metodologia **PEPS (Primeiro que Entra, Primeiro que Sai)** garante que os itens adquiridos há mais tempo sejam consumidos antes dos mais recentes:

```text
Entrada 1 (Lote A - 01/10): 10 un. a R\$ 5,00
Entrada 2 (Lote B - 15/10): 10 un. a R\$ 6,00
---------------------------------------------
Saída / Consumo de 12 unidades:
 ├── Consome 10 un. do Lote A (Zera o Lote A)
 └── Consome 02 un. do Lote B (Restam 8 un. a R\$ 6,00)
```

Isso assegura maior precisão no custo da mercadoria consumida e reduz perdas operacionais.

---

## 🚀 Tecnologias

Este projeto foi construído com a seguinte stack:

- **[React](https://reactjs.org)** — Biblioteca para construção da interface de usuário
- **[TypeScript](https://typescriptlang.org)** — Tipagem estática para maior previsibilidade e segurança
- **[Tailwind CSS](https://tailwindcss.com)** — Estilização utilitária para construção rápida de interfaces responsivas
- **[Firebase](https://google.com)** — Authentication e Cloud Firestore (banco de dados NoSQL em tempo real)
- **[Google AI Studio](https://google.com)** — Ambiente de prototipação e geração de código assistida por IA

---

## 💻 Como Rodar o Projeto

### Pré-requisitos
Antes de começar, você vai precisar ter instalado em sua máquina:
- [Node.js](https://nodejs.org) (v18 ou superior)
- Gerenciador de pacotes (`npm` ou `yarn`)
- Uma conta e projeto configurado no [Firebase Console](https://google.com)

### Passo a passo

1. **Clone este repositório**
   ```bash
   git clone https://github.com
   cd seu-repositorio
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configure as variáveis de ambiente**
   Crie um arquivo `.env` na raiz do projeto e adicione as credenciais do seu app Firebase:
   ```env
   VITE_FIREBASE_API_KEY=sua_api_key
   VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
   VITE_FIREBASE_PROJECT_ID=seu_project_id
   VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
   VITE_FIREBASE_APP_ID=seu_app_id
   ```



## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">
  Idealizado e refinado por <a href="https://github.com">Amanda Sales</a> • Desenvolvido com apoio do Google AI Studio
</div>
