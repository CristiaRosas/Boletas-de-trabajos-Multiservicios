import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { jsPDF } from 'jspdf';

// Importar el logo
import LogoMultis from '../assets/logo-multis.jpg';

const FormatoControlVisita = () => {
  const navigate = useNavigate();
  const sigCanvasCliente = useRef();
  const sigCanvasTecnico = useRef();
  
  // Estados
  const [datosTrabajo, setDatosTrabajo] = useState({
    nombreCliente: '',
    direccion: '',
    telefono: '',
    tecnico: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  const [equipos, setEquipos] = useState([
    { cantidad: '', descripcion: '', precio: '' }
  ]);

  const [horarios, setHorarios] = useState({
    horaEntrada: '',
    horaSalida: ''
  });

  const [observaciones, setObservaciones] = useState('');
  const [totalTrabajos, setTotalTrabajos] = useState('0.00');
  
  // Nuevos estados para firmas
  const [firmaCliente, setFirmaCliente] = useState(null);
  const [firmaTecnico, setFirmaTecnico] = useState(null);
  const [mensajeFirmaCliente, setMensajeFirmaCliente] = useState('');
  const [mensajeFirmaTecnico, setMensajeFirmaTecnico] = useState('');

  // Calcular total automáticamente con useEffect
  useEffect(() => {
    calcularTotal();
  }, [equipos]);

  // Calcular total automáticamente
  const calcularTotal = () => {
    const total = equipos.reduce((sum, equipo) => {
      const precio = parseFloat(equipo.precio) || 0;
      const cantidad = parseInt(equipo.cantidad) || 0;
      return sum + (precio * cantidad);
    }, 0);
    setTotalTrabajos(total.toFixed(2));
  };

  // Manejar cambios
  const handleDatosChange = (e) => {
    const { name, value } = e.target;
    setDatosTrabajo(prev => ({ ...prev, [name]: value }));
  };

  const handleEquipoChange = (index, field, value) => {
    const newEquipos = [...equipos];
    newEquipos[index] = { ...newEquipos[index], [field]: value };
    setEquipos(newEquipos);
  };

  const agregarEquipo = () => {
    setEquipos([...equipos, { cantidad: '', descripcion: '', precio: '' }]);
  };

  const eliminarEquipo = (index) => {
    if (equipos.length > 1) {
      const newEquipos = equipos.filter((_, i) => i !== index);
      setEquipos(newEquipos);
    }
  };

  // Funciones para manejar firmas digitales
  const clearFirmaCliente = () => {
    sigCanvasCliente.current.clear();
    setFirmaCliente(null);
    setMensajeFirmaCliente('');
  };

  const saveFirmaCliente = () => {
    if (!sigCanvasCliente.current.isEmpty()) {
      const dataUrl = sigCanvasCliente.current.getCanvas().toDataURL('image/png');
      setFirmaCliente(dataUrl);
      setMensajeFirmaCliente('✓ Firma del cliente guardada');
    }
  };

  const clearFirmaTecnico = () => {
    sigCanvasTecnico.current.clear();
    setFirmaTecnico(null);
    setMensajeFirmaTecnico('');
  };

  const saveFirmaTecnico = () => {
    if (!sigCanvasTecnico.current.isEmpty()) {
      const dataUrl = sigCanvasTecnico.current.getCanvas().toDataURL('image/png');
      setFirmaTecnico(dataUrl);
      setMensajeFirmaTecnico('✓ Firma del técnico guardada');
    }
  };

  // Función para formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  };

  // Función para formatear hora
  const formatHora12 = (hora24) => {
    if (!hora24) return '';
    const [horas, minutos] = hora24.split(':');
    const hora = parseInt(horas);
    const ampm = hora >= 12 ? 'p. m.' : 'a. m.';
    const hora12 = hora % 12 || 12;
    return `${hora12}:${minutos} ${ampm}`;
  };

  // Función para cargar imagen como Base64
  const cargarImagenComoBase64 = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  // Función para generar PDF con diseño profesional
  const generarPDF = async () => {
    const doc = new jsPDF();
    
    // Configuración de fuentes y colores
    doc.setFont('helvetica');
    const colorPrimario = [0, 51, 102];
    const colorSecundario = [220, 53, 69];
    const colorTexto = [51, 51, 51];

    // Encabezado con diseño profesional
    try {
      const logoBase64 = await cargarImagenComoBase64(LogoMultis);
      doc.addImage(logoBase64, 'JPEG', 15, 15, 25, 25);
    } catch (error) {
      console.log('Logo no disponible');
    }

    // Título principal
    doc.setFontSize(16);
    doc.setTextColor(...colorPrimario);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDEN DE TRABAJO TÉCNICO', 105, 25, { align: 'center' });

    // Información de la empresa
    doc.setFontSize(10);
    doc.setTextColor(...colorTexto);
    doc.setFont('helvetica', 'normal');
    doc.text('MULTISERVICIOS STS - SISTEMAS TÉCNICOS DE SEGURIDAD', 105, 32, { align: 'center' });
    
    doc.setFontSize(8);
    doc.text('Tel.: 5634-0802 • 5330-5559 • 2440-8162', 105, 37, { align: 'center' });
    doc.text('multiservicios.sts@gmail.com', 105, 41, { align: 'center' });

    // Línea decorativa
    doc.setDrawColor(...colorSecundario);
    doc.setLineWidth(0.8);
    doc.line(15, 45, 195, 45);

    let yPos = 55;

    // Información del cliente en cuadro estilizado
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(15, yPos, 180, 30, 3, 3, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(15, yPos, 180, 30, 3, 3, 'D');

    doc.setFontSize(10);
    doc.setTextColor(...colorPrimario);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL CLIENTE', 20, yPos + 8);

    doc.setFontSize(9);
    doc.setTextColor(...colorTexto);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${datosTrabajo.nombreCliente || 'N/A'}`, 20, yPos + 16);
    doc.text(`Fecha: ${formatFecha(datosTrabajo.fecha)}`, 110, yPos + 16);
    doc.text(`Dirección: ${datosTrabajo.direccion || 'N/A'}`, 20, yPos + 22);
    doc.text(`Teléfono: ${datosTrabajo.telefono || 'N/A'}`, 110, yPos + 22);
    doc.text(`Técnico: ${datosTrabajo.tecnico || 'N/A'}`, 20, yPos + 28);

    yPos += 40;

    // Horarios en cuadro lateral
    doc.setFillColor(249, 249, 249);
    doc.roundedRect(15, yPos, 85, 25, 3, 3, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(15, yPos, 85, 25, 3, 3, 'D');

    doc.setTextColor(...colorPrimario);
    doc.setFont('helvetica', 'bold');
    doc.text('HORARIOS', 20, yPos + 8);

    doc.setFontSize(8);
    doc.setTextColor(...colorTexto);
    doc.setFont('helvetica', 'normal');
    doc.text(`Entrada: ${formatHora12(horarios.horaEntrada) || 'N/A'}`, 20, yPos + 15);
    doc.text(`Salida: ${formatHora12(horarios.horaSalida) || 'N/A'}`, 20, yPos + 21);

    // Total en cuadro lateral
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(105, yPos, 90, 25, 3, 3, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(105, yPos, 90, 25, 3, 3, 'D');

    doc.setTextColor(...colorPrimario);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', 110, yPos + 8);
    
    doc.setFontSize(12);
    doc.setTextColor(...colorSecundario);
    doc.text(`Q. ${totalTrabajos || '0.00'}`, 110, yPos + 18);

    yPos += 35;

    // Tabla de equipos
    doc.setFontSize(10);
    doc.setTextColor(...colorPrimario);
    doc.setFont('helvetica', 'bold');
    
    // Encabezado de la tabla
    doc.setFillColor(70, 130, 180);
    doc.roundedRect(15, yPos, 180, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    
    doc.text('CANT.', 25, yPos + 5.5);
    doc.text('DESCRIPCIÓN', 50, yPos + 5.5);
    doc.text('PRECIO UNIT.', 140, yPos + 5.5);
    doc.text('SUBTOTAL', 170, yPos + 5.5);

    yPos += 12;

    // Datos de equipos
    doc.setFontSize(9);
    doc.setTextColor(...colorTexto);
    doc.setFont('helvetica', 'normal');

    equipos.forEach((equipo, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      const subtotal = (parseFloat(equipo.precio) || 0) * (parseInt(equipo.cantidad) || 0);
      
      if (index % 2 === 0) {
        doc.setFillColor(252, 252, 252);
      } else {
        doc.setFillColor(245, 249, 252);
      }
      doc.rect(15, yPos, 180, 8, 'F');

      doc.text(equipo.cantidad || '0', 25, yPos + 5.5);
      
      const descripcionLines = doc.splitTextToSize(equipo.descripcion || '', 80);
      if (descripcionLines.length > 1) {
        doc.text(descripcionLines[0], 50, yPos + 5.5);
      } else {
        doc.text(equipo.descripcion || '', 50, yPos + 5.5);
      }
      
      doc.text(`Q. ${parseFloat(equipo.precio || 0).toFixed(2)}`, 140, yPos + 5.5);
      doc.text(`Q. ${subtotal.toFixed(2)}`, 170, yPos + 5.5);

      yPos += 9;
    });

    yPos += 10;

    // Observaciones
    if (observaciones) {
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(10);
      doc.setTextColor(...colorPrimario);
      doc.setFont('helvetica', 'bold');
      doc.text('OBSERVACIONES Y COMENTARIOS:', 15, yPos);

      yPos += 5;
      doc.setFontSize(9);
      doc.setTextColor(...colorTexto);
      doc.setFont('helvetica', 'normal');
      
      const observacionesLines = doc.splitTextToSize(observaciones, 180);
      observacionesLines.forEach(line => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 15, yPos);
        yPos += 5;
      });
      yPos += 10;
    }

    // Texto de conformidad
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'italic');
    doc.text('Hago constar que recibí a satisfacción y en perfecto estado de funcionamiento', 15, yPos);
    doc.text('el equipo descrito anteriormente.', 15, yPos + 4);

    yPos += 15;

    // FIRMAS EN EL PDF
    doc.setFontSize(10);
    doc.setTextColor(...colorPrimario);
    doc.setFont('helvetica', 'bold');
    doc.text('FIRMAS', 105, yPos, { align: 'center' });
    
    yPos += 10;

    // Firma del Cliente
    doc.setFontSize(8);
    doc.setTextColor(...colorTexto);
    doc.setFont('helvetica', 'normal');
    doc.text('FIRMA DEL CLIENTE', 50, yPos, { align: 'center' });
    
    if (firmaCliente) {
      try {
        doc.addImage(firmaCliente, 'PNG', 30, yPos + 5, 40, 20);
      } catch (error) {
        doc.text('Firma no disponible', 50, yPos + 15, { align: 'center' });
      }
    } else {
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.3);
      doc.line(30, yPos + 15, 70, yPos + 15);
      doc.text('___________________', 50, yPos + 20, { align: 'center' });
    }
    
    doc.text(datosTrabajo.nombreCliente || 'Nombre del cliente', 50, yPos + 30, { align: 'center' });

    // Firma del Técnico
    doc.text('FIRMA DEL TÉCNICO', 150, yPos, { align: 'center' });
    
    if (firmaTecnico) {
      try {
        doc.addImage(firmaTecnico, 'PNG', 130, yPos + 5, 40, 20);
      } catch (error) {
        doc.text('Firma no disponible', 150, yPos + 15, { align: 'center' });
      }
    } else {
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.3);
      doc.line(130, yPos + 15, 170, yPos + 15);
      doc.text('___________________', 150, yPos + 20, { align: 'center' });
    }
    
    doc.text(datosTrabajo.tecnico || 'Nombre del técnico', 150, yPos + 30, { align: 'center' });

    // Pie de página
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`Documento generado el ${new Date().toLocaleDateString()}`, 105, pageHeight - 10, { align: 'center' });

    // Guardar PDF
    const nombreArchivo = `orden_trabajo_${datosTrabajo.nombreCliente || 'cliente'}_${datosTrabajo.fecha || ''}.pdf`
      .replace(/[^a-zA-Z0-9_]/g, '_');
    
    doc.save(nombreArchivo);
  };

  const limpiarFormulario = () => {
    setDatosTrabajo({ 
      nombreCliente: '', 
      direccion: '', 
      telefono: '', 
      tecnico: '',
      fecha: new Date().toISOString().split('T')[0]
    });
    setEquipos([{ cantidad: '', descripcion: '', precio: '' }]);
    setHorarios({ horaEntrada: '', horaSalida: '' });
    setObservaciones('');
    setTotalTrabajos('0.00');
    setFirmaCliente(null);
    setFirmaTecnico(null);
    setMensajeFirmaCliente('');
    setMensajeFirmaTecnico('');
    if (sigCanvasCliente.current) sigCanvasCliente.current.clear();
    if (sigCanvasTecnico.current) sigCanvasTecnico.current.clear();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-8">
      <div className="container mx-auto p-6 bg-white rounded-lg shadow-xl max-w-4xl">
        
        {/* Encabezado mejorado */}
        <div className="text-center mb-8 p-6 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg">
          <div className="flex items-center justify-center mb-4">
            <img 
              src={LogoMultis} 
              alt="MULTISERVICIOS" 
              className="h-20 mr-6 bg-white p-2 rounded-full"
              onError={(e) => e.target.style.display = 'none'}
            />
            <div>
              <h1 className="text-3xl font-bold mb-2">ORDEN DE TRABAJO TÉCNICO</h1>
              <div className="text-2xl font-bold">MULTISERVICIOS STS</div>
              <div className="text-lg">SISTEMAS TÉCNICOS DE SEGURIDAD</div>
            </div>
          </div>
          <div className="text-sm opacity-90">
            <div>Tel.: 5634-0802 • 5330-5559 • 2440-8162</div>
            <div className="font-semibold">multiservicios.sts@gmail.com</div>
          </div>
        </div>

        {/* Información del cliente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Cliente *</label>
              <input
                type="text"
                name="nombreCliente"
                value={datosTrabajo.nombreCliente}
                onChange={handleDatosChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ingrese el nombre completo"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección</label>
              <input
                type="text"
                name="direccion"
                value={datosTrabajo.direccion}
                onChange={handleDatosChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Dirección completa"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha *</label>
              <input
                type="date"
                name="fecha"
                value={datosTrabajo.fecha}
                onChange={handleDatosChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={datosTrabajo.telefono}
                onChange={handleDatosChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Número de contacto"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Técnico Responsable *</label>
              <input
                type="text"
                name="tecnico"
                value={datosTrabajo.tecnico}
                onChange={handleDatosChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre del técnico"
              />
            </div>
          </div>
        </div>

        {/* Horarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Hora de Entrada</label>
            <input
              type="time"
              value={horarios.horaEntrada}
              onChange={(e) => setHorarios({...horarios, horaEntrada: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <div className="text-sm text-gray-600 mt-2">{formatHora12(horarios.horaEntrada)}</div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Hora de Salida</label>
            <input
              type="time"
              value={horarios.horaSalida}
              onChange={(e) => setHorarios({...horarios, horaSalida: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <div className="text-sm text-gray-600 mt-2">{formatHora12(horarios.horaSalida)}</div>
          </div>
        </div>

        {/* Equipos */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">EQUIPOS Y SERVICIOS</h3>
            <button 
              onClick={agregarEquipo} 
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <span className="mr-2">+</span> Agregar Equipo
            </button>
          </div>
          
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cant.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {equipos.map((equipo, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={equipo.cantidad}
                        onChange={(e) => handleEquipoChange(index, 'cantidad', e.target.value)}
                        className="w-20 p-2 border border-gray-300 rounded"
                        min="1"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={equipo.descripcion}
                        onChange={(e) => handleEquipoChange(index, 'descripcion', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Descripción del equipo o servicio"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={equipo.precio}
                        onChange={(e) => handleEquipoChange(index, 'precio', e.target.value)}
                        className="w-32 p-2 border border-gray-300 rounded"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      Q. {((parseFloat(equipo.precio) || 0) * (parseInt(equipo.cantidad) || 0)).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      {equipos.length > 1 && (
                        <button 
                          onClick={() => eliminarEquipo(index)}
                          className="text-red-500 hover:text-red-700 font-bold text-lg"
                        >
                          ×
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-800 text-white">
                <tr>
                  <td colSpan="3" className="px-4 py-3 text-right font-semibold">TOTAL:</td>
                  <td colSpan="2" className="px-4 py-3 font-bold text-lg">
                    Q. {totalTrabajos}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Observaciones */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Observaciones y Comentarios</label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500"
            placeholder="Describa cualquier observación importante..."
          />
        </div>

        {/* SECCIÓN DE FIRMAS DIGITALES - NUEVA */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">FIRMAS DIGITALES</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Firma del Cliente */}
            <div className="text-center">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Firma del Cliente</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
                <SignatureCanvas
                  ref={sigCanvasCliente}
                  penColor="black"
                  canvasProps={{width: 280, height: 120, className: 'rounded bg-white border w-full'}}
                />
                <div className="flex gap-2 mt-3 justify-center">
                  <button 
                    type="button" 
                    onClick={saveFirmaCliente} 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                  >
                    Guardar Firma
                  </button>
                  <button 
                    type="button" 
                    onClick={clearFirmaCliente} 
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm"
                  >
                    Limpiar
                  </button>
                </div>
                {mensajeFirmaCliente && (
                  <div className="text-green-600 text-sm mt-2 font-semibold">{mensajeFirmaCliente}</div>
                )}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {datosTrabajo.nombreCliente || 'Nombre del cliente'}
              </div>
            </div>

            {/* Firma del Técnico */}
            <div className="text-center">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Firma del Técnico</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
                <SignatureCanvas
                  ref={sigCanvasTecnico}
                  penColor="black"
                  canvasProps={{width: 280, height: 120, className: 'rounded bg-white border w-full'}}
                />
                <div className="flex gap-2 mt-3 justify-center">
                  <button 
                    type="button" 
                    onClick={saveFirmaTecnico} 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                  >
                    Guardar Firma
                  </button>
                  <button 
                    type="button" 
                    onClick={clearFirmaTecnico} 
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm"
                  >
                    Limpiar
                  </button>
                </div>
                {mensajeFirmaTecnico && (
                  <div className="text-green-600 text-sm mt-2 font-semibold">{mensajeFirmaTecnico}</div>
                )}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {datosTrabajo.tecnico || 'Nombre del técnico'}
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-center space-x-6 mt-8">
          <button 
            onClick={limpiarFormulario} 
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
          >
            Limpiar Todo
          </button>
          <button 
            onClick={generarPDF} 
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 shadow-lg"
          >
            📄 Generar PDF con Firmas
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormatoControlVisita;