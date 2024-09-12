// Variables globales
let myChart;
let mySecondChart;

document.getElementById('sidebar-toggle').addEventListener('click', function() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('show');
});

document.querySelector(".theme-toggle").addEventListener("click", () => {
    toggleLocalStorage();
    toggleRootClass();
});

function toggleRootClass() {
    const current = document.documentElement.getAttribute('data-bs-theme');
    const inverted = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-bs-theme', inverted);
}

function toggleLocalStorage() {
    if (isLight()) {
        localStorage.removeItem("light");
    } else {
        localStorage.setItem("light", "set");
    }
}

function isLight() {
    return localStorage.getItem("light");
}

if (isLight()) {
    toggleRootClass();
}

const ctx = document.getElementById('myChart');
const ctx2 = document.getElementById('mySecondChart');
const form = document.getElementById('search-user');

form.addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('name').value;

    // Fetch user data
    fetch(`https://api.github.com/users/${username}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('User not found');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('profile-picture').src = data.avatar_url;
            document.getElementById('user-name').textContent = data.name || 'No name available';
            document.getElementById('bio').textContent = data.bio || 'No bio available';
            document.getElementById('github').textContent = data.html_url || 'No url available';
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('profile-picture').src = '';
            document.getElementById('user-name').textContent = 'User not found';
            document.getElementById('bio').textContent = 'Bio not found';
            document.getElementById('github').textContent = 'Url not found';
        });

    // Fetch repositories and languages
    fetch(`https://api.github.com/users/${username}/repos`)
        .then(response => response.json())
        .then(repos => {
            const languagePromises = repos.map(repo =>
                fetch(`https://api.github.com/repos/${username}/${repo.name}/languages`)
                    .then(response => response.json())
            );
            return Promise.all(languagePromises);
        })
        .then(languageData => {
            const allLanguages = {};

            languageData.forEach(languages => {
                for (const [language, bytes] of Object.entries(languages)) {
                    if (!allLanguages[language]) {
                        allLanguages[language] = 0;
                    }
                    allLanguages[language] += bytes;
                }
            });

            const labels = Object.keys(allLanguages);
            const dataLanguages = Object.values(allLanguages);

            // Ensure chart is visible
            if (ctx.style.display === 'none') {
                ctx.style.display = 'block';
            }

            // Destroy existing chart if it exists
            if (myChart) {
                myChart.destroy();
            }

            // Create new chart
            myChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Programming languages',
                        data: dataLanguages,
                        borderWidth: 1,
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF5733', '#C70039', '#900C3F'],
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    aspectRatio: 0.5,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(tooltipItem) {
                                    const label = tooltipItem.label || '';
                                    const value = tooltipItem.raw || '';
                                    return `${label}: ${value} bytes`;
                                }
                            }
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.error('Error:', error);
            // Optionally handle errors here
        });
});
