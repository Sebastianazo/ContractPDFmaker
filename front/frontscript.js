document.addEventListener("DOMContentLoaded", function () {
    const fecha = document.getElementById("fecha");
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    fecha.value = formattedDate;

    // Referencia al formulario
    const form = document.getElementById('pdfForm');

    async function handleSubmit(event) {
        event.preventDefault();

        // Limpiar puntos en inputs específicos
        ['PCuotas', 'Cuotas', 'Cantidad'].forEach(id => {
            const input = form.querySelector(`[name="${id}"]`);
            if (input) {
                input.value = input.value.replace(/\./g, ''); 
            }
        });

        const formData = new FormData(form);

        try {
            const response = await fetch('/generate-pdf', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const blob = await response.blob();
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'Contrato_KingHogar.pdf';
                link.click();
            } else {
                alert('Error al generar el PDF');
            }
        } catch (error) {
            alert('Error de red: ' + error.message);
        }
    }

    // Asociar el evento submit al formulario
    form.addEventListener('submit', handleSubmit);
});


