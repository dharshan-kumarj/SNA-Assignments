<?php
require_once __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class QueueManager {
    private $connection;
    private $channel;

    public function __construct() {
        $host = getenv('RABBITMQ_HOST') ?: 'rabbitmq';
        $user = getenv('RABBITMQ_USER') ?: 'guest';
        $pass = getenv('RABBITMQ_PASS') ?: 'guest';

        $this->connection = new AMQPStreamConnection($host, 5672, $user, $pass);
        $this->channel = $this->connection->channel();
        $this->channel->queue_declare('task_queue', false, true, false, false);
    }

    public function sendTask($data) {
        $msg = new AMQPMessage(
            json_encode($data),
            array('delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT)
        );
        $this->channel->basic_publish($msg, '', 'task_queue');
    }

    public function __destruct() {
        $this->channel->close();
        $this->connection->close();
    }
}
?>
