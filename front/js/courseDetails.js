document.addEventListener("DOMContentLoaded", () => {
    // Extrai o documentId da URL
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id'); 

    if (courseId) {
        loadCourseDetails(courseId); // Carrega os detalhes do curso
    } else {
        console.error("ID do curso não encontrado na URL.");
    }
});

async function loadCourseDetails(courseId) {
    console.log("ID do curso recebido:", courseId);

    try {
        const resposta = await fetch(`http://localhost:1337/api/courses`);
        if (!resposta.ok) {
            throw new Error(`Erro na requisição: ${resposta.status} ${resposta.statusText}`);
        }

        const data = await resposta.json();
        console.log("Dados recebidos da API:", data);

        
        if (!data || !data.data) {
            throw new Error("Dados da API inválidos ou vazios.");
        }

        
        const courseIdNumber = Number(courseId);

        // Encontra o curso com o ID correspondente
        const course = data.data.find(course => Number(course.id) === courseIdNumber);
        console.log("Curso encontrado:", course);

        if (!course) {
            throw new Error("Curso não encontrado.");
        }

        const response = await fetch(`http://localhost:1337/api/courses/${course.documentId}`);
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }

        const courseDetails = await response.json();
        console.log("Detalhes do curso:", courseDetails);

        // Preenche o título e a descrição do curso
        document.getElementById("course-title").textContent = courseDetails.data.Title;
        document.getElementById("course-description").textContent = courseDetails.data.Description;

        // Preenche os tópicos do curso
        const topicsList = document.getElementById("topics-list");
        topicsList.innerHTML = ""; 

        // Adiciona cada tópico à lista
        const topics = [
            courseDetails.data.TopicoA,
            courseDetails.data.TopicoB,
            courseDetails.data.TopicoC,
            courseDetails.data.TopicoD,
            courseDetails.data.TopicoE
        ];

        topics.forEach(topic => {
            if (topic) { 
                const topicItem = document.createElement("li");
                topicItem.textContent = topic;
                topicsList.appendChild(topicItem);
            }
        });

        // Se não houver tópicos, exibe uma mensagem
        if (topicsList.children.length === 0) {
            topicsList.innerHTML = "<li>Nenhum tópico disponível.</li>";
        }
    } catch (error) {
        console.error('Erro ao buscar detalhes do curso:', error);
        alert("Erro ao carregar detalhes do curso. Verifique o console para mais detalhes.");
    }
}