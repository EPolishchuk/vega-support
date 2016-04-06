<?php

class Logging {
    // declare log file and file pointer as private properties
    private $log_file, $fp;
    // set log file (path and name)
    public function lfile($path) {
        $this->log_file = $path;
    }
    // write message to the log file
    public function lwrite($message) {
        // if file pointer doesn't exist, then open log file
        if (!is_resource($this->fp)) {
            $this->lopen();
        }
        // define script name
        $script_name = pathinfo($_SERVER['PHP_SELF'], PATHINFO_FILENAME);
        $userIp = $_SERVER["REMOTE_ADDR"];
        // define current time and suppress E_WARNING if using the system TZ settings
        // (don't forget to set the INI setting date.timezone)
        $time = @date('d/M/Y H:i:s');
        // write current time, script name and message to the log file
        fwrite($this->fp, "$time | $userIp | $script_name | $message" . PHP_EOL);
    }
    // close log file (it's always a good idea to close a file when you're done with it)
    public function lclose() {
        fclose($this->fp);
    }
    // open log file (private method)
    private function lopen() {
        $log_file_default = 'logfile.txt';
        // define log file from lfile method or use previously set default
        $lfile = $this->log_file ? $this->log_file : $log_file_default;
        // open log file for writing only and place file pointer at the end of the file
        // (if the file does not exist, try to create it)
        $this->fp = fopen($lfile, 'a') or exit("Can't open $lfile!");
    }
}

// Logging class initialization
$log = new Logging();
 
// set path and name of log file (optional)
$log->lfile('nt-log.txt');
 
// write message to the log file
//$log->lwrite('Test message1');

$toolMethod = $_SERVER['REQUEST_METHOD'];
$toolParameter = $_GET;

$log->lwrite($toolMethod . ' ' . urldecode(http_build_query($toolParameter,' ',' ')));


$commandArray = array(
    "ping",
    "traceroute",
    "nslookup",
    "whois",
    "dig",
    "host",
    "nmap"
);

$hostFlag = false;

if (isset($_GET['h']) && ($_GET['h'] != null)) {
    $host = $_GET['h'];
} else {
    $log->lwrite('ERROR. Request without host');
    http_response_code(412);
    echo 'ERROR. Request without host';
    exit();
};

if (isset($_GET['c'])) {
    $command = $commandArray[intval($_GET['c'])];
    if ($command == 'host' || $command == 'nslookup') {
        $hostFlag = true;
    }
} else {
    $log->lwrite('ERROR. Request without tool');
    http_response_code(412);
    echo 'ERROR. Request without tool';
    exit();
};

if (isset($_GET['a']) && $_GET['a'] != '') {
    $add = $_GET['a'];
} elseif ($command != 'whois' && $command != 'nslookup') {
    $log->lwrite('ERROR. Request without options');
    http_response_code(412);
    echo 'ERROR. Request without options';
    exit();
} else {
	$add = '';
};

$check = isset($host) && isset($command) && isset($add);

if ($check) {
    echo "[root@php-net-tools] $ ";
    if ($hostFlag || $add == '-x' ) {
        $txt = $command . " " . $add . " " . $host . " ";
    } else {
        $txt = $command . " " . $host . " " . $add . " ";
    }
    
    $console = "<table>";
    echo $txt;
    echo "<br><br>";
    exec(escapeshellcmd($txt), $output, $status);
    for ($i = 0; $i < count($output); $i++) {
        echo $output[$i] . '<br>';
        $console .= "<tr><td>" . $output[$i] . '</td></tr><br>';
    }
    $console .= "</table>";
    $log->lwrite('SUCCESS');
}

// close log file
$log->lclose();

?>