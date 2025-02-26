document.addEventListener("DOMContentLoaded", () => {
    loadCourses();
});

// Carregar cursos sem botões de edição e remoção
async function loadCourses() {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch('http://localhost:1337/api/courses', {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);

        // Verifique se os dados estão no formato esperado
        if (!data || !data.data) {
            throw new Error("Dados da API inválidos ou vazios.");
        }

        const coursesContainer = document.getElementById('courses-container');
        if (!coursesContainer) {
            console.error("Elemento 'courses-container' não encontrado.");
            return;
        }

        coursesContainer.innerHTML = '';  

        for (const course of data.data) {
            const courseElement = document.createElement('div');
            courseElement.classList.add('course-item');
            courseElement.innerHTML = `
                <h3>${course.Title}</h3>
                <p>${course.Description}</p>
                <a href="course.html?id=${course.id}" class="btn-enroll">Comece a Aprender</a>
            `;
            coursesContainer.appendChild(courseElement);
        }
    } catch (error) {
        console.error('Erro ao buscar cursos:', error);
        alert("Erro ao carregar cursos. Verifique o console para mais detalhes.");
    }
}