document.addEventListener("DOMContentLoaded", async function () {
    const signupBtn = document.querySelector(".signup-btn");
    const signinBtn = document.querySelector(".signin-btn");
    const logoutBtn = document.querySelector(".logout-btn");
    const adminTextBtn = document.querySelector(".admin-text");
    const profileBtn = document.querySelector(".profile-btn"); 

    let logoutModal = document.getElementById("logout-modal");

    // Criar e adicionar o modal ao body
    if (!document.getElementById("logout-modal")) {
        const modalHTML = `
            <div id="logout-modal" class="modal hidden">
                <div class="modal-content">
                    <p>Tem certeza que deseja sair?</p>
                    <button id="confirm-logout">Sim</button>
                    <button id="cancel-logout">Não</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML("beforeend", modalHTML);
        logoutModal = document.getElementById("logout-modal");
    }
    logoutModal.classList.add("hidden");

    // Seleciona os elementos do modal
    const confirmLogoutBtn = document.getElementById("confirm-logout");
    const cancelLogoutBtn = document.getElementById("cancel-logout");

    // Verifica se o usuário está logado 
    const user = await checkUserLoggedIn();

    if (user) {
        signupBtn.classList.add("hidden");
        signinBtn.classList.add("hidden");
        logoutBtn.classList.remove("hidden");
        profileBtn.classList.remove("hidden");

        // Verifica se o usuário tem a role "Admin"
        if (user.role && user.role.name === "Admin") {
            adminTextBtn.classList.remove("hidden"); // Mostra o botão de Admin
        } else {
            adminTextBtn.classList.add("hidden"); // Oculta caso não seja admin
        }

        // Carrega os dados do perfil do usuário
        loadUserProfile(user);
    } else {
        signupBtn.classList.remove("hidden");
        signinBtn.classList.remove("hidden");
        logoutBtn.classList.add("hidden");
        profileBtn.classList.add("hidden"); 
        adminTextBtn.classList.add("hidden"); 
    }

    // Evento para abrir o modal de logout
    logoutBtn.addEventListener("click", function (event) {
        event.preventDefault();
        logoutModal.classList.remove("hidden");
    });

    // Se o usuário confirmar, faz o logout
    confirmLogoutBtn.addEventListener("click", function (event) {
        event.preventDefault();
        localStorage.removeItem("token");
        window.location.href = "index.html";
    });

    // Se o usuário cancelar, apenas fecha o modal
    cancelLogoutBtn.addEventListener("click", function (event) {
        event.preventDefault();
        logoutModal.classList.add("hidden");
    });

    // Evento para editar o nome
    const editNameBtn = document.getElementById("edit-name");
    if (editNameBtn) {
        editNameBtn.addEventListener("click", function () {
            openEditModal("name");
        });
    }

    // Evento para editar o email
    const editEmailBtn = document.getElementById("edit-email");
    if (editEmailBtn) {
        editEmailBtn.addEventListener("click", function () {
            openEditModal("email");
        });
    }

    // Evento para salvar o novo nome
    const saveNameBtn = document.getElementById("save-name");
    if (saveNameBtn) {
        saveNameBtn.addEventListener("click", async function () {
            const newName = document.getElementById("new-name").value;
            if (newName) {
                await updateProfileField(user.id, "username", newName);
                closeEditModal("name");
            }
        });
    }

    // Evento para salvar o novo email
    const saveEmailBtn = document.getElementById("save-email");
    if (saveEmailBtn) {
        saveEmailBtn.addEventListener("click", async function () {
            const newEmail = document.getElementById("new-email").value;
            if (newEmail) {
                await updateProfileField(user.id, "email", newEmail);
                closeEditModal("email");
            }
        });
    }

    // Evento para cancelar a edição do nome
    const cancelNameBtn = document.getElementById("cancel-name");
    if (cancelNameBtn) {
        cancelNameBtn.addEventListener("click", function () {
            closeEditModal("name");
        });
    }

    // Evento para cancelar a edição do email
    const cancelEmailBtn = document.getElementById("cancel-email");
    if (cancelEmailBtn) {
        cancelEmailBtn.addEventListener("click", function () {
            closeEditModal("email");
        });
    }

    // Evento para deletar a conta
    const deleteAccountBtn = document.getElementById("btn-delete-account");
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener("click", function (event) {
            event.preventDefault();
            openDeleteModal();
        });
    }

    // Evento para confirmar a exclusão da conta
    const confirmDeleteBtn = document.getElementById("confirm-delete");
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", async function (event) {
            event.preventDefault();
            await deleteAccount(user.id);
        });
    }

    // Evento para cancelar a exclusão da conta
    const cancelDeleteBtn = document.getElementById("cancel-delete");
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener("click", function (event) {
            event.preventDefault();
            closeDeleteModal();
        });
    }
});

// Função para carregar os dados do perfil do usuário
function loadUserProfile(user) {
    const nameDisplay = document.getElementById("name-display");
    const emailDisplay = document.getElementById("email-display");

    if (nameDisplay && emailDisplay) {
        nameDisplay.textContent = user.username || "No name provided";
        emailDisplay.textContent = user.email || "No email provided";
    }
}

// Função para abrir o modal de edição
function openEditModal(field) {
    const modal = document.getElementById(`edit-${field}-modal`);
    modal.classList.remove("hidden");
}

// Função para fechar o modal de edição
function closeEditModal(field) {
    const modal = document.getElementById(`edit-${field}-modal`);
    modal.classList.add("hidden");
}

// Função para atualizar um campo do perfil
async function updateProfileField(userId, field, value) {
    const token = localStorage.getItem("token");
    console.log(field)
    console.log(value)

    console.log(userId)
    const response = await fetch("http://localhost:1337/api/users");
        if (!response.ok) throw new Error("Erro ao buscar chats");

        const data = await response.json();
        console.log(data)
        const newluser = data.find(user => user.id === userId);
        console.log(newluser)

    try {
        const response = await fetch(`http://localhost:1337/api/users/${newluser.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                [field]: value
            })
        });

        if (!response.ok) throw new Error("Erro ao atualizar perfil");

        // Atualiza o valor exibido na tela
        const displayField = document.getElementById(`${field}-display`);
        if (displayField) {
            displayField.textContent = value;
        }

        alert("Perfil atualizado com sucesso!");
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        alert("Erro ao atualizar perfil. Tente novamente.");
    }
}

// Função para abrir o modal de confirmação de exclusão
function openDeleteModal() {
    const modal = document.getElementById("delete-modal");
    modal.classList.remove("hidden");
}

// Função para fechar o modal de confirmação de exclusão
function closeDeleteModal() {
    const modal = document.getElementById("delete-modal");
    modal.classList.add("hidden");
}

// Função para deletar a conta
async function deleteAccount(userId) {
    const token = localStorage.getItem("token");
    console.log(userId)
    const response = await fetch("http://localhost:1337/api/users");
        if (!response.ok) throw new Error("Erro ao buscar chats");

        const data = await response.json();
        const deluser = data.find(user => user.id === userId);
        console.log(deluser)

    try {
        const response = await fetch(`http://localhost:1337/api/users/${deluser.id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Erro ao deletar conta");

        localStorage.removeItem("token");
        alert("Conta deletada com sucesso!");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Erro ao deletar conta:", error);
        alert("Erro ao deletar conta. Tente novamente.");
    }
}

// Função para verificar se o usuário está logado
async function checkUserLoggedIn() {
    const token = localStorage.getItem("token");

    if (!token){
        console.log("o usuário n está logado")
        return null
    };

    try {
        const response = await fetch("http://localhost:1337/api/users/me?populate=role", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Token inválido ou expirado");

        return await response.json();
    } catch (error) {
        console.error("Erro ao verificar usuário:", error);
        localStorage.removeItem("token");
        return null;
    }
}