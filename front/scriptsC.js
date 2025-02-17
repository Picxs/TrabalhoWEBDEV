const forumIcon = document.getElementById('forum-icon');
const chatBox = document.getElementById('chat-box');
const closeChat = document.getElementById('close-chat');
const forumForm = document.getElementById('forum-form');
const chatMessages = document.getElementById('chat-messages');

// Mostrar a caixa de chat
forumIcon.addEventListener('click', function () {
    chatBox.style.display = 'flex';
});

// Fechar a caixa de chat
closeChat.addEventListener('click', function () {
    chatBox.style.display = 'none';
});

forumForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const question = document.getElementById('question').value;

    // Exibir a dúvida do usuário na tela
    const userMessageDiv = document.createElement('div');
    userMessageDiv.classList.add('user-message');
    userMessageDiv.textContent = question;
    chatMessages.appendChild(userMessageDiv);

    //simular a resposta do "admin"
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
});
