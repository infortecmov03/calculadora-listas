// ==================== SISTEMA DE ATUALIZAÇÕES ====================

class UpdateChecker {
    constructor() {
        this.currentVersion = '2.0.0';
        this.versionCode = 10;
        this.updateUrl = 'https://raw.githubusercontent.com/infortecmov03/calculadora-listas/main/version.json';
        this.checkInterval = 24 * 60 * 60 * 1000; // 24 horas
    }

    // Verificar atualizações
    async checkForUpdates() {
        if (!this.shouldCheck()) return;

        try {
            const response = await fetch(this.updateUrl + '?t=' + Date.now());
            const updateData = await response.json();

            if (this.isNewVersionAvailable(updateData)) {
                this.showUpdateNotification(updateData);
            }
            
            this.saveLastCheck();
        } catch (error) {
            console.log('Erro ao verificar atualizações:', error);
        }
    }

    // Verificar se é nova versão
    isNewVersionAvailable(updateData) {
        return this.versionCode < updateData.version_code;
    }

    // Mostrar notificação de atualização
    showUpdateNotification(updateData) {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <div class="update-header">
                    <i class="fas fa-sync-alt"></i>
                    <h3>Nova Versão Disponível!</h3>
                    <button class="close-update" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="update-body">
                    <p><strong>Versão ${updateData.latest_version}</strong> - ${updateData.release_date}</p>
                    <ul class="update-notes">
                        ${updateData.release_notes.map(note => `<li>${note}</li>`).join('')}
                    </ul>
                </div>
                <div class="update-actions">
                    <button class="btn-primary" onclick="downloadLatestAPK()">
                        <i class="fas fa-download"></i> Baixar Agora
                    </button>
                    <button class="btn-secondary" onclick="remindMeLater()">
                        <i class="fas fa-clock"></i> Lembrar Depois
                    </button>
                    <button class="btn-text" onclick="skipThisVersion(${updateData.version_code})">
                        Ignorar Esta Versão
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove após 30 segundos se não interagir
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.remove();
            }
        }, 30000);
    }

    // Verificar se deve fazer verificação
    shouldCheck() {
        const lastCheck = localStorage.getItem('lastUpdateCheck');
        if (!lastCheck) return true;

        const lastCheckTime = parseInt(lastCheck);
        return Date.now() - lastCheckTime > this.checkInterval;
    }

    // Salvar última verificação
    saveLastCheck() {
        localStorage.setItem('lastUpdateCheck', Date.now().toString());
    }

    // Verificar versão ignorada
    isVersionSkipped(versionCode) {
        const skippedVersion = localStorage.getItem('skippedVersion');
        return skippedVersion === versionCode.toString();
    }
}

// ==================== FUNÇÕES GLOBAIS ====================

// Download do APK mais recente
async function downloadLatestAPK() {
    try {
        showNotification('Iniciando download da nova versão...', 'info');
        
        const response = await fetch('https://raw.githubusercontent.com/infortecmov03/calculadora-listas/main/version.json');
        const data = await response.json();
        
        // Criar link de download
        const link = document.createElement('a');
        link.href = data.download_url;
        link.download = `calculadora-listas-${data.latest_version}.apk`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Fechar notificação
        document.querySelector('.update-notification')?.remove();
        
        showNotification('Download iniciado! Verifique sua pasta de downloads.', 'success');
        
    } catch (error) {
        console.error('Erro no download:', error);
        showNotification('Erro ao baixar. Tente novamente.', 'error');
    }
}

// Lembrar mais tarde
function remindMeLater() {
    const notification = document.querySelector('.update-notification');
    if (notification) {
        notification.remove();
        showNotification('Te lembraremos em 24 horas 📅', 'info');
    }
}

// Ignorar esta versão
function skipThisVersion(versionCode) {
    localStorage.setItem('skippedVersion', versionCode.toString());
    const notification = document.querySelector('.update-notification');
    if (notification) {
        notification.remove();
        showNotification('Versão ignorada. Notificaremos sobre a próxima.', 'info');
    }
}

// Inicializar verificador de atualizações
const updateChecker = new UpdateChecker();