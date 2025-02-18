document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".signup-form").addEventListener("submit", async function (e) {
        e.preventDefault(); // Impede o envio padrão do formulário

        let nome = document.getElementById("name").value;
        let email = document.getElementById("email").value;
        let senha = document.getElementById("password").value;
        let confirmarSenha = document.getElementById("confirm-password").value;

        // Verificar se as senhas coincidem
        if (senha !== confirmarSenha) {
            alert("As senhas não coincidem!");
            return;
        }

        try {
            let response = await fetch("http://localhost:1337/api/auth/local/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: nome,
                    email: email,
                    password: senha
                })
            });

            let data = await response.json();

            if (response.ok) {
                alert("Cadastro realizado com sucesso!");
                localStorage.setItem("token", data.jwt); // Salva o token para login automático
                window.location.href = "courses.html"; // Redireciona para a página de cursos
            } else {
                alert("Erro no cadastro: " + (data.message || "Tente novamente mais tarde."));
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Ocorreu um erro ao cadastrar. Tente novamente.");
        }
    });
});
