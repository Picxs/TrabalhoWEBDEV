document.addEventListener("DOMContentLoaded", () => {
    loadCourses();
    checkAdminAccess(); // Verifica se o usuário é admin

    // Eventos dos modais
    document.getElementById('create-course-btn').addEventListener('click', () => {
        openModal('create-course-modal');
    });

    document.getElementById('cancel-create-course-btn').addEventListener('click', () => {
        closeModal('create-course-modal');
    });

    document.getElementById('save-course-btn').addEventListener('click', createCourse);

    document.getElementById('cancel-edit-course-btn').addEventListener('click', () => {
        closeModal('edit-course-modal');
    });

    document.getElementById('save-edit-course-btn').addEventListener('click', () => {
        const courseId = document.getElementById('edit-course-modal').dataset.courseId;
        updateCourse(courseId);
    });
});

// Função para abrir um modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Função para fechar um modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

async function loadCourses() {
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

        const isAdmin = await checkIfUserIsAdmin();

        const coursesContainer = document.getElementById('courses-container');
        if (!coursesContainer) {
            console.error("Elemento 'courses-container' não encontrado.");
            return;
        }

        coursesContainer.innerHTML = '';  // Limpa o container

        for (const course of data.data) {
            const courseElement = document.createElement('div');
            courseElement.classList.add('course-item');
            courseElement.innerHTML = `
                <h3>${course.Title}</h3>
                <p>${course.Description}</p>
                ${isAdmin ? `
                    <button onclick="openEditModalC(${course.id})" class="btn-edit">Editar</button>
                    <button onclick="deleteCourse(${course.id})" class="btn-delete">Remover</button>
                ` : ''}
                <a href="${course.slug}.html" class="btn-enroll">Comece a Aprender</a>
            `;
            coursesContainer.appendChild(courseElement);
        }
    } catch (error) {
        console.error('Erro ao buscar cursos:', error);
        alert("Erro ao carregar cursos. Verifique o console para mais detalhes.");
    }
}

// Abrir modal de edição
async function openEditModalC(courseId) {
    try {
        console.log(courseId)
        const response = await fetch(`http://localhost:1337/api/courses`);
        const data = await response.json();
        const course = data.data.find(course => course.id === courseId);

        if (!course) {
            alert("Curso não encontrado!");
            return;
        }

        // Preencher os campos do modal de edição
        document.getElementById("edit-course-title").value = course.Title;
        document.getElementById("edit-course-description").value = course.Description;

        // Armazenar o ID do curso no modal para uso posterior
        document.getElementById('edit-course-modal').dataset.courseId = courseId;

        // Abrir o modal de edição
        openModal('edit-course-modal');
    } catch (error) {
        console.error("Erro ao carregar dados do curso:", error);
    }
}

// Criar um novo curso
async function createCourse() {
    const Title = document.getElementById("course-title").value.trim();
    const Description = document.getElementById("course-description").value.trim();
    const token = localStorage.getItem("token");

    if (!Title || !Description) {
        alert("Preencha todos os campos!");
        return;
    }

    const slug = generateSlug(Title);

    try {
        const courseData = {
            data: {
                Title,
                Description,
                slug
            }
        };

        console.log("Dados enviados:", courseData); // Depuração

        const response = await fetch("http://localhost:1337/api/courses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(courseData),
        });

        if (!response.ok) {
            const errorData = await response.json(); // Captura o erro retornado pela API
            console.error("Erro detalhado:", errorData); // Depuração
            throw new Error("Erro ao criar curso");
        }

        alert("Curso criado com sucesso!");
        closeModal('create-course-modal');
        loadCourses();
    } catch (error) {
        console.error("Erro ao salvar curso:", error);
        alert("Erro ao criar curso. Verifique o console para mais detalhes.");
    }
}

// Atualizar um curso existente
async function updateCourse(courseId) {
    const Title = document.getElementById("edit-course-title").value.trim();
    const Description = document.getElementById("edit-course-description").value.trim();
    const token = localStorage.getItem("token");

    try {
        // Buscar todos os cursos
        const response = await fetch("http://localhost:1337/api/courses");
        if (!response.ok) throw new Error("Erro ao buscar cursos");

        const data = await response.json();
        if (!data || !data.data) {
            console.error("Dados da API inválidos.");
            return;
        }

        const courses = data.data;

        // Verificar se a lista de cursos é válida
        if (!courses || !Array.isArray(courses)) {
            console.error("Lista de cursos inválida ou vazia.");
            return;
        }

        // Encontrar o curso com o ID correspondente
        const courseToUpdate = courses.find(course => course.id === Number(courseId));

        if (!courseToUpdate) {
            alert("Curso não encontrado!");
            return;
        }

        // Dados atualizados do curso
        const courseData = {
            data: {
                Title: Title || courseToUpdate.Title, // Mantém o valor antigo se o campo estiver vazio
                Description: Description || courseToUpdate.Description
            }
        };

        // Atualizar o curso no Strapi
        const updateResponse = await fetch(`http://localhost:1337/api/courses/${courseToUpdate.documentId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(courseData),
        });

        if (!updateResponse.ok) throw new Error("Erro ao atualizar curso");

        alert("Curso atualizado com sucesso!");
        closeModal('edit-course-modal');
        loadCourses(); // Recarrega a lista de cursos
    } catch (error) {
        console.error("Erro ao atualizar curso:", error);
    }
}

async function deleteCourse(courseId) {
    const token = localStorage.getItem("token");

    try {
        // Buscar todos os cursos
        const response = await fetch("http://localhost:1337/api/courses");
        if (!response.ok) throw new Error("Erro ao buscar cursos");

        const data = await response.json();
        const courses = data.data;

        // Encontrar o curso com o ID correspondente
        const courseToDelete = courses.find(course => course.id == courseId);

        if (!courseToDelete) {
            alert("Curso não encontrado!");
            return;
        }

        // Confirmar a exclusão com o usuário
        const confirmDelete = confirm(`Tem certeza que deseja excluir o curso "${courseToDelete.Title}"?`);
        if (!confirmDelete) return; // Se o usuário cancelar, não faz nada

        // Fazer a requisição DELETE para a API
        const deleteResponse = await fetch(`http://localhost:1337/api/courses/${courseToDelete.documentId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!deleteResponse.ok) throw new Error("Erro ao excluir curso");

        alert("Curso excluído com sucesso!");
        loadCourses(); // Recarrega a lista de cursos após a exclusão
    } catch (error) {
        console.error("Erro ao excluir curso:", error);
        alert("Erro ao excluir curso. Verifique o console para mais detalhes.");
    }
}

// Gerar slug a partir do título
function generateSlug(title) {
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

// Verificar se o usuário é admin
async function checkAdminAccess() {
    const isAdmin = await checkIfUserIsAdmin();
    if (isAdmin) {
        document.getElementById("admin-controls").classList.remove("hidden");
    }
}

// Verificar se o usuário é admin
async function checkIfUserIsAdmin() {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
        const response = await fetch("http://localhost:1337/api/users/me?populate=role", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Token inválido ou expirado");

        const user = await response.json();
        return user.role && user.role.name === "Admin";
    } catch (error) {
        console.error("Erro ao verificar usuário:", error);
        localStorage.removeItem("token");
        return false;
    }
}