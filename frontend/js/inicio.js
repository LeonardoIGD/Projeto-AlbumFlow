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
    console[type](message);
}

async function updateUserProfile() {
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

document.addEventListener('DOMContentLoaded', () => {
    updateUserProfile().catch(console.error);
    document.querySelector('.profile-btn')?.addEventListener('click', updateUserProfile);
});