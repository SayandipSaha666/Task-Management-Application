const amqp = require('amqplib');

let channel = null;
let connection = null;

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    console.log('Task Service: Connected to RabbitMQ');

    channel = await connection.createChannel();

    await channel.assertExchange('task.events', 'topic', { durable: true });
    console.log('Task Service: Exchange "task.events" is ready');

    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err.message);
      channel = null;
    });

    connection.on('close', () => {
      console.warn('RabbitMQ connection closed. Reconnecting...');
      channel = null;
      setTimeout(connectRabbitMQ, 5000);
    });

  } catch (error) {
    console.error('Task Service: RabbitMQ connection failed:', error.message);
    setTimeout(connectRabbitMQ, 5000);
  }
};

const getChannel = () => channel;

module.exports = { connectRabbitMQ, getChannel };
