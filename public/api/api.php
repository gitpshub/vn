<?php
date_default_timezone_set('Europe/Moscow');

header("Content-Type: application/json; chatset=utf-8");

// === Загрузка настроек из .env ===
$env = loadEnv(dirname(__DIR__, 2) . '/.env');

// === Настройки из .env или дефолтные значения ===
$validApiKey = $env['API_KEY'] ?? 'dev';
$dataDir = $env['DATA_DIR_PATH'] ?? dirname(__DIR__, 2) . '/data/';
$appVersion = $env['APP_VERSION'] ?? 'dev';
$appName = $env['APP_NAME'] ?? 'Voice Notes API v.1';

if (!is_dir($dataDir)) {
    mkdir($dataDir, 0777, true);
}

// === Функции ===

function handleSave(array $env): void
{
    global $dataDir;

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Неверный формат JSON']);
        return;
    }

    if (!isset($data['data']) || !isset($data['version'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Отсутствуют необходимые поля']);
        return;
    }

    $data['timestamp'] = date('c');
    $filename = uniqid('', true) . '.json';
    $filepath = $dataDir . $filename;

    if (file_put_contents($filepath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) === false) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Не удалось записать файл']);
        return;
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Файл успешно сохранён',
        'filename' => $filename,
    ]);
}

function handleList(): void
{
    global $dataDir;

    $files = array_diff(scandir($dataDir), ['.', '..']);
    echo json_encode([
        'status' => 'success',
        'files' => array_values($files),
    ]);
}

function handleGet(string $filename): void
{
    global $dataDir;

    $filepath = $dataDir . $filename;

    if (!file_exists($filepath)) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Файл не найден']);
        return;
    }

    $content = json_decode(file_get_contents($filepath), true);

    echo json_encode([
        'status' => 'success',
        'data' => $content,
    ]);
}

function handleDelete(string $filename): void
{
    global $dataDir;

    $filepath = $dataDir . $filename;

    if (!file_exists($filepath)) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Файл не найден']);
        return;
    }

    if (unlink($filepath)) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Файл успешно удалён',
            'filename' => $filename,
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Не удалось удалить файл']);
    }
}

function handleVersion(array $env): void
{
    global $appVersion, $appName, $appDescription;

    $apiInfo = [
        'status' => 'success',
        'version' => $appVersion,
        'name' => $appName,
        'timestamp' => date('c')
    ];

    echo json_encode($apiInfo, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}

// === Проверка API-ключа ===
function getRequestHeaders(): array
{
    $headers = [];
    foreach ($_SERVER as $key => $value) {
        if (str_starts_with($key, 'HTTP_')) {
            $headerKey = str_replace(['HTTP_', '_'], ['', '-'], $key);
            $headers[$headerKey] = $value;
        }
    }
    return $headers;
}

function checkApiKey(string $validApiKey): void
{
    $headers = getRequestHeaders();
    $apiKeyHeader = $headers['AUTHORIZATION'] ?? '';

    if (strpos($apiKeyHeader, 'ApiKey ') !== 0) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Не авторизован']);
        exit;
    }

    $apiKey = substr($apiKeyHeader, 7); // Убираем "ApiKey "

    if ($apiKey !== $validApiKey) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Доступ запрещён']);
        exit;
    }
}

// === Роутинг ===
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

if ($uri === '/api/save' && $method === 'POST') {
    checkApiKey($validApiKey);
    handleSave($env);
} elseif ($uri === '/api/list' && $method === 'GET') {
    checkApiKey($validApiKey);
    handleList();
} elseif (preg_match('/^\/api\/get\/([\w\-\.]+\.json)$/', $uri, $matches) && $method === 'GET') {
    checkApiKey($validApiKey);
    handleGet($matches[1]);
} elseif (preg_match('/^\/api\/delete\/([\w\-\.]+\.json)$/', $uri, $matches) && $method === 'DELETE') {
    checkApiKey($validApiKey);
    handleDelete($matches[1]);
} elseif ($uri === '/api/version' && $method === 'GET') {
    handleVersion($env);
} else {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Эндпоинт не найден']);
}

// === Вспомогательные функции ===

function loadEnv(string $filePath = ""): array
{
    if (!file_exists($filePath)) {
        return [];
    }

    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $env = [];

    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;

        [$name, $value] = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);

        if (!empty($name)) {
            $env[$name] = $value;
        }
    }

    return $env;
}
