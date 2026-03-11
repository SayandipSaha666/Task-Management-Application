const { v4: uuidv4 } = require('uuid');
const { getChannel } = require('../config/rabbitmq');

/**
 * Publishes an event to the "user.events" exchange.
 * 
 * @param {string} eventType - e.g., "user.registered", "user.loggedIn"
 * @param {object} payload   - The event data (userId, email, etc.)
 */
const publishUserEvent = async (eventType, payload) => {
  const channel = getChannel();

  if (!channel) {
    console.warn(`RabbitMQ unavailable. Event "${eventType}" was NOT published.`);
    return; // Don't crash — just skip the event
  }

  // standard message envelope (same format for ALL services)
  const message = {
    eventType,
    timestamp: new Date().toISOString(),
    source: 'user-service',
    correlationId: uuidv4(),
    payload
  };

  try {
    // Publish to the "user.events" exchange with the eventType as routing key
    channel.publish(
      'user.events',                        // Exchange name
      eventType,                            // Routing key (e.g., "user.registered")
      Buffer.from(JSON.stringify(message)), // Message must be a Buffer
      { persistent: true }                  // Survives RabbitMQ restarts
    );

    console.log(`Published event: ${eventType}`, payload);
  } catch (error) {
    console.error(`Failed to publish event "${eventType}":`, error.message);
  }
};

module.exports = { publishUserEvent };
