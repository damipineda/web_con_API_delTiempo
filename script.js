document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '5b0ad7552edd4b17ad5171009241707'; // Reemplaza con tu clave API real
    const urlBase = 'http://api.weatherapi.com/v1/';

    const formularioBusqueda = document.getElementById('formularioBusqueda');
    const entradaBusqueda = document.getElementById('entradaBusqueda');
    const datosClima = document.getElementById('datosClima');
    const alertaError = document.getElementById('alertaError');
    const encabezadoClima = document.getElementById('encabezadoClima');
    const tarjetasClima = document.getElementById('tarjetasClima');
    const body = document.body;

    // Manejador del formulario de búsqueda
    formularioBusqueda.addEventListener('submit', (evento) => {
        evento.preventDefault();
        const nombreLocalidad = entradaBusqueda.value.trim();
        if (nombreLocalidad === '') {
            mostrarError('Por favor, ingrese un nombre de localidad válido.');
        } else {
            obtenerDatosClima(nombreLocalidad, true);
        }
    });

    function obtenerDatosClima(ubicacion, esBusquedaManual = false) {
        let url = `${urlBase}forecast.json?key=${apiKey}&q=${ubicacion}&days=5&aqi=no&alerts=no`;

        fetch(url)
            .then(respuesta => respuesta.json())
            .then(datos => {
                if (datos.error) {
                    mostrarError(datos.error.message);
                } else {
                    mostrarDatosClima(datos, esBusquedaManual);
                }
            })
            .catch(error => {
                mostrarError('Error al obtener los datos del clima. Por favor, intente nuevamente.');
                console.error(error);
            });
    }

    function mostrarDatosClima(datos, esBusquedaManual) {
        alertaError.classList.add('d-none');
        encabezadoClima.innerHTML = '';
    
        const { name, region, country } = datos.location;
        const nombreLocalidad = `${name}, ${region}, ${country}`;
        const informacionLocalidad = document.createElement('h2');
        informacionLocalidad.textContent = nombreLocalidad;
        encabezadoClima.appendChild(informacionLocalidad);
    
        // Obtener el código de la condición del primer día para establecer el fondo
        const codigoCondicion = datos.current.condition.code;
        cambiarFondo(codigoCondicion);
    
        // Actualizar el contenido de las tarjetas
        const tarjetas = document.querySelectorAll('.tarjetaClima');
        datos.forecast.forecastday.forEach((dia, index) => {
            const tarjetaClima = tarjetas[index];
            const iconoClima = dia.day.condition.icon;
    
            tarjetaClima.innerHTML = `
                <h3>${dia.date}</h3>
                <img src="${iconoClima}" alt="Icono del Clima">
                <p>Temperatura Máx: ${dia.day.maxtemp_c}ºC</p>
                <p>Temperatura Mín: ${dia.day.mintemp_c}ºC</p>
                <p>${dia.day.condition.text}</p>
                <p>Humedad: ${dia.day.avghumidity}%</p>
                <p>Viento: ${dia.day.maxwind_kph} km/h</p>
            `;
        });
    
        // Si no es una búsqueda manual, mostrar un mensaje indicando que se muestra el clima actual
        if (!esBusquedaManual) {
            const mensajeUbicacionActual = document.createElement('p');
            mensajeUbicacionActual.textContent = 'Mostrando el clima de tu ubicación actual.';
            encabezadoClima.insertBefore(mensajeUbicacionActual, informacionLocalidad);
        }
    }
    function mostrarError(mensaje) {
        alertaError.textContent = mensaje;
        alertaError.classList.remove('d-none');
    }

    function mostrarErrorGeolocalizacion(error) {
        let mensajeError;
        switch (error.code) {
            case error.PERMISSION_DENIED:
                mensajeError = "Permiso denegado por el usuario.";
                break;
            case error.POSITION_UNAVAILABLE:
                mensajeError = "La ubicación no está disponible.";
                break;
            case error.TIMEOUT:
                mensajeError = "Tiempo de espera agotado.";
                break;
            case error.UNKNOWN_ERROR:
                mensajeError = "Error desconocido.";
                break;
        }
        mostrarError(mensajeError);
    }

    function cambiarFondo(codigoCondicion) {
        if (codigoCondicion >= 1000 && codigoCondicion < 2000) { // Lluvia
            body.style.backgroundImage = "url('https://images.pexels.com/photos/1118870/pexels-photo-1118870.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')"; // Imagen de lluvia
        } else if (codigoCondicion >= 2000 && codigoCondicion < 3000) { // Tormenta
            body.style.backgroundImage = "url('https://images.pexels.com/photos/111263/pexels-photo-111263.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')"; // Imagen de tormenta
        } else if (codigoCondicion >= 800 && codigoCondicion < 900) { // Nublado
            body.style.backgroundImage = "url('https://images.pexels.com/photos/3035610/pexels-photo-3035610.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')"; // Imagen de nublado
        } else { // Soleado
            body.style.backgroundImage = "url('https://images.pexels.com/photos/281260/pexels-photo-281260.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')"; // Imagen de soleado
        }
    }

    // Obtener clima de la localidad del dispositivo al cargar
    navigator.geolocation.getCurrentPosition(
        (posicion) => {
            const { latitude, longitude } = posicion.coords;
            obtenerDatosClima(`${latitude},${longitude}`);
        },
        mostrarErrorGeolocalizacion,
        { timeout: 10000 }
    );
});
