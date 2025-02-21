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
    });

    // Função para carregar mensagens do chat
    async function loadMessages() {
        try {
            const response = await fetch('http://localhost:1337/api/chats?populate=*'); // Buscar todas as mensagens do chat
            const data = await response.json();


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
});

document.addEventListener("DOMContentLoaded", function () {
    // Obter o courseId a partir do nome do arquivo na URL
    const courseId = getCourseIdFromURL();

    if (courseId) {
        // Salvar o courseId no localStorage ao entrar na tela
        localStorage.setItem('courseId', courseId);
        console.log(`Course ID ${courseId} salvo no localStorage`);
    } else {
        console.error('Course ID não encontrado na URL.');
    }

    // Remover o courseId ao sair da tela
    window.addEventListener("beforeunload", function () {
        localStorage.removeItem('courseId');
        console.log("Course ID removido do localStorage");
    });
});

// Função para extrair o courseId da URL
function getCourseIdFromURL() {
    const path = window.location.pathname; // Captura o caminho completo da URL
    const regex = /course(\d+)\.html/; // Regex para capturar números após 'course' e antes de '.html'
    const match = path.match(regex);

    if (match && match[1]) {
        return match[1]; // Retorna o número do curso
    }
    return null; // Caso não encontre, retorna null
}



document.addEventListener("DOMContentLoaded", function () {
    const chatMessages = document.getElementById('chat-messages');

    // Carregar mensagens armazenadas no localStorage
    const savedMessages = JSON.parse(localStorage.getItem('messages')) || [];
    
    savedMessages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add(message.sender === 'user' ? 'user-message' : 'admin-response');
        messageDiv.textContent = message.text;
        chatMessages.appendChild(messageDiv);
    });

    forumForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const question = document.getElementById('question').value;

        // Obtém o token do localStorage
        const token = localStorage.getItem('token');

        if (!token) {
            alert('Você precisa estar logado para enviar uma mensagem.');
            return;
        }

        // Substitua pelos IDs reais do usuário e do curso
        const userId = localStorage.getItem('userId'); // ID do usuário logado, altere conforme necessário
        const courseId = localStorage.getItem('courseId');  // ID do curso, altere conforme necessário

        const data = {
            data: {
                Message: question,  // Nome do campo de mensagem no modelo Chat, verifique se é "message"
                course: {
                    connect: [{ id: courseId }]  // Conectar ao curso, o nome do campo pode variar (course em vez de Course)
                },
                users: {
                    connect: [{ id: userId }]  // Conectar ao usuário, o nome do campo pode variar (user em vez de User)
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

                // Salvar a mensagem do usuário no localStorage
                savedMessages.push({ text: question, sender: 'user' });

                // Simular a resposta do "admin"
                setTimeout(function () {
                    const adminResponseDiv = document.createElement('div');
                    adminResponseDiv.classList.add('admin-response');
                    adminResponseDiv.textContent = "Aqui está a resposta para sua dúvida!";
                    chatMessages.appendChild(adminResponseDiv);

                    // Salvar a resposta do admin no localStorage
                    savedMessages.push({ text: "Aqui está a resposta para sua dúvida!", sender: 'admin' });

                    // Rolar para o final para mostrar a resposta
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                    
                    // Atualizar o localStorage com as mensagens
                    localStorage.setItem('messages', JSON.stringify(savedMessages));
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




