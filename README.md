<div align="center">
  <img alt="Logo do Projeto" src="https://img.icons8.com/color/150/000000/swimming-pool.png" height="100" />
  <h1>Sistema de Monitoramento de Piscina</h1>
  <p><i>Monitoramento inteligente de parâmetros de qualidade da água em tempo real</i></p>

  <p>
    <img src="https://img.shields.io/badge/Java-17-orange.svg" alt="Java 17" />
    <img src="https://img.shields.io/badge/Spring_Boot-4.0.2-brightgreen.svg" alt="Spring Boot" />
    <img src="https://img.shields.io/badge/Angular-21.2.0-red.svg" alt="Angular" />
    <img src="https://img.shields.io/badge/InfluxDB-7.2.0-blue.svg" alt="InfluxDB" />
    <img src="https://img.shields.io/badge/Docker-Ready-2496ED.svg" alt="Docker" />
  </p>
</div>

---

## 📖 Sobre o Projeto

Este projeto é um **Sistema de Monitoramento da Qualidade da Água de Piscinas**, desenvolvido como Trabalho de Conclusão de Curso (TCC) em Engenharia da Computação. O sistema coleta dados de sensores, armazena em um banco de dados de séries temporais e os apresenta em um dashboard moderno e interativo.

O sistema é construído com foco em **desempenho, escalabilidade e usabilidade**, utilizando uma arquitetura moderna dividida entre um backend em Spring Boot e um frontend em Angular.

## ✨ Funcionalidades

- 📊 **Dashboard Interativo:** Visualização de dados em tempo real utilizando gráficos (Chart.js).
- 🕒 **Filtros Temporais:** Alternância rápida entre diferentes períodos históricos (1H, 24H, 7 Dias).
- 🌑 **Dark Theme:** Interface moderna, responsiva e agradável, projetada para excelente experiência do usuário.
- 📄 **Geração de Relatórios:** Exportação de dados e gráficos em formato PDF de maneira automatizada (jsPDF).
- 🔒 **Segurança:** Autenticação via JWT (JSON Web Tokens) e rotas protegidas no frontend e backend.

## 🛠️ Tecnologias Utilizadas

### Backend
- **Java 17**
- **Spring Boot 4.0.2** (Web, Actuator, Security)
- **InfluxDB** (Armazenamento de séries temporais)
- **JJWT** (Autenticação baseada em token)
- **Lombok** (Redução de boilerplate code)
- **Maven**

### Frontend
- **Angular 21**
- **Chart.js & ng2-charts** (Visualização de dados)
- **jsPDF** (Geração de relatórios PDF)
- **TypeScript**

## 🚀 Como Executar

### Pré-requisitos
Certifique-se de ter instalado em sua máquina:
- [Java 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
- [Node.js](https://nodejs.org/en/) e [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) e Docker Compose (para o InfluxDB)

### 1. Clonando o Repositório
```bash
git clone https://github.com/MatheuxBr/TCC-EngComputacao.git
cd TCC-EngComputacao
```

### 2. Configurando o Backend e InfluxDB
O backend é uma aplicação Spring Boot. Antes de rodá-lo, o InfluxDB precisa estar disponível.

```bash
# Na raiz do projeto, instale as dependências usando o Maven Wrapper
./mvnw clean install

# Execute a aplicação
./mvnw spring-boot:run
```

### 3. Configurando o Frontend
Abra um novo terminal e navegue até a pasta `frontend`.

```bash
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm start
```
O frontend estará disponível em `http://localhost:4200`.

## 🤝 Contribuindo

Contribuições, problemas e solicitações de recursos são bem-vindos!
Sinta-se à vontade para verificar a [página de issues](../../issues).

## 📝 Licença

Este projeto é licenciado sob a [Licença MIT](LICENSE).

---
<div align="center">
  Desenvolvido com 💙 por <a href="https://github.com/MatheuxBr">Matheux</a>
</div>
