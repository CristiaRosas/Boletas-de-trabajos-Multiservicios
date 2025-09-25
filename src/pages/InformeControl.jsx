import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { jsPDF } from 'jspdf';

// Importar el logo
import LogoMultis from '../assets/logo-multis.jpg';

const FormatoControlVisita = () => {
  const navigate = useNavigate();
  const sigCanvas = useRef();
  
  // Estados
  const [datosTrabajo, setDatosTrabajo] = useState({
    nombreCliente: '',
    direccion: '',
    telefono: '',
    tecnico: ''
  });

  const [equipos, setEquipos] = useState([
    { cantidad: '', descripcion: '' }
  ]);

  const [horarios, setHorarios] = useState({
    horaEntrada: '',
    horaSalida: ''
  });

  const [observaciones, setObservaciones] = useState('');
  const [totalTrabajos, setTotalTrabajos] = useState('');
  const [firmaCliente, setFirmaCliente] = useState(null);

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
    setEquipos([...equipos, { cantidad: '', descripcion: '' }]);
  };

  const eliminarEquipo = (index) => {
    if (equipos.length > 1) {
      const newEquipos = equipos.filter((_, i) => i !== index);
      setEquipos(newEquipos);
    }
  };

  // Manejar firma digital
  const clearFirma = () => {
    sigCanvas.current.clear();
    setFirmaCliente(null);
  };

  const saveFirma = () => {
    if (!sigCanvas.current.isEmpty()) {
      const dataUrl = sigCanvas.current.getCanvas().toDataURL('image/png');
      setFirmaCliente(dataUrl);
    }
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

  // Función para generar PDF con diseño mejorado
  const generarPDF = async () => {
    const doc = new jsPDF();
    
    // Configuración
    doc.setFont('helvetica');
    doc.setFontSize(9);

    // Intentar agregar logo
    try {
      const logoBase64 = await cargarImagenComoBase64(LogoMultis);
      doc.addImage(logoBase64, 'JPEG', 15, 10, 25, 25);
    } catch (error) {
      console.log('Logo no disponible, continuando sin él');
    }

    // Encabezado - diseño compacto como boleta física
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('MULTISERVICIOS', 105, 15, { align: 'center' });
    doc.text('ORDEN DE TRABAJO TECNICO', 105, 20, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('S15 - SISTEMAS TÉCNICOS', 105, 25, { align: 'center' });

    // Información de contacto compacta
    doc.text('Tel.: 5634-0802 • 5330-5559 • 2440-8162', 105, 30, { align: 'center' });
    doc.text('multiservicios.sts@gmail.com', 105, 34, { align: 'center' });

    // Línea separadora gruesa
    doc.setLineWidth(0.5);
    doc.line(15, 38, 195, 38);

    let yPos = 45;

    // Información del cliente - estilo compacto
    doc.setFont('helvetica', 'bold');
    doc.text('Nombre Cliente:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(datosTrabajo.nombreCliente, 45, yPos);
    
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Dirección:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    const direccionLines = doc.splitTextToSize(datosTrabajo.direccion || '', 120);
    doc.text(direccionLines, 45, yPos);
    yPos += (direccionLines.length * 4) + 2;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Teléfono:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(datosTrabajo.telefono, 45, yPos);
    
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('TÉCNICO:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(datosTrabajo.tecnico, 45, yPos);

    // Línea separadora
    yPos += 8;
    doc.line(15, yPos, 195, yPos);
    yPos += 5;

    // Tabla de equipos - diseño minimalista
    doc.setFont('helvetica', 'bold');
    doc.text('CANTIDAD', 25, yPos);
    doc.text('DESCRIPCION', 50, yPos);
    
    // Línea bajo encabezados
    yPos += 3;
    doc.line(20, yPos, 190, yPos);
    yPos += 4;

    // Datos de equipos
    doc.setFont('helvetica', 'normal');
    equipos.forEach((equipo, index) => {
      doc.text(equipo.cantidad || '', 25, yPos);
      
      const descripcionLines = doc.splitTextToSize(equipo.descripcion || '', 120);
      doc.text(descripcionLines, 50, yPos);
      
      const lineHeight = 4;
      const descripcionHeight = descripcionLines.length * lineHeight;
      yPos += Math.max(6, descripcionHeight);
    });

    // Total de trabajos
    yPos += 4;
    doc.setFont('helvetica', 'bold');
    const totalTexto = totalTrabajos ? `TOTAL DE TRABAJOS: Q. ${totalTrabajos}` : 'TOTAL DE TRABAJOS:';
    doc.text(totalTexto, 20, yPos);

    // Línea separadora
    yPos += 8;
    doc.line(15, yPos, 195, yPos);
    yPos += 5;

    // Horarios
    doc.setFont('helvetica', 'bold');
    doc.text(`HORA DE ENTRADA: ${formatHora12(horarios.horaEntrada)}`, 20, yPos);
    doc.text(`HORA DE SALIDA: ${formatHora12(horarios.horaSalida)}`, 20, yPos + 5);

    // Línea separadora
    yPos += 12;
    doc.line(15, yPos, 195, yPos);
    yPos += 5;

    // Texto de conformidad
    doc.setFont('helvetica', 'normal');
    const conformidadLines = doc.splitTextToSize(
      'Hago constar que recibí a satisfacción y en perfecto estado de funcionamiento el equipo descrito anteriormente.', 
      170
    );
    doc.text(conformidadLines, 20, yPos);
    yPos += (conformidadLines.length * 4) + 8;

    // Línea separadora
    doc.line(15, yPos, 195, yPos);
    yPos += 5;

    // Observaciones
    doc.setFont('helvetica', 'bold');
    doc.text('Observaciones y comentarios:', 20, yPos);
    
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    if (observaciones) {
      const observacionesLines = doc.splitTextToSize(observaciones, 170);
      doc.text(observacionesLines, 20, yPos);
      yPos += (observacionesLines.length * 4) + 10;
    } else {
      yPos += 6;
    }

    // Línea separadora
    doc.line(15, yPos, 195, yPos);
    yPos += 5;

    // Firma del cliente - diseño mejorado
    doc.setFont('helvetica', 'italic');
    doc.text('Recibí a conformidad de la empresa lo descrito en esta boleta', 20, yPos);
    
    yPos += 8;
    
    // Firma en dos columnas bien alineadas
    doc.setFont('helvetica', 'bold');
    doc.text('Nombre Cliente:', 30, yPos);
    doc.text('Firma Cliente:', 110, yPos);
    
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(datosTrabajo.nombreCliente, 30, yPos);

    // Insertar firma - posición corregida
    if (firmaCliente) {
      try {
        doc.addImage(firmaCliente, 'PNG', 110, yPos - 8, 35, 15);
      } catch (error) {
        console.log('Error al insertar firma');
      }
    }

    doc.save(`boleta-multiservicios-${datosTrabajo.nombreCliente || 'cliente'}.pdf`);
  };

  const limpiarFormulario = () => {
    setDatosTrabajo({ nombreCliente: '', direccion: '', telefono: '', tecnico: '' });
    setEquipos([{ cantidad: '', descripcion: '' }]);
    setHorarios({ horaEntrada: '', horaSalida: '' });
    setObservaciones('');
    setTotalTrabajos('');
    setFirmaCliente(null);
    if (sigCanvas.current) sigCanvas.current.clear();
  };

  return (
    <div className="container mx-auto p-4 bg-white max-w-2xl" style={{ fontFamily: 'Arial, sans-serif' }}>
      
      {/* Encabezado con logo */}
      <div className="text-center mb-6 border-2 border-gray-800 p-4 bg-white">
        <div className="flex items-center justify-center mb-2">
          <img 
            src={LogoMultis} 
            alt="MULTISERVICIOS" 
            className="h-16 mr-4"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div>
            <h1 className="text-xl font-bold uppercase mb-1">MULTISERVICIOS ORDEN DE TRABAJO TECNICO</h1>
            <div className="text-center">
              <div className="font-bold text-lg">S15</div>
              <div className="text-md">SISTEMAS TÉCNICOS</div>
            </div>
          </div>
        </div>
        <div className="text-sm mt-2">
          <div>Tel.: 5634-0802 • 5330-5559 • 2440-8162</div>
          <div className="text-blue-600 font-semibold">multiservicios.sts@gmail.com</div>
        </div>
      </div>

      {/* Línea separadora gruesa */}
      <div className="border-t-2 border-gray-800 my-4"></div>

      {/* Información del cliente - Estilo compacto */}
      <div className="mb-6">
        <div className="space-y-3">
          <div className="flex items-center">
            <span className="font-bold w-32">Nombre Cliente:</span>
            <input
              type="text"
              name="nombreCliente"
              value={datosTrabajo.nombreCliente}
              onChange={handleDatosChange}
              className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500 px-2 py-1"
              placeholder=""
            />
          </div>
          <div className="flex items-center">
            <span className="font-bold w-32">Dirección:</span>
            <input
              type="text"
              name="direccion"
              value={datosTrabajo.direccion}
              onChange={handleDatosChange}
              className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500 px-2 py-1"
              placeholder=""
            />
          </div>
          <div className="flex items-center">
            <span className="font-bold w-32">Teléfono:</span>
            <input
              type="text"
              name="telefono"
              value={datosTrabajo.telefono}
              onChange={handleDatosChange}
              className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500 px-2 py-1"
              placeholder=""
            />
          </div>
          <div className="flex items-center">
            <span className="font-bold w-32">TÉCNICO:</span>
            <input
              type="text"
              name="tecnico"
              value={datosTrabajo.tecnico}
              onChange={handleDatosChange}
              className="flex-1 border-b border-gray-300 focus:outline-none focus:border-blue-500 px-2 py-1"
              placeholder=""
            />
          </div>
        </div>
      </div>

      {/* Línea separadora */}
      <div className="border-t border-gray-400 my-4"></div>

      {/* Equipos */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold">EQUIPOS</h3>
          <button onClick={agregarEquipo} className="bg-green-500 text-white px-3 py-1 rounded text-sm">
            + Agregar
          </button>
        </div>
        
        <div className="border border-gray-300">
          <div className="grid grid-cols-12 bg-gray-100 font-bold border-b border-gray-300">
            <div className="col-span-3 p-2 border-r border-gray-300">CANTIDAD</div>
            <div className="col-span-8 p-2">DESCRIPCION</div>
            <div className="col-span-1 p-2"></div>
          </div>
          {equipos.map((equipo, index) => (
            <div key={index} className="grid grid-cols-12 border-b border-gray-300">
              <div className="col-span-3 p-2 border-r border-gray-300">
                <input
                  type="text"
                  value={equipo.cantidad}
                  onChange={(e) => handleEquipoChange(index, 'cantidad', e.target.value)}
                  className="w-full border-none focus:outline-none bg-transparent"
                  placeholder=""
                />
              </div>
              <div className="col-span-8 p-2">
                <input
                  type="text"
                  value={equipo.descripcion}
                  onChange={(e) => handleEquipoChange(index, 'descripcion', e.target.value)}
                  className="w-full border-none focus:outline-none bg-transparent"
                  placeholder=""
                />
              </div>
              <div className="col-span-1 p-2 text-center">
                {equipos.length > 1 && (
                  <button onClick={() => eliminarEquipo(index)} className="text-red-500 font-bold">
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Total de trabajos */}
        <div className="mt-4 flex items-center">
          <span className="font-bold mr-2">TOTAL DE TRABAJOS: Q.</span>
          <input
            type="text"
            value={totalTrabajos}
            onChange={(e) => setTotalTrabajos(e.target.value)}
            className="border-b border-gray-300 focus:outline-none focus:border-blue-500 flex-1 px-2 py-1"
            placeholder=""
          />
        </div>
      </div>

      {/* Línea separadora */}
      <div className="border-t border-gray-400 my-4"></div>

      {/* Horarios */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold mb-1">HORA DE ENTRADA:</label>
            <input
              type="time"
              value={horarios.horaEntrada}
              onChange={(e) => setHorarios({...horarios, horaEntrada: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded"
            />
            <div className="text-sm text-gray-600 mt-1">{formatHora12(horarios.horaEntrada)}</div>
          </div>
          <div>
            <label className="block font-bold mb-1">HORA DE SALIDA:</label>
            <input
              type="time"
              value={horarios.horaSalida}
              onChange={(e) => setHorarios({...horarios, horaSalida: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded"
            />
            <div className="text-sm text-gray-600 mt-1">{formatHora12(horarios.horaSalida)}</div>
          </div>
        </div>
      </div>

      {/* Línea separadora */}
      <div className="border-t border-gray-400 my-4"></div>

      {/* Texto de conformidad */}
      <div className="mb-6 text-sm italic text-center bg-gray-50 p-3 border border-gray-200">
        Hago constar que recibí a satisfacción y en perfecto estado de funcionamiento el equipo descrito anteriormente.
      </div>

      {/* Observaciones */}
      <div className="mb-6">
        <label className="block font-bold mb-2">Observaciones y comentarios:</label>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded h-24"
          placeholder=""
        />
      </div>

      {/* Línea separadora */}
      <div className="border-t border-gray-400 my-4"></div>

      {/* Firma del cliente */}
      <div className="mb-6">
        <div className="italic text-center mb-4">Recibí a conformidad de la empresa lo descrito en esta boleta</div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block font-bold mb-2">Nombre Cliente:</label>
            <input
              type="text"
              value={datosTrabajo.nombreCliente}
              onChange={(e) => setDatosTrabajo({...datosTrabajo, nombreCliente: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block font-bold mb-2">Firma Cliente:</label>
            <div className="border-2 border-dashed border-gray-400 rounded p-3 bg-white">
              <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{width: 280, height: 100, className: 'rounded bg-white w-full'}}
              />
              <div className="flex gap-2 mt-3">
                <button type="button" onClick={saveFirma} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                  Guardar Firma
                </button>
                <button type="button" onClick={clearFirma} className="bg-gray-400 text-white px-3 py-1 rounded text-sm">
                  Limpiar
                </button>
              </div>
              {firmaCliente && (
                <div className="text-green-600 text-sm mt-2 text-center">✓ Firma guardada correctamente</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-center space-x-4 mt-8">
        <button onClick={limpiarFormulario} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded">
          Limpiar Todo
        </button>
        <button onClick={generarPDF} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded">
          Generar PDF
        </button>
      </div>
    </div>
  );
};

export default FormatoControlVisita;