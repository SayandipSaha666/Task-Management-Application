const amqp = require('amqplib');

let channel = null;
let connection = null;

const connectRabbitMQ = async () => {
  try {
    // Step 1: Create a connection to RabbitMQ
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    console.log('User Service: Connected to RabbitMQ');

    // Step 2: Create a channel
    channel = await connection.createChannel();

    // Step 3: Declare an exchange named "user.events"
    // Type "topic" => messages are routed by pattern
    await channel.assertExchange('user.events', 'topic', { durable: true });

    console.log('User Service: Exchange "user.events" is ready');

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
    console.error('User Service: RabbitMQ connection failed:', error.message);
    // Don't crash — RabbitMQ being down shouldn't stop user registration
    setTimeout(connectRabbitMQ, 5000);
  }
};

const getChannel = () => channel;

module.exports = { connectRabbitMQ, getChannel };
