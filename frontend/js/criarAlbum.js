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

    function loadUserInfo() {
        const user = localStorage.getItem('user');
        if (user) {
            document.getElementById('username').textContent = user;
        }
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

    // function handleAlbumSubmit(event) {
    //     event.preventDefault();
        
    //     const nomeAlbum = document.getElementById('album-nome').value.trim();
    //     const idUser = localStorage.getItem('user');
        
    //     console.log("Dados enviados:", JSON.stringify({
    //         name_album: nomeAlbum,
    //         photographer: Number(idUser)
    //     })); // 🔍 Verifica o envio
    
    //     fetch('http://127.0.0.1:8000/api/gallery/album/', {
    //         method: "POST",
    //         headers: {
    //             "Accept": "application/json",
    //             "Content-Type": "application/json"
    //         },
    //         body: JSON.stringify({
    //             name_album: nomeAlbum,
    //             photographer: Number(idUser)
    //         })
    //     })
    //     .then(response => {
    //         // Log da resposta bruta do servidor
    //         console.log("Resposta bruta do servidor:", response);
    
    //         // Verificar se a resposta foi bem-sucedida
    //         if (!response.ok) {
    //             throw new Error('Erro ao enviar dados');
    //         }
    //         return response.json();
    //     })
    //     .then(data => {
    //         // Verificando o conteúdo da resposta convertida
    //         console.log("Resposta do servidor:", data);
            
    //         // Exemplo de acesso aos campos retornados
    //         if (data.name_album) {
    //             console.log("Nome do Álbum:", data.name_album);
    //         }
    //         if (data.photographer) {
    //             console.log("ID do Fotógrafo:", data.photographer);
    //         }
    //     })
    //     .catch(error => console.error("Erro ao criar álbum:", error));
    // }
    

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
