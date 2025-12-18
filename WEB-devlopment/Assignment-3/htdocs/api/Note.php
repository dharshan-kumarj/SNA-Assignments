<?php
class Note {
    private $collection;
    private $userId;

    public function __construct($db, $userId) {
        $this->collection = $db->getCollection('notes');
        $this->userId = $userId;
    }

    // CREATE: Add a new note
    public function create($title, $content) {
        // Defensive: Validate input
        if (empty($title) || strlen($title) > 255) {
            throw new Exception("Title is required and must be under 255 characters");
        }
        if (strlen($content) > 10000) {
            throw new Exception("Content must be under 10000 characters");
        }

        $result = $this->collection->insertOne([
            'user_id' => $this->userId,
            'title' => htmlspecialchars($title, ENT_QUOTES, 'UTF-8'),
            'content' => htmlspecialchars($content, ENT_QUOTES, 'UTF-8'),
            'created_at' => new MongoDB\BSON\UTCDateTime(),
            'updated_at' => new MongoDB\BSON\UTCDateTime()
        ]);

        return $result->getInsertedId();
    }

    // READ: Get all notes for user
    public function getAll() {
        $cursor = $this->collection->find(
            ['user_id' => $this->userId],
            ['sort' => ['created_at' => -1]]
        );
        
        $notes = [];
        foreach ($cursor as $doc) {
            $notes[] = [
                'id' => (string)$doc['_id'],
                'title' => $doc['title'],
                'content' => $doc['content'],
                'created_at' => $doc['created_at']->toDateTime()->format('Y-m-d H:i:s')
            ];
        }
        return $notes;
    }

    // READ: Get single note
    public function getById($noteId) {
        $note = $this->collection->findOne([
            '_id' => new MongoDB\BSON\ObjectId($noteId),
            'user_id' => $this->userId
        ]);

        if (!$note) {
            throw new Exception("Note not found");
        }

        return [
            'id' => (string)$note['_id'],
            'title' => $note['title'],
            'content' => $note['content'],
            'created_at' => $note['created_at']->toDateTime()->format('Y-m-d H:i:s')
        ];
    }

    // UPDATE: Update a note
    public function update($noteId, $title, $content) {
        // Defensive: Validate input
        if (empty($title) || strlen($title) > 255) {
            throw new Exception("Title is required and must be under 255 characters");
        }

        $result = $this->collection->updateOne(
            [
                '_id' => new MongoDB\BSON\ObjectId($noteId),
                'user_id' => $this->userId
            ],
            [
                '$set' => [
                    'title' => htmlspecialchars($title, ENT_QUOTES, 'UTF-8'),
                    'content' => htmlspecialchars($content, ENT_QUOTES, 'UTF-8'),
                    'updated_at' => new MongoDB\BSON\UTCDateTime()
                ]
            ]
        );

        if ($result->getModifiedCount() === 0) {
            throw new Exception("Note not found or not modified");
        }

        return true;
    }

    // DELETE: Delete a note
    public function delete($noteId) {
        $result = $this->collection->deleteOne([
            '_id' => new MongoDB\BSON\ObjectId($noteId),
            'user_id' => $this->userId
        ]);

        if ($result->getDeletedCount() === 0) {
            throw new Exception("Note not found");
        }

        return true;
    }
}
?>
