const forumIcon = document.getElementById('forum-icon');
const chatBox = document.getElementById('chat-box');
const closeChat = document.getElementById('close-chat');
const forumForm = document.getElementById('forum-form');
const chatMessages = document.getElementById('chat-messages');

// Mostrar a caixa de chat
forumIcon.addEventListener('click', function () {
    chatBox.style.display = 'flex';
    loadMessages(); // Carregar mensagens ao abrir o chat
});

// Fechar a caixa de chat
closeChat.addEventListener('click', function () {
    chatBox.style.display = 'none';
});

// Função para carregar mensagens do chat
async function loadMessages() {
    try {
        const response = await fetch('http://localhost:1337/api/chats?populate=*'); // Buscar todas as mensagens do chat
        const data = await response.json();

        // Limpar mensagens antigas
        chatMessages.innerHTML = '';

        // Exibir as mensagens do chat
        data.data.forEach(chat => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add(chat.attributes.user.data ? 'user-message' : 'admin-response');
            messageDiv.textContent = chat.attributes.mensagem;
            chatMessages.appendChild(messageDiv);
        });

        // Rolar para o final para mostrar as novas mensagens
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
    }
}


document.addEventListener("DOMContentLoaded", function () {
    // Captura o formulário de envio de mensagem
    forumForm.addEventListener('submit', function (event) {
        event.preventDefault();
        
        const question = document.getElementById('question').value;
        
        // Obtém o token do localStorage
        const token = localStorage.getItem('token');

        if (!token) {
            alert('Você precisa estar logado para enviar uma mensagem.');
            return;
        }

        // Enviar a dúvida para o Strapi
        const data = {
            data: { // Aqui usamos o campo "data" que o Strapi espera
                Message: question, // O campo de mensagem
                Course: 1, // O ID do curso (substitua com o ID correto do curso)
                users: 1, // O ID do usuário (substitua com o ID do usuário logado)
            }
        };

        fetch('http://localhost:1337/api/chats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Adiciona o token de autenticação
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Erro ao enviar a mensagem:', data.error.message);
            } else {
                console.log('Mensagem enviada com sucesso:', data);
                // Exibir a dúvida do usuário na tela
                const userMessageDiv = document.createElement('div');
                userMessageDiv.classList.add('user-message');
                userMessageDiv.textContent = question;
                chatMessages.appendChild(userMessageDiv);

                // Simular a resposta do "admin"
                setTimeout(function () {
                    const adminResponseDiv = document.createElement('div');
                    adminResponseDiv.classList.add('admin-response');
                    adminResponseDiv.textContent = "Aqui está a resposta para sua dúvida!";
                    chatMessages.appendChild(adminResponseDiv);

                    // Rolar para o final para mostrar a resposta
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 2000);

                // Limpar o campo de dúvida
                document.getElementById('question').value = '';
            }
        })
        .catch((error) => {
            console.error('Erro ao enviar a mensagem:', error);
        });
    });
});

