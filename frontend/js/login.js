document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loading = document.getElementById('loading');
    
    document.getElementById('inpt-usuario').focus();
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('inpt-usuario').value.trim();
        const password = document.getElementById('inpt-senha').value;
        
        if (!username || !password) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        
        try {
            loading.style.display = 'flex';
            
            const response = await fetch('http://127.0.0.1:8000/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFTOKEN': getCsrfToken(),
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Erro ao fazer login');
            }
            
            if (data.status) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                
                setTimeout(() => {
                    window.location.href = 'inicio.html';
                }, 500);
            } else {
                throw new Error('Credenciais inválidas');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            alert(error.message || 'Erro ao tentar fazer login. Tente novamente.');
        } finally {
            loading.style.display = 'none';
        }
    });
    
    function getCsrfToken() {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        return cookieValue || '';
    }
});