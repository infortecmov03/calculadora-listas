# 1. Navegar para a pasta do projeto


# 2. Inicializar repositório Git
git init

# 3. Configurar usuário (substitua com seus dados)
git config user.name "Seu Nome"
git config user.email "seu.email@exemplo.com"

# 4. Verificar status dos arquivos
git status

# 5. Adicionar TODOS os arquivos
git add .

# 6. Fazer primeiro commit
git commit -m "feat: initial commit - Calculadora de Listas PWA completa

- ✅ Interface PWA responsiva
- ✅ Gestão múltiplas listas com edição inline
- ✅ Exportação PDF/Excel profissional
- ✅ Sistema de orçamento e dashboard
- ✅ Gráficos interativos com Chart.js
- ✅ Ordenação inteligente (maior valor no topo)
- ✅ Busca e filtros por categoria
- ✅ Templates pré-definidos
- ✅ Sistema de backup/restauração
- ✅ 100% offline com Service Worker
- ✅ Build APK automatizado com GitHub Actions
- ✅ Design mobile-first responsivo"

# 7. Criar repositório no GitHub (faça isso no site do GitHub)
# Vá para: https://github.com/new
# Nome: calculadora-listas
# Descrição: Calculadora de Listas PWA - Aplicativo offline para Android
# Público/Privado: escolha conforme preferência
# NÃO marque "Initialize with README" (já temos nosso README)

# 8. Adicionar repositório remoto (SUBSTITUA pelo seu usuário)
git remote add origin https://github.com/infortecmov03/calculadora-listas.git

# 9. Renomear branch principal para main
git branch -M main

# 10. Fazer primeiro push
git push -u origin main