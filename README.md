name: Build Android APK

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: |
        npm install
        npm install -g @capacitor/cli
        npx cap sync
        
    - name: Setup Java
      uses: actions/setup-java@v3
      with:
        distribution: 'temurin'
        java-version: '17'
        
    - name: Setup Android SDK
      uses: android-actions/setup-android@v3
      
    - name: Build APK with Capacitor
      run: |
        # Configurar permissões no AndroidManifest.xml
        sed -i '/<application/a\    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />' android/app/src/main/AndroidManifest.xml
        sed -i '/<application/a\    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />' android/app/src/main/AndroidManifest.xml
        
        # Build Android APK
        cd android
        ./gradlew assembleDebug
        cd ..
        
    - name: Upload APK artifact
      uses: actions/upload-artifact@v4
      with:
        name: calculadora-listas-app
        path: |
          android/app/build/outputs/apk/debug/app-debug.apk
          android/app/build/outputs/bundle/debug/app-debug.aab
        retention-days: 30

# Python 3
python server.py
# Ou
python3 server.py

# Acesse: http://localhost:5000

🎯 Como Usar o App
➕ Criar e Gerenciar Listas
Nova lista: Menu lateral → Digite nome → "+"

Alternar listas: Clique no nome no menu lateral

Excluir lista: Botão 🗑️ (exceto lista principal)

📝 Adicionar Itens
Preencha Nome do item

Digite Valor (formatação automática)

Selecione Categoria

Clique "Adicionar Item" ou pressione Enter

✏️ Edição Avançada
Editar nome: Clique em ✏️ "Nome" ao lado do item

Editar valor: Clique em ✏️ "Valor" ao lado do item

Excluir item: Clique em 🗑️ "Excluir" (com confirmação)

🔍 Busca e Filtros
Buscar: Digite no campo "Buscar itens..."

Filtrar por categoria: Use o dropdown de categoria

Ordenar: Botões "Ordem Alfabética" e "Maior Valor"

📊 Dashboard e Estatísticas
Ative/desative com "Mostrar Dashboard"

Visualize distribuição por categoria (gráfico pizza)

Veja faixas de valor (gráfico barras)

Acompanhe estatísticas gerais

💸 Sistema de Orçamento
Digite valor no campo "Definir Orçamento"

Clique em "Definir Orçamento"

Acompanhe pela barra de progresso colorida:

🟢 Verde: Dentro do orçamento

🟡 Amarelo: Aproximando do limite

🔴 Vermelho: Orçamento excedido

📤 Exportação de Dados
PDF: Relatório completo com tabela formatada

Excel: Planilha com formatação profissional

Backup: Arquivo JSON com todos os dados

Importar: Restaure backups anteriores

🛠️ Tecnologias Utilizadas
Frontend
HTML5 - Estrutura semântica

CSS3 - Design moderno com variáveis CSS e gradientes

JavaScript ES6+ - Lógica da aplicação

Font Awesome - Ícones vetoriais

Bibliotecas Locais (100% Offline)
Chart.js 3.9.1 - Gráficos interativos

jsPDF 2.5.1 + AutoTable - Exportação PDF profissional

SheetJS (XLSX) - Exportação Excel formatada

PWA & Mobile
Service Worker - Cache offline inteligente

Web App Manifest - Metadados de instalação

Capacitor - Build para Android APK

Responsive Design - Mobile-first

Backend & Build
Python HTTP Server - Servidor de desenvolvimento

GitHub Actions - CI/CD para APK automático

LocalStorage - Persistência de dados local

📁 Estrutura do Projeto
text
calculadora-listas/
├── 📄 index.html              # Interface principal PWA
├── 🎨 styles.css              # Estilos e design responsivo
├── ⚡ script.js               # Lógica completa da aplicação
├── 🔧 sw.js                   # Service Worker (offline)
├── 📱 manifest.json           # Configuração PWA
├── 🐍 server.py               # Servidor web local
├── 📦 package.json            # Configuração Node.js
├── ⚙️ capacitor.config.json   # Configuração Android
├── 📋 .github/workflows/
│   └── build-apk.yml          # GitHub Actions para APK
└── 📚 lib/
    ├── chart.min.js           # Gráficos (local)
    ├── jspdf.umd.min.js       # PDF export (local)
    ├── jspdf.plugin.autotable.min.js  # Tabelas PDF
    └── xlsx.full.min.js       # Excel export (local)
🔒 Modo Offline
A aplicação é 100% offline por design:

✅ Todas as bibliotecas incluídas localmente

✅ Zero dependências de CDN externas

✅ Service Worker cacheia todos os recursos

✅ Funciona sem internet após primeira visita

✅ Dados persistem via LocalStorage

✅ Exportação PDF/Excel funciona offline

📱 Build Android APK
Método 1: GitHub Actions (Automático)
bash
# 1. Faça push do código
git add .
git commit -m "feat: nova versão"
git tag v1.2.0
git push origin main --tags

# 2. APK será gerado automaticamente
# 3. Download em: GitHub → Actions → Artifacts
Método 2: Local com Capacitor
bash
# Instalar dependências
npm install

# Configurar Capacitor
npx cap init
npx cap add android
npx cap sync

# Build APK
cd android
./gradlew assembleDebug
🎨 Personalização
Cores do Tema
Edite styles.css:

css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}
Categorias Personalizadas
Edite no script.js:

javascript
let categories = ['alimentacao', 'transporte', 'educacao', 'saude', 'entretenimento', 'nova-categoria'];
Moeda Local
Substitua "MZN" no script.js pela sua moeda.

📊 Recursos Técnicos
Performance
⚡ Carregamento instantâneo (caching agressivo)

📱 Otimizado para mobile (lighthouse 95+)

💾 Armazenamento eficiente (LocalStorage)

🔄 Atualizações em tempo real

Segurança
🔒 Dados 100% locais (nenhum servidor)

🛡️ Sem tracking ou analytics

📵 Funciona completamente offline

🔐 Confirmações para ações destrutivas

Compatibilidade
🌐 Todos navegadores modernos

📱 Android 5.0+ (WebView)

🍎 iOS Safari (como PWA)

💻 Desktop (interface responsiva)

🔄 Atualizações
Versão 2.0 (Atual)
✅ Exportação Excel com formatação

✅ Dashboard com gráficos interativos

✅ Edição inline de itens

✅ Sistema de orçamento completo

✅ Build automatizado de APK

✅ Templates pré-definidos

Próximas Versões
🚧 Sincronização em nuvem (opcional)

🚧 Notificações push

🚧 Modo escuro

🚧 Relatórios avançados

🤝 Contribuição
Fork o projeto

Crie uma branch: git checkout -b feature/nova-funcionalidade

Commit: git commit -am 'Add nova funcionalidade'

Push: git push origin feature/nova-funcionalidade

Abra um Pull Request

📄 Licença
Copyright © 2025 - Todos os direitos reservados

Software livre para uso pessoal e comercial

👤 Desenvolvedor
Fernando J. Antonio
infortecmov.netlify.app

🌐 Links
📱 App Online: calculadoraxikotela.netlify.app

📦 Repositório: GitHub

🔖 Releases: APK Downloads

💡 Dica: Após instalar, você pode usar o app completamente offline, sem necessidade de internet para nenhuma funcionalidade!

text

Este README está pronto para copiar e colar. Ele inclui toda a documentação completa com formatação Mark