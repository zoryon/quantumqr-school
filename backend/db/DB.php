<?php
class DB
{
    // attributes
    private $conn;
    private $status = 200;
    private $headers = [];
    private $response = [];
    private static $instance = null;

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

    public function addCorsHeaders()
    {
        header("Access-Control-Allow-Origin: http://localhost:3000");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
        header("Access-Control-Allow-Credentials: true");
        return $this;
    }

    // connect to the database
    private function connect(): void
    {
        $dsn = "mysql:host={$this->DB_CONFIG['host']};dbname={$this->DB_CONFIG['database']};";

        try {
            $this->conn = new PDO(
                $dsn,
                $this->DB_CONFIG["user"],
                $this->DB_CONFIG["password"],
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            $this->handleError("Database connection failed: " . $e->getMessage(), 500);
        }
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

    /* 
        SELECT function
        @return an array of rows -> in case of selecting a single item, 
        only the first element of the array should be returned
        (with res[0])
    */
    public function executeQuery(string $sql, array $params = []): array | null
    {
        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            $this->handleError("Query execution failed: " . $e->getMessage(), 500);
        }
        return null;
    }

    // POST function
    public function insert(string $sql, array $params = []): int | null
    {
        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $this->conn->lastInsertId();
        } catch (PDOException $e) {
            $this->handleError("Insert failed: " . $e->getMessage(), 500);
        }

        return null;
    }

    // PUT function
    public function update(string $sql, array $params = []): int | null
    {
        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt->rowCount();
        } catch (PDOException $e) {
            $this->handleError("Update failed: " . $e->getMessage(), 500);
        }

        return null;
    }

    // DELETE function
    public function delete(string $sql, array $params = []): int
    {
        return $this->update($sql, $params);
    }

    // send the final response
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

    public function __destruct()
    {
        $this->conn = null;
    }
}
