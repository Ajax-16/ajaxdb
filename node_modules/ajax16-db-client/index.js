import net from 'net';

export default function connect(hostname, port, commands) {
  return new Promise((resolve, reject) => {
    const PORT = port;
    const HOST = hostname;
    let commandsQueue = [];
    let finalResult = [];

    const client = new net.Socket();

    client.connect(PORT, HOST, async () => {

      await processCommands();

      client.end();
    });

    client.on('end', () => {
      resolve(finalResult);
    });

    client.on('error', (err) => {
      console.error('Error:', err.message);
      reject(err);
    });

    async function processCommands() {
      commandsQueue = commands.split(';');

      for (const command of commandsQueue) {
        const trimmedCommand = command.trim();
        if (trimmedCommand) {
          try {
            const result = await sendCommand(trimmedCommand);
            finalResult.push(result);
          } catch (error) {
            console.error('Error processing command:', error.message);
            finalResult = '';
          }
        }
      }
    }

    function sendCommand(command) {
      return new Promise((resolve, reject) => {
        client.write(command);
        client.once('data', (data) => {
          const result = JSON.parse(data);
          if (result.error) {
            reject(new Error(result.error));
          } else {
            resolve(result);
          }
        });
      });
    }
  });
}