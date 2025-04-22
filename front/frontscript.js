document.addEventListener("DOMContentLoaded", function () {
    // Variables para el autocompletado de la fecha
    const fecha = document.getElementById("fecha");
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0'); 
    // Variables para el CheckMark

    const formattedDate = `${year}-${month}-${day}`;

    fecha.value = formattedDate; 

    async function handleSubmit(event) {
        event.preventDefault();
        const formData = new FormData(document.getElementById('pdfForm'));

        try {
            const response = await fetch('/generate-pdf', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const blob = await response.blob();
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'Contrato.pdf';
                link.click();
            } else {
                alert('Error al generar el PDF');
            }
        } catch (error) {
            alert('Error de red: ' + error.message);
        }
    }

});
