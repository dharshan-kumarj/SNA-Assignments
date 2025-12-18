const API_URL = '/api/students';

// DOM Elements
const studentGrid = document.getElementById('student-grid');
const modal = document.getElementById('studentModal');
const studentForm = document.getElementById('studentForm');
const modalTitle = document.getElementById('modalTitle');
const studentIdInput = document.getElementById('studentId');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const courseInput = document.getElementById('course');
const ageInput = document.getElementById('age');

// State
let isEditing = false;

// Fetch and Display Students
async function fetchStudents() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();
        renderStudents(result.data);
    } catch (error) {
        console.error('Error fetching students:', error);
        studentGrid.innerHTML = '<div class="empty-state">Failed to load data. Please try again later.</div>';
    }
}

function renderStudents(students) {
    studentGrid.innerHTML = '';

    if (students.length === 0) {
        studentGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No students found. Click "Add Student" to get started.</p>
            </div>
        `;
        return;
    }

    students.forEach(student => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${student.name}</h3>
            <p><i class="fas fa-envelope"></i> ${student.email}</p>
            <p><i class="fas fa-book"></i> ${student.course}</p>
            <p><i class="fas fa-birthday-cake"></i> ${student.age} Years Old</p>
            <div class="card-actions">
                <button class="btn-icon btn-edit" onclick="editStudent(${student.id}, '${student.name}', '${student.email}', '${student.course}', ${student.age})">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteStudent(${student.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        studentGrid.appendChild(card);
    });
}

// Open/Close Modal
function openModal() {
    modal.classList.add('active');
    if (!isEditing) {
        studentForm.reset();
        modalTitle.textContent = 'Add New Student';
        studentIdInput.value = '';
    }
}

function closeModal() {
    modal.classList.remove('active');
    isEditing = false;
    studentForm.reset();
}

// Edit Student - Pre-fill form
window.editStudent = (id, name, email, course, age) => {
    isEditing = true;
    studentIdInput.value = id;
    nameInput.value = name;
    emailInput.value = email;
    courseInput.value = course;
    ageInput.value = age;
    modalTitle.textContent = 'Edit Student';
    openModal();
};

// Handle Form Submit (Create or Update)
studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const studentData = {
        name: nameInput.value,
        email: emailInput.value,
        course: courseInput.value,
        age: ageInput.value
    };

    const id = studentIdInput.value;
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing ? `${API_URL}/${id}` : API_URL;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
        });

        const result = await response.json();

        if (response.ok) {
            closeModal();
            fetchStudents();
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error saving student:', error);
        alert('Failed to save student.');
    }
});

// Delete Student
window.deleteStudent = async (id) => {
    if (confirm('Are you sure you want to delete this student?')) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchStudents();
            } else {
                alert('Failed to delete student.');
            }
        } catch (error) {
            console.error('Error deleting student:', error);
        }
    }
};

// Initial Load
document.addEventListener('DOMContentLoaded', fetchStudents);
