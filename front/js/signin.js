document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".signup-form").addEventListener("submit", async function (e) {
        e.preventDefault(); // Impede o envio padrão do formulário

        let email = document.getElementById("email").value;
        let senha = document.getElementById("password").value;

        try {
            let response = await fetch("http://localhost:1337/api/auth/local", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    identifier: email,
                    password: senha
                })
            });

            let data = await response.json();

            if (response.ok) {
                alert("Login realizado com sucesso!");
                localStorage.setItem("token", data.jwt); // Salva o token para futuras requisições
                const userId = data.user.id;
                localStorage.setItem('userId', userId);
                window.location.href = "courses.html"; // Redireciona para a página de cursos
            } else {
                alert("Erro no login: " + (data.message || "Tente novamente mais tarde."));
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Ocorreu um erro ao fazer login. Tente novamente.");
        }
    });
});

document.addEventListener("DOMContentLoaded", async function () {
    const signupBtn = document.querySelector(".signup-btn");
    const signinBtn = document.querySelector(".signin-btn");
    const logoutBtn = document.querySelector(".logout-btn");

    if (!signupBtn || !signinBtn || !logoutBtn) {
        console.error("Erro: Um ou mais botões não foram encontrados.");
        return;
    }

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

    logoutBtn.addEventListener("click", function (event) {
        event.preventDefault();
        localStorage.removeItem("token");
        window.location.reload();
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
