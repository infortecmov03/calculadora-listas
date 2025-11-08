#!/bin/bash
echo "🚀 Iniciando build da Calculadora de Listas..."

# Criar pasta lib se não existir
mkdir -p lib

# Instalar dependências (se usar npm)
npm install

# Mensagem de conclusão
echo "✅ Projeto pronto para desenvolvimento!"
echo "📱 Para gerar APK:"
echo "   - Configure GitHub Actions"
echo "   - Ou execute manualmente com Capacitor"