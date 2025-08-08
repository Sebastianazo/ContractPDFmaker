const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'front')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'front', 'index.html'));
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/generate-pdf', upload.none(), (req, res) => {
    const { Fecha, title, Cliente, Numero, DNI, Direccion, Producto, Cantidad, PCuotas, Cuotas } = req.body;
    const productos = [{
        nombreProducto: Producto,
        cantidad: Cantidad,
        precioCuota: Number(PCuotas),
        subtotal: PCuotas * Cuotas,
        cuotas: Cuotas
    }];

    const doc = new PDFDocument({ margin: 50 });
    const filename = `Contrato_${Cliente.replace(/ /g, "_")}.pdf`;
    doc.pipe(res);  // Enviar el PDF directamente como respuesta

   doc.fontSize(20).font('Helvetica-Bold').text(`${title}`, { align: 'center' });
doc.moveDown();
doc.fontSize(12).font('Helvetica').text(`Fecha: ${Fecha}`, { align: 'right' }).moveDown();

let infoStartY = doc.y;

doc.font('Helvetica-Bold').fontSize(12);
doc.text(`Cliente: ${Cliente}`, 50, infoStartY);
doc.text(`Numero: ${Numero}`, 250, infoStartY);

infoStartY += 15; // Mover abajo para la siguiente línea

// Dirección y DNI en la misma línea, separados horizontalmente
doc.text(`Dirección: ${Direccion}`, 50, infoStartY);
doc.text(`DNI: ${DNI}`, 250, infoStartY);



    doc.moveDown(5);

    const startX = 50;
    let currentY = doc.y;
    const colSpacing = [0, 170, 250, 370, 460]; // posiciones X para cada columna

    const headers = ["Producto", "Cantidad", "Precio por Cuota", "Subtotal", "Cuotas"];
    headers.forEach((text, i) => {
      doc.font('Helvetica-Bold').fontSize(11).text(text, startX + colSpacing[i], currentY);
    });

    const lineY = currentY + 15;
    doc.moveTo(startX, lineY)
   .lineTo(startX + colSpacing[colSpacing.length - 1] + 50, lineY) // suma un poco más para que cruce toda la tabla
   .stroke();

    currentY += 20;

    // Filas
    productos.forEach(p => {
      doc.font('Helvetica').fontSize(10);
      doc.text(`${p.nombreProducto}`, startX + colSpacing[0], currentY, { width: 160 });
      doc.text(p.cantidad.toString(), startX + colSpacing[1], currentY);
      doc.text(`$${p.precioCuota.toLocaleString()}`, startX + colSpacing[2], currentY);
      doc.text(`$${p.subtotal.toLocaleString()}`, startX + colSpacing[3], currentY);
      doc.text(p.cuotas.toString(), startX + colSpacing[4], currentY);
      currentY += 20;
    });

    doc.y = currentY + 20;
    doc.x = startX;

    doc.moveDown(7);

    doc.moveDown(2);
    const firmaY = doc.y;
    doc.text("Firma: ", 50, firmaY);
    doc.text("Aclaración: ", 250, firmaY);
    doc.text("DNI: ", 450, firmaY);

    doc.x = 20;

    doc.moveDown(12);

    // Aquí comienza la sección de términos y condiciones q me olvide

    doc.fontSize(10).text(`Términos y condiciones del contrato`, { underline: true });
    doc.moveDown(0.5);
    doc.text(`El presente contrato tiene como finalidad la venta del producto acordado con el/la cliente. Ambas partes aceptan que el comprador deberá cumplir con el pago del monto total o de las cuotas pactadas en los plazos establecidos previamente.

    En caso de que el comprador no realice el pago dentro del plazo acordado, se aplicará un interés adicional equivalente al 10% sobre la suma del monto adeudado por cada mes de retraso.

    Asimismo, el incumplimiento de cuotas consecutivas o alternadas otorgará al vendedor el derecho de reclamar la totalidad del saldo pendiente de manera inmediata, incluyendo los intereses generados hasta la fecha.

    Este contrato se regirá por las disposiciones legales vigentes en la República Argentina, en particular por el Código Civil y Comercial de la Nación.`);

    doc.end();
});

app.listen(port, () => {
  // Para no olvidarme
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
