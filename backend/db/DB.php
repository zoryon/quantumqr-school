<?php
class DB
{
    // attributes
    private static $instance = null;
    private $pdo;

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
            throw new \RuntimeException("Database connection failed: " . $e->getMessage(), (int)$e->getCode(), $e);
        }
    }

    // General query executor
    public function execute($sql, $params = [])
    {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
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

        try {
            $stmt = $this->execute($sql, $params);
            $result = $stmt->fetchAll($fetchMode);
            return empty($result) ? [] : $result;
        } catch (PDOException $e) {
            return null;
        }
    }

    // SELECT single row
    public function selectOne($table, $conditions = [], $fetchMode = PDO::FETCH_ASSOC)
    {
        $result = $this->select($table, $conditions, $fetchMode);
        return ($result && !empty($result)) ? $result[0] : null;
    }

    // INSERT
    public function insert($table, $data)
    {
        try {
            $columns = implode(', ', array_keys($data));
            $placeholders = implode(', ', array_fill(0, count($data), '?'));
            $sql = "INSERT INTO $table ($columns) VALUES ($placeholders)";

            $this->execute($sql, array_values($data));
            return (int)$this->pdo->lastInsertId();
        } catch (PDOException $e) {
            return null;
        }
    }

    // UPDATE
    public function update($table, $data, $conditions)
    {
        try {
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
            return (int)$stmt->rowCount();
        } catch (PDOException $e) {
            return null;
        }
        
    }

    // DELETE
    public function delete($table, $conditions)
    {
        try {
            $where = [];
            $params = [];

            foreach ($conditions as $key => $value) {
                $where[] = "$key = ?";
                $params[] = $value;
            }

            $sql = "DELETE FROM $table WHERE " . implode(' AND ', $where);
            $stmt = $this->execute($sql, $params);
            return (int)$stmt->rowCount();
        } catch (PDOException $e) {
            return null;
        }
    }

    // Count
    public function count($table, $conditions = [], $fetchMode = PDO::FETCH_ASSOC)
    {
        try {
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
            $result = $stmt->fetchAll($fetchMode);
            return $result[0]['count'] ?? 0;
        } catch (PDOException $e) {
            return null;
        }
        
    }
}
