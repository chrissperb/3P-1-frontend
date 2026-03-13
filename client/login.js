document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const errorMsg = document.getElementById('login-error');
    const btnSubmit = document.getElementById('btn-submit');

    try {
        btnSubmit.textContent = 'Autenticando... ⏳';
        btnSubmit.disabled = true;
        errorMsg.style.display = 'none';

        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.erro || 'Falha na autenticação.');
        }

        localStorage.setItem('token', data.token);
        
        localStorage.setItem('usuario', JSON.stringify(data.usuario));

        window.location.href = '/index.html';

    } catch (error) {
        errorMsg.textContent = `Erro ${error.message}`;
        errorMsg.style.display = 'block';
    } finally {
        btnSubmit.textContent = 'Entrar no Sistema';
        btnSubmit.disabled = false;
    }
});