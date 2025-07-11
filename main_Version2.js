// Mostrar campos según tipo seleccionado
const tipoSelect = document.getElementById('tipo');
const camposDiv = document.getElementById('campos');
const camposPorTipo = {
    libro: ['autor','titulo','anio','ciudad','publicado'],
    articulo: ['autor','titulo','revista','anio','volumen','numero','paginas'],
    pagina: ['autor','nombrePagina','sitioWeb','anio','mes','dia','url'],
    documento: ['autor','nombrePagina','sitioWeb','anio','mes','dia','url'],
    recurso: ['autor','titulo','estado','pais','region','anio','mes','dia','url']
};

function mostrarCampos() {
    const tipo = tipoSelect.value;
    camposDiv.querySelectorAll('.campo').forEach(campo => campo.style.display = 'none');
    (camposPorTipo[tipo]||[]).forEach(clase =>
        camposDiv.querySelector(`.campo.${clase}`)?.style.setProperty('display','block')
    );
}
tipoSelect.addEventListener('change', mostrarCampos);

// Utilidades de texto
const capitalizar = str => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
const sentenceCase = str => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
const titleCase = str => str ? str.toLowerCase().split(' ').map(w=>capitalizar(w)).join(' ') : '';

function procesarAutores(str) {
    if (!str.trim()) return ["Autor Desconocido"];
    return str.split(";").map(nombreCompleto => {
        nombreCompleto = nombreCompleto.trim();
        if (!nombreCompleto) return "Autor Desconocido";
        const partes = nombreCompleto.split(" ").filter(p=>p.length>0);
        if (partes.length === 0) return "Autor Desconocido";
        if (partes.length === 1) return capitalizar(partes[0]);
        let apellidos, inicialesNombres;
        if (partes.length === 2) {
            apellidos = capitalizar(partes[1]);
            inicialesNombres = partes[0].charAt(0).toUpperCase() + ".";
        } else {
            const numNombres = partes.length-2;
            apellidos = partes.slice(numNombres).map(capitalizar).join(" ");
            inicialesNombres = partes.slice(0,numNombres).map(p=>p.charAt(0).toUpperCase()+".").join(" ");
        }
        return `${apellidos}, ${inicialesNombres}`;
    });
}
function formatearListaAutoresAPA(autores) {
    if (autores.length === 0 || autores[0] === "Autor Desconocido") return "Autor Desconocido";
    if (autores.length === 1) return autores[0];
    if (autores.length <= 20) return `${autores.slice(0,-1).join(", ")} & ${autores.slice(-1)}`;
    return `${autores.slice(0,19).join(", ")}, ..., ${autores.slice(-1)}`;
}
function formatearListaAutoresGeneral(autores,norma="apa") {
    if (autores.length === 0 || autores[0] === "Autor Desconocido") return "Autor Desconocido";
    if (autores.length === 1) return autores[0];
    if (norma === "mla") {
        if (autores.length === 2) return `${autores[0]} and ${autores[1]}`;
        if (autores.length >= 3) return `${autores[0]} et al.`;
    }
    return autores.join(norma==="iso"?"; ":", ");
}
function formatearNombresMes(mesStr) {
    if (!mesStr) return "";
    const mesNum = parseInt(mesStr,10);
    if (!isNaN(mesNum) && mesNum >=1 && mesNum <=12) {
        const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
        return meses[mesNum-1];
    }
    let mesLimpio = mesStr.trim().toLowerCase();
    if (mesLimpio.length > 4 && (tipoSelect.value==='pagina'||tipoSelect.value==='documento') && document.getElementById("norma").value==='mla') {
        const mlaMeses = {"enero":"Jan.","febrero":"Feb.","marzo":"Mar.","abril":"Apr.","agosto":"Aug.","septiembre":"Sept.","octubre":"Oct.","noviembre":"Nov.","diciembre":"Dec."};
        if (mlaMeses[mesLimpio]) return mlaMeses[mesLimpio];
    }
    return capitalizar(mesLimpio);
}

// Copiado al portapapeles (todas las citas)
document.addEventListener('click', e => {
    if (e.target.classList.contains('copiar-btn')) {
        const target = e.target.getAttribute('data-target');
        const content = document.getElementById(target).textContent;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(content).then(()=>{
                e.target.textContent='¡Copiado!';
                setTimeout(()=>{e.target.textContent=e.target.textContent.replace('¡Copiado!','Copiar');},2000);
            });
        } else {
            e.target.textContent='¡Copiado!';
            setTimeout(()=>{e.target.textContent=e.target.textContent.replace('¡Copiado!','Copiar');},2000);
        }
    }
});

// Lógica de generación de citas/referencias (simulada, puedes mejorar la lógica real)
function generarCitaReferencia(e) {
    e.preventDefault();
    const tipo = tipoSelect.value;
    const norma = document.getElementById('norma').value;
    // Recoger valores
    const get = id => document.getElementById(id)?.value || '';
    const datos = {
        autor: get('autor'),
        titulo: get('titulo'),
        anio: get('anio'),
        ciudad: get('ciudad'),
        publicado: get('publicado'),
        revista: get('revista'),
        volumen: get('volumen'),
        numero: get('numero'),
        paginas: get('paginas'),
        nombrePagina: get('nombrePagina'),
        sitioWeb: get('sitioWeb'),
        mes: get('mes'),
        dia: get('dia'),
        url: get('url'),
        estado: get('estado'),
        pais: get('pais'),
        region: get('region')
    };
    // Procesar autores
    const autoresArr = procesarAutores(datos.autor);

    // FÓRMULAS SIMPLIFICADAS, PERSONALÍZALAS SEGÚN NORMAS:
    let citaFinal = '', citaInicio = '', referencia = '';

    if (tipo === 'libro' && norma === 'apa') {
        const autores = formatearListaAutoresAPA(autoresArr);
        referencia = `${autores} (${datos.anio}). <i>${sentenceCase(datos.titulo)}</i>. ${capitalizar(datos.ciudad)}: ${capitalizar(datos.publicado)}.`;
        citaFinal = `(${autores.split(',')[0]}, ${datos.anio})`;
        citaInicio = `${autores.split(',')[0]} (${datos.anio}) señala que ...`;
    } else if (tipo === 'articulo' && norma === 'apa') {
        const autores = formatearListaAutoresAPA(autoresArr);
        referencia = `${autores} (${datos.anio}). ${sentenceCase(datos.titulo)}. <i>${capitalizar(datos.revista)}</i>, ${datos.volumen}(${datos.numero}), ${datos.paginas}.`;
        citaFinal = `(${autores.split(',')[0]}, ${datos.anio})`;
        citaInicio = `${autores.split(',')[0]} (${datos.anio}) indica que ...`;
    } else if ((tipo === 'pagina' || tipo === 'documento') && norma === 'apa') {
        const autores = formatearListaAutoresAPA(autoresArr);
        referencia = `${autores} (${datos.anio}). ${sentenceCase(datos.nombrePagina)}. <i>${capitalizar(datos.sitioWeb)}</i>. ${datos.url}`;
        citaFinal = `(${autores.split(',')[0]}, ${datos.anio})`;
        citaInicio = `${autores.split(',')[0]} (${datos.anio}) menciona ...`;
    } else if (tipo === 'libro' && norma === 'mla') {
        const autores = formatearListaAutoresGeneral(autoresArr,"mla");
        referencia = `${autores}. <i>${titleCase(datos.titulo)}</i>. ${capitalizar(datos.ciudad)}: ${capitalizar(datos.publicado)}, ${datos.anio}.`;
        citaFinal = `(${autores.split(',')[0]} ${datos.anio})`;
        citaInicio = `${autores.split(',')[0]} ${datos.anio} dice ...`;
    } else if (tipo === 'articulo' && norma === 'mla') {
        const autores = formatearListaAutoresGeneral(autoresArr,"mla");
        referencia = `${autores}. "${titleCase(datos.titulo)}." <i>${capitalizar(datos.revista)}</i>, vol. ${datos.volumen}, no. ${datos.numero}, ${datos.anio}, pp. ${datos.paginas}.`;
        citaFinal = `(${autores.split(',')[0]} ${datos.anio})`;
        citaInicio = `${autores.split(',')[0]} ${datos.anio} afirma ...`;
    } else if ((tipo === 'pagina' || tipo === 'documento') && norma === 'mla') {
        const autores = formatearListaAutoresGeneral(autoresArr,"mla");
        referencia = `${autores}. "${titleCase(datos.nombrePagina)}." <i>${capitalizar(datos.sitioWeb)}</i>, ${datos.dia} ${formatearNombresMes(datos.mes)} ${datos.anio}, ${datos.url}`;
        citaFinal = `(${autores.split(',')[0]})`;
        citaInicio = `${autores.split(',')[0]} sostiene ...`;
    } else {
        referencia = "Referencia generada aparecerá aquí...";
        citaFinal = "Cita generada aparecerá aquí...";
        citaInicio = "Cita de inicio aparecerá aquí...";
    }

    // Mostrar resultados
    document.getElementById('cita').innerHTML = citaFinal;
    document.getElementById('citaInicio').innerHTML = citaInicio;
    document.getElementById('referencia').innerHTML = referencia;
}
document.getElementById('citasForm').addEventListener('submit', generarCitaReferencia);

// Mostrar campos iniciales en carga
document.addEventListener('DOMContentLoaded', mostrarCampos);