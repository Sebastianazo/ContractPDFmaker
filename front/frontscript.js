document.addEventListener("DOMContentLoaded", function () {
    const fecha = document.getElementById("fecha");
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    fecha.value = formattedDate;

    const AddProductBtn = document.getElementById("addProductBtn");
    const form = document.getElementById('pdfForm');


    AddProductBtn.addEventListener("click", () => {
     const Producto = document.getElementById("Producto");
     const Cantidad = document.getElementById("Cantidad");
     const PCuotas = document.getElementById("PCuotas");
     const Cuotas = document.getElementById("Cuotas");

     if (!Producto.value || !Cantidad.value || !PCuotas.value || !Cuotas.value) {
        alert("Complete los campos, si el producto no es mayor de 1 cuota, coloque 1 en el campo Cuota.");
        return;
     };

    const hiddenProducto = document.createElement("input");
    hiddenProducto.type = "hidden";
    hiddenProducto.name = "Producto[]";
    hiddenProducto.value = Producto.value;

    const hiddenCantidad = document.createElement("input");
    hiddenCantidad.type = "hidden";
    hiddenCantidad.name = "Cantidad[]";
    hiddenCantidad.value = Cantidad.value;

    const hiddenPCuotas = document.createElement("input");
    hiddenPCuotas.type = "hidden";
    hiddenPCuotas.name = "PCuotas[]";
    hiddenPCuotas.value = PCuotas.value;

    const hiddenCuotas = document.createElement("input");
    hiddenCuotas.type = "hidden";
    hiddenCuotas.name = "Cuotas[]";
    hiddenCuotas.value = Cuotas.value;

    form.appendChild(hiddenProducto);
    form.appendChild(hiddenCantidad);
    form.appendChild(hiddenPCuotas);
    form.appendChild(hiddenCuotas);
    
    const sectorProducto = document.createElement("div");
    const logTexto = document.createElement("p");
    const botonEliminar = document.createElement("button");
    botonEliminar.textContent = "Eliminar";

    logTexto.textContent = `Producto: ${Producto.value} | Cantidad: ${Cantidad.value} | Precio por Cuota: ${PCuotas.value} | Cuotas: ${Cuotas.value}`;
    sectorProducto.appendChild(logTexto);
    sectorProducto.appendChild(botonEliminar);
    
    logTexto.classList.add("textoProducto");
    botonEliminar.classList.add("btnEliminarProducto");
    sectorProducto.classList.add("sectorProductoTemp");
    
    
    // Aca agrego el boton dentro de otro addEventListener para que tome el valor actualizado
    botonEliminar.addEventListener("click", () => {
        sectorProducto.remove();
        form.removeChild(hiddenProducto);
        form.removeChild(hiddenCantidad);
        form.removeChild(hiddenPCuotas);
        form.removeChild(hiddenCuotas);
    });


    document.getElementById("Sproducto").appendChild(sectorProducto)


     Producto.value = "";
     Cantidad.value = "";
     PCuotas.value = "";
     Cuotas.value = "";

    Producto.focus();
    });


    async function handleSubmit(event) {
        event.preventDefault();

        // Limpiar puntos en inputs específicos
        ['PCuotas[]', 'Cuotas[]', 'Cantidad[]'].forEach(id => {
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
