// Verificar se Capacitor está disponível
const Capacitor = window.Capacitor || {};
const Plugins = Capacitor.Plugins || {};

// Constantes para Capacitor (se não existirem)
const Directory = {
    Documents: 'DOCUMENTS',
    Data: 'DATA',
    Cache: 'CACHE',
    External: 'EXTERNAL',
    ExternalStorage: 'EXTERNAL_STORAGE'
};

const Encoding = {
    UTF8: 'utf8'
};

// ==================== MODAL FUNCTIONS ====================

function showBackupModal() {
    document.getElementById('backupModal').classList.add('active');
}

function hideBackupModal() {
    document.getElementById('backupModal').classList.remove('active');
}

function showBackButtonModal() {
    document.getElementById('backButtonOverlay').classList.add('active');
}

function hideBackButton() {
    document.getElementById('backButtonOverlay').classList.remove('active');
}

function confirmExit() {
    if (navigator.app) {
        navigator.app.exitApp();
    } else if (navigator.device) {
        navigator.device.exitApp();
    } else {
        window.close();
    }
}

// ==================== BACKUP FUNCTIONS ====================

function exportBackup() {
    if (isRunningInApp()) {
        exportBackupNative();
    } else {
        exportBackupBrowser();
    }
}

function triggerImport() {
    document.getElementById('importFile').click();
}

function triggerBackupImport() {
    document.getElementById('importFile').click();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backupData = JSON.parse(e.target.result);
            
            if (backupData.lists && backupData.categories) {
                showConfirmModal(
                    'Importar Backup',
                    'Isso substituirá todos os dados atuais. Continuar?',
                    () => {
                        lists = backupData.lists;
                        categories = backupData.categories;
                        currentList = Object.keys(lists)[0];
                        
                        saveData();
                        updateUI();
                        hideBackupModal();
                        showNotification('Backup importado com sucesso!', 'success');
                    }
                );
            } else {
                showNotification('Arquivo de backup inválido', 'error');
            }
        } catch (error) {
            showNotification('Erro ao ler arquivo de backup', 'error');
        }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
}

// ==================== FIM DAS FUNÇÕES DE MODAL E BACKUP ====================
// Variáveis globais
let currentList = 'lista-principal';
let lists = {};
let categories = ['alimentacao', 'transporte', 'educacao', 'saude', 'entretenimento'];
let sortOrder = { position: 'asc', name: 'asc', category: 'asc', value: 'asc' };
let currentSort = {
    field: 'position',
    order: 'desc',
    type: 'numeric'
};
let dashboardVisible = false;

// Instâncias dos gráficos
let categoryChartInstance = null;
let valueChartInstance = null;

// ==================== CARREGAMENTO DE BIBLIOTECAS ====================

let librariesLoaded = {
    chart: false,
    jspdf: false,
    xlsx: false
};

function loadExternalLibraries() {
    return new Promise(async (resolve) => {
        const librariesToLoad = [];
        
        // Chart.js
        if (typeof Chart === 'undefined') {
            librariesToLoad.push(loadChartJS());
        } else {
            librariesLoaded.chart = true;
        }
        
        // jsPDF
        if (typeof window.jspdf === 'undefined') {
            librariesToLoad.push(loadJsPDF());
        } else {
            librariesLoaded.jspdf = true;
        }
        
        // XLSX
        if (typeof XLSX === 'undefined') {
            librariesToLoad.push(loadXLSX());
        } else {
            librariesLoaded.xlsx = true;
        }
        
        if (librariesToLoad.length > 0) {
            showNotification('Carregando bibliotecas...', 'info');
            await Promise.all(librariesToLoad);
            showNotification('Bibliotecas carregadas!', 'success');
        }
        
        resolve();
    });
}

function loadChartJS() {
    return new Promise((resolve) => {
        if (librariesLoaded.chart) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = './lib/chart.min.js';
        script.onload = () => {
            librariesLoaded.chart = true;
            console.log('Chart.js carregado');
            resolve();
        };
        script.onerror = () => {
            console.error('Erro ao carregar Chart.js');
            resolve(); // Não impede o app de funcionar
        };
        document.head.appendChild(script);
    });
}

function loadJsPDF() {
    return new Promise((resolve) => {
        if (librariesLoaded.jspdf) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = './lib/jspdf.umd.min.js';
        script.onload = () => {
            // Carregar AutoTable após jsPDF
            const script2 = document.createElement('script');
            script2.src = './lib/jspdf.plugin.autotable.min.js';
            script2.onload = () => {
                librariesLoaded.jspdf = true;
                console.log('jsPDF e AutoTable carregados');
                resolve();
            };
            script2.onerror = () => {
                console.error('Erro ao carregar AutoTable');
                resolve();
            };
            document.head.appendChild(script2);
        };
        script.onerror = () => {
            console.error('Erro ao carregar jsPDF');
            resolve();
        };
        document.head.appendChild(script);
    });
}

function loadXLSX() {
    return new Promise((resolve) => {
        if (librariesLoaded.xlsx) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = './lib/xlsx.full.min.js';
        script.onload = () => {
            librariesLoaded.xlsx = true;
            console.log('XLSX carregado');
            resolve();
        };
        script.onerror = () => {
            console.error('Erro ao carregar XLSX');
            showNotification('Erro ao carregar biblioteca Excel', 'error');
            resolve();
        };
        document.head.appendChild(script);
    });
}

// Verificar se uma biblioteca está disponível
function isLibraryLoaded(libraryName) {
    switch(libraryName) {
        case 'chart':
            return typeof Chart !== 'undefined';
        case 'jspdf':
            return typeof window.jspdf !== 'undefined';
        case 'xlsx':
            return typeof XLSX !== 'undefined';
        default:
            return false;
    }
}

function showBackButtonModal() {
    document.getElementById('backButtonOverlay').classList.add('active');
}

function hideBackButton() {
    document.getElementById('backButtonOverlay').classList.remove('active');
}

function confirmExit() {
    if (navigator.app) {
        navigator.app.exitApp();
    } else if (navigator.device) {
        navigator.device.exitApp();
    } else {
        window.close();
    }
}

// Inicialização quando o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});


// Adicionar botão de download fixo na interface
function addDownloadButton() {
    // Verificar se já existe
    if (document.getElementById('downloadApkBtn')) return;

    const downloadBtn = document.createElement('button');
    downloadBtn.id = 'downloadApkBtn';
    downloadBtn.className = 'btn-download-fixed';
    downloadBtn.innerHTML = '<i class="fas fa-download"></i> 📱 Baixar APK';
    downloadBtn.onclick = smartDownloadAPK;

    document.body.appendChild(downloadBtn);
    
    console.log('✅ Botão de download adicionado');
}
// Inicializar sistemas
function initUpdateSystems() {
    // Adicionar botão de download fixo
    addDownloadButton();
    
    // Verificar atualizações após 5 segundos
    setTimeout(() => {
        updateChecker.checkForUpdates();
    }, 5000);
    
    // Verificar a cada 24 horas
    setInterval(() => {
        updateChecker.checkForUpdates();
    }, 24 * 60 * 60 * 1000);
}

// Função principal de inicialização
function initApp() {
    loadExternalLibraries();
    loadData();
    initEventListeners();
    initValueInput();
    initDashboardControl();
    initResponsiveEvents();
    initUpdateSystems();

    // Ordenar por valor (maior no topo) por padrão ao inicializar
    if (lists[currentList].items.length > 0) {
        sortByValue(); // Aplicar ordenação por valor por padrão
    }
    updateUI();
    setupServiceWorker();
    preventBackButton();
    
    // Mostrar mensagem de boas-vindas
    setTimeout(() => {
        if (Object.keys(lists).length === 1 && lists[currentList].items.length === 0) {
            showNotification('Bem-vindo à Calculadora de Listas! Comece adicionando itens.', 'info');
        }
    }, 1000);
}

// Carregar dados do localStorage
function loadData() {
    const savedLists = localStorage.getItem('calculadoraListas');
    const savedCategories = localStorage.getItem('listaCategorias');
    
    if (savedLists) {
        lists = JSON.parse(savedLists);
    } else {
        // Lista principal padrão
        lists = {
            'lista-principal': {
                name: 'Lista Principal',
                items: [],
                budget: 0,
                createdAt: new Date().toISOString()
            }
        };
    }
    
    if (savedCategories) {
        categories = JSON.parse(savedCategories);
    }
    
    updateCategorySelects();
}

// Salvar dados no localStorage
function saveData() {
    localStorage.setItem('calculadoraListas', JSON.stringify(lists));
    localStorage.setItem('listaCategorias', JSON.stringify(categories));
}

// Inicializar event listeners
function initEventListeners() {
    // Menu toggle
    document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
    
    // Adicionar item
    document.getElementById('addBtn').addEventListener('click', addItem);
    document.getElementById('itemName').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addItem();
    });
    document.getElementById('itemValue').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addItem();
    });
    
    // Adicionar lista
    document.getElementById('addListBtn').addEventListener('click', addNewList);
    document.getElementById('newListName').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addNewList();
    });
    
    // Ordenação
    document.getElementById('sortByNameBtn').addEventListener('click', () => sortByName());
    document.getElementById('sortByValueBtn').addEventListener('click', () => sortByValue());
    
    // Ações principais
    document.getElementById('saveListBtn').addEventListener('click', saveCurrentList);
    document.getElementById('clearListBtn').addEventListener('click', clearCurrentList);
    document.getElementById('exportPdfBtn').addEventListener('click', exportToPDF);
    document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
    document.getElementById('backupBtn').addEventListener('click', showBackupModal);
    document.getElementById('importBtn').addEventListener('click', triggerImport);
    
    // Busca e filtros
    document.getElementById('searchInput').addEventListener('input', filterItems);
    document.getElementById('categoryFilter').addEventListener('change', filterItems);
    
    // Orçamento
    document.getElementById('setBudgetBtn').addEventListener('click', setBudget);
    document.getElementById('listBudget').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') setBudget();
    });
    
    // Modais
    document.getElementById('modalCancel').addEventListener('click', hideModal);
    document.getElementById('backupCancel').addEventListener('click', hideBackupModal);
    document.getElementById('exportBackupBtn').addEventListener('click', exportBackup);
    document.getElementById('importBackupBtn').addEventListener('click', triggerBackupImport);
    
    // Templates
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', function() {
            applyTemplate(this.dataset.template);
        });
    });
    
    // Importação de arquivos
    document.getElementById('importFile').addEventListener('change', handleFileImport);
    
    // Botão voltar
    document.getElementById('backButtonCancel').addEventListener('click', hideBackButton);
    document.getElementById('backButtonConfirm').addEventListener('click', confirmExit);
    
    // Fechar sidebar ao clicar fora (mobile)
    document.addEventListener('click', function(e) {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.getElementById('menuToggle');
        
        if (sidebar.classList.contains('active') && 
            !sidebar.contains(e.target) && 
            !menuToggle.contains(e.target) &&
            window.innerWidth <= 768) {
            sidebar.classList.remove('active');
        }
    });
}

// ==================== DASHBOARD CONTROL ====================

// Inicializar controle do dashboard
function initDashboardControl() {
    const toggleDashboardBtn = document.getElementById('toggleDashboardBtn');
    
    if (!toggleDashboardBtn) {
        console.error('Botão do dashboard não encontrado');
        return;
    }
    
    // Carregar preferência salva do usuário
    loadDashboardPreference();
    
    toggleDashboardBtn.addEventListener('click', function() {
        toggleDashboard();
    });
    
    // Inicializar o estado baseado na preferência
    updateDashboardVisibility();
}

// Função para alternar o dashboard
function toggleDashboard() {
    dashboardVisible = !dashboardVisible;
    updateDashboardVisibility();
    saveDashboardPreference();
    
    if (dashboardVisible) {
        // Atualizar dados quando o dashboard é mostrado
        updateDashboard();
        showNotification('Dashboard ativado', 'success');
    } else {
        showNotification('Dashboard ocultado', 'info');
    }
}

// Função para atualizar a visibilidade do dashboard
function updateDashboardVisibility() {
    const toggleDashboardBtn = document.getElementById('toggleDashboardBtn');
    const dashboardSection = document.querySelector('.dashboard');
    const chartsSection = document.querySelector('.charts-section');
    
    if (dashboardVisible) {
        // Mostrar dashboard
        dashboardSection.classList.remove('hidden');
        chartsSection.classList.remove('hidden');
        toggleDashboardBtn.innerHTML = '<i class="fas fa-chart-bar"></i> Ocultar Dashboard';
        toggleDashboardBtn.classList.add('active');
    } else {
        // Ocultar dashboard
        dashboardSection.classList.add('hidden');
        chartsSection.classList.add('hidden');
        toggleDashboardBtn.innerHTML = '<i class="fas fa-chart-bar"></i> Mostrar Dashboard';
        toggleDashboardBtn.classList.remove('active');
    }
}

// Função para salvar preferência do dashboard
function saveDashboardPreference() {
    const preferences = {
        dashboardVisible: dashboardVisible,
        categories: categories
    };
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
}

// Função para carregar preferência do dashboard
function loadDashboardPreference() {
    const saved = localStorage.getItem('userPreferences');
    if (saved) {
        try {
            const preferences = JSON.parse(saved);
            dashboardVisible = preferences.dashboardVisible || false;
            
            // Carregar categorias se existirem
            if (preferences.categories) {
                categories = preferences.categories;
                updateCategorySelects();
            }
        } catch (e) {
            console.error('Erro ao carregar preferências:', e);
            dashboardVisible = false;
        }
    } else {
        dashboardVisible = false; // Começar oculto por padrão
    }
}

// ==================== VALUE INPUT CONTROL ====================

// Inicializar campo de valor
function initValueInput() {
    const valueInput = document.getElementById('itemValue');
    
    valueInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^\d,.]/g, '');
        value = value.replace(',', '.');
        
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }
        
        e.target.value = value;
        
        // Validação visual
        if (value && !isNaN(parseFloat(value))) {
            e.target.classList.add('valid');
            e.target.classList.remove('invalid');
        } else if (value) {
            e.target.classList.add('invalid');
            e.target.classList.remove('valid');
        } else {
            e.target.classList.remove('valid', 'invalid');
        }
    });
    
    valueInput.addEventListener('blur', function(e) {
        formatValueInput(e.target);
    });
    
    valueInput.addEventListener('focus', function(e) {
        e.target.value = e.target.value.replace(' MZN', '').replace(/\./g, ',');
    });
}

// Formatar campo de valor
function formatValueInput(input) {
    let value = input.value.trim();
    
    if (value === '') return;
    
    let numberValue = parseFloat(value.replace(',', '.'));
    
    if (isNaN(numberValue)) {
        input.value = '';
        return;
    }
    
    input.value = numberValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Obter valor numérico do campo
function getNumericValue() {
    const valueInput = document.getElementById('itemValue');
    let value = valueInput.value.trim();
    
    if (value === '') return 0;
    
    value = value.replace(/\./g, '').replace(',', '.');
    return parseFloat(value) || 0;
}

// Limpar campo de valor
function clearValueInput() {
    const valueInput = document.getElementById('itemValue');
    valueInput.value = '';
    valueInput.classList.remove('valid', 'invalid');
}

// ==================== ORDENAÇÃO ====================

// Ordenação por nome (alfabética)
function sortByName() {
    const isCurrentlySortedByName = currentSort.field === 'name';
    const newOrder = isCurrentlySortedByName && currentSort.order === 'asc' ? 'desc' : 'asc';
    
    lists[currentList].items.sort((a, b) => {
        const aValue = a.name.toLowerCase();
        const bValue = b.name.toLowerCase();
        
        if (aValue < bValue) return newOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return newOrder === 'asc' ? 1 : -1;
        return 0;
    });
    
    currentSort = { field: 'name', order: newOrder, type: 'alphabetic' };
    updateSortButtons();
    updateItemPositions();
    updateUI();
    
    const orderText = newOrder === 'asc' ? 'A-Z' : 'Z-A';
    showNotification(`Ordenado por nome (${orderText})`, 'success');
}

// Ordenação por valor
function sortByValue() {
    const isCurrentlySortedByValue = currentSort.field === 'value';
    const newOrder =  'desc'; // Sempre ordenar do maior para o menor
    
    lists[currentList].items.sort((a, b) => {
        if (newOrder === 'desc') {
            return b.value - a.value; // sempre do maior para o menor
        } 
    });
    
    currentSort = { field: 'value', order: newOrder, type: 'numeric' };
    updateSortButtons();
    updateItemPositions();
    updateUI();
    
    const orderText = 'Maior Valor';
    showNotification(`Ordenado por ${orderText}`, 'success');
}

// Atualizar estado visual dos botões
function updateSortButtons() {
    const nameBtn = document.getElementById('sortByNameBtn');
    const valueBtn = document.getElementById('sortByValueBtn');
    
    // Resetar todos os botões
    nameBtn.classList.remove('active');
    valueBtn.classList.remove('active');
    nameBtn.innerHTML = '<i class="fas fa-sort-alpha-down"></i> Ordem Alfabética';
    valueBtn.innerHTML = '<i class="fas fa-sort-amount-down"></i> Maior Valor';
    
    // Atualizar botão ativo
    if (currentSort.field === 'name') {
        nameBtn.classList.add('active');
        const icon = currentSort.order === 'asc' ? 'fa-sort-alpha-down' : 'fa-sort-alpha-up';
        nameBtn.innerHTML = `<i class="fas ${icon}"></i> Ordem ${currentSort.order === 'asc' ? 'A-Z' : 'Z-A'}`;
    } else if (currentSort.field === 'value') {
        valueBtn.classList.add('active');
        // SEMPRE mostrar como "Maior Valor" já que agora é fixo
        valueBtn.innerHTML = `<i class="fas fa-sort-amount-down"></i> Maior Valor`;
    }
}

// ==================== EDIÇÃO INLINE ====================

// Iniciar edição
function startEdit(index, field) {
    const rows = document.querySelectorAll('#itemsList tr');
    if (index >= rows.length) return;
    
    const row = rows[index];
    row.classList.add('editing');
    
    if (field === 'name') {
        // Esconder nome, mostrar input
        row.querySelector('.item-name').style.display = 'none';
        const nameInput = row.querySelector('.name-edit-input');
        nameInput.style.display = 'block';
        nameInput.focus();
        nameInput.select();
        
        // Mostrar ações de edição
        row.querySelector('.edit-actions').style.display = 'flex';
        
    } else if (field === 'value') {
        // Esconder valor, mostrar input
        row.querySelector('.item-value').style.display = 'none';
        const valueInput = row.querySelector('.value-edit-input');
        valueInput.style.display = 'block';
        valueInput.focus();
        valueInput.select();
        
        // Mostrar ações de edição
        const valueActions = row.querySelectorAll('.edit-actions')[1];
        valueActions.style.display = 'flex';
    }
}

// Confirmar edição
function confirmEdit(index, field) {
    const rows = document.querySelectorAll('#itemsList tr');
    if (index >= rows.length) return;
    
    const row = rows[index];
    const item = lists[currentList].items[index];
    
    if (field === 'name') {
        const nameInput = row.querySelector('.name-edit-input');
        const newName = nameInput.value.trim();
        
        if (newName && newName !== item.name) {
            item.name = newName;
            saveData();
            showNotification('Nome atualizado com sucesso!', 'success');
        }
        
    } else if (field === 'value') {
        const valueInput = row.querySelector('.value-edit-input');
        const newValue = parseFloat(valueInput.value.replace(',', '.'));
        
        if (!isNaN(newValue) && newValue > 0 && newValue !== item.value) {
            item.value = newValue;
            saveData();
            showNotification('Valor atualizado com sucesso!', 'success');
        } else {
            showNotification('Valor inválido', 'error');
            return; // Não finaliza a edição se o valor for inválido
        }
    }
    
    // Sair do modo de edição
    cancelEdit(index, field);
    
    // Atualizar UI se necessário
    if (dashboardVisible) {
        updateDashboard();
    }
    updateTotal();
}

// Cancelar edição
function cancelEdit(index, field) {
    const rows = document.querySelectorAll('#itemsList tr');
    if (index >= rows.length) return;
    
    const row = rows[index];
    row.classList.remove('editing');
    
    if (field === 'name') {
        row.querySelector('.item-name').style.display = 'block';
        row.querySelector('.name-edit-input').style.display = 'none';
        row.querySelector('.edit-actions').style.display = 'none';
    } else if (field === 'value') {
        row.querySelector('.item-value').style.display = 'block';
        row.querySelector('.value-edit-input').style.display = 'none';
        const valueActions = row.querySelectorAll('.edit-actions')[1];
        valueActions.style.display = 'none';
    }
}

// ==================== ITEM MANAGEMENT ====================

// Adicionar item à lista
function addItem() {
    const nameInput = document.getElementById('itemName');
    const valueInput = document.getElementById('itemValue');
    const categorySelect = document.getElementById('itemCategory');
    
    const name = nameInput.value.trim();
    const value = getNumericValue();
    const category = categorySelect.value;
    
    if (name === '' || value <= 0) {
        showNotification('Por favor, preencha nome e valor válidos', 'error');
        return;
    }
    
    const newItem = {
        id: Date.now(),
        name: name,
        value: value,
        category: category,
        position: lists[currentList].items.length + 1,
        createdAt: new Date().toISOString()
    };
    
    lists[currentList].items.push(newItem);
    
    // Aplicar ordenação atual após adicionar
    if (currentSort.field === 'name') {
        sortByName();
    } else if (currentSort.field === 'value') {
        sortByValue();
    } else {
        updateItemPositions();
    }
    
    // Limpar campos
    nameInput.value = '';
    clearValueInput();
    nameInput.focus();
    
    saveData();
    updateUI();
    showNotification('Item adicionado com sucesso!', 'success');
}

// Remover item
function removeItem(index) {
    showConfirmModal(
        'Confirmar Exclusão',
        'Tem certeza que deseja excluir este item?',
        () => {
            lists[currentList].items.splice(index, 1);
            
            // Manter a ordenação atual após remover
            if (currentSort.field === 'name') {
                sortByName();
            } else if (currentSort.field === 'value') {
                sortByValue();
            } else {
                updateItemPositions();
                updateUI();
            }
            
            saveData();
            showNotification('Item removido com sucesso!', 'success');
        }
    );
}

// Atualizar posições dos itens
function updateItemPositions() {
    lists[currentList].items.forEach((item, index) => {
        item.position = index + 1;
    });
}

// Filtrar itens
function filterItems() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    const filteredItems = lists[currentList].items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    renderItemsTable(filteredItems);
}

// ==================== RENDERIZAÇÃO DA TABELA ====================

// Renderizar tabela de itens
function renderItemsTable(items = null) {
    const itemsToRender = items || lists[currentList].items;
    const tbody = document.getElementById('itemsList');
    tbody.innerHTML = '';
    
    if (itemsToRender.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #7f8c8d;">
                    <i class="fas fa-inbox" style="font-size: 3em; margin-bottom: 10px; display: block;"></i>
                    Nenhum item na lista
                </td>
            </tr>
        `;
        return;
    }
    
    itemsToRender.forEach((item, index) => {
        const tr = document.createElement('tr');
        const actualIndex = lists[currentList].items.indexOf(item);
        
        // Determinar cor da linha baseada na categoria ou posição
        const rowClass = getRowClass(item, index);
        tr.className = rowClass;
        
        const categoryBadge = item.category ? 
            `<span class="category-badge category-${item.category}">${item.category}</span>` : '';
        
        tr.innerHTML = `
            <td data-label="Posição">${item.position}</td>
            <td data-label="Nome">
                <span class="item-name">${item.name}</span>
                <input type="text" class="edit-input name-edit-input" value="${item.name}" style="display: none;">
                <div class="edit-actions" style="display: none;">
                    <button class="confirm-edit" onclick="confirmEdit(${actualIndex}, 'name')">
                        <i class="fas fa-check"></i> Ok
                    </button>
                    <button class="cancel-edit" onclick="cancelEdit(${actualIndex}, 'name')">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            </td>
            <td data-label="Categoria" class="category-column">${categoryBadge}</td>
            <td data-label="Valor">
                <span class="item-value">MZN ${item.value.toFixed(2)}</span>
                <input type="text" class="edit-input value-edit-input" value="${item.value.toFixed(2)}" style="display: none;">
                <div class="edit-actions" style="display: none;">
                    <button class="confirm-edit" onclick="confirmEdit(${actualIndex}, 'value')">
                        <i class="fas fa-check"></i> Ok
                    </button>
                    <button class="cancel-edit" onclick="cancelEdit(${actualIndex}, 'value')">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            </td>
            <td data-label="Ações">
                <div class="item-actions">
                    <button class="edit-btn" onclick="startEdit(${actualIndex}, 'name')">
                        <i class="fas fa-edit"></i> Nome
                    </button>
                    <button class="edit-btn" onclick="startEdit(${actualIndex}, 'value')">
                        <i class="fas fa-edit"></i> Valor
                    </button>
                    <button class="delete-btn" onclick="removeItem(${actualIndex})">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Determinar classe CSS para coloração das linhas
function getRowClass(item, index) {
    // Cores baseadas na categoria
    const categoryColors = {
        'alimentacao': 'row-category-food',
        'transporte': 'row-category-transport',
        'educacao': 'row-category-education',
        'saude': 'row-category-health',
        'entretenimento': 'row-category-entertainment'
    };
    
    if (item.category && categoryColors[item.category]) {
        return categoryColors[item.category];
    }
    
    // Fallback: cores zebradas
    return index % 2 === 0 ? 'row-even' : 'row-odd';
}

// ==================== UI UPDATES ====================

// Atualizar interface
function updateUI() {
    updateListsMenu();
    renderItemsTable();
    updateTotal();
    updateCategorySelects();
    updateSortButtons();
    
    if (dashboardVisible) {
        updateDashboard();
    }
}

// Atualizar menu de listas
function updateListsMenu() {
    const listsMenu = document.getElementById('listsMenu');
    listsMenu.innerHTML = '';
    
    Object.keys(lists).forEach(listKey => {
        const list = lists[listKey];
        const li = document.createElement('li');
        li.className = listKey === currentList ? 'active' : '';
        
        li.innerHTML = `
            <span class="list-name">${list.name}</span>
            ${listKey !== 'lista-principal' ? 
                `<button class="delete-list" onclick="deleteList('${listKey}')">
                    <i class="fas fa-trash"></i>
                </button>` : ''
            }
        `;
        
        li.addEventListener('click', (e) => {
            if (!e.target.classList.contains('delete-list')) {
                switchList(listKey);
            }
        });
        
        listsMenu.appendChild(li);
    });
    
    document.getElementById('currentList').innerHTML = `<i class="fas fa-clipboard-check"></i> ${lists[currentList].name}`;
}

// Atualizar total
function updateTotal() {
    const total = lists[currentList].items.reduce((sum, item) => sum + item.value, 0);
    document.getElementById('totalValue').textContent = `MZN ${total.toFixed(2)}`;
    updateBudgetProgress(total);
}

// Atualizar selects de categoria
function updateCategorySelects() {
    const itemCategory = document.getElementById('itemCategory');
    const categoryFilter = document.getElementById('categoryFilter');
    
    // Limpar opções exceto a primeira
    while (itemCategory.children.length > 1) itemCategory.removeChild(itemCategory.lastChild);
    while (categoryFilter.children.length > 1) categoryFilter.removeChild(categoryFilter.lastChild);
    
    // Adicionar categorias
    categories.forEach(category => {
        const option1 = document.createElement('option');
        option1.value = category;
        option1.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        itemCategory.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = category;
        option2.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option2);
    });
}

// ==================== LIST MANAGEMENT ====================

// Alternar lista
function switchList(listKey) {
    currentList = listKey;
    updateUI();
    showNotification(`Lista "${lists[listKey].name}" carregada`, 'success');
}

// Adicionar nova lista
function addNewList() {
    const input = document.getElementById('newListName');
    const name = input.value.trim();
    
    if (name === '') {
        showNotification('Por favor, digite um nome para a lista', 'error');
        return;
    }
    
    const listKey = 'lista-' + Date.now();
    lists[listKey] = {
        name: name,
        items: [],
        budget: 0,
        createdAt: new Date().toISOString()
    };
    
    input.value = '';
    saveData();
    updateUI();
    showNotification(`Lista "${name}" criada com sucesso!`, 'success');
}

// Excluir lista
function deleteList(listKey) {
    if (Object.keys(lists).length <= 1) {
        showNotification('Não é possível excluir a única lista', 'error');
        return;
    }
    
    showConfirmModal(
        'Confirmar Exclusão',
        `Tem certeza que deseja excluir a lista "${lists[listKey].name}"?`,
        () => {
            const listName = lists[listKey].name;
            delete lists[listKey];
            
            // Se a lista atual foi excluída, mudar para a primeira lista disponível
            if (currentList === listKey) {
                currentList = Object.keys(lists)[0];
            }
            
            saveData();
            updateUI();
            showNotification(`Lista "${listName}" excluída com sucesso!`, 'success');
        }
    );
}

// Salvar lista atual
function saveCurrentList() {
    saveData();
    showNotification('Lista salva com sucesso!', 'success');
}

// Limpar lista atual
function clearCurrentList() {
    if (lists[currentList].items.length === 0) {
        showNotification('A lista já está vazia', 'info');
        return;
    }
    
    showConfirmModal(
        'Limpar Lista',
        'Tem certeza que deseja limpar todos os itens desta lista?',
        () => {
            lists[currentList].items = [];
            saveData();
            updateUI();
            showNotification('Lista limpa com sucesso!', 'success');
        }
    );
}

// Gerenciar categorias
function manageCategories() {
    const newCategory = prompt('Digite o nome da nova categoria:');
    
    if (newCategory && newCategory.trim() !== '') {
        const category = newCategory.trim().toLowerCase();
        
        if (!categories.includes(category)) {
            categories.push(category);
            saveDashboardPreference();
            updateCategorySelects();
            showNotification(`Categoria "${category}" adicionada com sucesso!`, 'success');
        } else {
            showNotification('Esta categoria já existe', 'error');
        }
    }
}

// ==================== TEMPLATES ====================

// Aplicar template
function applyTemplate(templateName) {
    const templates = {
        supermercado: [
            { name: 'Arroz', value: 45.90, category: 'alimentacao' },
            { name: 'Feijão', value: 12.50, category: 'alimentacao' },
            { name: 'Óleo', value: 8.90, category: 'alimentacao' },
            { name: 'Açúcar', value: 5.75, category: 'alimentacao' },
            { name: 'Café', value: 15.20, category: 'alimentacao' }
        ],
        viagem: [
            { name: 'Passagem aérea', value: 2500, category: 'transporte' },
            { name: 'Hotel', value: 1800, category: 'transporte' },
            { name: 'Alimentação', value: 800, category: 'alimentacao' },
            { name: 'Passeios', value: 600, category: 'entretenimento' },
            { name: 'Transporte local', value: 300, category: 'transporte' }
        ],
        evento: [
            { name: 'Local', value: 5000, category: 'transporte' },
            { name: 'Comida', value: 2500, category: 'alimentacao' },
            { name: 'Bebidas', value: 1800, category: 'alimentacao' },
            { name: 'Decoração', value: 1200, category: 'entretenimento' },
            { name: 'Som/Luz', value: 2000, category: 'entretenimento' }
        ],
        construcao: [
            { name: 'Cimento', value: 450, category: 'transporte' },
            { name: 'Areia', value: 280, category: 'transporte' },
            { name: 'Tijolos', value: 1200, category: 'transporte' },
            { name: 'Ferro', value: 3500, category: 'transporte' },
            { name: 'Mão de obra', value: 8000, category: 'transporte' }
        ]
    };
    
    const template = templates[templateName];
    if (template) {
        lists[currentList].items = template.map((item, index) => ({
            id: Date.now() + index,
            name: item.name,
            value: item.value,
            category: item.category,
            position: index + 1,
            createdAt: new Date().toISOString()
        }));
        
        saveData();
        updateUI();
        showNotification(`Template "${templateName}" aplicado com sucesso!`, 'success');
    }
}

// ==================== BUDGET SYSTEM ====================

// Sistema de Orçamento
function setBudget() {
    const budgetInput = document.getElementById('listBudget');
    const budget = parseFloat(budgetInput.value);
    
    if (isNaN(budget) || budget <= 0) {
        showNotification('Por favor, digite um valor de orçamento válido', 'error');
        return;
    }
    
    lists[currentList].budget = budget;
    saveData();
    updateBudgetProgress();
    budgetInput.value = '';
    showNotification(`Orçamento de MZN ${budget.toFixed(2)} definido com sucesso!`, 'success');
}

function updateBudgetProgress(currentTotal = null) {
    const total = currentTotal || lists[currentList].items.reduce((sum, item) => sum + item.value, 0);
    const budget = lists[currentList].budget;
    
    if (budget <= 0) return;
    
    const percentage = Math.min((total / budget) * 100, 100);
    const progressBar = document.getElementById('budgetProgressBar');
    
    progressBar.style.width = `${percentage}%`;
    
    // Cor baseada no percentual
    if (percentage > 90) {
        progressBar.style.background = 'var(--secondary-gradient)';
    } else if (percentage > 70) {
        progressBar.style.background = 'var(--success-gradient)';
    } else {
        progressBar.style.background = 'var(--primary-gradient)';
    }
    
    document.getElementById('budgetUsed').textContent = `MZN ${total.toFixed(2)}`;
    document.getElementById('budgetRemaining').textContent = `MZN ${Math.max(0, budget - total).toFixed(2)}`;
}

// ==================== DASHBOARD ====================

// Dashboard
function updateDashboard() {
    // Só atualiza se o dashboard estiver visível
    if (!dashboardVisible) return;
    
    // Estatísticas gerais
    const totalLists = Object.keys(lists).length;
    const totalItems = Object.values(lists).reduce((sum, list) => sum + list.items.length, 0);
    const totalValueAll = Object.values(lists).reduce((sum, list) => {
        return sum + list.items.reduce((itemSum, item) => itemSum + item.value, 0);
    }, 0);
    const avgValue = totalItems > 0 ? totalValueAll / totalItems : 0;
    
    document.getElementById('totalLists').textContent = totalLists;
    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('totalValueAll').textContent = `MZN ${totalValueAll.toFixed(2)}`;
    document.getElementById('avgValue').textContent = `MZN ${avgValue.toFixed(2)}`;
    
    updateCharts();
    updateBudgetProgress();
}

function updateCharts() {
    if (!dashboardVisible) return;
    
    // Destruir gráficos existentes para evitar duplicação
    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }
    if (valueChartInstance) {
        valueChartInstance.destroy();
    }
    
    // Gráfico de categorias
    const categoryData = {};
    Object.values(lists).forEach(list => {
        list.items.forEach(item => {
            const category = item.category || 'sem-categoria';
            categoryData[category] = (categoryData[category] || 0) + item.value;
        });
    });
    
    const categoryCanvas = document.getElementById('categoryChart');
    if (categoryCanvas && Object.keys(categoryData).length > 0) {
        const categoryCtx = categoryCanvas.getContext('2d');
        categoryChartInstance = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categoryData).map(cat => 
                    cat === 'sem-categoria' ? 'Sem Categoria' : 
                    cat.charAt(0).toUpperCase() + cat.slice(1)
                ),
                datasets: [{
                    data: Object.values(categoryData),
                    backgroundColor: [
                        '#e74c3c', '#3498db', '#9b59b6', '#2ecc71', '#f39c12',
                        '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#d35400'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribuição por Categoria',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Gráfico de distribuição de valores
    const valueRanges = {
        '0-100 MZN': 0,
        '101-500 MZN': 0,
        '501-1000 MZN': 0,
        '1001-5000 MZN': 0,
        '5000+ MZN': 0
    };
    
    Object.values(lists).forEach(list => {
        list.items.forEach(item => {
            if (item.value <= 100) valueRanges['0-100 MZN']++;
            else if (item.value <= 500) valueRanges['101-500 MZN']++;
            else if (item.value <= 1000) valueRanges['501-1000 MZN']++;
            else if (item.value <= 5000) valueRanges['1001-5000 MZN']++;
            else valueRanges['5000+ MZN']++;
        });
    });
    
    const valueCanvas = document.getElementById('valueDistributionChart');
    if (valueCanvas && Object.values(valueRanges).some(val => val > 0)) {
        const valueCtx = valueCanvas.getContext('2d');
        valueChartInstance = new Chart(valueCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(valueRanges),
                datasets: [{
                    label: 'Quantidade de Itens',
                    data: Object.values(valueRanges),
                    backgroundColor: 'rgba(52, 152, 219, 0.8)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribuição por Faixa de Valor',
                        font: {
                            size: 16
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
}

// ==================== EXPORT/IMPORT ====================

// Substitua todo o código de exportação atual por este:

// ==================== EXPORT/IMPORT PARA APK ====================

// Detectar se está no APK
function isRunningInApp() {
    return window.Capacitor && window.Capacitor.isNative;
}

// Exportar PDF no APK
async function exportToPDF() {
    // Verificar se jsPDF está carregado
    if (typeof window.jspdf === 'undefined') {
        showNotification('Biblioteca PDF não carregada. Aguarde...', 'error');
        return;
    }
    
    if (isRunningInApp()) {
        await exportPdfNative();
    } else {
        exportPdfBrowser();
    }
}

// Exportar Excel no APK  
async function exportToExcel() {
    // Verificar se XLSX está carregado
    if (!isLibraryLoaded('xlsx')) {
        showNotification('Biblioteca Excel não carregada. Tentando carregar...', 'warning');
        await loadXLSX();
        
        if (!isLibraryLoaded('xlsx')) {
            showNotification('Não foi possível carregar a biblioteca Excel', 'error');
            return;
        }
    }
    
    if (isRunningInApp()) {
        await exportExcelNative();
    } else {
        exportExcelBrowser();
    }
}

// Exportação PDF para Browser (seu código atual)
function exportPdfBrowser() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Cabeçalho
        doc.setFontSize(20);
        doc.text(`Lista: ${lists[currentList].name}`, 20, 20);
        doc.setFontSize(12);
        doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
        
        // Tabela
        const tableData = lists[currentList].items.map(item => [
            item.position,
            item.name,
            item.category || 'Sem categoria',
            `MZN ${item.value.toFixed(2)}`
        ]);
        
        doc.autoTable({
            head: [['Pos', 'Nome', 'Categoria', 'Valor']],
            body: tableData,
            startY: 40,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [52, 152, 219] }
        });
        
        // Total
        const total = lists[currentList].items.reduce((sum, item) => sum + item.value, 0);
        const finalY = doc.lastAutoTable.finalY + 10;
        
        doc.setFontSize(14);
        doc.text(`Total: MZN ${total.toFixed(2)}`, 20, finalY);
        
        // Orçamento
        if (lists[currentList].budget > 0) {
            doc.text(`Orçamento: MZN ${lists[currentList].budget.toFixed(2)}`, 20, finalY + 10);
            doc.text(`Saldo: MZN ${(lists[currentList].budget - total).toFixed(2)}`, 20, finalY + 20);
        }
        
        doc.save(`${lists[currentList].name.replace(/\s+/g, '_')}.pdf`);
        showNotification('PDF exportado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao exportar PDF:', error);
        showNotification('Erro ao exportar PDF.', 'error');
    }
}

// Exportação PDF para APK
async function exportPdfNative() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Cabeçalho
        doc.setFontSize(20);
        doc.text(`Lista: ${lists[currentList].name}`, 20, 20);
        doc.setFontSize(12);
        doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
        
        // Tabela
        const tableData = lists[currentList].items.map(item => [
            item.position,
            item.name,
            item.category || 'Sem categoria',
            `MZN ${item.value.toFixed(2)}`
        ]);
        
        doc.autoTable({
            head: [['Pos', 'Nome', 'Categoria', 'Valor']],
            body: tableData,
            startY: 40,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [52, 152, 219] }
        });
        
        // Total
        const total = lists[currentList].items.reduce((sum, item) => sum + item.value, 0);
        const finalY = doc.lastAutoTable.finalY + 10;
        
        doc.setFontSize(14);
        doc.text(`Total: MZN ${total.toFixed(2)}`, 20, finalY);
        
        // Orçamento
        if (lists[currentList].budget > 0) {
            doc.text(`Orçamento: MZN ${lists[currentList].budget.toFixed(2)}`, 20, finalY + 10);
            doc.text(`Saldo: MZN ${(lists[currentList].budget - total).toFixed(2)}`, 20, finalY + 20);
        }
        
        // Gerar blob do PDF
        const pdfBlob = doc.output('blob');
        const pdfBase64 = await blobToBase64(pdfBlob);
        
        // Salvar usando Capacitor Filesystem
        const { Filesystem } = Plugins;
        const fileName = `${lists[currentList].name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        
        // Escrever arquivo no diretório de documentos do app
        await Filesystem.writeFile({
            path: fileName,
            data: pdfBase64,
            directory: Directory.Documents
        });
        
        // Compartilhar o arquivo
        await Share.share({
            title: 'Exportar PDF',
            text: `Lista: ${lists[currentList].name}`,
            url: `file:///Documents/${fileName}`,
            dialogTitle: 'Salvar PDF'
        });
        
        showNotification('PDF salvo e pronto para compartilhar!', 'success');
    } catch (error) {
        console.error('Erro ao exportar PDF no APK:', error);
        showNotification('Erro ao salvar PDF. Use a versão web.', 'error');
    }
}

// Exportação Excel para Browser - COM FORMATAÇÃO
function exportExcelBrowser() {
    try {
        if (typeof XLSX === 'undefined') {
            showNotification('Biblioteca Excel não carregada. Recarregue a página.', 'error');
            return;
        }
        
        // Criar workbook
        const wb = XLSX.utils.book_new();
        
        // Preparar dados com formatação
        const excelData = [
            // Cabeçalho com estilo
            ['RELATÓRIO DE LISTA', '', '', ''], // Título
            [`Lista: ${lists[currentList].name}`, '', '', ''], // Nome da lista
            [`Data: ${new Date().toLocaleDateString('pt-BR')}`, '', '', ''], // Data
            [], // Linha vazia
            ['POSIÇÃO', 'NOME DO ITEM', 'CATEGORIA', 'VALOR (MZN)'] // Cabeçalhos da tabela
        ];
        
        // Adicionar itens
        lists[currentList].items.forEach(item => {
            excelData.push([
                item.position,
                item.name,
                item.category || 'Sem categoria',
                item.value
            ]);
        });
        
        // Linha vazia
        excelData.push([]);
        
        // Totais
        const total = lists[currentList].items.reduce((sum, item) => sum + item.value, 0);
        excelData.push(['', '', 'TOTAL:', total]);
        
        if (lists[currentList].budget > 0) {
            const saldo = lists[currentList].budget - total;
            excelData.push(['', '', 'ORÇAMENTO:', lists[currentList].budget]);
            excelData.push(['', '', 'SALDO:', saldo]);
            
            // Status do orçamento
            const status = saldo >= 0 ? 'DENTRO DO ORÇAMENTO' : 'ORÇAMENTO EXCEDIDO';
            excelData.push(['', '', 'STATUS:', status]);
        }
        
        // Criar worksheet
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        
        // ==================== FORMATAÇÃO ====================
        
        // Definir larguras das colunas
        if (!ws['!cols']) ws['!cols'] = [];
        ws['!cols'][0] = { width: 12 }; // Posição
        ws['!cols'][1] = { width: 30 }; // Nome
        ws['!cols'][2] = { width: 20 }; // Categoria  
        ws['!cols'][3] = { width: 15 }; // Valor
        
        // Definir estilos
        const styles = {
            // Título principal
            'A1': { 
                s: { 
                    font: { bold: true, sz: 16, color: { rgb: "2C3E50" } },
                    fill: { fgColor: { rgb: "3498DB" } }
                } 
            },
            
            // Informações da lista
            'A2': { s: { font: { bold: true, sz: 12 } } },
            'A3': { s: { font: { bold: true, sz: 12 } } },
            
            // Cabeçalhos da tabela (linha 5)
            'A5': { s: { 
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "2C3E50" } },
                alignment: { horizontal: "center" }
            }},
            'B5': { s: { 
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "2C3E50" } }
            }},
            'C5': { s: { 
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "2C3E50" } }
            }},
            'D5': { s: { 
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "2C3E50" } },
                alignment: { horizontal: "right" }
            }}
        };
        
        // Aplicar estilos às células
        Object.keys(styles).forEach(cell => {
            if (!ws[cell]) ws[cell] = { v: excelData[getRow(cell)][getCol(cell)] };
            ws[cell].s = styles[cell].s;
        });
        
        // Formatar células de valor (coluna D)
        const dataStartRow = 5; // Após cabeçalhos
        for (let i = dataStartRow; i < dataStartRow + lists[currentList].items.length; i++) {
            const cell = 'D' + (i + 1);
            if (ws[cell]) {
                ws[cell].z = '#,##0.00'; // Formato numérico
                ws[cell].s = { 
                    ...ws[cell].s,
                    numFmt: '#,##0.00',
                    alignment: { horizontal: "right" }
                };
            }
        }
        
        // Formatar células de total
        const totalRow = dataStartRow + lists[currentList].items.length + 2;
        ['D' + totalRow, 'D' + (totalRow + 1), 'D' + (totalRow + 2), 'D' + (totalRow + 3)].forEach(cell => {
            if (ws[cell]) {
                ws[cell].z = '#,##0.00';
                ws[cell].s = { 
                    font: { bold: true },
                    numFmt: '#,##0.00',
                    alignment: { horizontal: "right" },
                    fill: { fgColor: { rgb: "ECF0F1" } }
                };
            }
        });
        
        // Destacar status do orçamento
        if (lists[currentList].budget > 0) {
            const statusCell = 'D' + (totalRow + 3);
            if (ws[statusCell]) {
                const saldo = lists[currentList].budget - total;
                ws[statusCell].s = { 
                    ...ws[statusCell].s,
                    font: { 
                        bold: true, 
                        color: { rgb: saldo >= 0 ? "27AE60" : "E74C3C" } 
                    },
                    fill: { fgColor: { rgb: saldo >= 0 ? "D5F4E6" : "FADBD8" } }
                };
            }
        }
        
        // Adicionar worksheet ao workbook
        XLSX.utils.book_append_sheet(wb, ws, lists[currentList].name.substring(0, 31));
        
        // Gerar e salvar arquivo
        XLSX.writeFile(wb, `${lists[currentList].name.replace(/\s+/g, '_')}.xlsx`);
        showNotification('Excel exportado com formatação profissional!', 'success');
        
    } catch (error) {
        console.error('Erro ao exportar Excel:', error);
        showNotification('Erro ao exportar Excel.', 'error');
    }
}

// Funções auxiliares para formatação
function getRow(cell) {
    return parseInt(cell.match(/\d+/)[0]) - 1;
}

function getCol(cell) {
    return cell.charCodeAt(0) - 65;
}

// Exportação Excel para APK - COM FORMATAÇÃO
async function exportExcelNative() {
    try {
        if (typeof XLSX === 'undefined') {
            showNotification('Biblioteca Excel não carregada.', 'error');
            return;
        }
        
        // Criar workbook (mesmo código de formatação do browser)
        const wb = XLSX.utils.book_new();
        
        const excelData = [
            ['RELATÓRIO DE LISTA', '', '', ''],
            [`Lista: ${lists[currentList].name}`, '', '', ''],
            [`Data: ${new Date().toLocaleDateString('pt-BR')}`, '', '', ''],
            [],
            ['POSIÇÃO', 'NOME DO ITEM', 'CATEGORIA', 'VALOR (MZN)']
        ];
        
        lists[currentList].items.forEach(item => {
            excelData.push([
                item.position,
                item.name,
                item.category || 'Sem categoria',
                item.value
            ]);
        });
        
        excelData.push([]);
        
        const total = lists[currentList].items.reduce((sum, item) => sum + item.value, 0);
        excelData.push(['', '', 'TOTAL:', total]);
        
        if (lists[currentList].budget > 0) {
            const saldo = lists[currentList].budget - total;
            excelData.push(['', '', 'ORÇAMENTO:', lists[currentList].budget]);
            excelData.push(['', '', 'SALDO:', saldo]);
            excelData.push(['', '', 'STATUS:', saldo >= 0 ? 'DENTRO DO ORÇAMENTO' : 'ORÇAMENTO EXCEDIDO']);
        }
        
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        
        // Aplicar formatação (mesmo código do browser)
        if (!ws['!cols']) ws['!cols'] = [];
        ws['!cols'][0] = { width: 12 };
        ws['!cols'][1] = { width: 30 };
        ws['!cols'][2] = { width: 20 };
        ws['!cols'][3] = { width: 15 };
        
        XLSX.utils.book_append_sheet(wb, ws, lists[currentList].name.substring(0, 31));
        
        // Gerar blob do Excel
        const excelBlob = new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        
        const excelBase64 = await blobToBase64(excelBlob);
        const fileName = `${lists[currentList].name.replace(/\s+/g, '_')}_${new Date().getTime()}.xlsx`;
        
        // Salvar arquivo
        const { Filesystem } = Plugins;
        await Filesystem.writeFile({
            path: fileName,
            data: excelBase64,
            directory: Directory.Documents
        });
        
        // Compartilhar
        await Share.share({
            title: 'Exportar Excel',
            text: `Lista: ${lists[currentList].name}`,
            url: `file:///Documents/${fileName}`,
            dialogTitle: 'Salvar Excel'
        });
        
        showNotification('Excel formatado salvo e pronto para compartilhar!', 'success');
    } catch (error) {
        console.error('Erro ao exportar Excel no APK:', error);
        showNotification('Erro ao salvar Excel.', 'error');
    }
}

// Exportação Excel para APK
async function exportExcelNative() {
    try {
        if (typeof XLSX === 'undefined') {
            showNotification('Biblioteca Excel não carregada.', 'error');
            return;
        }
        
        const data = lists[currentList].items.map(item => ({
            'Posição': item.position,
            'Nome': item.name,
            'Categoria': item.category || 'Sem categoria',
            'Valor (MZN)': item.value
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, lists[currentList].name.substring(0, 31));
        
        const total = lists[currentList].items.reduce((sum, item) => sum + item.value, 0);
        XLSX.utils.sheet_add_aoa(worksheet, [['', '', 'TOTAL:', total]], { origin: -1 });
        
        // Gerar blob do Excel
        const excelBlob = new Blob([XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        
        const excelBase64 = await blobToBase64(excelBlob);
        const fileName = `${lists[currentList].name.replace(/\s+/g, '_')}_${Date.now()}.xlsx`;
        
        // Salvar arquivo
        const { Filesystem } = Plugins;
        await Filesystem.writeFile({
            path: fileName,
            data: excelBase64,
            directory: Directory.Documents
        });
        
        // Compartilhar
        await Share.share({
            title: 'Exportar Excel',
            text: `Lista: ${lists[currentList].name}`,
            url: `file:///Documents/${fileName}`,
            dialogTitle: 'Salvar Excel'
        });
        
        showNotification('Excel salvo e pronto para compartilhar!', 'success');
    } catch (error) {
        console.error('Erro ao exportar Excel no APK:', error);
        showNotification('Erro ao salvar Excel.', 'error');
    }
}

// Converter blob para base64
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Sistema de Backup para APK
async function exportBackup() {
    if (isRunningInApp()) {
        await exportBackupNative();
    } else {
        exportBackupBrowser();
    }
}

// Backup para Browser
function exportBackupBrowser() {
    const backupData = {
        lists: lists,
        categories: categories,
        version: '1.0',
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `backup_listas_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Backup exportado com sucesso!', 'success');
}

// Backup para APK
async function exportBackupNative() {
    const backupData = {
        lists: lists,
        categories: categories,
        version: '1.0',
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const fileName = `backup_listas_${new Date().toISOString().split('T')[0]}.json`;
    
    try {
        const { Filesystem } = Plugins;
        
        await Filesystem.writeFile({
            path: fileName,
            data: btoa(unescape(encodeURIComponent(dataStr))),
            directory: Directory.Documents,
            encoding: Encoding.UTF8
        });
        
        // Compartilhar arquivo
        await Share.share({
            title: 'Backup Listas',
            text: 'Backup da calculadora de listas',
            url: `file:///Documents/${fileName}`,
            dialogTitle: 'Salvar Backup'
        });
        
        showNotification('Backup salvo com sucesso!', 'success');
    } catch (error) {
        console.error('Erro backup APK:', error);
        showNotification('Erro ao salvar backup', 'error');
    }
}

// Importação de Backup
async function triggerBackupImport() {
    if (isRunningInApp()) {
        // Para APK, usar seletor de arquivos nativo
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = handleFileImport;
        input.click();
    } else {
        document.getElementById('importFile').click();
    }
}

// ==================== FIM DA SEÇÃO EXPORT/IMPORT ====================

function triggerImport() {
    document.getElementById('importFile').click();
}

// ==================== UI HELPERS ====================

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function showConfirmModal(title, message, confirmCallback) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    
    const modal = document.getElementById('confirmModal');
    modal.classList.add('active');
    
    const confirmBtn = document.getElementById('modalConfirm');
    const cancelBtn = document.getElementById('modalCancel');
    
    // Remover event listeners anteriores para evitar duplicação
    const newConfirmBtn = confirmBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    
    newConfirmBtn.addEventListener('click', function handleConfirm() {
        confirmCallback();
        hideModal();
    });
    
    newCancelBtn.addEventListener('click', hideModal);
}

function hideModal() {
    document.getElementById('confirmModal').classList.remove('active');
}

// Sistema de Notificações
function showNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${icons[type]}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Auto-remove após 5 segundos
    const autoRemove = setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        clearTimeout(autoRemove);
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('active');
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// ==================== RESPONSIVE EVENTS ====================

// Inicializar eventos de responsividade
function initResponsiveEvents() {
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Executar uma vez no carregamento
    handleOrientationChange();
    handleResize();
}

// Detectar mudanças de orientação
function handleOrientationChange() {
    if (window.innerHeight > window.innerWidth) {
        // Portrait
        document.body.classList.add('portrait');
        document.body.classList.remove('landscape');
    } else {
        // Landscape
        document.body.classList.add('landscape');
        document.body.classList.remove('portrait');
    }
    
    // Fechar sidebar em mobile quando em landscape
    if (window.innerWidth <= 768 && window.innerHeight < window.innerWidth) {
        document.getElementById('sidebar').classList.remove('active');
    }
}

// Detectar resize da janela
function handleResize() {
    // Fechar sidebar em mobile quando a tela for grande o suficiente
    if (window.innerWidth > 768) {
        document.getElementById('sidebar').classList.remove('active');
    }
}

// ==================== PWA FEATURES ====================

// ==================== PWA FEATURES ====================

// ==================== PWA FEATURES ====================

function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        // Usar caminho relativo para evitar problemas
        const swUrl = './sw.js';
        
        navigator.serviceWorker.register(swUrl)
            .then(registration => {
                console.log('SW registered successfully: ', registration);
                
                // Verificar se há atualizações
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('Nova versão do SW encontrada:', newWorker);
                });
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
                // Não mostrar erro para o usuário - app funciona sem SW
            });
    }
}

// Prevenir botão voltar
function preventBackButton() {
    let backButtonPressed = false;
    
    window.addEventListener('beforeunload', function(e) {
        if (!backButtonPressed) return;
        
        e.preventDefault();
        e.returnValue = '';
        showBackButtonModal();
    });
    
    window.addEventListener('popstate', function(e) {
        backButtonPressed = true;
        showBackButtonModal();
        history.pushState(null, null, window.location.href);
    });
    
    history.pushState(null, null, window.location.href);
}



// ==================== OFFLINE SUPPORT ====================

window.addEventListener('online', function() {
    showNotification('Conexão restaurada', 'success');
});

window.addEventListener('offline', function() {
    showNotification('Você está offline. Algumas funcionalidades podem não estar disponíveis.', 'warning');
});



// ==================== SISTEMA COMPLETO DE DOWNLOAD E UPDATE ====================

// Botão de Download Fixo
function addDownloadButton() {
    if (document.getElementById('downloadApkBtn')) return;

    const downloadBtn = document.createElement('button');
    downloadBtn.id = 'downloadApkBtn';
    downloadBtn.className = 'btn-download-fixed';
    downloadBtn.innerHTML = '<i class="fas fa-download"></i> 📱 Baixar APK';
    downloadBtn.onclick = function() {
        // Download direto
        showNotification('📥 Preparando download...', 'info');
        
        const url = 'https://github.com/infortecmov03/calculadora-listas/releases/latest/download/app-debug.apk';
        const link = document.createElement('a');
        link.href = url;
        link.download = 'calculadora-listas.apk';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => {
            showNotification('✅ Download iniciado!', 'success');
        }, 1000);
    };

    document.body.appendChild(downloadBtn);
}

// Update Checker Simplificado
class SimpleUpdateChecker {
    checkForUpdates() {
        console.log('🔍 Verificando atualizações...');
        // Implementação simples - pode expandir depois
    }
}

// Inicialização
function initUpdateSystems() {
    addDownloadButton();
    
    // Inicializar update checker se necessário
    if (typeof updateChecker === 'undefined') {
        window.updateChecker = new SimpleUpdateChecker();
    }
    
    // Verificar updates depois de um tempo
    setTimeout(() => {
        if (window.updateChecker && typeof window.updateChecker.checkForUpdates === 'function') {
            window.updateChecker.checkForUpdates();
        }
    }, 5000);
}

// Exportar para uso global
window.addDownloadButton = addDownloadButton;
window.initUpdateSystems = initUpdateSystems;
// ==================== GLOBAL EXPORTS ====================

// Exportar funções globais para uso no HTML
window.manageCategories = manageCategories;
window.removeItem = removeItem;
window.startEdit = startEdit;
window.confirmEdit = confirmEdit;
window.cancelEdit = cancelEdit;
window.deleteList = deleteList;
window.switchList = switchList;
window.toggleSidebar = toggleSidebar;
window.sortByName = sortByName;
window.sortByValue = sortByValue;

// Compatibilidade com versões anteriores
window.saveUserPreferences = saveDashboardPreference;