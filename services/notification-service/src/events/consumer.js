const amqp = require('amqplib');
const { handleEvent } = require('./handler');

let connection = null;
let channel = null;

const connectAndConsume = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    console.log('Notification Service: Connected to RabbitMQ');

    channel = await connection.createChannel();

    // ─── Step A: Assert the exchanges exist ─────────────────
    // (They were created by User/Task services, but we assert 
    //  them here too in case Notification starts first)
    await channel.assertExchange('user.events', 'topic', { durable: true });
    await channel.assertExchange('task.events', 'topic', { durable: true });

    // ─── Step B: Create QUEUES for this consumer ────────────
    // These queues are where messages wait until we process them
    await channel.assertQueue('notification.user', { durable: true });
    await channel.assertQueue('notification.task', { durable: true });

    // ─── Step C: BIND queues to exchanges ───────────────────
    // "Hey RabbitMQ, send any message from user.events 
    //  that matches 'user.#' into the notification.user queue"
    await channel.bindQueue('notification.user', 'user.events', 'user.#');
    await channel.bindQueue('notification.task', 'task.events', 'task.#');

    console.log('Queues bound: notification.user ← user.events');
    console.log('Queues bound: notification.task ← task.events');

    // ─── Step D: CONSUME messages ───────────────────────────
    // prefetch(1) = process one message at a time (prevents overload)
    channel.prefetch(1);

    channel.consume('notification.user', async (msg) => {
      if (msg) {
        try {
          const event = JSON.parse(msg.content.toString());
          await handleEvent(event);
          channel.ack(msg);       // "Done processing, remove from queue"
        } catch (error) {
          console.error(' Error processing user event:', error.message);
          channel.nack(msg, false, false);  // Reject, don't requeue
        }
      }
    });

    channel.consume('notification.task', async (msg) => {
      if (msg) {
        try {
          const event = JSON.parse(msg.content.toString());
          await handleEvent(event);
          channel.ack(msg);
        } catch (error) {
          console.error('Error processing task event:', error.message);
          channel.nack(msg, false, false);
        }
      }
    });

    console.log(' Notification Service: Listening for events...');

    // ─── Reconnection logic ─────────────────────────────────
    connection.on('error', (err) => {
      console.error(' RabbitMQ connection error:', err.message);
      channel = null;
    });

    connection.on('close', () => {
      console.warn('RabbitMQ connection closed. Reconnecting...');
      channel = null;
      setTimeout(connectAndConsume, 5000);
    });

  } catch (error) {
    console.error('Notification Service: RabbitMQ connection failed:', error.message);
    setTimeout(connectAndConsume, 5000);
  }
};

module.exports = { connectAndConsume };
