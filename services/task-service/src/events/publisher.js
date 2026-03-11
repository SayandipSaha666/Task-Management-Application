const { v4: uuidv4 } = require('uuid');
const { getChannel } = require('../config/rabbitmq');

const publishTaskEvent = async (eventType, payload) => {
  const channel = getChannel();

  if (!channel) {
    console.warn(`RabbitMQ unavailable. Event "${eventType}" was NOT published.`);
    return;
  }

  const message = {
    eventType,
    timestamp: new Date().toISOString(),
    source: 'task-service',
    correlationId: uuidv4(),
    payload
  };

  try {
    channel.publish(
      'task.events',
      eventType,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    console.log(`Published event: ${eventType}`, payload);
  } catch (error) {
    console.error(`Failed to publish event "${eventType}":`, error.message);
  }
};

module.exports = { publishTaskEvent };
