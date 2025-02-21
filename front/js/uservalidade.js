document.addEventListener("DOMContentLoaded", async function () {
    const signupBtn = document.querySelector(".signup-btn");
    const signinBtn = document.querySelector(".signin-btn");
    const logoutBtn = document.querySelector(".logout-btn");

    let logoutModal = document.getElementById("logout-modal");

    // Criar e adicionar o modal ao body (se ainda não existir)
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
    } else {
        signupBtn.classList.remove("hidden");
        signinBtn.classList.remove("hidden");
        logoutBtn.classList.add("hidden");
    }

    // Evento para abrir o modal
    logoutBtn.addEventListener("click", function (event) {
        event.preventDefault();
        logoutModal.classList.remove("hidden"); // Exibe o modal
    });

    // Se o usuário confirmar, faz o logout
    confirmLogoutBtn.addEventListener("click", function (event) {
        event.preventDefault(); // Evita que a página recarregue
        localStorage.removeItem("token");
        window.location.href = "index.html"; // Redireciona para a página inicial
    });

    // Se o usuário cancelar, apenas fecha o modal
    cancelLogoutBtn.addEventListener("click", function (event) {
        event.preventDefault();
        logoutModal.classList.add("hidden"); // Esconde o modal
    });
});

async function checkUserLoggedIn() {
    const token = localStorage.getItem("token");

    if (!token) return null;

    try {
        const response = await fetch("http://localhost:1337/api/users/me", {
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
