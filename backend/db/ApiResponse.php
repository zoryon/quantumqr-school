<?php

class ApiResponse
{
    private int $statusCode = 200;
    private array $headers = ['Content-Type' => 'application/json'];
    private array $body = [];

    public function setStatus(int $code): self
    {
        $this->statusCode = $code;
        return $this;
    }

    public function addHeader(string $name, string $value): self
    {
        $this->headers[$name] = $value;
        return $this;
    }

    public function setBody(array $data): self
    {
        $this->body = $data;
        return $this;
    }

    // Helper methods for common response types
    public static function success(string $message, $data = null, int $statusCode = 200): self
    {
        return (new self())
            ->setStatus($statusCode)
            ->setBody(['success' => true, 'message' => $message, 'data' => $data]);
    }

    public static function error(string $message, $data = null, int $statusCode = 500): self
    {
        return (new self())
            ->setStatus($statusCode)
            ->setBody(['success' => false, 'message' => $message, 'data' => $data]);
    }

    // Specific
    public static function created($message = "Created successfully", $data): self
    {
        return ApiResponse::success($message, $data, 201);
    }

    public static function clientError($message, $data = null): self
    {
        return ApiResponse::error($message, $data, 400);
    }

    public static function unauthorized($message = 'Unauthorized'): self
    {
        return ApiResponse::error($message, null, 401);
    }

    public static function forbidden($message = 'Forbidden'): self
    {
        return ApiResponse::error($message, null, 403);
    }

    public static function notFound($message = 'Not found'): self
    {
        return ApiResponse::error($message, null, 404);
    }

    public static function methodNotAllowed(): self
    {
        return ApiResponse::error('Method not allowed', null, 405);
    }

    public static function conflict($message): self
    {
        return ApiResponse::error($message, null, 409);
    }

    public static function internalServerError($message = 'Internal Server Error'): self
    {
        return ApiResponse::error($message, null, 500);
    }

    // Method to add standard CORS headers
    public function addCorsHeaders(): self
    {
        header("Access-Control-Allow-Origin: http://localhost:3000");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
        header("Access-Control-Allow-Credentials: true");
        return $this;
    }


    public function send(): void
    {
        $this->addCorsHeaders();

        if (!headers_sent()) {
            http_response_code($this->statusCode);
            foreach ($this->headers as $name => $value) {
                header("$name: $value");
            }
        }

        echo json_encode($this->body);
        exit(); // Terminate script execution after sending
    }
}
