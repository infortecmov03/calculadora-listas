// ==================== SISTEMA DE DOWNLOAD DIRETO ====================

class DownloadHandler {
    constructor() {
        this.versionUrl = 'https://raw.githubusercontent.com/infortecmov03/calculadora-listas/main/version.json';
        this.fallbackUrl = 'https://github.com/infortecmov03/calculadora-listas/releases/latest';
    }

    // Download direto do APK mais recente
    async downloadAPK() {
        try {
            showNotification('🔄 Obtendo versão mais recente...', 'info');

            // Buscar informações da versão
            const versionData = await this.getVersionData();
            
            if (!versionData) {
                this.showFallbackOptions();
                return;
            }

            // URL direta do APK
            const apkUrl = versionData.download_url || 
                         `https://github.com/infortecmov03/calculadora-listas/releases/latest/download/calculadora-listas-v${versionData.latest_version}.apk`;

            // Iniciar download
            this.startDownload(apkUrl, `calculadora-listas-v${versionData.latest_version}.apk`);

            // Mostrar informações da versão
            this.showVersionInfo(versionData);

        } catch (error) {
            console.error('Erro no download:', error);
            this.showFallbackOptions();
        }
    }

    // Buscar dados da versão
    async getVersionData() {
        try {
            const response = await fetch(this.versionUrl + '?t=' + Date.now());
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar versão:', error);
            return null;
        }
    }

    // Iniciar download
    startDownload(url, filename) {
        showNotification(`📥 Iniciando download da versão...`, 'info');

        // Método 1: Link direto
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Método 2: Fallback após 3 segundos
        setTimeout(() => {
            if (!this.downloadStarted) {
                this.triggerAlternativeDownload(url);
            }
        }, 3000);
    }

    // Download alternativo
    triggerAlternativeDownload(url) {
        showNotification('🔧 Usando método alternativo...', 'info');
        window.open(url, '_blank');
    }

    // Mostrar informações da versão
    showVersionInfo(versionData) {
        setTimeout(() => {
            showNotification(`✅ Download da v${versionData.latest_version} iniciado!`, 'success');
        }, 1000);

        // Mostrar modal com detalhes
        setTimeout(() => {
            this.showUpdateModal(versionData);
        }, 2000);
    }

    // Modal com detalhes da versão
    showUpdateModal(versionData) {
        const modal = document.createElement('div');
        modal.className = 'update-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🎉 Nova Versão ${versionData.latest_version}</h3>
                    <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p><strong>Data de lançamento:</strong> ${versionData.release_date}</p>
                    <p><strong>Build:</strong> #${versionData.build_number}</p>
                    
                    <h4>📋 Novidades:</h4>
                    <ul class="release-notes">
                        ${versionData.release_notes.map(note => `<li>${note}</li>`).join('')}
                    </ul>
                    
                    <div class="download-actions">
                        <button class="btn-primary" onclick="window.open('${versionData.download_url}', '_blank')">
                            <i class="fas fa-download"></i> Baixar Novamente
                        </button>
                        <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()">
                            <i class="fas fa-check"></i> Entendi
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Opções de fallback
    showFallbackOptions() {
        showConfirmModal(
            '📥 Download do APK',
            `Se o download não iniciou automaticamente:<br><br>
            
            <strong>Opção 1 (Recomendada):</strong><br>
            <a href="https://github.com/infortecmov03/calculadora-listas/releases/latest" 
               target="_blank" class="btn-download">
               📱 Baixar Versão Mais Recente
            </a><br><br>
            
            <strong>Opção 2 (Link Direto):</strong><br>
            <a href="https://github.com/infortecmov03/calculadora-listas/releases/latest/download/app-debug.apk" 
               download class="btn-download">
               ⚡ Download Direto APK
            </a><br><br>
            
            <strong>📋 Instruções de Instalação:</strong>
            <ol>
                <li>Baixe o arquivo APK</li>
                <li>Habilite "Fontes desconhecidas" nas configurações</li>
                <li>Toque no arquivo para instalar</li>
                <li>Aproveite o app! 🎉</li>
            </ol>`,
            () => {
                window.open(this.fallbackUrl, '_blank');
            }
        );
    }

    // Verificar se é Android
    isAndroidDevice() {
        return /android/i.test(navigator.userAgent);
    }

    // Download inteligente
    smartDownload() {
        if (this.isAndroidDevice()) {
            this.downloadAPK();
        } else {
            this.showCrossPlatformInstructions();
        }
    }

    // Instruções multiplataforma
    showCrossPlatformInstructions() {
        showConfirmModal(
            '📱 Download para Android',
            `Para instalar no seu dispositivo Android:<br><br>
            
            <strong>No seu Android:</strong><br>
            1. Abra este link no navegador do celular<br>
            2. Toque no botão abaixo para baixar<br>
            3. Instale e aproveite!<br><br>
            
            <strong>No computador:</strong><br>
            1. Baixe o APK abaixo<br>
            2. Transfira para o seu Android<br>
            3. Instale e aproveite!<br><br>
            
            <a href="https://github.com/infortecmov03/calculadora-listas/releases/latest" 
               target="_blank" class="btn-download">
               📥 Baixar Versão Mais Recente
            </a>`,
            () => {
                window.open(this.fallbackUrl, '_blank');
            }
        );
    }
}

// Inicializar handler
const downloadHandler = new DownloadHandler();

// Funções globais
function downloadAPK() {
    downloadHandler.downloadAPK();
}

function smartDownloadAPK() {
    downloadHandler.smartDownload();
}