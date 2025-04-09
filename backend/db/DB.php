<?php
class DB
{
    // attributes
    private static $instance = null;
    private $pdo;
    private $status = 200;
    private $headers = [];
    private $response = [];

    private $DB_CONFIG = [
        "host" => "localhost",
        "user" => "root",
        "password" => "",
        "database" => "quantumqr",
    ];

    // constructor
    private function __construct()
    {
        $this->connect();
        $this->setDefaultHeaders();
    }

    // Singleton -> ensures only one instance of the class is created
    // this way, only on DB connection is enstablished
    public static function getInstance(): self
    {
        if (!self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    // connect to the database
    private function connect(): void
    {
        $dsn = "mysql:host={$this->DB_CONFIG['host']};dbname={$this->DB_CONFIG['database']};";

        try {
            $this->pdo = new PDO(
                $dsn,
                $this->DB_CONFIG["user"],
                $this->DB_CONFIG["password"],
            );
            $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            $this->handleError("Database connection failed: " . $e->getMessage(), (int)$e->getCode());
        }
    }

    public function addCorsHeaders()
    {
        header("Access-Control-Allow-Origin: http://localhost:3000");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
        header("Access-Control-Allow-Credentials: true");
        return $this;
    }

    // by default, set Content-Type header to application/json
    private function setDefaultHeaders(): void
    {
        $this->headers = [
            "Content-Type" => "application/json",
        ];
    }

    public function setStatus(int $status): self
    {
        $this->status = $status;
        return $this;
    }

    public function addHeader(string $name, string $value): self
    {
        $this->headers[$name] = $value;
        return $this;
    }

    public function setResponse(array $data): self
    {
        $this->response = $data;
        return $this;
    }

    // General query executor
    public function execute($sql, $params = [])
    {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            $this->handleError($e->getMessage(), (int)$e->getCode());
            return false;
        }
    }

    // SELECT multiple rows
    public function select($table, $conditions = [], $fetchMode = PDO::FETCH_ASSOC)
    {
        $sql = "SELECT * FROM $table";
        $params = [];

        if (!empty($conditions)) {
            $where = [];
            foreach ($conditions as $key => $value) {
                if ($value === null) {
                    // *** Use IS NULL for null values ***
                    $where[] = "$key IS NULL";
                } else {
                    // *** Use = ? for non-null values ***
                    $where[] = "$key = ?";
                    $params[] = $value; // Add the value to be bound
                }
            }
            $sql .= " WHERE " . implode(' AND ', $where);
        }

        $stmt = $this->execute($sql, $params);
        return $stmt ? $stmt->fetchAll($fetchMode) : false;
    }

    // SELECT single row
    public function selectOne($table, $conditions = [], $fetchMode = PDO::FETCH_ASSOC)
    {
        $result = $this->select($table, $conditions, $fetchMode);
        return $result ? $result[0] : false;
    }

    // INSERT
    public function insert($table, $data)
    {
        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));
        $sql = "INSERT INTO $table ($columns) VALUES ($placeholders)";

        $stmt = $this->execute($sql, array_values($data));
        return $stmt ? $this->pdo->lastInsertId() : false;
    }

    // UPDATE
    public function update($table, $data, $conditions)
    {
        $set = [];
        $params = [];

        foreach ($data as $key => $value) {
            $set[] = "$key = ?";
            $params[] = $value;
        }

        $where = [];
        foreach ($conditions as $key => $value) {
            $where[] = "$key = ?";
            $params[] = $value;
        }

        $sql = "UPDATE $table SET " . implode(', ', $set) . " WHERE " . implode(' AND ', $where);
        $stmt = $this->execute($sql, $params);
        return $stmt ? $stmt->rowCount() : false;
    }

    // DELETE
    public function delete($table, $conditions)
    {
        $where = [];
        $params = [];

        foreach ($conditions as $key => $value) {
            $where[] = "$key = ?";
            $params[] = $value;
        }

        $sql = "DELETE FROM $table WHERE " . implode(' AND ', $where);
        $stmt = $this->execute($sql, $params);
        return $stmt ? $stmt->rowCount() : false;
    }

    // Count
    public function count($table, $conditions = [], $fetchMode = PDO::FETCH_ASSOC)
    {
        $sql = "SELECT COUNT(*) AS count FROM $table";
        $params = [];

        if (!empty($conditions)) {
            $where = [];
            foreach ($conditions as $key => $value) {
                $where[] = "$key = ?";
                $params[] = $value;
            }
            $sql .= " WHERE " . implode(' AND ', $where);
        }

        $stmt = $this->execute($sql, $params);
        $result = $stmt ? $stmt->fetchAll($fetchMode) : false;
        return $result ? $result[0] : false;
    }

    // Send the final response
    public function send(): void
    {
        $this->addCorsHeaders();
        if (!headers_sent()) {
            http_response_code($this->status);
            foreach ($this->headers as $name => $value) {
                header("$name: $value");
            }
        }

        echo json_encode($this->response);
        exit();
    }

    private function handleError(string $message, int $status = 500): void
    {
        $this->setStatus($status)
            ->setResponse(["error" => $message])
            ->send();
    }
}
