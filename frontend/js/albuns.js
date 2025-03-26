
let isFetching = false;

document.addEventListener('DOMContentLoaded', function() {
    const usernameElement = document.getElementById('username');
    const albunsSecao = document.querySelector('.albuns-secao');
    
    if (!checkAuth()) return;

    loadUserInfo();

    showLoadingState();

    fetchAlbuns();

    function checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    async function getUserInfo() {
        const API_BASE_URL = 'http://127.0.0.1:8000/api';
        const ERROR_MESSAGES = {
            noToken: 'Autenticação necessária. Por favor, faça login novamente.',
            noUserId: 'ID do usuário não encontrado.',
            apiError: 'Erro ao obter informações do usuário.'
        };
    
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showNotification(ERROR_MESSAGES.noToken, 'error');
                return;
            }
    
            const userId = localStorage.getItem('user');
            if (!userId) {
                showNotification(ERROR_MESSAGES.noUserId, 'error');
                return;
            }
    
            const response = await fetch(`${API_BASE_URL}/users/${userId}/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
    
            if (!response.ok) {
                const errorData = await parseErrorResponse(response);
                throw new Error(errorData.message || ERROR_MESSAGES.apiError);
            }
    
            const userData = await response.json();
            
            if (!userData || typeof userData !== 'object') {
                throw new Error('Dados do usuário inválidos');
            }
    
            console.debug('Informações do usuário obtidas:', userData);
            return userData;
    
        } catch (error) {
            console.error('Falha na obtenção dos dados:', error);
            showNotification(error.message || ERROR_MESSAGES.apiError, 'error');
            return;
        }
    }

    async function loadUserInfo() {
        const userData = await getUserInfo();
    
        if (userData) {
            const usernameElement = document.getElementById('username');
            if (usernameElement) {
                usernameElement.textContent = userData.name_photographer || 'Usuário';
            }
            
            return userData;
        }
    
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 500);
    }

    function showLoadingState() {
        albunsSecao.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Carregando seus álbuns...</span>
            </div>
        `;
    }

    async function fetchAlbuns() {
        if (isFetching) return;
        isFetching = true;
        
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch('http://127.0.0.1:8000/api/gallery/album/', {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }

            const albuns = await response.json();
            renderAlbuns(albuns);
        } catch (error) {
            console.error('Falha ao carregar álbuns:', error);
            showErrorState(error.message);
        } finally {
            isFetching = false;
        }
    }

    function renderAlbuns(albuns) {
        if (!albuns || albuns.length === 0) {
            showEmptyState();
            return;
        }

        albuns.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        albunsSecao.innerHTML = albuns.map(album => `
            <div class="album-card">
                <div class="album-info">
                    <h3>${album.name_album}</h3>
                    <p><i class="far fa-calendar-alt"></i> ${formatDate(album.created_at_album)}</p>
                    <p><i class="far fa-images"></i> ${album.photos_count || 0} fotos</p>
                    <a href="album.html?id=${album.id}" class="btn-view">
                        <i class="fas fa-eye"></i> Ver Álbum
                    </a>
                </div>
            </div>
        `).join('');
    }

    function formatDate(dateString) {
        if (!dateString) return 'Data não disponível';
        
        try {
            const options = { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return new Date(dateString).toLocaleDateString('pt-BR', options);
        } catch (e) {
            console.warn('Erro ao formatar data:', e);
            return dateString;
        }
    }

    function showEmptyState() {
        albunsSecao.innerHTML = `
            <div class="empty-state">
                <i class="far fa-folder-open"></i>
                <h3>Nenhum álbum encontrado</h3>
                <p>Você ainda não criou nenhum álbum</p>
                <a href="criarAlbum.html" class="btn-primary">
                    <i class="fas fa-plus"></i> Criar primeiro álbum
                </a>
            </div>
        `;
    }

    function showErrorState(message) {
        albunsSecao.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Ocorreu um erro</h3>
                <p>${message || 'Não foi possível carregar os álbuns'}</p>
                <button class="btn-retry">
                    <i class="fas fa-sync-alt"></i> Tentar novamente
                </button>
            </div>
        `;

        document.querySelector('.btn-retry')?.addEventListener('click', fetchAlbuns);
    }
});