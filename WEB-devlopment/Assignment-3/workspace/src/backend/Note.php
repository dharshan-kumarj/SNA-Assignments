<?php
class Note {
    private $collection;
    private $userId;
    private $activityCollection;

    // Available tags
    public static $TAGS = ['work', 'personal', 'important', 'idea'];

    public function __construct($db, $userId) {
        $this->collection = $db->getCollection('notes');
        $this->activityCollection = $db->getCollection('activity_log');
        $this->userId = $userId;
    }

    // Log activity for security audit
    private function logActivity($action, $details = '') {
        $this->activityCollection->insertOne([
            'user_id' => $this->userId,
            'action' => $action,
            'details' => $details,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'timestamp' => new MongoDB\BSON\UTCDateTime()
        ]);
    }

    // CREATE: Add a new note with tags
    public function create($title, $content, $tag = 'personal', $isEncrypted = false) {
        // Defensive: Validate input
        if (empty($title) || strlen($title) > 255) {
            throw new Exception("Title is required and must be under 255 characters");
        }
        if (strlen($content) > 10000) {
            throw new Exception("Content must be under 10000 characters");
        }
        if (!in_array($tag, self::$TAGS)) {
            $tag = 'personal';
        }

        $result = $this->collection->insertOne([
            'user_id' => $this->userId,
            'title' => htmlspecialchars($title, ENT_QUOTES, 'UTF-8'),
            'content' => htmlspecialchars($content, ENT_QUOTES, 'UTF-8'),
            'tag' => $tag,
            'is_encrypted' => $isEncrypted,
            'created_at' => new MongoDB\BSON\UTCDateTime(),
            'updated_at' => new MongoDB\BSON\UTCDateTime()
        ]);

        $this->logActivity('note_created', "Created note: $title");
        return $result->getInsertedId();
    }

    // READ: Get all notes for user with optional search
    public function getAll($search = null, $tagFilter = null) {
        $filter = ['user_id' => $this->userId];
        
        if ($search) {
            $filter['$or'] = [
                ['title' => ['$regex' => $search, '$options' => 'i']],
                ['content' => ['$regex' => $search, '$options' => 'i']]
            ];
        }
        
        if ($tagFilter && in_array($tagFilter, self::$TAGS)) {
            $filter['tag'] = $tagFilter;
        }

        $cursor = $this->collection->find(
            $filter,
            ['sort' => ['created_at' => -1]]
        );
        
        $notes = [];
        foreach ($cursor as $doc) {
            $notes[] = [
                'id' => (string)$doc['_id'],
                'title' => $doc['title'],
                'content' => $doc['content'],
                'tag' => $doc['tag'] ?? 'personal',
                'is_encrypted' => $doc['is_encrypted'] ?? false,
                'created_at' => $doc['created_at']->toDateTime()->format('M d, Y H:i')
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
            'tag' => $note['tag'] ?? 'personal',
            'is_encrypted' => $note['is_encrypted'] ?? false,
            'created_at' => $note['created_at']->toDateTime()->format('M d, Y H:i')
        ];
    }

    // UPDATE: Update a note
    public function update($noteId, $title, $content, $tag = null) {
        if (empty($title) || strlen($title) > 255) {
            throw new Exception("Title is required and must be under 255 characters");
        }

        $updateData = [
            'title' => htmlspecialchars($title, ENT_QUOTES, 'UTF-8'),
            'content' => htmlspecialchars($content, ENT_QUOTES, 'UTF-8'),
            'updated_at' => new MongoDB\BSON\UTCDateTime()
        ];

        if ($tag && in_array($tag, self::$TAGS)) {
            $updateData['tag'] = $tag;
        }

        $result = $this->collection->updateOne(
            [
                '_id' => new MongoDB\BSON\ObjectId($noteId),
                'user_id' => $this->userId
            ],
            ['$set' => $updateData]
        );

        if ($result->getModifiedCount() === 0) {
            throw new Exception("Note not found or not modified");
        }

        $this->logActivity('note_updated', "Updated note: $title");
        return true;
    }

    // DELETE: Delete a note
    public function delete($noteId) {
        $note = $this->getById($noteId);
        
        $result = $this->collection->deleteOne([
            '_id' => new MongoDB\BSON\ObjectId($noteId),
            'user_id' => $this->userId
        ]);

        if ($result->getDeletedCount() === 0) {
            throw new Exception("Note not found");
        }

        $this->logActivity('note_deleted', "Deleted note: " . $note['title']);
        return true;
    }

    // Get notes count by tag
    public function getStats() {
        $total = $this->collection->countDocuments(['user_id' => $this->userId]);
        
        $stats = ['total' => $total];
        foreach (self::$TAGS as $tag) {
            $stats[$tag] = $this->collection->countDocuments([
                'user_id' => $this->userId,
                'tag' => $tag
            ]);
        }
        
        return $stats;
    }

    // Get recent activity
    public function getActivity($limit = 10) {
        $cursor = $this->activityCollection->find(
            ['user_id' => $this->userId],
            ['sort' => ['timestamp' => -1], 'limit' => $limit]
        );

        $activities = [];
        foreach ($cursor as $doc) {
            $activities[] = [
                'action' => $doc['action'],
                'details' => $doc['details'],
                'timestamp' => $doc['timestamp']->toDateTime()->format('M d, H:i')
            ];
        }
        return $activities;
    }

    // Export notes as JSON
    public function exportNotes() {
        $notes = $this->getAll();
        $this->logActivity('notes_exported', "Exported " . count($notes) . " notes");
        return $notes;
    }
}
?>
