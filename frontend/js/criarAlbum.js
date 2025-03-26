document.addEventListener('DOMContentLoaded', function () {
    // Elementos do DOM
    const albumForm = document.getElementById('albumForm');
    const uploadArea = document.getElementById('uploadArea');
    const imagePreview = document.getElementById('image-preview');
    const fileInput = document.getElementById('ipt-album');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const feedbackModal = new bootstrap.Modal(document.getElementById('feedbackModal'));

    let selectedFiles = [];
    let albumId = null;
    
    initEventListeners();
    loadUserInfo();

    function initEventListeners() {
        albumForm.addEventListener('submit', handleAlbumSubmit);
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileSelect);
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
        document.getElementById('btn-cancelar').addEventListener('click', resetForm);
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

    function handleFileSelect(event) {
        processFiles(event.target.files);
    }

    function handleDragOver(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    }

    function handleDrop(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        processFiles(e.dataTransfer.files);
    }

    function processFiles(files) {
        selectedFiles = Array.from(files);
        updateImagePreview();
    }

    function updateImagePreview() {
        imagePreview.innerHTML = '';
        if (selectedFiles.length === 0) {
            imagePreview.classList.remove('has-images');
            return;
        }
        imagePreview.classList.add('has-images');

        selectedFiles.forEach((file, index) => {
            if (!file.type.startsWith('image/')) return;
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';

            const img = document.createElement('img');
            img.alt = `Preview ${file.name}`;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '&times;';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeImage(index);
            });

            const fileInfo = document.createElement('div');
            fileInfo.className = 'preview-info';
            fileInfo.textContent = `${file.name} (${formatFileSize(file.size)})`;

            const reader = new FileReader();
            reader.onload = (e) => (img.src = e.target.result);
            reader.readAsDataURL(file);

            previewItem.appendChild(img);
            previewItem.appendChild(removeBtn);
            previewItem.appendChild(fileInfo);
            imagePreview.appendChild(previewItem);
        });
    }

    function removeImage(index) {
        selectedFiles.splice(index, 1);
        updateImagePreview();
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async function handleAlbumSubmit(e) {
        e.preventDefault();
        console.log('Iniciando submit...');

        const nomeAlbum = document.getElementById('album-nome').value.trim();
        if (!nomeAlbum) {
            alert('Por favor, insira um nome para o álbum.');
            return;
        }

        if (selectedFiles.length === 0) {
            alert('Nenhuma imagem selecionada!');
            return;
        }

        showLoading(true);

        try {
            console.log('Criando álbum...');
            albumId = await createAlbum(nomeAlbum);
            console.log('Álbum criado com ID:', albumId);

            console.log('Iniciando upload de fotos...');
            await uploadPhotos(albumId);

            console.log('Upload concluído com sucesso!');
            showFeedback('Sucesso', 'Álbum criado com sucesso!', true);
        } catch (error) {
            console.error('Erro:', error);
            showFeedback('Erro', error.message);
        } finally {
            showLoading(false);
        }
    } 

    async function createAlbum(nomeAlbum) {
        try {
            const token = localStorage.getItem('token');
            const idUser = localStorage.getItem('user');
    
            if (!token || !idUser) {
                throw new Error('Usuário não autenticado.');
            }
    
            const response = await fetch("http://127.0.0.1:8000/api/gallery/album/", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`
                },
                body: JSON.stringify({
                    name_album: nomeAlbum,
                    photographer: Number(idUser)
                })
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ${response.status}: ${errorText}`);
            }
    
            const data = await response.json();
            return data.id;
        } catch (error) {
            console.error('Erro detalhado:', error);
            throw new Error(`Falha na comunicação com o servidor: ${error.message}`);
        }
    }

    async function uploadPhotos(albumId) {
        const token = localStorage.getItem('token');
    
        if (!albumId) {
            console.error("Erro: ID do álbum não encontrado.");
            return;
        }
    
        for (let file of selectedFiles) {
            if (!file.type.startsWith('image/')) {
                console.warn(`Arquivo ignorado: ${file.name} (não é uma imagem)`);
                continue;
            }
    
            const formData = new FormData();
            formData.append('album', albumId);
            formData.append('image', file);
    
            try {
                console.log(`Enviando ${file.name}...`);
                
                const response = await fetch("http://127.0.0.1:8000/api/gallery/photos/", {
                    method: "POST",
                    headers: {
                        "Authorization": `Token ${token}`
                    },
                    body: formData
                });
    
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Erro ${response.status}: ${errorText}`);
                }
    
                console.log(`Imagem ${file.name} enviada com sucesso!`);
            } catch (error) {
                console.error(`Erro ao enviar ${file.name}:`, error);
            }
        }
    }
    

    function showLoading(isLoading) {
        loadingOverlay.style.display = isLoading ? 'flex' : 'none';
    }

    function showFeedback(title, message, success = false) {
        document.getElementById('feedbackTitle').textContent = title;
        document.getElementById('feedbackMessage').textContent = message;
        feedbackModal.show();
        if (success) {
            resetForm();
        }
    }

    function resetForm() {
        document.getElementById('album-nome').value = '';
        fileInput.value = '';
        selectedFiles = [];
        updateImagePreview();
    }
});
