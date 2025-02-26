const forumIcon = document.getElementById('forum-icon');
const chatBox = document.getElementById('chat-box');
const closeChat = document.getElementById('close-chat');
const forumForm = document.getElementById('forum-form');
const chatMessages = document.getElementById('chat-messages');

// Verifica se o usuário está logado
document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem('token');

    // Se o token não existir, oculta o ícone de chat
    if (!token) {
        forumIcon.style.display = 'none'; // Oculta o ícone de chat se não estiver logado
        return;
    }

    // Se estiver logado, exibe o ícone de chat
    forumIcon.style.display = 'inline-block';

    // Mostrar a caixa de chat
    forumIcon.addEventListener('click', function () {
        if (chatBox.classList.contains('hidden')) {
            chatBox.style.display = 'flex'; 
            chatBox.classList.remove('hidden'); 
            loadMessages(); 
        } else if(chatBox.style.display == 'none'){
            chatBox.style.display = 'flex';
            loadMessages();
        }
        else {
            chatBox.style.display = 'none'; // Esconde o chat
            chatBox.classList.add('hidden'); 
        }
    });

    // Fechar a caixa de chat
    closeChat.addEventListener('click', function () {
        chatBox.style.display = 'none'; // Fecha o chat
    });
});

// Função para extrair o ID do curso da URL
function getCourseIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id'); 
    return courseId ? Number(courseId) : null; // Converte para número e retorna
}

async function loadMessages() {
    const token = localStorage.getItem("token");

    try {
        // Obtém o ID do curso da URL
        const courseId = getCourseIdFromURL();
        console.log(courseId)
        if (!courseId) {
            console.error("ID do curso não encontrado na URL.");
            return;
        }

        // Busca as mensagens vinculadas ao curso
        const response = await fetch(`http://localhost:1337/api/chats?filters[course][id][$eq]=${courseId}&populate=users`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`, 
            },
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Resposta da API:', data);

        // Limpar mensagens antigas
        chatMessages.innerHTML = "";

        // Verificar se a resposta contém dados
        if (data.data && data.data.length > 0) {
            const isAdmin = await checkIfUserIsAdmin(); // Verifica se o usuário é admin

            data.data.forEach((chat) => {
                const messageText = chat.Message || 'Mensagem não encontrada';
                const messageId = chat.id;

                // Criar um novo elemento de mensagem
                const messageDiv = document.createElement('div');
                messageDiv.classList.add('chat-message');
                messageDiv.setAttribute('data-message-id', messageId);

                // Criar o elemento para o texto da mensagem
                const messageTextSpan = document.createElement('span');
                messageTextSpan.classList.add('chat-message-text');
                messageTextSpan.textContent = `${messageText}`;

                // Adicionar botão de edição
                const editButton = document.createElement('button');
                editButton.classList.add('edit-message-btn');
                editButton.textContent = 'Editar';
                editButton.addEventListener('click', () => editMessage(messageId));

                // Adicionar botão de remoção
                if (isAdmin) {
                    const deleteButton = document.createElement('button');
                    deleteButton.classList.add('delete-message-btn');
                    deleteButton.textContent = 'Remover';
                    deleteButton.addEventListener('click', () => deleteMessage(messageId));
                    messageDiv.appendChild(deleteButton);
                }

                // Adiciona a mensagem ao chat
                messageDiv.appendChild(messageTextSpan);
                messageDiv.appendChild(editButton);
                chatMessages.appendChild(messageDiv);
            });
        } else {
            console.log('Não há mensagens para exibir.');
        }

        // Rolar para o final do chat
        chatMessages.scrollTop = chatMessages.scrollHeight;

    } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
    }
}

async function deleteMessage(messageId) {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Você precisa estar logado para remover uma mensagem.');
        return;
    }

    const confirmDelete = confirm('Tem certeza que deseja remover esta mensagem?');
    if (!confirmDelete) return;

    const response = await fetch(`http://localhost:1337/api/chats`);
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const message = data.data.find(message => message.id === Number(messageId));
        console.log(message)

    try {
        const response = await fetch(`http://localhost:1337/api/chats/${message.documentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Erro ao remover a mensagem');
        }

        console.log('Mensagem removida com sucesso!');
        loadMessages(); 
    } catch (error) {
        console.error('Erro ao remover a mensagem:', error);
    }
}

async function editMessage(messageId) {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Você precisa estar logado para editar uma mensagem.');
        return;
    }

    const newMessage = prompt('Edite sua mensagem:');
    if (!newMessage) return;
    const response = await fetch(`http://localhost:1337/api/chats`);
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const message = data.data.find(message => message.id === Number(messageId));
        console.log(message)
    try {
        const response = await fetch(`http://localhost:1337/api/chats/${message.documentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                data: {
                    Message: newMessage,
                },
            }),
        });

        if (!response.ok) {
            throw new Error('Erro ao editar a mensagem');
        }

        console.log('Mensagem editada com sucesso!');
        loadMessages(); 
    } catch (error) {
        console.error('Erro ao editar a mensagem:', error);
    }
}

async function checkIfUserIsAdmin() {
    const token = localStorage.getItem('token');

    if (!token) return false;

    try {
        const response = await fetch('http://localhost:1337/api/users/me?populate=role', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) throw new Error('Token inválido ou expirado');

        const user = await response.json();
        return user.role && user.role.name === 'Admin';
    } catch (error) {
        console.error('Erro ao verificar usuário:', error);
        localStorage.removeItem('token');
        return false;
    }
}

forumForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const question = document.getElementById('question').value;

    // Obtém o token do localStorage
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Você precisa estar logado para enviar uma mensagem.');
        return;
    }

    // Obtém o ID do curso da URL
    const courseId = getCourseIdFromURL();

    const userId = localStorage.getItem('userId'); 
    console.log("ID do usuário:", userId);


    const dados = {
        data: {
            Message: question,
            course: {
                id: courseId - 1
            },
            users: {
                id: userId 
            },
        }
    };

    try {
        // Envia a mensagem para o Strapi
        const response = await fetch('http://localhost:1337/api/chats', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(dados),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erro ao enviar a mensagem:', errorData);
            throw new Error('Erro ao enviar a mensagem');
        }

        const responseData = await response.json();
        console.log('Mensagem enviada com sucesso:', responseData);

        // Exibir a dúvida do usuário na tela
        const userMessageDiv = document.createElement('div');
        userMessageDiv.classList.add('user-message');
        userMessageDiv.textContent = `${question}`;
        chatMessages.appendChild(userMessageDiv);

        // Simular a resposta do "admin"
        setTimeout(function () {
            const adminResponseDiv = document.createElement('div');
            adminResponseDiv.classList.add('admin-response');
            adminResponseDiv.textContent = "Admin: Aqui está a resposta para sua dúvida!";
            chatMessages.appendChild(adminResponseDiv);

            // Rolar para o final para mostrar a resposta
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 2000);

        // Limpar o campo de dúvida
        document.getElementById('question').value = '';
    } catch (error) {
        console.error('Erro ao enviar a mensagem:', error);
        alert('Erro ao enviar a mensagem. Verifique o console para mais detalhes.');
    }
});