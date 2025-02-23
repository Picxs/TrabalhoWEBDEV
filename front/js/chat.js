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
        return; // Não permite que o usuário interaja com o chat
    }

    // Se estiver logado, exibe o ícone de chat
    forumIcon.style.display = 'inline-block';

    // Mostrar a caixa de chat
    forumIcon.addEventListener('click', function () {
        if (chatBox.classList.contains('hidden') || chatBox.style.display === 'none' || chatBox.style.display === '') {
            chatBox.style.display = 'flex'; // Exibe o chat
            chatBox.classList.remove('hidden'); // Remove a classe hidden
            loadMessages(); // Carregar mensagens ao abrir o chat
        } else {
            chatBox.style.display = 'none'; // Esconde o chat
            chatBox.classList.add('hidden'); // Adiciona a classe hidden para garantir que o chat permaneça oculto
        }
    });

    // Fechar a caixa de chat
    closeChat.addEventListener('click', function () {
        chatBox.style.display = 'none'; // Fecha o chat
    })
});

// Função para extrair o slug do curso na URL
function getCourseSlugFromURL() {
    const path = window.location.pathname; // Captura o caminho completo da URL
    const regex = /\/html\/([a-z0-9\-]+)\.html$/; // Regex para capturar o slug após '/html/' e antes de '.html'
    const match = path.match(regex);

    if (match && match[1]) {
        return match[1]; // Retorna o slug do curso
    }
    return null; // Caso não encontre, retorna null
}


// Função para carregar as mensagens
async function loadMessages() {
    try {
        const response = await fetch('http://localhost:1337/api/chats?populate=course');
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
                messageTextSpan.textContent = messageText;

                // Adicionar botão de edição (para todos os usuários logados)
                const editButton = document.createElement('button');
                editButton.classList.add('edit-message-btn');
                editButton.textContent = 'Editar';
                editButton.addEventListener('click', () => editMessage(messageId));

                // Adicionar botão de remoção (apenas para admin)
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

        // Rolar a tela para a última mensagem
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

    const response = await fetch("http://localhost:1337/api/chats");
        if (!response.ok) throw new Error("Erro ao buscar chats");

        const data = await response.json();
        const message = data.data.find(message => message.id === messageId);
        if (!data || !data.data) {
            console.error("Dados da API inválidos.");
            return;
        }

    const confirmDelete = confirm('Tem certeza que deseja remover esta mensagem?');
    if (!confirmDelete) return;

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
        loadMessages(); // Recarrega as mensagens após a remoção
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

    const response = await fetch("http://localhost:1337/api/chats");
        if (!response.ok) throw new Error("Erro ao buscar chats");

        const data = await response.json();
        const chat = data.data.find(chat => chat.id === messageId);
        if (!data || !data.data) {
            console.error("Dados da API inválidos.");
            return;
        }


    try {

        const response = await fetch(`http://localhost:1337/api/chats/${chat.documentId}`, {
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
        loadMessages(); // Recarrega as mensagens após a edição
    } catch (error) {
        console.error('Erro ao editar a mensagem:', error);
    }
}

// Função para extrair o courseId da URL
document.addEventListener("DOMContentLoaded", function () {
    const courseSlug = getCourseSlugFromURL();

    if (courseSlug) {
        // Salvar o slug no localStorage ao entrar na tela
        localStorage.setItem('courseSlug', courseSlug);
        console.log(`Slug do curso ${courseSlug} salvo no localStorage`);
    } else {
        console.error('Slug do curso não encontrado na URL.');
    }

    // Remover o courseSlug ao sair da tela
    window.addEventListener("beforeunload", function () {
        localStorage.removeItem('courseSlug');
        console.log("Slug do curso removido do localStorage");
    });
});

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



// Função para pegar o ID do curso a partir do slug
async function getCourseIdBySlug(courseSlug) {
    const response = await fetch(`http://localhost:1337/api/courses?filters[slug][$eq]=${courseSlug}`);
    const data = await response.json();
    console.log(data)
    
    if (data.data && data.data.length > 0) {
        return data.data[0].id; // Retorna o ID do curso encontrado
    } else {
        console.error('Curso não encontrado.');
        return null;
    }
}

async function getCourseBySlug(slug) {
    try {
        const response = await fetch(`http://localhost:1337/api/courses?filters[slug][$eq]=${slug}`);
        const data = await response.json();

        if (data.data && data.data.length > 0) {
            return data.data[0]; // Retorna o primeiro curso encontrado
        } else {
            console.error('Curso não encontrado para o slug:', slug);
            return null;
        }
    } catch (error) {
        console.error('Erro ao buscar curso pelo slug:', error);
        return null;
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

    const slug = getCourseSlugFromURL();

    const userId = localStorage.getItem('userId'); // ID do usuário logado
    console.log(userId)
    const courseId = await getCourseBySlug(slug);  // ID do curso do localStorage 
    console.log(courseId)

    const data = {
        data: {
            Message: question,
            course: { 
                connect: [{ id: courseId.id - 1}]  // Relaciona o chat com o curso (um chat para um curso)
            },
            users: {
                connect: [{ id: userId }]  // Relaciona o chat com o usuário
            },
        }
    };
    fetch('http://localhost:1337/api/chats', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
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
