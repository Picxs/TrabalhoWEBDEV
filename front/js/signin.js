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

document.addEventListener("DOMContentLoaded", function () {
    const signupBtn = document.getElementById("signup-btn");
    const signinBtn = document.getElementById("signin-btn");
    const logoutBtn = document.getElementById("logout-btn");

    // Verifica se o usuário está logado
    const token = localStorage.getItem("token");

    if (token) {
        // Se o usuário estiver logado, oculta Sign up/Sign in e mostra Logout
        signupBtn.classList.add("hidden");
        signinBtn.classList.add("hidden");
        logoutBtn.classList.remove("hidden");
    } else {
        // Se não estiver logado, exibe os botões de Sign up/Sign in
        signupBtn.classList.remove("hidden");
        signinBtn.classList.remove("hidden");
        logoutBtn.classList.add("hidden");
    }

    // Função de logout
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("token");
        window.location.href = "index.html"; // Redireciona para a página inicial ou para onde você desejar
    });
});

