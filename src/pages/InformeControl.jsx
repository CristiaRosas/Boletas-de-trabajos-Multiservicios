import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { jsPDF } from 'jspdf';

const FormatoControlVisita = () => {
  const navigate = useNavigate();
  const sigCanvas = useRef();
  
  // Estados actualizados
  const [datosTrabajo, setDatosTrabajo] = useState({
    nombreCliente: '',
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

  // Manejar cambios en equipos
  const handleEquipoChange = (index, field, value) => {
    const newEquipos = [...equipos];
    newEquipos[index] = { ...newEquipos[index], [field]: value };
    setEquipos(newEquipos);
  };

  // Agregar más equipos
  const agregarEquipo = () => {
    setEquipos([...equipos, { cantidad: '', descripcion: '' }]);
  };

  // Eliminar equipo
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

  // Función para formatear hora en formato 12 horas
  const formatHora12 = (hora24) => {
    if (!hora24) return '';
    
    const [horas, minutos] = hora24.split(':');
    const hora = parseInt(horas);
    const ampm = hora >= 12 ? 'p. m.' : 'a. m.';
    const hora12 = hora % 12 || 12;
    
    return `${hora12}:${minutos} ${ampm}`;
  };

  // Función para generar PDF mejorado
  const generarPDF = () => {
    const doc = new jsPDF();
    
    // Configuración inicial
    doc.setFont('helvetica');
    doc.setFontSize(10);

    // Encabezado
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDEN DE TRABAJO TECNICO', 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Tel.: 5634-0802 • 5330-5559 • 2440-8162', 105, 22, { align: 'center' });
    doc.text('multiservicios.sts@gmail.com', 105, 27, { align: 'center' });

    // Línea separadora
    doc.line(10, 33, 200, 33);

    // Información del cliente y técnico
    let yPos = 43;
    doc.setFont('helvetica', 'bold');
    doc.text(`Nombre Cliente: ${datosTrabajo.nombreCliente}`, 15, yPos);
    doc.text(`TÉCNICO: ${datosTrabajo.tecnico}`, 15, yPos + 7);

    // Tabla de equipos - Encabezados
    yPos += 20;
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos, 180, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('CANTIDAD', 20, yPos + 5);
    doc.text('DESCRIPCION', 60, yPos + 5);

    // Datos de equipos
    yPos += 8;
    equipos.forEach((equipo, index) => {
      doc.setFont('helvetica', 'normal');
      
      // Cantidad
      doc.text(equipo.cantidad || '', 20, yPos + 5);
      
      // Descripción con manejo de texto largo
      const descripcionLines = doc.splitTextToSize(equipo.descripcion || '', 120);
      doc.text(descripcionLines, 60, yPos + 5);
      
      // Ajustar altura según líneas de descripción
      const lineHeight = 5;
      const descripcionHeight = descripcionLines.length * lineHeight;
      
      // Línea separadora
      doc.line(15, yPos + descripcionHeight + 2, 195, yPos + descripcionHeight + 2);
      
      yPos += Math.max(8, descripcionHeight + 3);
    });

    // Total de trabajos con formato Q.
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    const totalTexto = totalTrabajos ? `TOTAL DE TRABAJOS: Q. ${totalTrabajos}` : 'TOTAL DE TRABAJOS:';
    doc.text(totalTexto, 15, yPos);

    // Línea separadora después de equipos
    yPos += 10;
    doc.line(10, yPos, 200, yPos);

    // Horarios en formato 12 horas
    yPos += 10;
    doc.text(`HORA DE ENTRADA: ${formatHora12(horarios.horaEntrada)}`, 15, yPos);
    doc.text(`HORA DE SALIDA: ${formatHora12(horarios.horaSalida)}`, 15, yPos + 7);

    // Texto de conformidad
    yPos += 15;
    doc.setFont('helvetica', 'normal');
    doc.text('Hago constar que recibí a satisfacción y en perfecto estado de funcionamiento el equipo', 15, yPos);
    doc.text('descrito anteriormente.', 15, yPos + 5);

    // Observaciones
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Observaciones y comentarios:', 15, yPos);
    
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    if (observaciones) {
      const observacionesLines = doc.splitTextToSize(observaciones, 180);
      doc.text(observacionesLines, 15, yPos);
      yPos += (observacionesLines.length * 5) + 10;
    } else {
      yPos += 8;
    }

    // Firma del cliente - POSICIÓN CORREGIDA
    doc.setFont('helvetica', 'italic');
    doc.text('Recibí a conformidad de la empresa lo descrito en esta boleta', 15, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    
    // Encabezados de firma en la misma línea
    doc.text('Nombre Cliente:', 15, yPos);
    doc.text('Firma Cliente:', 110, yPos);
    
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.text(datosTrabajo.nombreCliente, 15, yPos);

    // Insertar firma SI EXISTE - POSICIÓN CORREGIDA
    if (firmaCliente) {
      try {
        // Redimensionar y posicionar correctamente la firma
        doc.addImage(firmaCliente, 'PNG', 110, yPos - 12, 35, 15);
      } catch (error) {
        console.log('Error al insertar firma:', error);
      }
    }

    // Guardar PDF
    doc.save(`boleta-multiservicios-${datosTrabajo.nombreCliente || 'cliente'}.pdf`);
  };

  // Limpiar formulario
  const limpiarFormulario = () => {
    setDatosTrabajo({ nombreCliente: '', tecnico: '' });
    setEquipos([{ cantidad: '', descripcion: '' }]);
    setHorarios({ horaEntrada: '', horaSalida: '' });
    setObservaciones('');
    setTotalTrabajos('');
    setFirmaCliente(null);
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  return (
    <div className="container mx-auto p-4 bg-white max-w-3xl" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Encabezado con logo */}
      <div className="text-center mb-4 border-b border-gray-300 pb-3">
        <div className="flex items-center justify-center mb-2">
          {/* Logo placeholder - reemplaza con tu imagen */}
          <div className="mr-4 w-20 h-12 bg-gray-100 border border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <div className="font-bold text-xs">MULTISERVICIOS</div>
              <div className="text-xs">S15</div>
              <div className="text-xs">SISTEMAS TÉCNICOS</div>
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold uppercase">ORDEN DE TRABAJO TECNICO</h1>
            <div className="text-xs mt-1">
              <p>Tel.: 5634-0802 • 5330-5559 • 2440-8162</p>
              <p className="text-blue-600">multiservicios.sts@gmail.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Línea separadora */}
      <div className="border-t border-gray-400 my-3"></div>

      {/* Información del cliente y técnico */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block font-bold mb-1 text-sm">Nombre Cliente:</label>
          <input
            type="text"
            value={datosTrabajo.nombreCliente}
            onChange={(e) => setDatosTrabajo({...datosTrabajo, nombreCliente: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded text-sm"
            placeholder="Nombre del cliente"
          />
        </div>
        <div>
          <label className="block font-bold mb-1 text-sm">TÉCNICO:</label>
          <input
            type="text"
            value={datosTrabajo.tecnico}
            onChange={(e) => setDatosTrabajo({...datosTrabajo, tecnico: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded text-sm"
            placeholder="Nombre del técnico"
          />
        </div>
      </div>

      {/* Línea separadora */}
      <div className="border-t border-gray-400 my-3"></div>

      {/* Tabla de equipos */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-sm">EQUIPOS</h3>
          <button 
            onClick={agregarEquipo}
            className="bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2 rounded"
          >
            + Agregar Equipo
          </button>
        </div>
        
        <table className="w-full border-collapse border border-gray-300 text-sm mb-3">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 w-1/6">CANTIDAD</th>
              <th className="border border-gray-300 p-2">DESCRIPCION</th>
              <th className="border border-gray-300 p-2 w-16">Acción</th>
            </tr>
          </thead>
          <tbody>
            {equipos.map((equipo, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={equipo.cantidad}
                    onChange={(e) => handleEquipoChange(index, 'cantidad', e.target.value)}
                    className="w-full p-1 border-none focus:outline-none text-sm"
                    placeholder="Cant."
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <textarea
                    value={equipo.descripcion}
                    onChange={(e) => handleEquipoChange(index, 'descripcion', e.target.value)}
                    className="w-full p-1 border-none focus:outline-none text-sm resize-none"
                    placeholder="Descripción del equipo"
                    rows="2"
                  />
                </td>
                <td className="border border-gray-300 p-1 text-center">
                  {equipos.length > 1 && (
                    <button 
                      onClick={() => eliminarEquipo(index)}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded"
                    >
                      ✗
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total de trabajos con formato Q. */}
        <div className="mt-2">
          <label className="block font-bold mb-1 text-sm">TOTAL DE TRABAJOS:</label>
          <div className="flex items-center">
            <span className="mr-2 font-bold">Q.</span>
            <input
              type="text"
              value={totalTrabajos}
              onChange={(e) => setTotalTrabajos(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="Ingrese el total"
            />
          </div>
        </div>
      </div>

      {/* Línea separadora */}
      <div className="border-t border-gray-400 my-3"></div>

      {/* Horarios */}
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold mb-1 text-sm">HORA DE ENTRADA:</label>
            <input
              type="time"
              value={horarios.horaEntrada}
              onChange={(e) => setHorarios({...horarios, horaEntrada: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            />
            <span className="text-xs text-gray-600">
              {formatHora12(horarios.horaEntrada)}
            </span>
          </div>
          <div>
            <label className="block font-bold mb-1 text-sm">HORA DE SALIDA:</label>
            <input
              type="time"
              value={horarios.horaSalida}
              onChange={(e) => setHorarios({...horarios, horaSalida: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            />
            <span className="text-xs text-gray-600">
              {formatHora12(horarios.horaSalida)}
            </span>
          </div>
        </div>
      </div>

      {/* Línea separadora */}
      <div className="border-t border-gray-400 my-3"></div>

      {/* Texto de conformidad */}
      <div className="mb-4 text-sm italic bg-gray-50 p-3 rounded border border-gray-200">
        Hago constar que recibí a satisfacción y en perfecto estado de funcionamiento el equipo descrito anteriormente.
      </div>

      {/* Observaciones */}
      <div className="mb-4">
        <label className="block font-bold mb-1 text-sm">Observaciones y comentarios:</label>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded text-sm h-20"
          placeholder="Escriba aquí las observaciones..."
        />
      </div>

      {/* Línea separadora */}
      <div className="border-t border-gray-400 my-3"></div>

      {/* Firma del cliente */}
      <div className="mb-6 border border-gray-300 p-3 rounded bg-gray-50">
        <div className="italic mb-3 text-sm">Recibí a conformidad de la empresa lo descrito en esta boleta</div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold mb-1 text-sm">Nombre Cliente:</label>
            <input
              type="text"
              value={datosTrabajo.nombreCliente}
              onChange={(e) => setDatosTrabajo({...datosTrabajo, nombreCliente: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="Nombre completo"
            />
          </div>
          
          <div>
            <label className="block font-bold mb-1 text-sm">Firma Cliente:</label>
            <div className="border border-dashed border-gray-400 rounded p-2 bg-white">
              <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{width: 250, height: 80, className: 'rounded bg-white'}}
              />
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={saveFirma} className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                  Guardar Firma
                </button>
                <button type="button" onClick={clearFirma} className="bg-gray-400 text-white px-2 py-1 rounded text-xs">
                  Limpiar
                </button>
              </div>
              {firmaCliente && (
                <div className="text-green-600 text-xs mt-1">✓ Firma guardada</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={limpiarFormulario}
          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded text-sm"
        >
          Limpiar Todo
        </button>
        <button
          onClick={generarPDF}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded text-sm"
        >
          Generar PDF
        </button>
      </div>
    </div>
  );
};

export default FormatoControlVisita;