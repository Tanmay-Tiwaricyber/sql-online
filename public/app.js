document.addEventListener('DOMContentLoaded', () => {
    const runQueryButton = document.getElementById('runQuery');
    const sqlQuery = document.getElementById('sqlQuery');
    const output = document.getElementById('output');
    const clearOutputButton = document.getElementById('clearOutput');
    const queryHistory = document.getElementById('queryHistory');
    const themeToggle = document.getElementById('themeToggle');

    // Function to run SQL query
    runQueryButton.addEventListener('click', async () => {
        const query = sqlQuery.value.trim();
        if (!query) return;

        try {
            const response = await fetch('/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });
            const result = await response.json();

            if (response.ok) {
                output.innerHTML = ''; // Clear previous output
                const table = document.createElement('table');
                const thead = document.createElement('thead');
                const tbody = document.createElement('tbody');

                // Generate table header
                const headerRow = document.createElement('tr');
                if (result.data.length > 0) {
                    Object.keys(result.data[0]).forEach(key => {
                        const th = document.createElement('th');
                        th.textContent = key;
                        headerRow.appendChild(th);
                    });
                    thead.appendChild(headerRow);
                }

                // Generate table rows
                result.data.forEach(row => {
                    const tr = document.createElement('tr');
                    Object.values(row).forEach(value => {
                        const td = document.createElement('td');
                        td.textContent = value;
                        tr.appendChild(td);
                    });
                    tbody.appendChild(tr);
                });

                table.appendChild(thead);
                table.appendChild(tbody);
                output.appendChild(table);
                addToHistory(query); // Add query to history
            } else {
                output.textContent = `Error: ${result.error}`;
            }
        } catch (error) {
            output.textContent = `Error: ${error.message}`;
        }
    });

    // Function to clear output
    clearOutputButton.addEventListener('click', () => {
        output.innerHTML = ''; // Clear previous output
        sqlQuery.value = ''; // Clear query input
    });

    // Function to add query to history
    function addToHistory(query) {
        const li = document.createElement('li');
        li.textContent = query;
        li.addEventListener('click', () => {
            sqlQuery.value = query; // Populate textarea with the selected query
        });
        queryHistory.appendChild(li);
    }

    // Function to toggle theme
    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-theme', themeToggle.checked);
    });
});
