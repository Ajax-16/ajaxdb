import net from 'net';

export default function connect(hostname, port, commands) {
  return new Promise((resolve, reject) => {
    const PORT = port;
    const HOST = hostname;
    let responses = []; // Array para almacenar todas las respuestas

    const client = new net.Socket();

    client.connect(PORT, HOST, async () => {
      await processCommands();
      client.end();
    });

    client.on('end', () => {
      // Se ha completado la transmisión de datos, resolver la promesa con todas las respuestas
      resolve(responses);
    });

    client.on('error', (err) => {
      console.error('Error:', err.message);
      reject(err);
    });

    async function processCommands() {
      const commandsQueue = commands.split(';').map(command => command.trim()).filter(command => command); // Filtrar comandos vacíos

      for (const command of commandsQueue) {
        try {
          const result = await sendCommand(command);
          // Agregar la respuesta al array de respuestas
          responses.push(result);
        } catch (error) {
          console.error('Error processing command:', error.message);
          // Agregar una respuesta vacía al array en caso de error
          responses.push('');
        }
      }
    }

    function sendCommand(command) {
      return new Promise((resolve, reject) => {
        let partialResult = ''; // Variable para almacenar el fragmento de la respuesta
    
        client.write(command);
        client.on('data', (data) => {
          const result = data.toString();
          
          // Comprueba si se ha recibido la marca de fin de respuesta
          if (result.includes('END_OF_RESPONSE')) {
            // Concatena el todos los chunks de respuesta sin la marca de fin de respuesta
            partialResult += result.replace('END_OF_RESPONSE', '');

            const parsedResult = JSON.parse(partialResult);
            // Resuelve la promesa con la respuesta completa parseada a JSON
            resolve(parsedResult);
            // Limpia partialResult para la próxima respuesta ya que al mandarse varios paquetes, este evento se va a reproducir varias veces
            partialResult = '';
          } else {
            // Concatena el chunk de respuesta al parcialResult
            partialResult += result;
          }
        });
      });
    }
        
  });
}
