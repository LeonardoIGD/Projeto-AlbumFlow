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
            redirectToLogin();
            return;
        }

        const userId = localStorage.getItem('user');
        if (!userId) {
            showNotification(ERROR_MESSAGES.noUserId, 'error');
            redirectToLogin();
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
        redirectToLogin();
        return;
    }
}

async function parseErrorResponse(response) {
    try {
        return await response.json();
    } catch {
        return { 
            message: `Erro ${response.status}: ${response.statusText}`
        };
    }
}

function showNotification(message, type = 'info') {
    // Implementação de notificação visual pode ser adicionada aqui
    console[type](message);
    alert(message); // Temporário - substituir por um sistema de notificação bonito
}

function redirectToLogin() {
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

async function updateProfileForm(userData) {
    if (!userData) return;

    console.log(userData)

    // Atualizar informações do cabeçalho
    document.querySelector('.username').textContent = userData.name_photographer || 'Usuário';
    document.querySelector('.profile-name').textContent = userData.name_photographer || 'Usuário';

    // Preencher formulário
    document.getElementById('username').value = userData.username || '...';
    document.getElementById('email').value = userData.email || '...';
    document.getElementById('phone').value = userData.phone || '...';
    document.getElementById('company').value = userData.name_company || '...';

    // Se houver foto de perfil, atualizar
    if (userData.profile_picture) {
        document.getElementById('profile-pic').src = userData.profile_picture;
    }
}

function setupEventListeners() {
    // Mostrar/ocultar senha
    document.querySelector('.show-password').addEventListener('click', function() {
        const passwordInput = document.getElementById('password');
        const icon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });

    // Botão de alterar senha
    document.querySelector('.change-password-btn').addEventListener('click', function() {
        // Implementar lógica para alteração de senha
        showNotification('Funcionalidade de alteração de senha será implementada aqui', 'info');
    });

    // Botão cancelar
    document.querySelector('.cancel-btn').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.reload();
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    const userData = await getUserInfo();
    if (userData) {
        updateProfileForm(userData);
        setupEventListeners();
    }
});

// Logout
document.querySelector('.logout .nav-link').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
});