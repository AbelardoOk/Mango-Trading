# 📈 Trading Simulator

Simulador de trading com mercado de ações fictícias. Os usuários compram e vendem ações de empresas fictícias utilizando saldo virtual, acompanham sua carteira e competem em um ranking.

> ⚠️ Não envolve dinheiro real. Empresas, ações, preços e eventos são fictícios.

## ✨ Funcionalidades

- Cadastro e autenticação de usuários (JWT)
- Papéis de acesso: `USER` e `ADMIN`
- CRUD administrativo de empresas e ações
- Compra e venda de ações com saldo virtual
- Carteira de investimentos com cálculo de lucro/prejuízo
- Histórico de transações
- Ranking de usuários por patrimônio total

## 🛠️ Tecnologias

**Back-end:** Java 17+, Spring Boot, Spring Web, Spring Data JPA, Spring Security, Hibernate, Maven

**Front-end:** React, TypeScript, Vite, HTML5, CSS3

**Banco de dados:** PostgreSQL

## 🏗️ Arquitetura

Aplicação desacoplada: front-end e back-end são projetos independentes, comunicando-se via API REST (JSON).

```
Front-end (React) → HTTP/JSON → Back-end (Spring Boot) → PostgreSQL
```

## 📂 Estrutura do repositório

```
trading-simulator/
├── backend/     # API Spring Boot (controller, service, repository, entity...)
├── frontend/    # Aplicação React + TypeScript
└── docker-compose.yml
```

## 🚀 Como rodar o projeto

### Pré-requisitos

- Java 17+
- Node.js 18+
- PostgreSQL
- Maven

### Back-end

```bash
cd backend
mvn spring-boot:run
```

### Front-end

```bash
cd frontend
npm install
npm run dev
```

A API ficará disponível em `http://localhost:8080` e o front-end em `http://localhost:5173` (padrão Vite).

## 🔐 Principais rotas da API

| Rota                | Acesso              |
| ------------------- | ------------------- |
| `/api/auth/**`      | Público             |
| `/api/stocks/**`    | Usuário autenticado |
| `/api/trades/**`    | Usuário autenticado |
| `/api/portfolio/**` | Usuário autenticado |
| `/api/ranking/**`   | Usuário autenticado |
| `/api/admin/**`     | ADMIN               |

## 📄 Documentação

Detalhes completos de arquitetura, modelo de dados, requisitos e planejamento estão no documento **Planejamento_Projeto_Simulador_Trading.docx**.

## 👥 Equipe

Projeto desenvolvido em módulos: Autenticação, Mercado/Administração, Trading, Front-end e Ranking/Mercado.
