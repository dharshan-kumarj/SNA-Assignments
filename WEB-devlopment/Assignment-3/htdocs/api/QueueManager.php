<?php
require_once __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class QueueManager {
    private $connection = null;
    private $channel = null;
    private $connected = false;

    public function __construct() {
        $host = getenv('RABBITMQ_HOST') ?: 'rabbitmq';
        $port = (int)(getenv('RABBITMQ_PORT') ?: 5672);
        $user = getenv('RABBITMQ_USER') ?: 'guest';
        $pass = getenv('RABBITMQ_PASS') ?: 'guest';

        try {
            $this->connection = new AMQPStreamConnection($host, $port, $user, $pass);
            $this->channel = $this->connection->channel();
            
            // Declare queues
            $this->channel->queue_declare('welcome_emails', false, true, false, false);
            $this->channel->queue_declare('notifications', false, true, false, false);
            
            $this->connected = true;
        } catch (Exception $e) {
            // Log error but don't crash app - RabbitMQ is optional
            error_log("RabbitMQ Connection Error: " . $e->getMessage());
            $this->connected = false;
        }
    }

    public function isConnected() {
        return $this->connected;
    }

    // Queue a welcome email task
    public function queueWelcomeEmail($userId, $email, $name) {
        if (!$this->connected) return false;

        $data = [
            'type' => 'welcome_email',
            'user_id' => $userId,
            'email' => $email,
            'name' => $name,
            'queued_at' => date('Y-m-d H:i:s')
        ];

        $msg = new AMQPMessage(
            json_encode($data),
            ['delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT]
        );
        
        $this->channel->basic_publish($msg, '', 'welcome_emails');
        return true;
    }

    // Queue a generic notification
    public function queueNotification($userId, $message, $type = 'info') {
        if (!$this->connected) return false;

        $data = [
            'user_id' => $userId,
            'message' => $message,
            'type' => $type,
            'queued_at' => date('Y-m-d H:i:s')
        ];

        $msg = new AMQPMessage(
            json_encode($data),
            ['delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT]
        );
        
        $this->channel->basic_publish($msg, '', 'notifications');
        return true;
    }

    public function __destruct() {
        if ($this->channel) {
            try { $this->channel->close(); } catch (Exception $e) {}
        }
        if ($this->connection) {
            try { $this->connection->close(); } catch (Exception $e) {}
        }
    }
}
?>
