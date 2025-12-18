<?php
require_once __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class QueueManager {
    private $connection;
    private $channel;

    public function __construct() {
        $host = getenv('RABBITMQ_HOST') ?: 'rabbitmq';
        $port = getenv('RABBITMQ_PORT') ?: 5672;
        $user = getenv('RABBITMQ_USER') ?: 'guest';
        $pass = getenv('RABBITMQ_PASS') ?: 'guest';

        try {
            $this->connection = new AMQPStreamConnection($host, $port, $user, $pass);
            $this->channel = $this->connection->channel();
            $this->channel->queue_declare('task_queue', false, true, false, false);
        } catch (Exception $e) {
            // Log error but don't crash app if queue is optional
            error_log("RabbitMQ Connection Error: " . $e->getMessage());
        }
    }

    public function sendTask($data) {
        if (!$this->channel) return;

        $msg = new AMQPMessage(
            json_encode($data),
            array('delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT)
        );
        $this->channel->basic_publish($msg, '', 'task_queue');
    }

    public function __destruct() {
        if ($this->channel) $this->channel->close();
        if ($this->connection) $this->connection->close();
    }
}
?>
