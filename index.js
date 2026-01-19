// uso de common js, pero se que deberia ser con modules y import
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
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
    const { Fecha, title, Cliente, Numero, DNI, Direccion } = req.body;
    let { Producto, Cantidad, PCuotas, Cuotas } = req.body;

    // Asegurarse de que sean arrays aunque venga un solo producto
    if (!Array.isArray(Producto)) Producto = [Producto];
    if (!Array.isArray(Cantidad)) Cantidad = [Cantidad];
    if (!Array.isArray(PCuotas)) PCuotas = [PCuotas];
    if (!Array.isArray(Cuotas)) Cuotas = [Cuotas];

    // Construir array de productos
    const productos = Producto.map((p, i) => ({
        nombreProducto: p,
        cantidad: Number(Cantidad[i]),
        precioCuota: Number(PCuotas[i]),
        cuotas: Number(Cuotas[i]),
        subtotal: Number(PCuotas[i]) * Number(Cuotas[i]) 
    }));

    // Calcular total general
    // reduce es el metodo mas efectivo, reduce guarda los valores en sum y los va sumando constantemente cada p.subtotal
    const totalGeneral = productos.reduce((sum, p) => sum + p.subtotal, 0);

    const doc = new PDFDocument({ margin: 50 });
    const filename = `Contrato_${Cliente.replace(/ /g, "_")}.pdf`;
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(res);

    // Título y fecha
    doc.fontSize(20).font('Helvetica-Bold').text(`${title}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text(`Fecha: ${Fecha}`, { align: 'right' }).moveDown();

    // Cliente/Dirección/Número/DNI
    doc.font('Helvetica-Bold').fontSize(12);
    let clienteTexto = `Cliente: ${Cliente}`;
    let direccionTexto = `Dirección: ${Direccion}`;
    let maxIzquierdoWidth = Math.max(doc.widthOfString(clienteTexto), doc.widthOfString(direccionTexto));
    const minX = 250;
    let segundaColumnaX = Math.max(maxIzquierdoWidth + 60, minX);
    let infoStartY = doc.y;

    // Fila 1
    doc.text(clienteTexto, 50, infoStartY);
    doc.text(`Número: ${Numero}`, segundaColumnaX, infoStartY);

    // Fila 2
    infoStartY += 15;
    doc.text(direccionTexto, 50, infoStartY);
    doc.text(`DNI: ${DNI}`, segundaColumnaX, infoStartY);

    doc.moveDown(5);

    // Tabla de productos
    const startX = 50;
    let currentY = doc.y;
    const colSpacing = [0, 170, 250, 370, 460];

    // Cabecera
    const headers = ["Producto", "Cantidad", "Precio por Cuota", "Subtotal", "Cuotas"];
    headers.forEach((text, i) => {
        doc.font('Helvetica-Bold').fontSize(11).text(text, startX + colSpacing[i], currentY);
    });

    const lineY = currentY + 15;
    doc.moveTo(startX, lineY)
       .lineTo(startX + colSpacing[colSpacing.length - 1] + 50, lineY)
       .stroke();

    currentY += 20;

    // Filas de productos
    productos.forEach(p => {
        doc.font('Helvetica').fontSize(10);
        doc.text(`${p.nombreProducto}`, startX + colSpacing[0], currentY, { width: 160 });
        doc.text(p.cantidad.toString(), startX + colSpacing[1], currentY);
        doc.text(`$${p.precioCuota.toLocaleString()}`, startX + colSpacing[2], currentY);
        doc.text(`$${p.subtotal.toLocaleString()}`, startX + colSpacing[3], currentY);
        doc.text(p.cuotas.toString(), startX + colSpacing[4], currentY);
        currentY += 15;
    });

    // Total general al final
    doc.moveDown(1);
    doc.font('Helvetica-Bold').fontSize(12).text(`TOTAL GENERAL: $${totalGeneral.toLocaleString()}`, startX, currentY + 10);

    doc.moveDown(5);

    // Firmas
    const firmaY = doc.y;
    doc.font('Helvetica').fontSize(10);
    doc.text("Firma: ", 50, firmaY);
    doc.text("Aclaración: ", 250, firmaY);
    doc.text("DNI: ", 450, firmaY);

    doc.moveDown(12);
    doc.x = 50; // Reset X

    // Términos y condiciones
    doc.fontSize(10).text(`Términos y condiciones del contrato`, { underline: true });
    doc.moveDown(0.5);
    doc.text(`El presente contrato tiene como finalidad la venta del producto acordado con el/la cliente. Ambas partes aceptan que el comprador deberá cumplir con el pago del monto total o de las cuotas pactadas en los plazos establecidos previamente.

En caso de que el comprador no realice el pago dentro del plazo acordado, se aplicará un interés adicional equivalente al 10% sobre la suma del monto adeudado por cada mes de retraso.

Asimismo, el incumplimiento de cuotas consecutivas o alternadas otorgará al vendedor el derecho de reclamar la totalidad del saldo pendiente de manera inmediata, incluyendo los intereses generados hasta la fecha.

Este contrato se regirá por las disposiciones legales vigentes en la República Argentina, en particular por el Código Civil y Comercial de la Nación.`);

    doc.end();
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

