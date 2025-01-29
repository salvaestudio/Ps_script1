// Definir tamaños de salida
var sizes = [
    { name: "1920x1080", width: 1920, height: 1080 },
    { name: "1000x3000", width: 1000, height: 3000 },
    { name: "2000x400", width: 2000, height: 400 }
];

// Configuración
var margin = 100; // Margen para logos y textos
var minLogoSize = 100; // Tamaño mínimo para logos (en píxeles)

// Obtener el documento activo
var doc = app.activeDocument;

// Crear una instantánea del estado original
doc.historyStates[doc.historyStates.length - 1];

// Obtener grupos de capas
var bgGroup = doc.layerSets.getByName("fondo");
var logoGroup = doc.layerSets.getByName("logos");
var textGroup = doc.layerSets.getByName("textos");

// Función para procesar cada tamaño
function processSize(newWidth, newHeight, outputName) {
    // Restaurar el estado original antes de cada cambio
    doc.activeHistoryState = doc.historyStates[0];

    // Cambiar tamaño del lienzo
    doc.resizeCanvas(newWidth, newHeight, AnchorPosition.MIDDLECENTER);

    // Escalar y centrar el fondo
    var originalWidth = 4000; // Tamaño original del documento
    var originalHeight = 4000;
    var scaleX = newWidth / originalWidth;
    var scaleY = newHeight / originalHeight;
    var scaleFactor = Math.max(scaleX, scaleY) * 100; // Escala para cubrir todo el lienzo
    bgGroup.resize(scaleFactor, scaleFactor);

    // Escalar los logos proporcionalmente al fondo
    logoGroup.resize(scaleFactor, scaleFactor);

    // Verificar si los logos son más pequeños que el tamaño mínimo permitido
    var logoBounds = logoGroup.bounds;
    var logoWidth = logoBounds[2].as("px") - logoBounds[0].as("px");
    if (logoWidth < minLogoSize) {
        var scaleUp = (minLogoSize / logoWidth) * 100;
        logoGroup.resize(scaleUp, scaleUp);
    }

    // Reposicionar los logos (centrados en X, abajo con margen)
    logoBounds = logoGroup.bounds;
    logoGroup.translate(
        newWidth / 2 - (logoBounds[0].as("px") + (logoBounds[2].as("px") - logoBounds[0].as("px")) / 2), // Centrar en X
        newHeight - logoBounds[3].as("px") - margin // Justificar abajo
    );

    // Escalar y reposicionar los textos
    textGroup.resize(scaleFactor, scaleFactor);
    var textBounds = textGroup.bounds;
    textGroup.translate(
        margin - textBounds[0].as("px"), // Justificar a la izquierda
        newHeight / 2 - (textBounds[3].as("px") - textBounds[1].as("px")) / 2 - textBounds[1].as("px") // Centrar en Y
    );

    // Exportar como PNG
    var exportFile = new File("~/Desktop/" + outputName + ".png");
    var exportOptions = new ExportOptionsSaveForWeb();
    exportOptions.format = SaveDocumentType.PNG;
    exportOptions.PNG8 = false;
    exportOptions.transparency = true;
    doc.exportDocument(exportFile, ExportType.SAVEFORWEB, exportOptions);
}

// Procesar todos los tamaños
for (var i = 0; i < sizes.length; i++) {
    var size = sizes[i];
    processSize(size.width, size.height, size.name);
}

// Restaurar el documento original al finalizar
doc.activeHistoryState = doc.historyStates[0];

alert("Proceso completado. Archivos exportados en el Escritorio.");
